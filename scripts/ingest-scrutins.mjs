// @ts-check
/**
 * Ingestion des scrutins de l'Assemblée nationale (Exercice A).
 *
 * Source : open data data.assemblee-nationale.fr — archive `Scrutins.json.zip`
 * (un fichier JSON par scrutin, ~7200 scrutins pour la 17e législature).
 *
 * Ce script fait UNIQUEMENT la plomberie mécanique et non éditoriale :
 *   1. télécharge l'archive (mise en cache locale dans scripts/.cache),
 *   2. parse chaque scrutin,
 *   3. ne retient que les votes SIGNIFIANTS :
 *        - « votes sur l'ensemble » d'un texte (le vote phare),
 *        - motions de censure (MOC),
 *      sur les 12 derniers mois,
 *   4. extrait la position de CHAQUE groupe politique (pour / contre /
 *      abstention) à partir du décompte des voix,
 *   5. écrit un dataset normalisé dans public/data/scrutins.json.
 *
 * Ce qu'il NE fait PAS (étapes éditoriales, à venir) :
 *   - l'affectation des THÈMES (écologie, fiscalité…) à chaque scrutin,
 *   - la sélection fine / le regroupement des votes par dossier.
 *
 * Usage : `npm run ingest:scrutins`
 *         `npm run ingest:scrutins -- --months=12 --offline`
 */

import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unzipSync } from 'fflate'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CACHE = join(__dirname, '.cache')
const OUT = join(ROOT, 'public', 'data', 'scrutins.json')
const TAXONOMY = join(ROOT, 'public', 'data', 'taxonomy.json')
const THEMES = join(__dirname, 'themes.json')

const LEGISLATURE = 17
const SCRUTINS_URL = `https://data.assemblee-nationale.fr/static/openData/repository/${LEGISLATURE}/loi/scrutins/Scrutins.json.zip`

/**
 * Référentiel des groupes politiques (17e législature).
 * Dérivé du jeu de données de référence AMO10 (json/organe, codeType=GP).
 * organeRef → { abbrev, name }.
 */
const GROUPS = {
  PO845401: { abbrev: 'RN', name: 'Rassemblement National' },
  PO845407: { abbrev: 'EPR', name: 'Ensemble pour la République' },
  PO845413: { abbrev: 'LFI-NFP', name: 'La France insoumise - Nouveau Front Populaire' },
  PO845419: { abbrev: 'SOC', name: 'Socialistes et apparentés' },
  PO845425: { abbrev: 'DR', name: 'Droite Républicaine' },
  PO845439: { abbrev: 'EcoS', name: 'Écologiste et Social' },
  PO845454: { abbrev: 'Dem', name: 'Les Démocrates' },
  PO845470: { abbrev: 'HOR', name: 'Horizons & Indépendants' },
  PO845485: { abbrev: 'LIOT', name: 'Libertés, Indépendants, Outre-mer et Territoires' },
  PO845514: { abbrev: 'GDR', name: 'Gauche Démocrate et Républicaine' },
  PO872880: { abbrev: 'UDR', name: 'Union des droites pour la République' },
  PO840056: { abbrev: 'NI', name: 'Non inscrits' },
  PO847173: { abbrev: '?', name: 'Groupe dissous (à résoudre)' },
}

// --- petits utilitaires -----------------------------------------------------

/** Normalise un champ XML→JSON qui peut être null, un objet seul, ou un tableau. */
const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x])

const toInt = (x) => {
  const n = parseInt(x, 10)
  return Number.isNaN(n) ? 0 : n
}

/** Normalise les apostrophes typographiques pour les comparaisons de texte. */
const normApos = (s) => (s || '').replace(/[’ʼ]/g, "'")

function parseArgs() {
  const args = { months: 12, download: true }
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--months=')) args.months = toInt(a.split('=')[1])
    // `--offline` : réutilise l'archive en cache sans re-télécharger.
    // (on évite `--no-download`, intercepté par npm via sa convention --no-*)
    else if (a === '--offline') args.download = false
  }
  return args
}

// --- téléchargement / cache -------------------------------------------------

async function getScrutinFiles(download) {
  await mkdir(CACHE, { recursive: true })
  const zipPath = join(CACHE, 'Scrutins.json.zip')

  if (download || !existsSync(zipPath)) {
    console.log(`Téléchargement de ${SCRUTINS_URL} …`)
    const res = await fetch(SCRUTINS_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status} sur ${SCRUTINS_URL}`)
    const buf = Buffer.from(await res.arrayBuffer())
    await writeFile(zipPath, buf)
    console.log(`  → ${(buf.length / 1e6).toFixed(1)} Mo`)
  } else {
    console.log('Archive déjà en cache (--no-download).')
  }

  const zipBuf = await readFile(zipPath)
  const entries = unzipSync(new Uint8Array(zipBuf))
  const decoder = new TextDecoder('utf-8')
  /** @type {Array<{name: string, json: any}>} */
  const files = []
  for (const [name, bytes] of Object.entries(entries)) {
    if (!name.endsWith('.json') || bytes.length === 0) continue
    files.push({ name, json: JSON.parse(decoder.decode(bytes)) })
  }
  return files
}

// --- classification mécanique d'un scrutin ----------------------------------

/**
 * Catégorise un scrutin. On ne garde que les votes signifiants :
 *  - 'ensemble' : vote sur l'ensemble d'un texte (le vote politique majeur),
 *  - 'motion'   : motion de censure.
 * Tout le reste (amendements, articles…) → null (écarté).
 */
function categorize(scrutin) {
  if (scrutin.typeVote?.codeTypeVote === 'MOC') return 'motion'
  const objet = normApos(scrutin.objet?.libelle || scrutin.titre || '').toLowerCase()
  if (/^l'ensemble\b/.test(objet)) return 'ensemble'
  return null
}

/**
 * Détermine la position exprimée d'un groupe à partir du décompte des voix
 * (et non du champ `positionMajoritaire`, peu fiable sur les motions).
 * Renvoie 'pour' | 'contre' | 'abstention' | 'absent'.
 */
function groupPosition(decompteVoix) {
  const pour = toInt(decompteVoix?.pour)
  const contre = toInt(decompteVoix?.contre)
  const abst = toInt(decompteVoix?.abstentions)
  const max = Math.max(pour, contre, abst)
  if (max === 0) return 'absent'
  if (pour === max) return 'pour'
  if (contre === max) return 'contre'
  return 'abstention'
}

/**
 * Mesure mécanique du caractère clivant d'un scrutin, à partir des positions
 * de groupe. Un vote où tous les groupes votent pareil n'a aucune valeur pour
 * distinguer l'utilisateur entre partis ; un vote pour/contre franc en a.
 * Renvoie { clivant, pour, contre, abstention } (nombres de groupes par camp).
 */
function discriminance(positions) {
  let pour = 0
  let contre = 0
  let abstention = 0
  for (const p of Object.values(positions)) {
    if (p.position === 'pour') pour++
    else if (p.position === 'contre') contre++
    else if (p.position === 'abstention') abstention++
  }
  return { clivant: pour > 0 && contre > 0, pour, contre, abstention }
}

// --- pipeline principal -----------------------------------------------------

/** Charge la taxonomie + les affectations, et prépare la validation des ids. */
async function loadThemes() {
  const taxonomy = JSON.parse(await readFile(TAXONOMY, 'utf8'))
  const validSub = new Set(taxonomy.themes.flatMap((t) => t.subthemes.map((s) => s.id)))
  const validTag = new Set(taxonomy.tags.map((t) => t.id))
  let assignments = {}
  if (existsSync(THEMES)) assignments = JSON.parse(await readFile(THEMES, 'utf8'))
  return { validSub, validTag, assignments }
}

async function main() {
  const { months, download } = parseArgs()
  const files = await getScrutinFiles(download)
  console.log(`${files.length} scrutins lus dans l'archive.`)

  const { validSub, validTag, assignments } = await loadThemes()
  const unknownIds = new Set()
  const unclassified = []

  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  console.log(`Filtre : votes signifiants depuis ${cutoffStr} (${months} mois).`)

  const scrutins = []
  let minDate = '9999'
  let maxDate = '0000'

  for (const { json } of files) {
    const s = json.scrutin
    if (!s) continue
    const date = s.dateScrutin
    if (!date || date < cutoffStr) continue
    const category = categorize(s)
    if (!category) continue

    const groupes = asArray(s.ventilationVotes?.organe?.groupes?.groupe)
    /** @type {Record<string, any>} */
    const positions = {}
    for (const g of groupes) {
      const ref = g.organeRef
      if (!ref || !GROUPS[ref]) continue // ignore PO0 et inconnus
      const dv = g.vote?.decompteVoix
      positions[ref] = {
        position: groupPosition(dv),
        pour: toInt(dv?.pour),
        contre: toInt(dv?.contre),
        abstention: toInt(dv?.abstentions),
        membres: toInt(g.nombreMembresGroupe),
      }
    }

    // Fusion des thèmes (affectations éditoriales depuis scripts/themes.json),
    // avec validation des identifiants contre la taxonomie.
    const assigned = assignments[s.uid]
    const subthemes = (assigned?.subthemes || []).filter((id) => {
      if (validSub.has(id)) return true
      unknownIds.add(id)
      return false
    })
    const tags = (assigned?.tags || []).filter((id) => {
      if (validTag.has(id)) return true
      unknownIds.add(id)
      return false
    })
    if (subthemes.length === 0) unclassified.push(s.uid)

    const d = s.syntheseVote?.decompte || {}
    scrutins.push({
      uid: s.uid,
      numero: toInt(s.numero),
      date,
      title: (s.objet?.libelle || s.titre || '').trim(),
      type: s.typeVote?.codeTypeVote || null, // SPS | SPO | MOC
      category, // ensemble | motion
      sort: s.sort?.code || null, // adopté | rejeté
      dossier: s.objet?.dossierLegislatif
        ? {
            ref: s.objet.dossierLegislatif.dossierRef || null,
            libelle: s.objet.dossierLegislatif.libelle || null,
          }
        : null,
      synthese: {
        pour: toInt(d.pour),
        contre: toInt(d.contre),
        abstention: toInt(d.abstentions),
        nonVotants: toInt(d.nonVotants),
      },
      themes: { subthemes, tags },
      discriminance: discriminance(positions),
      positions,
    })

    if (date < minDate) minDate = date
    if (date > maxDate) maxDate = date
  }

  scrutins.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  const groups = Object.entries(GROUPS)
    .filter(([ref]) => ref !== 'PO840056' && ref !== 'PO847173')
    .map(([ref, g]) => ({ ref, ...g }))

  const dataset = {
    meta: {
      source: 'data.assemblee-nationale.fr',
      sourceUrl: SCRUTINS_URL,
      legislature: LEGISLATURE,
      generatedAt: new Date().toISOString(),
      windowMonths: months,
      scrutinCount: scrutins.length,
      dateRange: { from: minDate, to: maxDate },
      note: 'Votes « sur l\'ensemble » + motions de censure uniquement. Thèmes non encore renseignés.',
    },
    groups,
    scrutins,
  }

  await mkdir(dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify(dataset, null, 2), 'utf-8')

  console.log(`\n✓ ${scrutins.length} scrutins signifiants écrits dans public/data/scrutins.json`)
  console.log(`  Période : ${minDate} → ${maxDate}`)
  const byCat = scrutins.reduce((m, s) => ((m[s.category] = (m[s.category] || 0) + 1), m), {})
  console.log(`  Répartition : ${JSON.stringify(byCat)}`)

  // Rapport de thématisation
  const classifiedCount = scrutins.length - unclassified.length
  console.log(`\n  Thèmes : ${classifiedCount}/${scrutins.length} scrutins classés.`)
  if (unknownIds.size) {
    console.warn(`  ⚠ Identifiants inconnus (absents de la taxonomie) : ${[...unknownIds].join(', ')}`)
  }
  if (unclassified.length) {
    console.warn(`  ⚠ ${unclassified.length} scrutins NON classés : ${unclassified.join(', ')}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
