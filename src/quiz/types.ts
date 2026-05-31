/** Types du dataset des scrutins (cf. public/data/scrutins.json & taxonomy.json). */

export type Position = 'pour' | 'contre' | 'abstention'
/** Réponse possible de l'utilisateur (inclut « passer »). */
export type Answer = Position | 'passer'

export interface GroupPosition {
  /** Position exprimée du groupe ; 'absent' si le groupe n'a pas voté. */
  position: Position | 'absent'
  pour: number
  contre: number
  abstention: number
  membres: number
}

export interface Scrutin {
  uid: string
  numero: number
  date: string
  title: string
  type: string | null
  category: 'ensemble' | 'motion'
  sort: string | null
  dossier: { ref: string | null; libelle: string | null } | null
  synthese: { pour: number; contre: number; abstention: number; nonVotants: number }
  themes: { subthemes: string[]; tags: string[] }
  discriminance: { clivant: boolean; pour: number; contre: number; abstention: number }
  positions: Record<string, GroupPosition>
}

export interface Group {
  ref: string
  abbrev: string
  name: string
}

export interface Dataset {
  meta: {
    source: string
    legislature: number
    generatedAt: string
    windowMonths: number
    scrutinCount: number
    dateRange: { from: string; to: string }
  }
  groups: Group[]
  scrutins: Scrutin[]
}

export interface Subtheme {
  id: string
  label: string
}
export interface Theme {
  id: string
  label: string
  subthemes: Subtheme[]
}
export interface Taxonomy {
  version: number
  themes: Theme[]
  tags: { id: string; label: string }[]
}
