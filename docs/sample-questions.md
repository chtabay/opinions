# 5 questions/contextes — échantillon pour la maquette

> Contenu **réel** (données de l'Assemblée, 17e législature) destiné à nourrir la
> maquette. Chaque vote est présenté avec les **deux états** du bloc contexte :
> *avant réponse* (informer sans orienter) et *après réponse* (révélation +
> source). Données extraites de `public/data/scrutins.json`.

Les 5 sont choisis pour couvrir les cas à designer : votes clivants, large
consensus, motion de censure (cas piégeux), et présence/absence d'un lien
« dossier » avant réponse.

---

## 1. Aide à mourir — *clivant, société/santé*

- **Question** : « Proposition de loi relative au droit à l'aide à mourir (deuxième lecture). »
- **Nature** : Vote sur l'ensemble · **Date** : 25/02/2026 · **Thème** : Santé & fin de vie ▸ Fin de vie & soins palliatifs

**Avant réponse** — badge thème ; *pas de lien dossier* (indisponible) ; aucun résultat affiché.
**Après réponse** :
- Résultat : **Adopté** — Pour 299 · Contre 226 · Abstention 37
- Positions de groupe : **Pour** → EPR, LFI-NFP, SOC, EcoS, Dem, LIOT, GDR · **Contre** → RN, DR, HOR, UDR
- Lien : `assemblee-nationale.fr/dyn/17/scrutins/5729`

---

## 2. Nationalisation d'ArcelorMittal — *clivant, économie*

- **Question** : « Proposition de loi visant à la nationalisation d'ArcelorMittal France afin de préserver la souveraineté industrielle de la France (première lecture). »
- **Nature** : Vote sur l'ensemble · **Date** : 27/11/2025 · **Thème** : Économie ▸ Politique industrielle

**Avant réponse** — badge thème ; pas de lien dossier ; aucun résultat affiché.
**Après réponse** :
- Résultat : **Adopté** — Pour 127 · Contre 41 · Abstention 42
- Positions de groupe : **Pour** → LFI-NFP, SOC, EcoS, GDR · **Contre** → EPR, DR, Dem, HOR, UDR · **Abstention** → RN · **N'a pas pris part** → LIOT
- Lien : `assemblee-nationale.fr/dyn/17/scrutins/4438`
- *Note design* : un texte « adopté » avec seulement 127 pour montre l'effet de l'absentéisme — matière à expliquer plus tard.

---

## 3. Protéger les mineurs des réseaux sociaux — *large consensus, numérique*

- **Question** : « Proposition de loi visant à protéger les mineurs des risques auxquels les expose l'utilisation des réseaux sociaux (première lecture). »
- **Nature** : Vote sur l'ensemble · **Date** : 26/01/2026 · **Thème** : Éducation ▸ Enfance & numérique · **Étiquette** : Numérique

**Avant réponse** — badges thème + étiquette ; pas de lien dossier ; aucun résultat affiché.
**Après réponse** :
- Résultat : **Adopté** — Pour 130 · Contre 21 · Abstention 6
- Positions de groupe : **Pour** → RN, EPR, SOC, DR, EcoS, Dem, HOR, LIOT, UDR · **Contre** → LFI-NFP · **Abstention** → GDR
- Lien : `assemblee-nationale.fr/dyn/17/scrutins/5192`
- *Note design* : quasi-unanimité → peu discriminant, mais révèle un quasi-consensus.

---

## 4. Motion de censure (Le Pen / Ciotti) — *cas piégeux, institutions*

- **Question** : « La motion de censure déposée en application de l'article 49, alinéa 3, de la Constitution par Mme Marine Le Pen, M. Éric Ciotti et 102 députés. »
- **Nature** : **Motion de censure** · **Date** : 23/01/2026 · **Thème** : Institutions ▸ Gouvernement & responsabilité
- Note affichée : *« Voter “pour” une motion de censure, c'est chercher à renverser le gouvernement. »*

**Avant réponse** — badge thème + la note ci-dessus ; aucun résultat affiché.
**Après réponse** :
- Résultat : **Rejeté** (289 voix requises) — Pour 142 · Contre 0 · Abstention 0
- Positions de groupe : **Ont voté la censure** → RN, DR, UDR · **N'ont pas pris part** (= n'ont pas soutenu) → EPR, LFI-NFP, SOC, EcoS, Dem, HOR, LIOT, GDR
- Lien : `assemblee-nationale.fr/dyn/17/scrutins/5155`
- *Note design* : cas emblématique du **sens contextuel** — sur une motion, « ne pas voter » équivaut à soutenir le gouvernement. Le décompte (142-0-0) est trompeur si on le lit naïvement.

---

## 5. Abrogation du « code noir » — *consensus + lien dossier disponible, mémoire*

- **Question** : « Proposition de loi portant abrogation du « code noir » (première lecture). »
- **Nature** : Vote sur l'ensemble · **Date** : 28/05/2026 · **Thème** : Libertés ▸ Mémoire & réparations
- **Dossier disponible** : « Abrogation du Code noir »

**Avant réponse** — badge thème + **lien « Lire le texte (dossier législatif) »** → `assemblee-nationale.fr/dyn/17/dossiers/DLR5L17N52767` ; aucun résultat affiché.
**Après réponse** :
- Résultat : **Adopté** — Pour 254 · Contre 0 · Abstention 0
- Positions de groupe : **Pour** → tous les groupes (RN, EPR, LFI-NFP, SOC, DR, EcoS, Dem, HOR, LIOT, UDR, GDR)
- Lien : `assemblee-nationale.fr/dyn/17/scrutins/7002`
- *Note design* : seul exemple **avec lien dossier avant réponse** — à utiliser pour maquetter cet état.

---

### Récapitulatif des cas couverts

| # | Sujet | Nature | Résultat | Clivage | Lien dossier (avant) |
|---|-------|--------|----------|---------|----------------------|
| 1 | Aide à mourir | ensemble | adopté | fort (7 vs 4) | non |
| 2 | Nationalisation ArcelorMittal | ensemble | adopté | fort (4 vs 5) | non |
| 3 | Mineurs & réseaux sociaux | ensemble | adopté | quasi-consensus | non |
| 4 | Motion de censure | motion | rejeté | piégeux | non |
| 5 | Code noir | ensemble | adopté | unanimité | **oui** |
