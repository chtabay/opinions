import { useEffect, useMemo, useRef, useState } from 'react'
import './opinions.css'
import type { Answer, Dataset, Scrutin, Taxonomy } from './types'
import { balancedSample, loadData, scoreAgreement } from './dataset'
import { Badge, Button, ChoiceButton, CountBar, Disclosure, GroupBar, Icon, Mark, Progress } from './ui'

type Phase = 'intro' | 'question' | 'results'

const AN_SCRUTIN = (numero: number) => `https://www.assemblee-nationale.fr/dyn/17/scrutins/${numero}`
const AN_DOSSIER = (ref: string) => `https://www.assemblee-nationale.fr/dyn/17/dossiers/${ref}`

const NATURE_HINT: Record<string, string> = {
  "Vote sur l'ensemble": "Vote final sur l'adoption ou non d'un texte de loi.",
  'Motion de censure': 'Vote pouvant renverser le Gouvernement (seules les voix « pour » comptent).',
}

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]
function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`
}

function nature(s: Scrutin): string {
  return s.category === 'motion' ? 'Motion de censure' : "Vote sur l'ensemble"
}
function clivLabel(s: Scrutin): string {
  return s.discriminance.clivant ? 'Vote clivant' : 'Vote consensuel'
}
/** Titre lisible : retire le préfixe « l'ensemble de la… ». */
function cleanTitle(s: Scrutin): string {
  const t = s.title.replace(/^l['’]ensemble (de la |du |de l['’]|des )?/i, '').trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

const CHOICES = [
  { key: 'pour', label: 'Pour', icon: 'check' },
  { key: 'contre', label: 'Contre', icon: 'x' },
  { key: 'abstention', label: 'Abstention', icon: 'minus' },
  { key: 'passer', label: 'Passer', icon: 'skip' },
]

export function Quiz() {
  const [data, setData] = useState<{ dataset: Dataset; taxonomy: Taxonomy } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData().then(setData).catch((e) => setError(String(e)))
  }, [])

  const sample = useMemo(
    () => (data ? balancedSample(data.dataset, data.taxonomy, 2) : []),
    [data],
  )
  const subLabel = useMemo(() => {
    const m = new Map<string, string>()
    if (data) for (const t of data.taxonomy.themes) for (const s of t.subthemes) m.set(s.id, s.label)
    return m
  }, [data])

  const total = sample.length

  function resetScroll() {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }
  function start() {
    setAnswers({})
    setIdx(0)
    setPhase('question')
    resetScroll()
  }
  function answerCurrent(choice: Answer) {
    const v = sample[idx]
    setAnswers((a) => ({ ...a, [v.uid]: choice }))
  }
  function next() {
    if (idx + 1 >= total) setPhase('results')
    else setIdx(idx + 1)
    resetScroll()
  }
  function restart() {
    setAnswers({})
    setIdx(0)
    setPhase('intro')
    resetScroll()
  }

  const ranking = useMemo(() => {
    if (!data) return []
    return scoreAgreement(sample, answers, data.dataset.groups).map((r) => ({
      sigle: r.group.abbrev,
      nom: r.group.name,
      pct: r.pct ?? 0,
    }))
  }, [data, sample, answers])
  const comparedCount = sample.filter((s) => answers[s.uid] && answers[s.uid] !== 'passer').length

  return (
    <div className="stage">
      <div className="device" data-density="standard">
        <div className="appbar">
          <div className="wordmark">
            <Mark size={22} />
            <b>GlobéNostra</b>
            <span className="sep">/</span>
            <span className="mod">Opinions</span>
          </div>
          {phase === 'question' && total > 0 && (
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {idx + 1}/{total}
            </span>
          )}
        </div>

        <div ref={scrollRef} className="scroll">
          {error && (
            <div className="screen">
              <p style={{ color: 'var(--pos-rejete)' }}>Erreur de chargement des données : {error}</p>
            </div>
          )}
          {!error && !data && (
            <div className="screen">
              <p className="eyebrow">Chargement…</p>
            </div>
          )}
          {data && phase === 'intro' && <IntroScreen onStart={start} total={total} window={data.dataset.meta.windowMonths} />}
          {data && phase === 'question' && (
            <QuestionScreen
              key={sample[idx].uid}
              vote={sample[idx]}
              index={idx + 1}
              total={total}
              answer={answers[sample[idx].uid]}
              themeLabels={sample[idx].themes.subthemes.map((id) => subLabel.get(id) ?? id)}
              groups={data.dataset.groups}
              onAnswer={answerCurrent}
              onNext={next}
            />
          )}
          {data && phase === 'results' && (
            <ResultsScreen ranking={ranking} compared={comparedCount} onRestart={restart} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ————————————————————————————— INTRO ————————————————————————————— */
function IntroScreen({ onStart, total, window: months }: { onStart: () => void; total: number; window: number }) {
  return (
    <div className="screen">
      <p className="eyebrow" style={{ marginBottom: 14 }}>Atelier de lucidité politique</p>
      <h1 style={{ margin: '0 0 14px', fontSize: 'var(--fs-3xl)', lineHeight: 1.12, letterSpacing: '-.02em', fontWeight: 800, textWrap: 'balance' }}>
        Et vous, vous auriez voté comment ?
      </h1>
      <p style={{ margin: '0 0 22px', fontSize: 'var(--fs-lg)', lineHeight: 1.5, color: 'var(--text-muted)', textWrap: 'pretty' }}>
        {total} vrais votes de l'Assemblée nationale, choisis parmi les {months} derniers mois. Répondez, puis découvrez de quels
        groupes parlementaires vos réponses se rapprochent.
      </p>

      <div style={{ display: 'flex', gap: 12, padding: '16px 16px', background: 'var(--accent-50)', border: '1px solid var(--accent-100)', borderRadius: 'var(--r-lg)', marginBottom: 18 }}>
        <span style={{ color: 'var(--accent-600)', flexShrink: 0, marginTop: 1 }}>
          <Icon name="scale" size={22} />
        </span>
        <div>
          <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--accent-800)' }}>
            Le score n'est qu'une porte d'entrée.
          </p>
          <p style={{ margin: 0, fontSize: 'var(--fs-sm)', lineHeight: 1.55, color: 'var(--accent-800)', opacity: 0.9 }}>
            Ce genre d'outil simplifie. Un vote dépend du contexte, de la discipline de groupe, de compromis. « Se rapprocher »
            d'un groupe n'est pas « être d'accord » avec lui. Ici, le but est de comprendre ces biais et d'approfondir — pas de
            vous ranger dans une case.
          </p>
        </div>
      </div>

      <ul style={{ listStyle: 'none', margin: '0 0 26px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {([
          ['eye', "Le résultat réel d'un vote ne s'affiche qu'après votre réponse."],
          ['lock', 'Anonyme. Aucune réponse n\'est conservée ni transmise.'],
          ['external', 'Chaque vote renvoie à son scrutin officiel sur assemblée-nationale.fr.'],
        ] as const).map(([ic, txt]) => (
          <li key={ic} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            <span style={{ color: 'var(--text-subtle)', marginTop: 1, flexShrink: 0 }}>
              <Icon name={ic} size={17} />
            </span>
            {txt}
          </li>
        ))}
      </ul>

      <Button size="lg" full onClick={onStart} iconRight="arrow">Commencer</Button>
      <p style={{ textAlign: 'center', marginTop: 12, fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>
        Environ 3 minutes · {total} votes · sans inscription
      </p>
    </div>
  )
}

/* —————————————————————— CARTE-QUESTION (2 états) —————————————————————— */
function QuestionScreen({
  vote,
  index,
  total,
  answer,
  themeLabels,
  groups,
  onAnswer,
  onNext,
}: {
  vote: Scrutin
  index: number
  total: number
  answer: Answer | undefined
  themeLabels: string[]
  groups: Dataset['groups']
  onAnswer: (a: Answer) => void
  onNext: () => void
}) {
  const [ctxOpen, setCtxOpen] = useState(false)
  const [groupsOpen, setGroupsOpen] = useState(false)
  const answered = !!answer
  const nat = nature(vote)
  const dec = vote.synthese
  const decTotal = dec.pour + dec.contre + dec.abstention

  return (
    <div className="screen" style={{ paddingTop: 'var(--sp-5)' }}>
      <Progress index={index} total={total} />

      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <Badge tone="accent" variant="subtle">{nat}</Badge>
          <Badge tone="neutral" variant="outline">{formatDate(vote.date)}</Badge>
          <Badge tone="neutral" variant="outline">{clivLabel(vote)}</Badge>
        </div>

        <p style={{ margin: '0 0 4px', fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>{NATURE_HINT[nat]}</p>

        <h2 style={{ margin: '6px 0 14px', fontSize: 'var(--fs-2xl)', lineHeight: 1.18, letterSpacing: '-.015em', fontWeight: 800, textWrap: 'balance' }}>
          {cleanTitle(vote)}
        </h2>

        {themeLabels.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
            {themeLabels.map((t) => (
              <span key={t} style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '4px 10px', borderRadius: 'var(--r-full)' }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Contexte « pour décider » — matériel officiel uniquement (on informe, on n'oriente pas) */}
      <div style={{ marginBottom: 18 }}>
        <Disclosure open={ctxOpen} onToggle={() => setCtxOpen(!ctxOpen)} icon="info" summary="Contexte — pour décider">
          <p style={{ margin: 0 }}>{NATURE_HINT[nat]}</p>
          {vote.dossier?.ref && (
            <p style={{ margin: '10px 0 0' }}>
              <a href={AN_DOSSIER(vote.dossier.ref)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, textDecoration: 'none' }}>
                Lire le texte (dossier législatif) <Icon name="external" size={14} />
              </a>
            </p>
          )}
          {!answered && (
            <p style={{ margin: '10px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
              Le résultat réel du vote n'est volontairement pas affiché : à vous de vous décider d'abord.
            </p>
          )}
        </Disclosure>
      </div>

      {/* CHOIX — neutres */}
      <div style={{ display: 'grid', gap: 10 }}>
        {CHOICES.map((c) => (
          <ChoiceButton
            key={c.key}
            choice={c}
            selected={answer === c.key}
            disabled={answered}
            onClick={() => !answered && onAnswer(c.key as Answer)}
          />
        ))}
      </div>

      {/* —— RÉVÉLATION après réponse —— */}
      {answered && (
        <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Badge tone={vote.sort === 'adopté' ? 'adopte' : 'rejete'} variant="subtle">
              <Icon name={vote.sort === 'adopté' ? 'check' : 'x'} size={14} />
              Texte {vote.sort}
            </Badge>
            <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-subtle)' }}>Scrutin n° {vote.numero}</span>
          </div>

          {nat === 'Motion de censure' ? (
            <p style={{ margin: '0 0 16px', fontSize: 'var(--fs-md)', lineHeight: 1.55, color: 'var(--text-muted)' }}>
              <b style={{ color: 'var(--text)' }}>{dec.pour} voix</b> pour la censure — il en fallait 289. Seules les voix « pour »
              sont décomptées.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 9, marginBottom: 16 }}>
              <CountBar label="Pour" value={dec.pour} total={decTotal} />
              <CountBar label="Contre" value={dec.contre} total={decTotal} />
              <CountBar label="Abstention" value={dec.abstention} total={decTotal} />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <Disclosure open={groupsOpen} onToggle={() => setGroupsOpen(!groupsOpen)} icon="layers" summary="Comment chaque groupe a voté">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginTop: 4 }}>
                {groups.map((g) => {
                  const pos = vote.positions[g.ref]?.position
                  const lbl = pos === 'pour' ? 'Pour' : pos === 'contre' ? 'Contre' : pos === 'abstention' ? 'Abstention' : '—'
                  return (
                    <div key={g.ref} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 'var(--fs-sm)', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{g.abbrev}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{lbl}</span>
                    </div>
                  )
                })}
              </div>
            </Disclosure>
          </div>

          <a
            href={AN_SCRUTIN(vote.numero)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 'var(--fs-sm)', fontWeight: 600, textDecoration: 'none', color: 'var(--accent-600)', marginBottom: 20 }}
          >
            Voir l'analyse du scrutin sur assemblée-nationale.fr
            <Icon name="external" size={15} />
          </a>

          <Button size="lg" full onClick={onNext} iconRight="arrow">
            {index === total ? 'Voir mes résultats' : 'Question suivante'}
          </Button>
        </div>
      )}
    </div>
  )
}

/* ————————————————————————————— RÉSULTATS ————————————————————————————— */
function ComingSoonCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 15px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', opacity: 0.92 }}>
      <span style={{ color: 'var(--text-subtle)', flexShrink: 0, marginTop: 1 }}>
        <Icon name={icon} size={20} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)' }}>{title}</span>
          <Badge tone="neutral" variant="outline">à venir</Badge>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.45 }}>{desc}</p>
      </div>
    </div>
  )
}

function ResultsScreen({
  ranking,
  compared,
  onRestart,
}: {
  ranking: { sigle: string; nom: string; pct: number }[]
  compared: number
  onRestart: () => void
}) {
  const lead = ranking[0]
  return (
    <div className="screen">
      <p className="eyebrow" style={{ marginBottom: 12 }}>Vos résultats</p>

      <div style={{ padding: '20px 18px', background: 'var(--accent-500)', borderRadius: 'var(--r-xl)', color: '#fff', marginBottom: 8 }}>
        <p style={{ margin: '0 0 6px', fontSize: 'var(--fs-sm)', opacity: 0.85, fontWeight: 600 }}>Vos réponses se rapprochent le plus de</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--fs-3xl)', fontWeight: 800, letterSpacing: '-.02em' }}>{lead?.sigle ?? '—'}</span>
          <span style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, opacity: 0.95 }}>{lead?.pct ?? 0}% d'accord</span>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 'var(--fs-sm)', opacity: 0.85 }}>{lead?.nom ?? ''}</p>
      </div>
      <p style={{ margin: '0 0 20px', fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', textAlign: 'center' }}>
        Sur {compared} vote{compared > 1 ? 's' : ''} comparé{compared > 1 ? 's' : ''} (les votes « passés » sont exclus).
      </p>

      <p className="eyebrow" style={{ marginBottom: 6 }}>Proximité par groupe</p>
      <div style={{ marginBottom: 8 }}>
        {ranking.map((g, i) => (
          <GroupBar key={g.sigle} rank={i + 1} sigle={g.sigle} nom={g.nom} pct={g.pct} lead={i === 0} />
        ))}
      </div>
      <p style={{ margin: '4px 0 24px', fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', lineHeight: 1.5 }}>
        Même couleur pour tous les groupes : « Opinions » ne code jamais les familles politiques par des couleurs, pour ne pas
        orienter votre lecture.
      </p>

      <div style={{ padding: '16px', background: 'var(--accent-50)', border: '1px solid var(--accent-100)', borderRadius: 'var(--r-lg)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <span style={{ color: 'var(--accent-600)', display: 'flex' }}><Icon name="alert" size={20} /></span>
          <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--accent-800)' }}>Ce que ce score ne dit pas</span>
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 9 }}>
          {[
            'La discipline de groupe : un·e député·e vote souvent avec son groupe, pas forcément selon sa conviction propre.',
            'Proximité ≠ adhésion : tomber d\'accord sur des votes ne signifie pas partager un programme.',
            'Le contexte d\'un vote (compromis, calendrier, stratégie) échappe à un simple « pour / contre ».',
          ].map((t, i) => (
            <li key={i} style={{ display: 'flex', gap: 9, fontSize: 'var(--fs-sm)', lineHeight: 1.5, color: 'var(--accent-800)' }}>
              <span style={{ flexShrink: 0, opacity: 0.6 }}>—</span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <p className="eyebrow" style={{ marginBottom: 10 }}>Aller plus loin</p>
      <div style={{ display: 'grid', gap: 10, marginBottom: 26 }}>
        <ComingSoonCard icon="layers" title="Détail par thème" desc="Voir vos accords et désaccords ventilés par sujet : budget, santé, sécurité…" />
        <ComingSoonCard icon="scale" title="Démontage des biais" desc="Comprendre, vote par vote, ce que la mécanique du score a pu masquer ou exagérer." />
      </div>

      <Button size="lg" full variant="outline" onClick={onRestart}>Recommencer l'atelier</Button>
    </div>
  )
}
