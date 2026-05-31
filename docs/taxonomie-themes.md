# Taxonomie des thèmes — proposition (à valider)

> **Statut : BROUILLON soumis à validation.** Rien n'est affecté tant que cette
> taxonomie n'est pas arrêtée (décision « taxonomie d'abord »).

Structure retenue : **thèmes de fond à deux niveaux** (thème → sous-thèmes) +
**étiquettes transversales** qui se combinent librement. Taxonomie **dérivée des
115 votes réels** des 12 derniers mois.

## Principes

1. **Affectation multiple** : un vote peut porter plusieurs sous-thèmes et
   plusieurs étiquettes (ex. refondation de Mayotte = *Institutions ▸ Statut des
   territoires* + *Économie ▸ Budget* + étiquette `outre-mer`).
2. **Le sous-thème est l'unité d'affectation** ; le thème de niveau 1 est la
   regroupement d'affichage.
3. **Critère = sujet dominant du texte**, pas la présence d'un mot.

---

## Thèmes (12) et sous-thèmes (38)

### 1. Économie, fiscalité & entreprises
- **Budget & finances publiques** — loi de finances, fin de gestion, loi spéciale, dette
- **Fiscalité** — cadre fiscal des micro-entreprises, fraude fiscale et sociale
- **Entreprises & simplification** — simplification de la vie économique, commande publique
- **Politique industrielle** — nationalisation d'ArcelorMittal, investissement hydroélectrique

### 2. Travail, emploi & protection sociale
- **Droit du travail & emploi** — accords interprofessionnels, contrat de professionnalisation, accès à l'emploi
- **Sécurité sociale & retraites** — PLFSS
- **Famille & allocations** — allocations familiales dès le 1ᵉʳ enfant
- **Fonction publique** — protection sociale des agents publics territoriaux

### 3. Logement & urbanisme
- **Loyers & rapports locatifs** — encadrement des loyers, rapports locatifs
- **Construction & habitat** — transformation de bureaux en logements, mobilisation de l'habitat, logement des travailleurs des services publics
- **Urbanisme & foncier** — simplification de l'urbanisme, patrimoine immobilier de l'État, préemption de baux commerciaux

### 4. Écologie, énergie & climat
- **Énergie** — programmation énergie-climat, hydroélectricité
- **Climat & adaptation** — politique nationale d'adaptation au changement climatique
- **Biodiversité & milieux** — montagne vivante, transport maritime à propulsion vélique

### 5. Agriculture & alimentation
- **Conditions d'exercice agricole** — contraintes du métier, place des agriculteurs dans l'aménagement
- **Alimentation & consommation** — information sur l'origine des produits

### 6. Santé & fin de vie
- **Système de santé & professionnels** — infirmiers, médecins diplômés à l'étranger, missions des professionnels de santé, sécurité des soignants
- **Accès aux soins** — gratuité des parkings d'hôpitaux, innovation thérapeutique
- **Fin de vie & soins palliatifs** — aide à mourir, soins palliatifs

### 7. Sécurité, justice & pénal
- **Droit pénal & peines** — homicide routier, définition pénale du viol, rave-parties
- **Sécurité & ordre public** — sécurité des commerçants, rétention administrative
- **Justice & procédure** — recouvrement de créances, droit de visite des parlementaires, protection contre la criminalité

### 8. Immigration & nationalité
- **Séjour & asile** — titres de séjour, rétention administrative des étrangers
- **Mineurs isolés** — protection des mineurs isolés, sans-abrisme

### 9. Libertés, société & mémoire
- **Droits & égalité** — devoir conjugal, égal accès au service public
- **Mémoire & réparations** — condamnations pour homosexualité, « code noir », essais nucléaires, rapatriés d'Indochine, transplantation de mineurs
- **Lutte contre les discriminations** — antisémitisme dans l'enseignement supérieur
- **Culture & patrimoine** — restitution de biens culturels, droits voisins des éditeurs

### 10. Éducation, enfance & numérique
- **École & enseignement** — regroupements pédagogiques, éducation à la vie affective, enseignement de la défense
- **Protection de l'enfance** — intérêt de l'enfant, droit à un avocat, enfants à besoins éducatifs particuliers
- **Enfance & numérique** — protection des mineurs sur les réseaux sociaux

### 11. Institutions, démocratie & territoires
- **Vie démocratique & élections** — vote par correspondance des détenus, élection du Conseil de Paris, corps électoral de Nouvelle-Calédonie
- **Gouvernement & responsabilité** — motions de censure
- **Élus & collectivités** — statut de l'élu local, millefeuille territorial, compensation financière aux communes
- **Statut des territoires** — refondation de Mayotte, Corse, renouvellement du congrès de Nouvelle-Calédonie

### 12. Défense & international
- **Défense & armées** — programmation militaire 2024-2030, enseignement de la défense nationale
- **Diplomatie & traités** — ratifications, restitution de biens culturels à des États
- **Grands événements** — JO et Paralympiques 2030

---

## Étiquettes transversales (4)

Marqueurs qui traversent plusieurs thèmes ; se combinent à n'importe quel
sous-thème.

- **`outre-mer`** — Mayotte, Corse, Nouvelle-Calédonie, vie chère ultramarine
- **`ruralité`** — montagne, communes, intercommunalité, agriculture territoriale
- **`europe-international`** — traités, accords, ratifications
- **`numérique`** — réseaux sociaux, plateformes, données

---

## Cas-limites tranchés (proposition)

- **Motions de censure** → *Institutions ▸ Gouvernement & responsabilité*
  systématiquement (le geste politique prime), même quand déclenchées par un
  budget. Une note pourra rappeler le contexte déclencheur.
- **Restitution de biens culturels** → double : *Libertés ▸ Culture & patrimoine*
  + *Défense & international ▸ Diplomatie & traités*.
- **Outre-mer** → toujours une **étiquette**, jamais un thème ; le vote garde son
  sous-thème de fond (économie, institutions…).

---

## Prochaine étape (après validation)

Affectation des 115 votes selon l'approche **assistée puis validée** :
classification automatique proposée (titre + dossier) → relecture et correction
humaine → enrichissement du champ `themes` dans `public/data/scrutins.json`.
