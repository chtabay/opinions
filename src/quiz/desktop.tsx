import type { ReactNode } from 'react'
import type { Answer, Dataset, Scrutin } from './types'
import { Badge, Button, GroupBar, Icon, Mark, Progress } from './ui'
import { Choices, ComingSoonCard, ContextBody, RevealBody, ScoreCaveat } from './parts'
import { cleanTitle, clivLabel, formatDate, nature, NATURE_HINT } from './helpers'

type Phase = 'intro' | 'question' | 'results'

/* — Coquille desktop : barre pleine largeur + zone centrée — */
export function DesktopShell({
  phase,
  idx,
  total,
  children,
}: {
  phase: Phase
  idx: number
  total: number
  children: ReactNode
}) {
  return (
    <div className="desk-page">
      <header className="desk-bar">
        <div className="desk-bar-inner">
          <div className="wordmark">
            <Mark size={24} />
            <b style={{ fontSize: 'var(--fs-lg)' }}>GlobéNostra</b>
            <span className="sep">/</span>
            <span className="mod" style={{ fontSize: 'var(--fs-lg)' }}>Opinions</span>
          </div>
          {phase === 'question' && (
            <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-subtle)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              Question {idx + 1} / {total}
            </span>
          )}
        </div>
      </header>
      <main className="desk-main">{children}</main>
    </div>
  )
}

/* ————————————————————————— INTRO desktop ————————————————————————— */
export function IntroDesktop({ onStart, total, months }: { onStart: () => void; total: number; months: number }) {
  return (
    <div className="desk-intro">
      <div>
        <p className="eyebrow" style={{ marginBottom: 18 }}>Atelier de lucidité politique</p>
        <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(2.4rem, 4vw, 3.3rem)', lineHeight: 1.05, letterSpacing: '-.025em', fontWeight: 800, textWrap: 'balance' }}>
          Et vous, vous auriez voté comment ?
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 'var(--fs-xl)', lineHeight: 1.5, color: 'var(--text-muted)', maxWidth: 480, textWrap: 'pretty' }}>
          {total} vrais votes de l'Assemblée nationale, choisis parmi les {months} derniers mois. Répondez, puis découvrez de quels
          groupes parlementaires vos réponses se rapprochent.
        </p>
        <Button size="lg" onClick={onStart} iconRight="arrow">Commencer l'atelier</Button>
        <p style={{ marginTop: 16, fontSize: 'var(--fs-sm)', color: 'var(--text-subtle)' }}>
          Environ 3 minutes · {total} votes · sans inscription
        </p>
      </div>

      <aside className="desk-card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <span style={{ color: 'var(--accent-600)', flexShrink: 0, marginTop: 1 }}>
            <Icon name="scale" size={24} />
          </span>
          <div>
            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'var(--accent-800)' }}>
              Le score n'est qu'une porte d'entrée.
            </p>
            <p style={{ margin: 0, fontSize: 'var(--fs-md)', lineHeight: 1.55, color: 'var(--text-muted)' }}>
              Ce genre d'outil simplifie. Un vote dépend du contexte, de la discipline de groupe, de compromis. « Se rapprocher »
              d'un groupe n'est pas « être d'accord » avec lui. Ici, le but est de comprendre ces biais et d'approfondir — pas de
              vous ranger dans une case.
            </p>
          </div>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: '18px 0 0', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 13 }}>
          {([
            ['eye', "Le résultat réel d'un vote ne s'affiche qu'après votre réponse."],
            ['lock', 'Anonyme. Aucune réponse n\'est conservée ni transmise.'],
            ['external', 'Chaque vote renvoie à son scrutin officiel sur assemblée-nationale.fr.'],
          ] as const).map(([ic, txt]) => (
            <li key={ic} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 'var(--fs-md)', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              <span style={{ color: 'var(--text-subtle)', marginTop: 1, flexShrink: 0 }}>
                <Icon name={ic} size={19} />
              </span>
              {txt}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

/* ——————————————————————— QUESTION desktop ——————————————————————— */
export function QuestionDesktop({
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
  const answered = !!answer

  return (
    <div>
      <div style={{ maxWidth: 560, marginBottom: 26 }}>
        <Progress index={index} total={total} />
      </div>

      <div className="desk-q-grid">
        {/* — Colonne question / choix — */}
        <section className="desk-card" style={{ padding: 'var(--sp-8)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <Badge tone="accent" variant="subtle">{nature(vote)}</Badge>
            <Badge tone="neutral" variant="outline">{formatDate(vote.date)}</Badge>
            <Badge tone="neutral" variant="outline">{clivLabel(vote)}</Badge>
          </div>
          <p style={{ margin: '0 0 6px', fontSize: 'var(--fs-sm)', color: 'var(--text-subtle)' }}>{NATURE_HINT[nature(vote)]}</p>
          <h2 style={{ margin: '4px 0 16px', fontSize: 'var(--fs-3xl)', lineHeight: 1.14, letterSpacing: '-.02em', fontWeight: 800, textWrap: 'balance' }}>
            {cleanTitle(vote)}
          </h2>
          {themeLabels.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 24 }}>
              {themeLabels.map((t) => (
                <span key={t} style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '4px 10px', borderRadius: 'var(--r-full)' }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          <p className="eyebrow" style={{ marginBottom: 12 }}>Vous auriez voté…</p>
          <Choices answer={answer} answered={answered} onAnswer={onAnswer} columns={2} />
        </section>

        {/* — Rail : contexte puis révélation — */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div className="desk-card" style={{ padding: 'var(--sp-5)', background: 'var(--bg-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <span style={{ color: 'var(--accent-600)', display: 'flex' }}><Icon name="info" size={20} /></span>
              <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)' }}>Contexte — pour décider</span>
            </div>
            <div style={{ fontSize: 'var(--fs-md)', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              <ContextBody vote={vote} answered={answered} bordered />
            </div>
          </div>

          {answered ? (
            <div className="desk-card" style={{ padding: 'var(--sp-5)' }}>
              <RevealBody vote={vote} groups={groups} index={index} total={total} onNext={onNext} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-lg)', color: 'var(--text-subtle)', fontSize: 'var(--fs-sm)' }}>
              <Icon name="lock" size={18} />
              Le résultat réel s'affichera ici après votre réponse.
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

/* ——————————————————————— RÉSULTATS desktop ——————————————————————— */
export function ResultsDesktop({
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
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <p className="eyebrow" style={{ marginBottom: 14 }}>Vos résultats</p>
      <div style={{ padding: '26px 28px', background: 'var(--accent-500)', borderRadius: 'var(--r-xl)', color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 'var(--fs-md)', opacity: 0.85, fontWeight: 600 }}>Vos réponses se rapprochent le plus de</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}>{lead?.sigle ?? '—'}</span>
            <span style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, opacity: 0.9 }}>{lead?.nom ?? ''}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>{lead?.pct ?? 0}%</div>
          <div style={{ fontSize: 'var(--fs-sm)', opacity: 0.85 }}>d'accord</div>
        </div>
      </div>
      <p style={{ margin: '0 0 26px', fontSize: 'var(--fs-sm)', color: 'var(--text-subtle)' }}>
        Sur {compared} vote{compared > 1 ? 's' : ''} comparé{compared > 1 ? 's' : ''} (les votes « passés » sont exclus).
      </p>

      <div className="desk-r-grid">
        <section>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Proximité par groupe</p>
          <div className="desk-card" style={{ padding: 'var(--sp-5) var(--sp-6)' }}>
            {ranking.map((g, i) => (
              <GroupBar key={g.sigle} rank={i + 1} sigle={g.sigle} nom={g.nom} pct={g.pct} lead={i === 0} />
            ))}
          </div>
          <p style={{ margin: '10px 2px 0', fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', lineHeight: 1.5 }}>
            Même couleur pour tous les groupes : « Opinions » ne code jamais les familles politiques par des couleurs, pour ne pas
            orienter votre lecture.
          </p>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ScoreCaveat />
          <ComingSoonCard icon="layers" title="Détail par thème" desc="Voir vos accords et désaccords ventilés par sujet : budget, santé, sécurité…" />
          <ComingSoonCard icon="scale" title="Démontage des biais" desc="Comprendre, vote par vote, ce que la mécanique du score a pu masquer ou exagérer." />
          <Button size="lg" full variant="outline" onClick={onRestart}>Recommencer l'atelier</Button>
        </aside>
      </div>
    </div>
  )
}
