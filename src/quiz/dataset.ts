import type {
  Answer,
  Dataset,
  Group,
  Position,
  Scrutin,
  Taxonomy,
  Theme,
} from './types'

const base = import.meta.env.BASE_URL

/** Charge le dataset des scrutins et la taxonomie (fichiers statiques). */
export async function loadData(): Promise<{ dataset: Dataset; taxonomy: Taxonomy }> {
  const [dataset, taxonomy] = await Promise.all([
    fetch(`${base}data/scrutins.json`).then((r) => r.json() as Promise<Dataset>),
    fetch(`${base}data/taxonomy.json`).then((r) => r.json() as Promise<Taxonomy>),
  ])
  return { dataset, taxonomy }
}

/** Indexe : sous-thème → thème, pour regrouper à l'affichage. */
export function buildThemeIndex(taxonomy: Taxonomy) {
  const subToTheme = new Map<string, Theme>()
  for (const theme of taxonomy.themes) {
    for (const sub of theme.subthemes) subToTheme.set(sub.id, theme)
  }
  return subToTheme
}

/** Thème principal d'un scrutin = thème de son premier sous-thème. */
function primaryThemeId(scrutin: Scrutin, subToTheme: Map<string, Theme>): string | null {
  const sub = scrutin.themes.subthemes[0]
  return sub ? (subToTheme.get(sub)?.id ?? null) : null
}

/**
 * Sélection déterministe d'un échantillon équilibré : jusqu'à `perTheme` votes
 * par thème, en privilégiant les votes clivants puis les plus récents.
 * Couvre tous les thèmes représentés. Aucun aléatoire (résultat stable).
 */
export function balancedSample(
  dataset: Dataset,
  taxonomy: Taxonomy,
  perTheme = 2,
): Scrutin[] {
  const subToTheme = buildThemeIndex(taxonomy)
  const byTheme = new Map<string, Scrutin[]>()
  for (const s of dataset.scrutins) {
    const tid = primaryThemeId(s, subToTheme)
    if (!tid) continue
    if (!byTheme.has(tid)) byTheme.set(tid, [])
    byTheme.get(tid)!.push(s)
  }

  const sample: Scrutin[] = []
  // Ordre des thèmes = ordre de la taxonomie (stable et lisible).
  for (const theme of taxonomy.themes) {
    const list = byTheme.get(theme.id)
    if (!list) continue
    list.sort((a, b) => {
      if (a.discriminance.clivant !== b.discriminance.clivant)
        return a.discriminance.clivant ? -1 : 1
      return a.date < b.date ? 1 : -1
    })
    sample.push(...list.slice(0, perTheme))
  }
  // Présentation finale par date décroissante.
  sample.sort((a, b) => (a.date < b.date ? 1 : -1))
  return sample
}

export interface GroupScore {
  group: Group
  /** Votes comparables (le groupe a exprimé une position). */
  comparable: number
  /** Votes où l'utilisateur et le groupe sont d'accord. */
  agree: number
  /** Pourcentage d'accord (0–100), ou null si aucun vote comparable. */
  pct: number | null
}

/**
 * Score d'accord simple (v1) : pour chaque réponse de l'utilisateur, on compte
 * +1 d'accord si le groupe a la même position. Les votes « passés » par
 * l'utilisateur et les votes où le groupe est absent sont ignorés.
 *
 * (Conçu pour être étendu ensuite à une distance par sous-thème.)
 */
export function scoreAgreement(
  scrutins: Scrutin[],
  answers: Record<string, Answer>,
  groups: Group[],
): GroupScore[] {
  const scores: GroupScore[] = groups.map((group) => {
    let comparable = 0
    let agree = 0
    for (const s of scrutins) {
      const ua = answers[s.uid]
      if (!ua || ua === 'passer') continue
      const gp = s.positions[group.ref]
      if (!gp || gp.position === 'absent') continue
      comparable++
      if (gp.position === (ua as Position)) agree++
    }
    return {
      group,
      comparable,
      agree,
      pct: comparable > 0 ? Math.round((agree / comparable) * 100) : null,
    }
  })
  scores.sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1))
  return scores
}
