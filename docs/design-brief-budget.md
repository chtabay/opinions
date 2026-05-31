# Brief de design — « Arbitrages » (jeu de mise au point budgétaire)

> Nom de travail : **Arbitrages** (sous-titre : *l'épreuve du chiffrage*).
> Nouveau jeu de la plateforme GlobéNostra, **frère du module Opinions** et qui
> **réutilise son système de design** (bleu ardoise, Public Sans, neutralité,
> cadre device mobile + variante desktop). Document rédigé pour être **collé
> comme prompt** à Claude Design.

---

## PROMPT

Tu es designer produit pour une plateforme de civic-tech. Conçois l'interface de
**« Arbitrages »**, un jeu de mise au point budgétaire. Réutilise le **système de
design existant** du module « Opinions » (accent unique bleu ardoise `#3d5a80`,
police Public Sans, fonds gris ardoisé, cartes, badges, neutralité politique
assumée, mobile-first + variante desktop ≥ 960px).

### Ce qu'est le jeu (et son intention)

Le joueur compose un budget : il actionne des **leviers** (augmenter l'école,
baisser un impôt, financer un service…) et voit les **conséquences projetées dans
le temps**. Le sujet réel n'est pas « trouver le bon budget » : c'est de **faire
ressentir que tout budget est un système d'arbitrages** (« prendre à gauche remet
à droite ») et que **toute projection dépend des hypothèses qu'on choisit**. Le
jeu enseigne l'incertitude et le compromis, pas une vérité chiffrée.

### Les trois provenances de chiffre — LE point de design central

Chaque nombre affiché porte une **provenance visuellement distincte et
inratable**. C'est la pièce maîtresse de l'interface :

1. **Moteur** (calcul déterministe, ex. coût immédiat, gagnants/perdants par
   décile) — ton « solide / factuel ».
2. **Source** (effet tiré d'une étude : ampleur en **fourchette**, délai,
   confiance, **citation cliquable**) — ton « sourcé ».
3. **Estimation IA — non sourcée** (quand aucune étude n'existe) — ton
   **distinct et prudent** (ex. bordure pointillée, icône dédiée, libellé
   explicite « Estimation IA, non sourcée », niveau de confiance affiché). Ne
   **jamais** la fondre visuellement avec un chiffre Moteur ou Source.

Conçois ces **trois « chips de provenance »** comme un composant à part entière.

### Deux invariants d'affichage

- **Jamais de chiffre net sans son incertitude.** Les effets dynamiques
  s'affichent en **fourchette** (barre min–max), pas en point. La fausse
  précision est l'ennemi.
- **L'hypothèse est manipulable.** Le joueur peut changer l'**étude retenue** ou
  l'**horizon de temps** et voir le résultat **basculer en direct** — c'est la
  démonstration centrale.

### Direction visuelle

Sobre, sérieux, digne de confiance (continuité avec Opinions). Calme, beaucoup
d'air, neutralité chromatique (pas de couleurs partisanes). Français, accessible
(AA), mobile-first + desktop.

### Les écrans à concevoir

**1. Intro** — pose le jeu : « Composez un budget. Voyez ce que ça déplace. » +
un encart honnête : *ce jeu ne dit pas le vrai budget de la France ; il montre
comment une décision se propage, et à quel point ça dépend des hypothèses.*

**2. Atelier — composition (écran central)**
- Une **liste de leviers** activables (curseurs / +/−), groupés par domaine
  (Éducation, Fiscalité, Santé, Travail…).
- Un **bandeau d'équilibre toujours visible** : solde budgétaire courant, et la
  contrainte « d'où vient l'argent ? » — actionner un levier coûteux **oblige**
  à le financer ailleurs (la mécanique « gauche/droite »).
- Un aperçu immédiat de la **redistribution par décile** (gagnants/perdants) —
  chiffres *Moteur*.

**3. Projection — la frise multi-horizons (le cœur pédagogique)**
- Pour un levier choisi (ex. l'école), une **frise temporelle** : court terme
  (0–3 ans) / moyen (5–10) / long (15–25).
- Sur chaque horizon, les **effets** avec leur **fourchette**, leur **chip de
  provenance** (Moteur / Source / IA) et leur **confiance**.
- Le mécanisme **« l'argent revient… en partie »** : montrer que les recettes
  futures compensent *partiellement* le coût initial, avec une fourchette large.
- Les **contrôles d'hypothèse** : sélecteur « quelle étude » et « quel horizon »
  qui fait **bouger les résultats** sous les yeux du joueur.

**4. Sources & désaccords** — un panneau qui liste les études mobilisées, et
**montre quand les experts divergent** (estimations rivales côte à côte). Le
désaccord est une fonctionnalité, pas un défaut.

**5. Bilan** — synthèse du budget composé : ce qu'il privilégie, ce qu'il
sacrifie, son degré d'incertitude global, et un rappel : *« ce résultat dépend
des hypothèses que vous avez retenues — changez-les, il change ».*

### Anti-biais — règles de contenu (non négociables)

1. **Provenance** : Moteur / Source / IA toujours distingués (cf. ci-dessus).
2. **Incertitude visible** : fourchettes, jamais de point pour un effet estimé.
3. **Hypothèses contestables** : le joueur peut changer l'étude/l'horizon.
4. **Biais de sélection assumé** : un lien « quelles études avons-nous retenues,
   et pourquoi » est accessible — le jeu expose ses propres choix.
5. **Pas d'autorité simulée** : le ton ne dit jamais « voici ce qui se passera »,
   mais « voici ce que telle étude estime, avec telle incertitude ».

### Livrables attendus

Direction visuelle réutilisant les tokens d'Opinions ; les écrans ci-dessus
(mobile + desktop) ; le **composant chip-de-provenance** dans ses 3 états ; le
composant **fourchette** (barre min–max) ; les notes accessibilité/responsive.

Principe directeur : *le design doit faire ressentir l'arbitrage et l'incertitude
— jamais vendre un chiffre comme une vérité.*

---

## Exemple réaliste pour la maquette — levier « Éducation »

À utiliser comme contenu de démonstration (montre les 3 provenances + fourchettes).

**Levier : +5 Md€/an pour l'école primaire**

| Horizon | Effet | Valeur (fourchette) | Provenance | Confiance |
|---|---|---|---|---|
| Immédiat | Coût budgétaire | −5,0 Md€/an | **Moteur** | — (déterministe) |
| Immédiat | Financement requis (à arbitrer) | +5,0 Md€ à trouver | **Moteur** | — |
| Immédiat | Redistribution | gagnants : ménages avec enfants ; payeurs : selon le financement choisi | **Moteur** | — |
| Court terme (0–3 ans) | ↓ taille des classes → réussite en lecture | +0,05 à +0,15 écart-type | **Source** (IPP) | moyenne |
| Moyen terme (5–10 ans) | ↓ taux de décrochage | −0,5 à −1,5 point | **Source** (France Stratégie / DEPP) | moyenne-faible |
| Long terme (15–25 ans) | ↑ revenus → ↑ recettes fiscales | +0,5 à +2,0 Md€/an *à terme* | **Estimation IA — non sourcée** | faible |

→ Lecture du jeu : le coût initial (−5) est **en partie** récupéré à long terme
(+0,5 à +2), mais la fourchette est énorme **et** la dernière ligne n'est qu'une
estimation IA — à prendre avec des pincettes. Changer l'étude du court terme, ou
regarder à 5 ans plutôt qu'à 25, peut inverser le verdict « ça vaut le coup ».

> Sources françaises crédibles à mobiliser (couche 2, réelle implémentation) :
> Institut des politiques publiques (IPP), France Stratégie, Conseil d'analyse
> économique, Cour des comptes, DEPP, OFCE. Moteur statique (couche 1) :
> **OpenFisca** (microsimulation socio-fiscale open source).
