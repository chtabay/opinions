import { useEffect, useMemo, useRef, useState } from 'react'
import './opinions.css'
import type { Answer, Dataset, Scrutin, Taxonomy } from './types'
import { balancedSample, loadData, scoreAgreement } from './dataset'
import { Badge, Button, Disclosure, GroupBar, Icon, Mark, Progress } from './ui'
import { Choices, ComingSoonCard, ContextBody, RevealBody, ScoreCaveat } from './parts'
import { cleanTitle, clivLabel, formatDate, nature, NATURE_HINT, useIsDesktop } from './helpers'
import { DesktopShell, IntroDesktop, QuestionDesktop, ResultsDesktop } from './desktop'

type Phase = 'intro' | 'question' | 'results'

export function Quiz() {
  const [data, setData] = useState<{ dataset: Dataset; taxonomy: Taxonomy } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktop(960)

  useEffect(() => {
    loadData().then(setData).catch((e) => setError(String(e)))
  }, [])

  const sample = useMemo(() => (data ? balancedSample(data.dataset, data.taxonomy, 2) : []), [data])
  const subLabel = useMemo(() => {
    const m = new Map<string, string>()
    if (data) for (const t of data.taxonomy.themes) for (const s of t.subthemes) m.set(s.id, s.label)
    return m
  }, [data])

  const total = sample.length

  function resetScroll() {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    window.scrollTo(0, 0)
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

  const themeLabelsFor = (s: Scrutin) => s.themes.subthemes.map((id) => subLabel.get(id) ?? id)

  // — États transverses (chargement / erreur) —
  if (error) {
    return (
      <div className="opinions-root">
        <div className="desk-page">
          <div className="desk-main">
            <p style={{ color: 'var(--pos-rejete)' }}>Erreur de chargement des données : {error}</p>
          </div>
        </div>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="opinions-root">
        <div className="desk-page">
          <div className="desk-main">
            <p className="eyebrow">Chargement…</p>
          </div>
        </div>
      </div>
    )
  }

  const cur = sample[idx]

  // — Desktop (≥ 960px) —
  if (isDesktop) {
    return (
      <div className="opinions-root">
        <DesktopShell phase={phase} idx={idx} total={total}>
          {phase === 'intro' && <IntroDesktop onStart={start} total={total} months={data.dataset.meta.windowMonths} />}
          {phase === 'question' && (
            <QuestionDesktop
              key={cur.uid}
              vote={cur}
              index={idx + 1}
              total={total}
              answer={answers[cur.uid]}
              themeLabels={themeLabelsFor(cur)}
              groups={data.dataset.groups}
              onAnswer={answerCurrent}
              onNext={next}
            />
          )}
          {phase === 'results' && <ResultsDesktop ranking={ranking} compared={comparedCount} onRestart={restart} />}
        </DesktopShell>
      </div>
    )
  }

  // — Mobile (cadre « device ») —
  return (
    <div className="opinions-root">
      <div className="stage">
        <div className="device" data-density="standard">
          <div className="appbar">
            <div className="wordmark">
              <Mark size={22} />
              <b>GlobéNostra</b>
              <span className="sep">/</span>
              <span className="mod">Opinions</span>
            </div>
            {phase === 'question' && (
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {idx + 1}/{total}
              </span>
            )}
          </div>

          <div ref={scrollRef} className="scroll">
            {phase === 'intro' && <IntroScreen onStart={start} total={total} months={data.dataset.meta.windowMonths} />}
            {phase === 'question' && (
              <QuestionScreen
                key={cur.uid}
                vote={cur}
                index={idx + 1}
                total={total}
                answer={answers[cur.uid]}
                themeLabels={themeLabelsFor(cur)}
                groups={data.dataset.groups}
                onAnswer={answerCurrent}
                onNext={next}
              />
            )}
            {phase === 'results' && <ResultsScreen ranking={ranking} compared={comparedCount} onRestart={restart} />}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ————————————————————————————— INTRO (mobile) ————————————————————————————— */
function IntroScreen({ onStart, total, months }: { onStart: () => void; total: number; months: number }) {
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

/* —————————————————————— CARTE-QUESTION mobile (2 états) —————————————————————— */
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
  const answered = !!answer

  return (
    <div className="screen" style={{ paddingTop: 'var(--sp-5)' }}>
      <Progress index={index} total={total} />

      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <Badge tone="accent" variant="subtle">{nature(vote)}</Badge>
          <Badge tone="neutral" variant="outline">{formatDate(vote.date)}</Badge>
          <Badge tone="neutral" variant="outline">{clivLabel(vote)}</Badge>
        </div>

        <p style={{ margin: '0 0 4px', fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>{NATURE_HINT[nature(vote)]}</p>

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

      <div style={{ marginBottom: 18 }}>
        <Disclosure open={ctxOpen} onToggle={() => setCtxOpen(!ctxOpen)} icon="info" summary="Contexte — pour décider">
          <ContextBody vote={vote} answered={answered} />
        </Disclosure>
      </div>

      <Choices answer={answer} answered={answered} onAnswer={onAnswer} columns={1} />

      {answered && (
        <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <RevealBody vote={vote} groups={groups} index={index} total={total} onNext={onNext} />
        </div>
      )}
    </div>
  )
}

/* ————————————————————————————— RÉSULTATS (mobile) ————————————————————————————— */
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

      <div style={{ marginBottom: 24 }}>
        <ScoreCaveat />
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
