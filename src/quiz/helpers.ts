import { useEffect, useState } from 'react'
import type { Scrutin } from './types'

export const AN_SCRUTIN = (numero: number) => `https://www.assemblee-nationale.fr/dyn/17/scrutins/${numero}`
export const AN_DOSSIER = (ref: string) => `https://www.assemblee-nationale.fr/dyn/17/dossiers/${ref}`

export const NATURE_HINT: Record<string, string> = {
  "Vote sur l'ensemble": "Vote final sur l'adoption ou non d'un texte de loi.",
  'Motion de censure': 'Vote pouvant renverser le Gouvernement (seules les voix « pour » comptent).',
}

export const CHOICES = [
  { key: 'pour', label: 'Pour', icon: 'check' },
  { key: 'contre', label: 'Contre', icon: 'x' },
  { key: 'abstention', label: 'Abstention', icon: 'minus' },
  { key: 'passer', label: 'Passer', icon: 'skip' },
]

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]
export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`
}

export function nature(s: Scrutin): string {
  return s.category === 'motion' ? 'Motion de censure' : "Vote sur l'ensemble"
}
export function clivLabel(s: Scrutin): string {
  return s.discriminance.clivant ? 'Vote clivant' : 'Vote consensuel'
}
/** Titre lisible : retire le préfixe « l'ensemble de la… ». */
export function cleanTitle(s: Scrutin): string {
  const t = s.title.replace(/^l['’]ensemble (de la |du |de l['’]|des )?/i, '').trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** Vrai à partir de `min`px de large (bascule responsive mobile/desktop). */
export function useIsDesktop(min = 960): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(`(min-width:${min}px)`).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(`(min-width:${min}px)`)
    const onChange = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    // Filet de sécurité : certains environnements ne déclenchent pas l'event
    // `change` de matchMedia au redimensionnement — on réévalue aussi sur resize.
    window.addEventListener('resize', onChange)
    onChange()
    return () => {
      mq.removeEventListener('change', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [min])
  return isDesktop
}
