# PROJET : PBP CONCOURS

## MISSION

Tu es un expert senior en développement d'applications web, architecture logicielle, UX/UI et conception de systèmes de gestion de compétitions sportives.

Ta mission est de concevoir et construire une application web moderne complète pour l'association de pétanque **PBP – Pétanque Bohra Paris**.

L'application doit permettre de gérer un concours de pétanque **de A à Z** :

**Création du concours → Inscriptions → Création des équipes → Validation → Tirage au sort → Construction des poules → Génération des matchs → Saisie des scores → Classements → Qualifications → Phase finale → Résultats → Archivage**

L'objectif est de créer une application réellement utilisable par les organisateurs de concours.

---

# OBJECTIF PRINCIPAL

Créer une application appelée :

# 🏆 PBP CONCOURS

L'application doit permettre à une association de gérer facilement tous ses concours de pétanque.

L'interface doit être :

- Moderne
- Professionnelle
- Très simple à utiliser
- Rapide
- Responsive
- Utilisable sur ordinateur, tablette et smartphone
- Optimisée pour une utilisation le jour d'un concours

---

# UTILISATEURS

L'application doit gérer plusieurs rôles.

## 1. ADMINISTRATEUR

L'administrateur possède tous les droits.

Il peut :

- Créer un concours
- Modifier un concours
- Supprimer un concours
- Configurer les règles
- Gérer les joueurs
- Gérer les équipes
- Gérer les inscriptions
- Valider ou refuser une inscription
- Effectuer le tirage
- Modifier manuellement les poules
- Générer les matchs
- Saisir ou modifier les scores
- Gérer les qualifications
- Gérer la phase finale
- Consulter les statistiques
- Archiver les concours

---

## 2. ORGANISATEUR

L'organisateur peut :

- Consulter les concours
- Voir les inscriptions
- Ajouter des équipes
- Modifier les équipes
- Consulter les poules
- Saisir les résultats
- Consulter les classements

Il ne peut pas modifier les paramètres critiques du système.

---

## 3. JOUEUR

Le joueur peut :

- Créer son profil
- Consulter les concours disponibles
- S'inscrire
- Créer une équipe
- Rejoindre une équipe
- Consulter son équipe
- Voir les poules
- Voir les matchs
- Consulter les résultats
- Consulter le classement

---

## 4. VISITEUR / PUBLIC

Le public peut consulter sans modifier :

- Les concours
- Les participants
- Les poules
- Les matchs
- Les scores
- Les classements
- Le tableau final

---

# MODULE 1 — GESTION DES CONCOURS

L'administrateur peut créer un nouveau concours.

Chaque concours doit contenir les informations suivantes :

- Nom du concours
- Description
- Date
- Heure de début
- Lieu
- Adresse
- Nombre de terrains disponibles
- Nombre maximum d'équipes
- Type de jeu
- Format de compétition
- Nombre d'équipes par poule
- Nombre d'équipes qualifiées
- Statut
- Règlement spécifique

---

# TYPES DE JEU

L'application doit obligatoirement gérer trois formats.

## TÊTE-À-TÊTE

Une équipe contient :

- 1 joueur

---

## DOUBLETTE

Une équipe contient :

- 2 joueurs

---

## TRIPLETTE

Une équipe contient :

- 3 joueurs

---

Le système doit utiliser une structure générique d'équipe afin que le même moteur de compétition fonctionne pour les trois formats.

---

# STATUTS DU CONCOURS

Chaque concours doit suivre un cycle de vie.

```text
BROUILLON

↓

INSCRIPTIONS OUVERTES

↓

INSCRIPTIONS CLÔTURÉES

↓

TIRAGE EN ATTENTE

↓

TIRAGE EFFECTUÉ

↓

CONCOURS EN COURS

↓

TERMINÉ

↓

ARCHIVÉ
```

L'interface doit clairement afficher le statut actuel.

---

# MODULE 2 — GESTION DES JOUEURS

Créer une base de données de joueurs.

Chaque joueur possède :

- ID unique
- Nom
- Prénom
- Téléphone
- Email
- Numéro de licence
- Club
- Photo optionnelle
- Date de création
- Statut

Prévoir une recherche rapide.

Exemple :

```text
🔍 Rechercher un joueur
```

La recherche doit fonctionner par :

- Nom
- Prénom
- Téléphone
- Numéro de licence

---

# MODULE 3 — INSCRIPTIONS

Le système doit permettre deux modes d'inscription.

---

## MODE A — INSCRIPTION PAR ÉQUIPE

Les joueurs arrivent déjà avec leur équipe.

Exemple pour une doublette :

```text
ÉQUIPE

Joueur 1
Jean Dupont

Joueur 2
Karim Ben Ali
```

L'organisateur crée directement l'équipe.

---

## MODE B — INSCRIPTION INDIVIDUELLE

Un joueur peut s'inscrire individuellement.

L'organisateur peut ensuite :

- Le laisser sans équipe
- L'ajouter à une équipe existante
- Créer une nouvelle équipe

---

# STATUT DES INSCRIPTIONS

Chaque inscription possède un statut :

```text
EN ATTENTE

VALIDÉE

REFUSÉE

ANNULÉE
```

Seules les équipes VALIDÉES peuvent participer au tirage.

---

# MODULE 4 — GESTION DES ÉQUIPES

Chaque équipe possède :

- ID unique
- Nom de l'équipe
- Concours associé
- Liste des joueurs
- Statut
- Numéro attribué automatiquement

Exemple :

```text
ÉQUIPE #12

👤 Jean Dupont
👤 Karim Ben Ali
```

Le système doit empêcher une équipe de contenir un nombre incorrect de joueurs.

Exemple :

- Tête-à-tête : exactement 1 joueur
- Doublette : exactement 2 joueurs
- Triplette : exactement 3 joueurs

---

# MODULE 5 — TABLEAU DES INSCRIPTIONS

Créer un écran permettant de visualiser rapidement toutes les équipes.

Colonnes :

| N° | Équipe | Joueurs | Statut |
|---|---|---|---|

Fonctionnalités :

- Recherche
- Tri
- Filtre
- Validation
- Modification
- Suppression

Afficher un compteur :

```text
48 / 64 équipes inscrites
```

---

# MODULE 6 — TIRAGE AU SORT

Le tirage est une fonctionnalité centrale.

Créer un écran dédié.

Titre :

# 🎲 TIRAGE AU SORT

Avant le tirage, afficher :

- Nombre total d'équipes validées
- Nombre de poules
- Nombre d'équipes par poule
- Nombre de terrains
- Nombre total de matchs

---

## BOUTON PRINCIPAL

```text
🎲 EFFECTUER LE TIRAGE
```

---

# RÈGLES DU TIRAGE

Le système doit :

1. Récupérer uniquement les équipes validées.
2. Mélanger aléatoirement les équipes.
3. Créer les poules.
4. Distribuer les équipes.
5. Générer les matchs.
6. Sauvegarder le résultat.

IMPORTANT :

Le système doit afficher un écran de confirmation avant de finaliser le tirage.

Une fois le tirage confirmé :

- Les poules sont créées.
- Les équipes sont affectées.
- Les matchs sont générés.
- Le concours passe au statut suivant.

---

# MODIFICATION MANUELLE

Après le tirage, l'administrateur doit pouvoir déplacer une équipe.

Exemple :

```text
Déplacer Équipe 12

POULE A

VERS

POULE C
```

IMPORTANT :

Après une modification manuelle, le système doit automatiquement mettre à jour les matchs concernés.

---

# MODULE 7 — CONSTRUCTION DES POULES

L'application doit automatiquement créer les poules.

Exemple :

```text
POULE A

Équipe 1
Équipe 7
Équipe 12
Équipe 18
```

```text
POULE B

Équipe 2
Équipe 5
Équipe 11
Équipe 20
```

---

# CONFIGURATION DES POULES

L'administrateur peut choisir :

- Nombre de poules
- Nombre maximum d'équipes par poule

Le système doit proposer automatiquement une répartition optimale.

Exemples :

```text
32 équipes

8 poules de 4
```

```text
24 équipes

6 poules de 4
```

```text
16 équipes

4 poules de 4
```

---

# GESTION DES NOMBRES NON PARFAITS

Le système doit gérer automatiquement les cas où le nombre d'équipes ne permet pas de créer des poules parfaitement égales.

Exemple :

```text
22 équipes
```

Le système doit proposer plusieurs solutions équilibrées.

Par exemple :

```text
4 poules de 4
+
2 poules de 3
```

L'administrateur doit pouvoir choisir la solution.

---

# MODULE 8 — GÉNÉRATION DES MATCHS

Le système doit générer automatiquement les matchs.

Pour une poule de 4 équipes :

```text
Équipe A1
VS
Équipe A2

Équipe A3
VS
Équipe A4
```

Puis :

```text
Équipe A1
VS
Équipe A3

Équipe A2
VS
Équipe A4
```

Puis :

```text
Équipe A1
VS
Équipe A4

Équipe A2
VS
Équipe A3
```

Chaque équipe doit rencontrer les autres équipes de sa poule.

---

# MATCHS

Chaque match possède :

- ID
- Concours
- Phase
- Poule
- Équipe 1
- Équipe 2
- Score équipe 1
- Score équipe 2
- Statut
- Terrain
- Heure prévue
- Heure réelle de début
- Heure de fin

---

# STATUT DES MATCHS

```text
À VENIR

EN COURS

TERMINÉ

VALIDÉ
```

---

# MODULE 9 — GESTION DES TERRAINS

Le concours peut posséder plusieurs terrains.

Exemple :

```text
Terrain 1
Terrain 2
Terrain 3
Terrain 4
Terrain 5
```

Le système doit pouvoir affecter automatiquement les matchs aux terrains.

Objectif :

Éviter qu'une équipe joue simultanément sur deux terrains.

Prévoir une interface permettant à l'organisateur de modifier manuellement le terrain.

---

# MODULE 10 — SAISIE DES SCORES

Créer une interface extrêmement simple.

Exemple :

```text
POULE A

ÉQUIPE 1

13

VS

8

ÉQUIPE 7
```

Boutons :

```text
VALIDER LE RÉSULTAT
```

---

# VALIDATION DES SCORES

Avant validation :

- Vérifier que les scores sont valides.
- Empêcher les résultats impossibles.
- Demander confirmation.

Après validation :

- Mettre à jour le classement.
- Mettre à jour les statistiques.
- Débloquer les matchs suivants si nécessaire.

---

# MODULE 11 — CLASSEMENT DES POULES

Créer automatiquement un classement.

Afficher :

| Rang | Équipe | Matchs | Victoires | Défaites | Points Pour | Points Contre | Différence |
|---|---|---|---|---|---|---|---|

Exemple :

```text
1. Équipe 7

3 victoires

2. Équipe 12

2 victoires

3. Équipe 4

1 victoire

4. Équipe 9

0 victoire
```

---

# RÈGLES DE CLASSEMENT

Le moteur doit être PARAMÉTRABLE.

Prévoir les critères suivants :

1. Nombre de victoires
2. Résultat des confrontations directes
3. Différence de points
4. Points marqués
5. Tirage au sort si nécessaire

IMPORTANT :

Les règles exactes de départage doivent être configurables par concours.

NE PAS coder une règle unique de manière rigide.

---

# MODULE 12 — QUALIFICATIONS

L'administrateur doit pouvoir configurer :

```text
Nombre d'équipes qualifiées par poule
```

Exemple :

```text
1er et 2e de chaque poule qualifiés
```

L'application doit automatiquement identifier les équipes qualifiées.

---

# MODULE 13 — PHASE FINALE

Créer automatiquement un tableau d'élimination directe.

Exemple :

# QUARTS DE FINALE

```text
MATCH Q1

1er Poule A

VS

2e Poule B
```

```text
MATCH Q2

1er Poule C

VS

2e Poule D
```

Puis :

```text
DEMI-FINALES
```

Puis :

```text
FINALE
```

Puis :

# 🏆 VAINQUEUR DU CONCOURS

---

# TABLEAU VISUEL

Créer une visualisation graphique moderne du tableau.

Exemple :

```text
QUARTS

A ─────┐
       ├──── DEMI ────┐
B ─────┘              │
                      ├──── 🏆
C ─────┐              │
       ├──── DEMI ────┘
D ─────┘
```

Le tableau doit être responsive.

---

# MODULE 14 — TABLEAU DE BORD

Créer un dashboard principal.

Exemple :

# 🏆 PBP CONCOURS

```text
Concours en cours
```

Afficher des cartes.

### PARTICIPANTS

```text
👥

48

Équipes inscrites
```

### MATCHS

```text
🎯

24

Matchs terminés
```

### CONCOURS

```text
🏆

2

Concours actifs
```

### TERRAINS

```text
📍

8

Terrains disponibles
```

---

# PAGE D'ACCUEIL

Créer une interface avec :

- Logo PBP
- Nom de l'association
- Concours à venir
- Concours en cours
- Derniers résultats

Design sportif et élégant.

---

# MODULE 15 — SUIVI EN DIRECT

Créer une vue publique.

URL possible :

```text
/concours/{id}/live
```

Le public doit pouvoir consulter :

- Les matchs en cours
- Les scores
- Les poules
- Les classements
- Le tableau final

IMPORTANT :

Les informations doivent être mises à jour automatiquement lorsque les résultats changent.

---

# MODULE 16 — HISTORIQUE

Conserver tous les concours terminés.

Chaque concours archivé doit permettre de consulter :

- Participants
- Équipes
- Poules
- Matchs
- Résultats
- Classement final
- Vainqueur

---

# MODULE 17 — STATISTIQUES

Créer des statistiques simples.

Par concours :

- Nombre de participants
- Nombre d'équipes
- Nombre de matchs
- Nombre de terrains utilisés
- Durée du concours
- Vainqueur

Pour les joueurs :

- Nombre de concours
- Nombre de victoires
- Nombre de défaites
- Historique des résultats

---

# BASE DE DONNÉES

Utiliser une architecture relationnelle propre.

Tables principales :

```text
users
```

```text
players
```

```text
tournaments
```

```text
registrations
```

```text
teams
```

```text
team_players
```

```text
pools
```

```text
pool_teams
```

```text
matches
```

```text
match_results
```

```text
venues
```

```text
courts
```

---

# RELATIONS PRINCIPALES

```text
TOURNAMENT

↓

TEAMS

↓

TEAM PLAYERS

↓

POOLS

↓

POOL TEAMS

↓

MATCHES

↓

RESULTS
```

---

# MOTEUR DE COMPÉTITION

IMPORTANT :

Créer un moteur de compétition indépendant de l'interface utilisateur.

Le moteur doit recevoir une configuration.

Exemple :

```json
{
  "team_count": 48,
  "team_format": "doublette",
  "competition_format": "groups_then_knockout",
  "group_size": 4,
  "qualified_per_group": 2
}
```

Le moteur doit générer :

```json
{
  "groups": 12,
  "teams_per_group": 4,
  "qualified_teams": 24,
  "competition_structure": "groups_then_knockout"
}
```

---

# ALGORITHME DE CONSTRUCTION DES POULES

Le système doit :

1. Compter les équipes validées.
2. Analyser les répartitions possibles.
3. Rechercher une solution équilibrée.
4. Éviter autant que possible des poules avec trop d'écart de taille.
5. Proposer les meilleures configurations.
6. Laisser l'administrateur choisir.
7. Effectuer le tirage.
8. Créer les matchs.

---

# IMPORTANT : ARCHITECTURE EXTENSIBLE

Le système doit être conçu pour permettre d'ajouter ultérieurement :

- Concours à élimination directe
- Système suisse
- Concours A / B / C / D
- Repêchage
- Concours par équipes
- Classement général annuel
- Classement des joueurs
- Système de points
- Gestion des licences
- Paiement en ligne
- Notifications
- SMS
- Emails
- QR Code d'inscription

NE PAS construire une architecture rigide.

---

# DESIGN UI / UX

Créer un design :

- Moderne
- Sportif
- Élégant
- Professionnel
- Minimaliste

---

# IDENTITÉ VISUELLE

Inspirer l'interface de :

- La pétanque
- Les compétitions sportives
- Les tableaux de tournoi professionnels

Utiliser principalement :

- Bleu profond
- Blanc
- Tons sable / terre
- Vert discret pour les validations
- Rouge discret pour les erreurs

---

# COMPOSANTS UI

Utiliser :

- Cartes
- Tableaux
- Badges
- Modales
- Boutons visibles
- Onglets
- Filtres
- Barre de recherche
- Notifications

---

# NAVIGATION PRINCIPALE

Créer une sidebar.

```text
🏠 Tableau de bord

🏆 Concours

👥 Joueurs

👥 Équipes

🎲 Tirages

📊 Poules

🎯 Matchs

🏆 Classements

📈 Statistiques

⚙️ Paramètres
```

---

# RESPONSIVE DESIGN

L'application doit fonctionner parfaitement sur :

- Desktop
- Tablette
- Smartphone

Le jour du concours, les organisateurs peuvent utiliser un téléphone ou une tablette.

PRIORITÉ :

La saisie des résultats doit être particulièrement simple sur mobile.

---

# SÉCURITÉ

Implémenter :

- Authentification
- Gestion des rôles
- Protection des données
- Validation des formulaires
- Contrôle des permissions

---

# VALIDATIONS MÉTIER CRITIQUES

Le système ne doit jamais permettre :

- Une équipe avec un nombre incorrect de joueurs.
- Une équipe non validée dans le tirage.
- Un joueur dupliqué dans une même équipe.
- Un joueur inscrit deux fois au même concours sans autorisation explicite.
- Un match avec la même équipe des deux côtés.
- Une équipe jouant deux matchs simultanément.
- Une modification silencieuse d'un tirage déjà utilisé.

Toute modification critique doit être confirmée et tracée.

---

# EXPÉRIENCE ORGANISATEUR

L'application doit guider l'organisateur.

Exemple :

### ÉTAPE 1

```text
Créer le concours
```

### ÉTAPE 2

```text
Ouvrir les inscriptions
```

### ÉTAPE 3

```text
Valider les équipes
```

### ÉTAPE 4

```text
Clôturer les inscriptions
```

### ÉTAPE 5

```text
Configurer les poules
```

### ÉTAPE 6

```text
Effectuer le tirage
```

### ÉTAPE 7

```text
Lancer les matchs
```

### ÉTAPE 8

```text
Saisir les résultats
```

### ÉTAPE 9

```text
Générer la phase finale
```

### ÉTAPE 10

```text
Clôturer le concours
```

---

# PRIORITÉ DE DÉVELOPPEMENT

Construire l'application dans cet ordre.

## PHASE 1 — MVP

Créer :

1. Authentification
2. Tableau de bord
3. Gestion des joueurs
4. Création des concours
5. Gestion des équipes
6. Inscriptions
7. Validation
8. Tirage
9. Construction des poules
10. Génération des matchs
11. Saisie des scores
12. Classement
13. Phase finale

---

## PHASE 2

Ajouter :

- Vue publique
- Suivi en direct
- Statistiques
- Historique

---

## PHASE 3

Ajouter :

- Paiement
- Notifications
- QR Code
- Classement annuel
- Système de points
- API

---

# INSTRUCTIONS DE DÉVELOPPEMENT

Construis une application réellement fonctionnelle.

NE PAS créer uniquement une maquette statique.

Chaque bouton important doit avoir une fonction.

Les données doivent être cohérentes.

Créer des données de démonstration pour permettre de tester immédiatement l'application.

---

# DONNÉES DE DÉMONSTRATION

Créer automatiquement :

- 1 administrateur
- 20 joueurs
- Plusieurs équipes
- 1 concours de démonstration
- Plusieurs poules
- Plusieurs matchs

Les données doivent permettre de tester :

- Le tirage
- Les résultats
- Le classement
- La phase finale

---

# EXEMPLE DE PARCOURS COMPLET

L'administrateur doit pouvoir :

```text
Créer un concours
        ↓
Choisir DOUBLETTE
        ↓
Définir 32 équipes maximum
        ↓
Créer les équipes
        ↓
Valider les inscriptions
        ↓
Clôturer les inscriptions
        ↓
Choisir 8 poules de 4 équipes
        ↓
Effectuer le tirage
        ↓
Générer les matchs
        ↓
Saisir les résultats
        ↓
Calculer automatiquement les classements
        ↓
Qualifier les équipes
        ↓
Générer le tableau final
        ↓
Déterminer le vainqueur
        ↓
Archiver le concours
```

---

# CRITÈRES DE QUALITÉ

L'application finale doit être :

- Fonctionnelle
- Stable
- Cohérente
- Professionnelle
- Intuitive
- Responsive
- Extensible
- Maintenable

---

# INSTRUCTION FINALE

Commence par construire une première version complète et fonctionnelle du MVP.

PRIORITÉ ABSOLUE :

1. Architecture claire.
2. Expérience organisateur simple.
3. Gestion fiable des équipes.
4. Tirage au sort fonctionnel.
5. Construction automatique des poules.
6. Génération correcte des matchs.
7. Calcul automatique des classements.
8. Tableau de phase finale fonctionnel.

NE PAS sacrifier la logique métier au profit du design.

Le design doit être excellent, mais la priorité absolue est que l'application permette réellement de gérer un concours de pétanque de A à Z.

Si une règle métier de compétition n'est pas explicitement définie, rendre cette règle configurable plutôt que de faire une hypothèse rigide.

Construis le projet de manière progressive, mais avec une architecture prête pour évoluer vers une plateforme complète de gestion des concours de pétanque pour PBP.