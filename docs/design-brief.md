# Brief de design — Opinions (à donner à Claude pour concevoir l'UI)

> Ce document est rédigé pour être **collé tel quel comme prompt** à un Claude
> orienté design. Il décrit le produit, sa philosophie, les écrans et les
> contraintes. Objectif : obtenir une direction visuelle + des maquettes
> d'écrans implémentables dans notre stack (React + Chakra UI v3).

---

## PROMPT

Tu es designer produit pour une plateforme de civic-tech. Conçois l'interface de
**« Opinions »**, un module de la plateforme GlobéNostra.

### Ce qu'est le produit (et son intention)

Opinions est un **atelier de lucidité politique**, pas un « test rigolo » qui
range les gens dans une case. L'utilisateur répond à de vrais votes de
l'Assemblée nationale (« et vous, vous auriez voté comment ? ») et découvre de
quels groupes parlementaires ses réponses se rapprochent.

**La finalité n'est PAS le score.** Elle est double :
1. **comprendre les biais** que fabrique ce genre d'outil (discipline de groupe,
   sens contextuel d'un vote, choix de pondération…) ;
2. **approfondir les sujets** sur lesquels on s'est positionné.

Le score n'est qu'une porte d'entrée vers la compréhension. Le design doit
incarner cette honnêteté intellectuelle.

### Ton et direction visuelle attendus

- **Sobre, sérieux, digne de confiance** — registre éditorial / institutionnel
  moderne, proche d'un média de qualité ou d'un service public bien conçu. Pas
  d'esthétique « quiz BuzzFeed », pas de gamification tape-à-l'œil.
- **Neutralité politique assumée jusque dans les couleurs.** NE code PAS les
  groupes par des couleurs partisanes (pas de rouge=gauche / bleu=droite). Une
  palette d'accent **neutre et unique** pour tous les groupes est un choix
  délibéré contre le biais. Cette neutralité est un parti pris à respecter.
- **Calme et lisible.** Beaucoup d'air, typographie soignée, hiérarchie claire.
  Le sujet est dense ; l'interface doit l'alléger, pas l'alourdir.
- **Mobile-first** et **accessible** (contrastes AA, focus visibles, tailles de
  cible confortables). Interface en **français**.

### Contraintes techniques (importantes)

- L'implémentation cible est **React + Chakra UI v3**. Propose une direction qui
  se traduit en tokens Chakra : **palette** (avec une couleur d'accent
  principale), **échelle typographique**, **espacements**, **rayons de bordure**,
  styles de **boutons / cartes / badges**.
- Livre de préférence une **maquette haute-fidélité sous forme d'artefact
  autonome** (un seul fichier HTML ou React) montrant les écrans ci-dessous, plus
  une courte **spec de design tokens** réutilisable. Reste fidèle à ce qui est
  réalisable avec Chakra (pas d'effets infaisables).

### Les écrans à concevoir

**1. Accueil / intro de l'exercice**
- Titre fort : « Et vous, vous auriez voté comment ? »
- Sous-titre expliquant : N vrais votes des 12 derniers mois.
- Un **encart d'avertissement sur les biais** (ton honnête, pas anxiogène) :
  rappeler que le score compare à la *ligne majoritaire* d'un groupe, pas aux
  convictions individuelles ; que c'est un point de départ, pas un verdict.
- Bouton « Commencer ».

**2. La carte-question (l'écran central — à soigner particulièrement)**
- Progression (question i / N) + date du vote.
- Étiquette de nature : « Vote sur l'ensemble du texte » ou « Motion de censure »
  (avec une note pour les motions : voter « pour » = renverser le gouvernement).
- **L'intitulé du texte**, présenté comme une question claire et lisible.
- Les **étiquettes de thème** (ex. « Logement », « Sécurité »).
- Actions de réponse : **Pour / Contre / Abstention**, plus **Passer**. Design
  des boutons neutre (ne pas suggérer la « bonne » réponse).
- **NOUVEAU — un bloc « contexte / pour décider »**, sous la question, conçu avec
  soin :
  - **Avant de répondre** : un résumé neutre et court de l'enjeu (de quoi parle
    le texte), sans révéler comment le vote a réellement tourné — pour **éviter le
    biais d'ancrage**. Pensé comme un panneau **dépliable** (« En savoir plus »)
    pour ne pas surcharger.
  - **Après avoir répondu** : on révèle alors le **résultat réel** (adopté /
    rejeté, décompte pour/contre/abstention) et un **lien vers la source
    officielle** (la page d'analyse du scrutin sur assemblée-nationale.fr).
  - Prévois donc deux états visuels de ce bloc : *avant réponse* (aide à décider,
    neutre) et *après réponse* (révélation + approfondissement + source).

**3. Résultats**
- Phrase de synthèse : « Vous êtes le plus proche de [Groupe] ».
- **Classement des groupes** par % d'accord, sous forme de barres horizontales
  (toutes de la même couleur d'accent neutre ; le 1er légèrement mis en avant).
- Indiquer le nombre de votes réellement comparés.
- Un **encart « ce que ce score ne dit pas »** (discipline de groupe, sens
  contextuel, proximité ≠ adhésion au programme).
- Amorces vers la suite : « le détail par thème » et « le démontage des biais »
  (à venir) — à prévoir comme zones d'extension.
- Bouton « Recommencer ».

### Données réellement disponibles (pour réalisme des maquettes)

Par vote : intitulé du texte, date, nature (ensemble/motion), résultat
(adopté/rejeté), décompte global pour/contre/abstention, position de chaque
groupe (pour/contre/abstention), thèmes, et un indicateur « clivant ou
consensuel ». Groupes (17e législature) : RN, EPR, LFI-NFP, SOC, DR, EcoS, Dem,
HOR, LIOT, GDR, UDR.

### Livrables attendus

1. Une **direction visuelle** (moodboard décrit + design tokens : couleurs,
   typo, espacements, rayons).
2. Les **trois écrans** en haute-fidélité, dont la carte-question avec ses deux
   états du bloc contexte.
3. Des notes d'**accessibilité** et de **responsive**.

Garde toujours à l'esprit le principe directeur : *le design doit aider à
comprendre et à douter, jamais à manipuler ou à flatter.*
