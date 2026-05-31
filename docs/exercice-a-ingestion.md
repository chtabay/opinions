# Exercice A — Ingestion des votes de l'Assemblée

> État : **Phase 1 — plomberie en place.** Le dataset normalisé est produit ;
> la couche éditoriale (thèmes) reste à faire.

Ce document décrit comment on transforme l'open data brut de l'Assemblée
nationale en un jeu de données exploitable par l'exercice « Et vous, vous auriez
voté comment ? ».

---

## 1. La source

- **Portail** : [data.assemblee-nationale.fr](https://data.assemblee-nationale.fr/travaux-parlementaires/votes)
- **Archive scrutins** (17ᵉ législature) :
  `https://data.assemblee-nationale.fr/static/openData/repository/17/loi/scrutins/Scrutins.json.zip`
  (~23 Mo, **un fichier JSON par scrutin**, mis à jour quotidiennement).
- **Référentiel des groupes** (pour résoudre les identifiants) :
  `…/17/amo/deputes_actifs_mandats_actifs_organes/AMO10_….json.zip`
  (dossier `json/organe`, `codeType = GP`).

Le JSON est **converti automatiquement depuis du XML**. Conséquence piège : un
élément unique apparaît comme objet, et plusieurs comme tableau. Le script
normalise systématiquement (`asArray`).

---

## 2. Anatomie d'un scrutin (champs utiles)

```
scrutin
├─ uid                       "VTANR5L17V7002"
├─ numero                    "7002"
├─ dateScrutin               "2026-05-28"
├─ typeVote.codeTypeVote     SPO | SPS | MOC
├─ sort.code                 "adopté" | "rejeté"
├─ titre / objet.libelle     "l'ensemble de la proposition de loi …"
├─ objet.dossierLegislatif   { dossierRef, libelle } | null
├─ syntheseVote.decompte     { pour, contre, abstentions, nonVotants }
└─ ventilationVotes.organe.groupes.groupe[]
   ├─ organeRef              "PO845401"  (→ groupe politique)
   ├─ nombreMembresGroupe    "122"
   └─ vote
      ├─ positionMajoritaire "pour" | "contre" | "abstention"
      └─ decompteVoix        { pour, contre, abstentions, nonVotants, … }
```

**Choix de modélisation important.** On dérive la position d'un groupe du
`decompteVoix` (argmax pour/contre/abstention) plutôt que du champ
`positionMajoritaire`, peu fiable sur les motions de censure (où ne pas voter
équivaut à s'opposer). Ce point est lui-même un biais à exposer plus tard.

---

## 3. Le problème du volume → la curation

L'archive contient **7208 scrutins** (législature complète), soit **~5000 sur
12 mois**. Mais leur nature est très déséquilibrée :

| Nature (par libellé)        | Nombre  |
|-----------------------------|--------:|
| Amendements / sous-amend.   |   6153  |
| Articles                    |    807  |
| **Votes sur l'ensemble**    |  **178**|
| Motions                     |     45  |
| Autres                      |     25  |

Par type officiel : `SPO` 7138 (ordinaires, surtout amendements), `SPS` 48
(solennels), `MOC` 22 (motions de censure).

→ **On ne retient que les votes signifiants** : les **votes sur l'ensemble d'un
texte** (le vote politique majeur, titre explicite) + les **motions de
censure**. Sur 12 mois glissants, cela donne **115 scrutins** (101 « ensemble »
+ 14 motions) — un volume parfaitement gérable et éditorialisable.

### Discriminance

Un vote adopté à l'unanimité ne distingue pas l'utilisateur entre partis. Le
script calcule donc pour chaque scrutin un indicateur `discriminance.clivant`
(au moins un groupe « pour » **et** un groupe « contre »). Sur les 115 retenus,
**59 sont clivants**. C'est le vivier prioritaire pour les questions du quiz.

---

## 4. Référentiel des groupes (17ᵉ législature)

| organeRef | Abrév.  | Groupe |
|-----------|---------|--------|
| PO845401  | RN      | Rassemblement National |
| PO845407  | EPR     | Ensemble pour la République |
| PO845413  | LFI-NFP | La France insoumise – Nouveau Front Populaire |
| PO845419  | SOC     | Socialistes et apparentés |
| PO845425  | DR      | Droite Républicaine |
| PO845439  | EcoS    | Écologiste et Social |
| PO845454  | Dem     | Les Démocrates |
| PO845470  | HOR     | Horizons & Indépendants |
| PO845485  | LIOT    | Libertés, Indépendants, Outre-mer et Territoires |
| PO845514  | GDR     | Gauche Démocrate et Républicaine |
| PO872880  | UDR     | Union des droites pour la République |
| PO840056  | NI      | Non inscrits *(exclu : pas un parti)* |
| PO847173  | ?       | Groupe dissous *(à résoudre via réf. historique AMO30)* |

---

## 5. Le pipeline

```
Scrutins.json.zip ──► scripts/ingest-scrutins.mjs ──► public/data/scrutins.json
                       (télécharge, filtre, normalise)      (committé, auditable)
```

- **Build-time, pas runtime.** Le portail de l'AN n'est pas requêtable depuis le
  navigateur (CORS) et l'archive est lourde. On pré-calcule un dataset léger,
  **committé dans le repo** : il est ainsi versionné, relisible et transparent
  (cf. principe « la méthode est publique »).
- Rafraîchissement : `npm run ingest:scrutins` (re-télécharge), ou `--offline`
  pour réutiliser le cache, `--months=N` pour ajuster la fenêtre.

### Schéma de sortie (`public/data/scrutins.json`)

```jsonc
{
  "meta":   { "source", "legislature", "generatedAt", "windowMonths",
              "scrutinCount", "dateRange" },
  "groups": [ { "ref", "abbrev", "name" } ],
  "scrutins": [
    {
      "uid", "numero", "date", "title",
      "type",          // SPS | SPO | MOC
      "category",      // ensemble | motion
      "sort",          // adopté | rejeté
      "dossier",       // { ref, libelle } | null
      "synthese",      // { pour, contre, abstention, nonVotants }
      "themes": [],    // ⟵ À RENSEIGNER (étape suivante)
      "discriminance", // { clivant, pour, contre, abstention }
      "positions": {   // par groupe : la cible de comparaison du quiz
        "PO845401": { "position", "pour", "contre", "abstention", "membres" }
      }
    }
  ]
}
```

---

## 6. Les biais à exposer (rappel — c'est la finalité)

L'ingestion les rend visibles ; il faudra les afficher dans l'exercice :

- **Discipline de groupe** — `positions[g].position` est la ligne du groupe, pas
  la conviction de chaque député. Les décomptes (`pour`/`contre`/`abstention`)
  permettront de montrer les dissidences internes.
- **Sens contextuel d'un vote** — un « contre » de gauche et un « contre » de
  droite n'ont pas le même sens. La comparaison brute l'écrase.
- **Vote stratégique / motions** — sur une motion de censure, l'abstention ou le
  non-vote équivaut à un soutien au gouvernement : le « décompte » ment si on le
  lit naïvement.
- **Sélection éditoriale** — choisir 115 votes (et bientôt les thématiser) est
  un acte qui introduit notre propre biais. À assumer et documenter.

---

## 7. Décisions ouvertes — prochaine étape

1. **Thématisation** (le gros morceau éditorial). Affecter 1–n thèmes à chacun
   des ~115 votes. Approches :
   - manuelle (qualité maximale, ~115 entrées, faisable) ;
   - assistée (classification auto par titre/dossier, puis validation humaine) ;
   - taxonomie de thèmes à définir (écologie, fiscalité, libertés, régalien,
     social, institutions, international…).
2. **Sélection des questions du quiz** : se limiter aux votes `clivants` ?
   combien par thème ? équilibrer les thèmes ?
3. **Résolution du groupe `PO847173`** (dissous) via le référentiel historique.
4. **Granularité** : rester sur pour/contre/abstention, ou enrichir plus tard
   avec les votes par article pour les textes phares ?
