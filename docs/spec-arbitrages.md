# Spécification — « Arbitrages » (jeu de mise au point budgétaire)

> Statut : **brouillon de spécification** (mai 2026). Nom de travail : *Arbitrages*
> (sous-titre : *l'épreuve du chiffrage*). Nouveau jeu de la plateforme
> GlobéNostra, frère du module *Opinions*, réutilisant son système de design.
> Voir aussi : [`design-brief-budget.md`](design-brief-budget.md) (maquette) et la
> section Sources ci-dessous.

---

## 1. Vision

Le joueur compose un budget en actionnant des **leviers** (augmenter l'école,
baisser un impôt, financer un service…) et voit les **conséquences projetées dans
le temps**. L'objet réel n'est **pas** de « trouver le bon budget » : c'est de
faire ressentir que **tout budget est un système d'arbitrages** (« prendre à
gauche remet à droite ») et que **toute projection dépend des hypothèses
choisies**. Le jeu enseigne l'incertitude et le compromis — pas une vérité
chiffrée.

Cohérent avec la mission de la plateforme : *comprendre les biais, approfondir
les sujets ; le résultat n'est qu'une porte d'entrée.*

## 2. Objectifs et non-objectifs

**Objectifs**
- Rendre tangible l'arbitrage budgétaire (financer A, c'est ne pas financer B).
- Montrer qu'une décision a des effets **étalés dans le temps** et **incertains**.
- Distinguer en permanence **ce qui est calculé**, **ce qui est sourcé** et **ce
  qui est estimé** — la provenance comme pièce maîtresse d'interface.
- Exposer ses propres biais (choix des études, des horizons, des hypothèses).

**Non-objectifs**
- Prétendre simuler l'économie française entière ou prédire l'avenir.
- Produire un chiffre « définitif » présenté comme une vérité.
- Remplacer une expertise : on **cite** et on **renvoie** aux sources, on ne s'y
  substitue pas.

## 3. Principes directeurs (anti-biais, non négociables)

1. **Provenance toujours visible** : Moteur / Source / Estimation IA, jamais
   confondus visuellement (cf. §6).
2. **Incertitude affichée** : un effet estimé s'affiche en **fourchette**
   (min–max), jamais en point. Pas de fausse précision.
3. **Hypothèses manipulables** : le joueur peut changer l'**étude retenue** et
   l'**horizon** et voir le résultat basculer — c'est la démonstration centrale.
4. **Biais de sélection assumé** : un accès « quelles études avons-nous retenues,
   et pourquoi » expose nos propres choix.
5. **Pas d'autorité simulée** : ton « telle étude estime X, avec telle
   incertitude », jamais « voici ce qui se passera ».
6. **L'IA n'estime jamais en couche déterministe** (§5) — uniquement dans les
   trous du corpus, sur les effets dynamiques.

## 4. Architecture en trois couches

Le découpage qui sauve la crédibilité : séparer ce qui est **calculé** de ce qui
est **estimé**.

| Couche | Nature | Rôle | Outil / source |
|--------|--------|------|----------------|
| **1. Comptabilité statique** | déterministe, rigoureuse | coût immédiat, redistribution par foyer/décile, impact agrégé État + Sécu | **OpenFisca / LexImpact** |
| **2. Effets dynamiques** | sourcée, incertaine | effets étalés dans le temps (éducation→emploi…), en fourchettes | **corpus d'études vérifié** (Cour des comptes, IPP, France Stratégie…) |
| **3. Estimation IA** | encadrée, prudente | combler les trous du corpus, expliquer, citer, composer | LLM bridé sur RAG du corpus couche 2 |

**Frontière capitale** : OpenFisca/LexImpact sont **statiques** (« effets
globaux, sans être comportementaux »). Tout ce qui est dynamique / long terme /
comportemental **n'a aucun moteur** → relève des couches 2 et 3, les couches
incertaines. La couche 1 n'est **jamais** marquée incertaine ; les couches 2-3
le sont **toujours**.

## 5. Le moteur déterministe (couche 1)

- **OpenFisca** — moteur open source de microsimulation socio-fiscale (« applique
  la loi »), créé en 2011 au sein de France Stratégie. API web (`/calculate`,
  `/trace`, `parameters`, `variables`, `reforms`). Calcule au niveau d'une
  **situation/foyer** ; l'**agrégat budgétaire** s'obtient en faisant tourner le
  moteur sur un **échantillon représentatif** (microsimulation).
- **LexImpact** (Assemblée nationale, sur OpenFisca) — chiffre une réforme (IR,
  CSG, cotisations, prestations) sur les foyers **et** sur le budget de l'État et
  de la Sécu. Code ouvert.
- **Limites à afficher** : statique (pas de réactions comportementales), données
  décalées de **1–2 ans**, cas-types simplifiés, imprécision inhérente.
- **Licences** : OpenFisca open source ; LexImpact **AGPL-3.0**. ⚠️ Réutiliser le
  *code* LexImpact (AGPL, copyleft réseau) contraindrait la licence de toute
  l'app ; **appeler OpenFisca via API** évite cette contamination. Décision de
  licence à trancher.

## 6. Provenance & incertitude (le composant central d'UI)

Trois « chips de provenance », visuellement distinctes :

- **Moteur** — calcul déterministe (OpenFisca). Ton solide/factuel. Pas de
  fourchette sur le coût lui-même (mais les hypothèses de population sont
  documentées).
- **Source** — effet tiré d'une étude : **fourchette**, délai, **confiance**,
  **citation cliquable** vers le rapport.
- **Estimation IA — non sourcée** — quand aucune étude n'existe : rendu
  **distinct et prudent** (ex. bordure pointillée, icône dédiée, libellé
  explicite, confiance « faible » par défaut). Jamais fondue avec un chiffre
  Moteur ou Source.

Composant **Fourchette** (barre min–max) systématique pour les couches 2-3.

## 7. Modèle de données (esquisse)

```jsonc
// Levier : une décision actionnable
Levier {
  id, domaine,                 // ex. "education", "fiscalite"
  libelle,
  type,                        // "depense" | "recette" | "parametre_reforme"
  // pour la couche 1 : mapping vers une réforme OpenFisca
  reformeOpenfisca?,           // paramètres/variables modifiés
  unite, min, max, pas         // pour le curseur
}

// Effet : une arête causale (couche 2/3)
Effet {
  id, levierId,
  outcome,                     // ex. "reussite_lecture", "recettes_fiscales"
  horizon,                     // "immediat" | "court" | "moyen" | "long"
  valeurMin, valeurMax, unite, // TOUJOURS une fourchette
  provenance,                  // "moteur" | "source" | "ia"
  confiance,                   // "elevee" | "moyenne" | "faible"
  sourceId?,                   // -> Source (obligatoire si provenance="source")
  note                         // explication courte
}

Source {
  id, organisme,               // "IPP" | "Cour des comptes" | ...
  titre, annee, url, type      // "evaluation" | "rapport" | "note"
}

// Scénario : l'état composé par le joueur
Scenario {
  leviers: { [levierId]: valeur },
  financement,                 // d'où vient l'argent (contrainte d'équilibre)
  hypotheses: { [effetId]: sourceChoisieId, horizonAffiche }
}
```

## 8. Le rôle de l'IA (couche 3) — « estimatrice encadrée »

Décision retenue : l'IA **peut** estimer **là où le corpus est muet**, en
l'affichant explicitement « Estimation IA — non sourcée ». Garde-fous :

- **RAG sur corpus fermé** (les études couche 2 ingérées), **pas** le web ouvert.
- L'IA **ne touche jamais** la couche 1 (chiffres déterministes).
- Toute sortie IA porte la chip « IA », une **confiance** et un **« pourquoi »**
  dépliable (sur quoi elle s'appuie / ce qui manque).
- Priorité : citer une étude > estimer. L'estimation IA est un **dernier
  recours**, signalé comme tel.
- Réponses **bornées** : pas de point, des fourchettes ; refus assumé quand
  l'incertitude est trop grande.

## 9. Sources (vérifiées, mai 2026)

**Moteur (couche 1)**
- OpenFisca — `openfisca.org`, code `github.com/openfisca/openfisca-france`, API `api.gouv.fr/les-api/openfisca`
- LexImpact — `leximpact.an.fr`, code `git.leximpact.dev`

**Corpus d'effets (couche 2)**
- Cour des comptes — open data + API des rapports (`ccomptes.fr`, `data.gouv.fr/datasets/rapports-publies-par-la-cour-des-comptes`)
- Institut des politiques publiques (IPP) — `ipp.eu/projets`
- France Stratégie — comités d'évaluation
- Conseil d'analyse économique (CAE), OFCE — notes
- DEPP / DREES / DARES — statistiques et évaluations sectorielles

**Données budgétaires brutes**
- `budget.gouv.fr/budget-etat`, `data.economie.gouv.fr`, jeux PLF sur `data.gouv.fr` (dépenses par mission/programme/action) — Licence Ouverte

## 10. Implications techniques (par rapport à l'existant)

L'app actuelle est un **SPA statique** (Vite + React) sur GitHub Pages. Ce jeu
**ne peut pas rester 100 % statique** :

- **OpenFisca** : l'instance publique est « prototypage uniquement » (pas de SLA)
  → prévoir un **proxy backend** voire un **auto-hébergement** du moteur.
- **Corpus + RAG + LLM** : nécessite un **backend** (fonctions serverless), un
  **store** (corpus d'effets + éventuel index vectoriel) et un **appel LLM**.
- Donc : introduire une couche backend (les intégrations Supabase / Vercel
  disponibles côté plateforme sont des candidats). À arbitrer.
- Le **dataset des leviers/effets/sources** peut, lui, rester un fichier statique
  versionné (comme `scrutins.json`) tant que le corpus est petit — bon pour la
  transparence.

## 11. Feuille de route (MVP → cible)

1. **Maquette** (en cours) — valider l'expérience et le composant provenance
   avant tout moteur. Cf. `design-brief-budget.md`.
2. **MVP couche 1** — une réforme fiscale simple via OpenFisca : coût +
   gagnants/perdants par décile, 100 % calculé/sourcé, sans IA.
3. **Greffe couche 2** — 2-3 effets dynamiques (éducation) avec fourchettes,
   sources, et le curseur « quelle étude / quel horizon » qui fait basculer.
4. **Couche 3 (IA)** — en dernier, comme explicatrice/citatrice, puis estimatrice
   encadrée dans les trous.
5. **Cible** — bibliothèque d'effets élargie, plusieurs domaines, panneau
   « sources & désaccords ».

## 12. Risques & questions ouvertes

- **Le vrai coût n'est pas le moteur (il existe) mais la curation du corpus
  d'effets** (couche 2) : lente, scientifique, c'est là que se joue la
  crédibilité.
- **Neutralité du corpus** : quelles études retenir ? Critère explicite et
  contestable à définir (rang de la source, revue par les pairs, pluralité).
- **Licence** : API OpenFisca (sans contamination) vs réutilisation code
  LexImpact (AGPL) → à trancher.
- **Backend** : quel hébergement pour OpenFisca + l'IA ? coût, RGPD (aucune
  donnée personnelle ne doit transiter).
- **Périmètre** : risque de scope creep majeur — tenir la discipline du MVP.
- **Garde-fou éthique** : ne jamais laisser l'estimation IA prendre l'apparence
  d'un fait. Tester ce risque sur utilisateurs.
