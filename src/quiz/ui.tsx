// ui.tsx — primitives partagées pour « Opinions »
// Portées fidèlement depuis le handoff Claude Design (project/app/ui.jsx).
import type { CSSProperties, ReactNode } from 'react'

/* — Icônes (stroke 1.75, 20px) — */
export function Icon({
  name,
  size = 20,
  style,
}: {
  name: string
  size?: number
  style?: CSSProperties
}) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style,
    'aria-hidden': true,
  }
  switch (name) {
    case 'check':
      return <svg {...p}><path d="M5 12.5l4 4L19 7" /></svg>
    case 'x':
      return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
    case 'minus':
      return <svg {...p}><path d="M5 12h14" /></svg>
    case 'skip':
      return <svg {...p}><path d="M7 5l8 7-8 7zM17 5v14" /></svg>
    case 'chevron':
      return <svg {...p}><path d="M6 9l6 6 6-6" /></svg>
    case 'arrow':
      return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    case 'external':
      return <svg {...p}><path d="M14 5h5v5M19 5l-8 8M19 13v6H5V5h6" /></svg>
    case 'info':
      return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.5" /></svg>
    case 'scale':
      return <svg {...p}><path d="M12 4v16M7 8h10M5 8l-2 6h6zM19 8l-2 6h6zM8 20h8" /></svg>
    case 'alert':
      return <svg {...p}><path d="M12 4l9 16H3zM12 10v4M12 17.5v.2" /></svg>
    case 'eye':
      return <svg {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.5" /></svg>
    case 'lock':
      return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
    case 'layers':
      return <svg {...p}><path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5" /></svg>
    default:
      return null
  }
}

/* — Marque GlobéNostra (globe stylisé sobre) — */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="var(--accent-500)" />
      <path
        d="M12 2.5v19M2.7 12h18.6M12 2.5c3 2.6 3 16.4 0 19M12 2.5c-3 2.6-3 16.4 0 19M4.2 7.2c4.6 2.3 11 2.3 15.6 0M4.2 16.8c4.6-2.3 11-2.3 15.6 0"
        fill="none"
        stroke="#fff"
        strokeWidth="1"
        opacity=".85"
      />
    </svg>
  )
}

/* — Badge — */
type Tone = 'neutral' | 'accent' | 'adopte' | 'rejete'
export function Badge({
  children,
  variant = 'subtle',
  tone = 'neutral',
}: {
  children: ReactNode
  variant?: 'subtle' | 'outline'
  tone?: Tone
}) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 'var(--fs-xs)',
    fontWeight: 600,
    lineHeight: 1,
    padding: '5px 9px',
    borderRadius: 'var(--r-full)',
    whiteSpace: 'nowrap',
  }
  const tones: Record<Tone, { bg: string; fg: string; bd: string }> = {
    neutral: { bg: 'var(--bg-muted)', fg: 'var(--text-muted)', bd: 'var(--border)' },
    accent: { bg: 'var(--accent-50)', fg: 'var(--accent-700)', bd: 'var(--accent-100)' },
    adopte: { bg: '#e9f1ee', fg: 'var(--pos-adopte)', bd: '#cfe3dc' },
    rejete: { bg: '#f3e9e6', fg: 'var(--pos-rejete)', bd: '#e6d2cc' },
  }
  const t = tones[tone]
  const sty: CSSProperties =
    variant === 'outline'
      ? { ...base, background: 'transparent', color: t.fg, border: `1px solid ${t.bd}` }
      : { ...base, background: t.bg, color: t.fg, border: `1px solid ${t.bd}` }
  return <span style={sty}>{children}</span>
}

/* — Barre de progression i/N — */
export function Progress({ index, total }: { index: number; total: number }) {
  const pct = (index / total) * 100
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--fs-xs)',
          fontWeight: 600,
          color: 'var(--text-subtle)',
          marginBottom: 6,
        }}
      >
        <span>
          Question {index} / {total}
        </span>
      </div>
      <div style={{ height: 5, background: 'var(--bg-muted)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
        <div
          style={{
            width: pct + '%',
            height: '100%',
            background: 'var(--accent-500)',
            borderRadius: 'var(--r-full)',
            transition: 'width .35s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </div>
    </div>
  )
}

/* — Bouton primaire / secondaire (façon Chakra solid/outline) — */
export function Button({
  children,
  onClick,
  variant = 'solid',
  full,
  size = 'md',
  iconRight,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'solid' | 'outline' | 'ghost'
  full?: boolean
  size?: 'md' | 'lg'
  iconRight?: string
  disabled?: boolean
}) {
  const sizes = {
    md: { pad: '12px 18px', fs: 'var(--fs-md)' },
    lg: { pad: '15px 22px', fs: 'var(--fs-lg)' },
  }[size]
  const variants = {
    solid: { background: 'var(--accent-500)', color: '#fff', border: '1px solid var(--accent-500)' },
    outline: { background: '#fff', color: 'var(--accent-700)', border: '1px solid var(--border-strong)' },
    ghost: { background: 'transparent', color: 'var(--accent-700)', border: '1px solid transparent' },
  }[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: sizes.pad,
        fontSize: sizes.fs,
        fontWeight: 600,
        borderRadius: 'var(--r-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: full ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        transition: 'filter .15s, background .15s',
        ...variants,
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.filter = 'brightness(0.96)')}
      onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
    >
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </button>
  )
}

/* — Disclosure (panneau dépliable, accessible) — */
export function Disclosure({
  open,
  onToggle,
  summary,
  icon,
  children,
}: {
  open: boolean
  onToggle: () => void
  summary: string
  icon?: string
  children: ReactNode
}) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        background: 'var(--bg-subtle)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '13px 15px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ color: 'var(--accent-600)', display: 'flex' }}>
          <Icon name={icon || 'info'} size={19} />
        </span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 'var(--fs-md)', color: 'var(--text)' }}>{summary}</span>
        <span
          style={{
            color: 'var(--text-subtle)',
            display: 'flex',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .2s',
          }}
        >
          <Icon name="chevron" size={18} />
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 15px 15px', fontSize: 'var(--fs-md)', lineHeight: 1.6, color: 'var(--text-muted)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* — Barre de groupe (résultats) — */
export function GroupBar({
  rank,
  sigle,
  nom,
  pct,
  lead,
}: {
  rank: number
  sigle: string
  nom: string
  pct: number
  lead?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
      <div
        style={{
          width: 18,
          textAlign: 'right',
          fontSize: 'var(--fs-sm)',
          fontWeight: 700,
          color: lead ? 'var(--accent-600)' : 'var(--text-subtle)',
        }}
      >
        {rank}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: lead ? 'var(--accent-700)' : 'var(--text)' }}>
              {sigle}
            </span>
            <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', fontWeight: 500 }}>
              {nom}
            </span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: lead ? 'var(--accent-700)' : 'var(--text-muted)' }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: lead ? 12 : 9, background: 'var(--bg-muted)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: pct + '%',
              height: '100%',
              background: lead ? 'var(--accent-500)' : 'var(--accent-300)',
              borderRadius: 'var(--r-full)',
              transition: 'width .5s cubic-bezier(.2,.8,.2,1)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* — Bouton de choix (Pour/Contre/Abstention/Passer) — neutres, même poids — */
export function ChoiceButton({
  choice,
  selected,
  onClick,
  disabled,
}: {
  choice: { key: string; label: string; icon: string }
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        width: '100%',
        padding: 'var(--row-pad, 16px) 16px',
        textAlign: 'left',
        fontSize: 'var(--fs-md)',
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: 'var(--r-md)',
        border: selected ? '1.5px solid var(--accent-500)' : '1.5px solid var(--border-strong)',
        background: selected ? 'var(--accent-50)' : '#fff',
        color: selected ? 'var(--accent-800)' : 'var(--text)',
        opacity: disabled && !selected ? 0.55 : 1,
        transition: 'border-color .15s, background .15s',
      }}
      onMouseEnter={(e) => !disabled && !selected && (e.currentTarget.style.borderColor = 'var(--accent-300)')}
      onMouseLeave={(e) => !selected && (e.currentTarget.style.borderColor = 'var(--border-strong)')}
    >
      <span style={{ display: 'flex', flexShrink: 0, color: selected ? 'var(--accent-600)' : 'var(--text-subtle)' }}>
        <Icon name={choice.icon} size={20} />
      </span>
      {choice.label}
      {selected && (
        <span style={{ marginLeft: 'auto', display: 'flex', color: 'var(--accent-600)' }}>
          <Icon name="check" size={18} />
        </span>
      )}
    </button>
  )
}

/* — Barre de décompte (révélation) — */
export function CountBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-sm)' }}>
      <span style={{ width: 78, color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: 'var(--bg-muted)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: 'var(--accent-400)', borderRadius: 'var(--r-full)' }} />
      </div>
      <span
        style={{
          width: 38,
          textAlign: 'right',
          fontWeight: 600,
          color: 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}
