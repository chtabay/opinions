# Sources & faisabilité — module « médias » (type Ground News)

> Note de sourcing (mai 2026). Module frère d'*Opinions* et d'*Arbitrages*, dans
> la même mission : **rendre les biais visibles**. Nom de travail provisoire :
> **Prismes** (un même événement réfracté par plusieurs rédactions).
> Recherche vérifiée — liens en bas de chaque section.

---

## 1. Le piège à éviter (rappel de cadrage)

Ground News étiquette chaque média sur un axe **gauche / centre / droite**, à
partir d'organismes tiers américains (AllSides, Ad Fontes, MBFC). **En France, il
n'existe aucun équivalent neutre et consensuel.** Décréter qu'un média est « de
droite » est **un acte éditorial contestable** — exactement le biais que la
plateforme prétend démonter. → On **n'étiquette pas** : on **montre des faits et
du cadrage**, et l'utilisateur juge.

Trois piliers défendables, du plus solide au plus délicat :
1. **Les faits, pas les étiquettes** : propriété, financement, audience.
2. **La comparaison de cadrage** : même événement, titres côte à côte.
3. **L'angle mort** : qui a couvert / qui n'a pas couvert (donnée, pas verdict).

---

## 2. Agrégation & détection d'événements (le « flux »)

- **GDELT** — **libre et gratuit**, presse mondiale en 100+ langues, support
  français (`language=fr`). La v2 produit des **« Stories » = clusters d'articles
  d'un même événement** + articles représentatifs. **Backbone naturel** pour
  « le même événement vu par N rédactions ».
  `gdeltproject.org` · `docs.gdeltcloud.com`
- **News APIs** (titres/métadonnées, **payantes en prod**) : Mediastack (gratuit
  500/mois), GNews (gratuit 100/jour), NewsAPI (gratuit en dev seulement).
- **RSS** des rédactions : gratuit, configuration flux par flux.

**Nuance :** GDELT détecte bien « qui a couvert quoi » + volume/tonalité
grossière, mais est **faible pour une comparaison fine de cadrage**. →
architecture hybride : GDELT/RSS pour **détecter**, puis **LLM + relecture
humaine** pour **regrouper et présenter** les titres.

## 3. Propriété des médias — le pilier factuel (et réutilisable)

- **« Médias français : qui possède quoi »** (*Le Monde diplomatique*) — **jeu de
  données OUVERT** (CSV UTF-8 réutilisable) sur `data.gouv.fr` et **GitHub**
  (`github.com/mdiplo/Medias_francais`). La « fiche propriétaire » dont on a
  besoin, **déjà libre**.
- **RSF — Who owns the media in France / Media Ownership Monitor** — travail de
  **Julia Cagé** (économiste des médias), data-driven, citable. `rsf.org`
- **Euromedia Ownership Monitor — France (2023)** — référence académique UE.
  `media-ownership.eu`

→ Pilier « les faits » : **solide et faisable dès maintenant**.

## 4. Factualité / fact-checking

- **Google Fact Check Tools API** — Claim Search (gratuit, clé API), standard
  **ClaimReview** ; **AFP Factuel** = contributeur majeur (~17 % des résultats).
  Affiche les vérifications **existantes** par requête, sans les réécrire.
  `developers.google.com/fact-check/tools/api`

## 5. Cadre juridique — il décide du design

- **Droit voisin de la presse** (loi 2019-775, art. **L.218-1+** CPI) : agréger
  reproductions/extraits → droit exclusif des éditeurs (a fait condamner Google).
- **Exception décisive — art. L.211-3-1 CPI** : le droit voisin **ne couvre pas**
  les **liens hypertextes** ni « l'utilisation de **mots isolés ou de très courts
  extraits** ».

→ **Conséquence :** un design **titres + très courts extraits + lien vers la
source** (avec attribution) est **juridiquement sûr**. Snippets longs / texte
intégral = non (licences requises). Le droit pousse vers notre pilier le plus
fort (cadrage par les titres).

## 6. Synthèse de faisabilité

| Brique | Faisabilité | Coût |
|---|---|---|
| Détection d'événements (GDELT) | bonne | gratuit |
| Fiches propriété (Le Monde diplo, open data) | élevée | gratuit |
| Fact-checks (Google API / AFP) | bonne | gratuit |
| Comparaison de cadrage (titres + liens) | **juridiquement OK** | gratuit |
| Clustering fin / curation FR | moyenne (LLM + humain) | LLM + temps |
| Étiquetage gauche/droite | **à éviter** (le piège) | — |

**Dur / coûteux :** qualité du **clustering français** (GDELT seul insuffisant) ;
surtout l'**exploitation continue** (l'actu coule en permanence → ingestion,
modération). Comme *Arbitrages*, **suppose un backend**.

## 7. MVP

« **Un événement, six rédactions** » : détection GDELT/RSS → **titres + très
courts extraits + liens**, **fiche propriété** (dataset *Le Monde diplo*),
fact-checks via l'API Google, **zéro étiquetage automatique**. Tout en
gratuit/open, sur terrain juridique sûr.

## 8. Questions ouvertes

- **Nom du module** (Prismes ? Revue ? Kaléidoscope ?).
- **Backend & exploitation** : hébergement, fréquence d'ingestion, modération.
- **Curation vs automatisation** : jusqu'où l'humain dans la boucle au lancement.
- **Sélection des rédactions** affichées : un choix éditorial → à rendre explicite
  et contestable (cohérent avec la mission).
