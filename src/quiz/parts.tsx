import { useState } from 'react'
import type { Answer, Dataset, Scrutin } from './types'
import { Badge, Button, ChoiceButton, CountBar, Disclosure, Icon } from './ui'
import { AN_DOSSIER, AN_SCRUTIN, CHOICES, NATURE_HINT, nature } from './helpers'

/** Boutons de choix — neutres. `columns` = 1 (mobile) ou 2 (desktop). */
export function Choices({
  answer,
  answered,
  onAnswer,
  columns = 1,
}: {
  answer: Answer | undefined
  answered: boolean
  onAnswer: (a: Answer) => void
  columns?: 1 | 2
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: columns === 2 ? '1fr 1fr' : '1fr', gap: columns === 2 ? 12 : 10 }}>
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
  )
}

/** Contenu du bloc « Contexte — pour décider ». Matériel OFFICIEL uniquement :
    on informe, on n'oriente pas (pas de résumé rédigé par la plateforme). */
export function ContextBody({ vote, answered, bordered }: { vote: Scrutin; answered: boolean; bordered?: boolean }) {
  return (
    <>
      <p style={{ margin: 0 }}>{NATURE_HINT[nature(vote)]}</p>
      {vote.dossier?.ref && (
        <p style={{ margin: '10px 0 0' }}>
          <a
            href={AN_DOSSIER(vote.dossier.ref)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, textDecoration: 'none' }}
          >
            Lire le texte (dossier législatif) <Icon name="external" size={14} />
          </a>
        </p>
      )}
      {!answered && (
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 'var(--fs-sm)',
            color: 'var(--text-subtle)',
            fontStyle: 'italic',
            ...(bordered ? { paddingTop: 12, borderTop: '1px solid var(--border)' } : {}),
          }}
        >
          Le résultat réel du vote n'est volontairement pas affiché : à vous de vous décider d'abord.
        </p>
      )}
    </>
  )
}

/** Révélation après réponse : résultat réel + décompte + groupes + source. */
export function RevealBody({
  vote,
  groups,
  index,
  total,
  onNext,
}: {
  vote: Scrutin
  groups: Dataset['groups']
  index: number
  total: number
  onNext: () => void
}) {
  const [groupsOpen, setGroupsOpen] = useState(false)
  const dec = vote.synthese
  const decTotal = dec.pour + dec.contre + dec.abstention
  const isMotion = nature(vote) === 'Motion de censure'

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Badge tone={vote.sort === 'adopté' ? 'adopte' : 'rejete'} variant="subtle">
          <Icon name={vote.sort === 'adopté' ? 'check' : 'x'} size={14} />
          Texte {vote.sort}
        </Badge>
        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-subtle)' }}>Scrutin n° {vote.numero}</span>
      </div>

      {isMotion ? (
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
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 'var(--fs-sm)', fontWeight: 600, textDecoration: 'none', color: 'var(--accent-600)', marginBottom: 18 }}
      >
        Voir l'analyse du scrutin sur assemblée-nationale.fr
        <Icon name="external" size={15} />
      </a>

      <Button size="lg" full onClick={onNext} iconRight="arrow">
        {index === total ? 'Voir mes résultats' : 'Question suivante'}
      </Button>
    </>
  )
}

/** Carte « à venir » (écran résultats). */
export function ComingSoonCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
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

/** Encart « Ce que ce score ne dit pas » (partagé mobile/desktop). */
export function ScoreCaveat() {
  return (
    <div style={{ padding: '16px', background: 'var(--accent-50)', border: '1px solid var(--accent-100)', borderRadius: 'var(--r-lg)' }}>
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
  )
}
