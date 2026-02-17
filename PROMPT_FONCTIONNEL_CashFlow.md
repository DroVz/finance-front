# PROMPT FONCTIONNEL - Feature Cash Flow

## Contexte
Application de gestion de finances personnelles. L'utilisateur saisit ses transactions (revenus et dépenses) sur ses différents comptes bancaires 1 à 2 fois par mois.

## Objectif de la feature
Créer un onglet "Cash Flow" qui permet à l'utilisateur de visualiser s'il arrive à rester dans le positif chaque mois, c'est-à-dire s'il génère de l'épargne ou s'il dépense plus que ce qu'il gagne.

---

## Définitions métier essentielles

### Type de transactions dans l'application

**VIREMENT** = Mouvement d'argent entre deux comptes appartenant au même utilisateur
- Exemple : Transfert de 500€ du Compte Courant vers le Livret A
- Nature : Mouvement interne, n'affecte pas la richesse globale
- Traitement : **À EXCLURE** de toutes les analyses de cash flow

**DÉPENSE** = Sortie d'argent vers un tiers (personne ou organisation externe)
- Exemples : 
  - Loyer de 800€ payé par virement bancaire au propriétaire
  - Courses de 120€ payées par carte bancaire au supermarché
  - Essence de 60€ payée en espèces à la station-service
- Nature : Sortie réelle d'argent, diminue la richesse
- Traitement : **À INCLURE** dans l'analyse (peu importe le moyen de paiement)

**REVENU** = Entrée d'argent provenant d'un tiers
- Exemples :
  - Salaire de 2500€ reçu par virement de l'employeur
  - Remboursement sécu de 50€ reçu par virement
  - Cadeau de 100€ reçu en espèces
- Nature : Entrée réelle d'argent, augmente la richesse
- Traitement : **À INCLURE** dans l'analyse (peu importe le moyen de réception)

**INTÉRÊTS / REVENUS PASSIFS** = Argent généré automatiquement par les placements
- Exemples :
  - Intérêts du Livret A : +5€
  - Dividendes d'actions : +20€
- Nature : Revenu passif, pas lié à la capacité d'épargne active de l'utilisateur
- Traitement : **À EXCLURE** de l'analyse cash flow (on veut voir ce que l'utilisateur génère, pas ce que la banque donne)

---

## Fonctionnalité 1 : Dépenses et revenus par catégorie

### Description
Afficher une vue synthétique des dépenses et revenus, regroupés par catégorie.

### Règles de calcul
- **Inclure** : Toutes les dépenses réelles vers des tiers
- **Inclure** : Tous les revenus réels depuis des tiers
- **Exclure** : Les virements internes (mouvements entre comptes de l'utilisateur)
- **Exclure** : Les intérêts et revenus passifs

### Exemple concret

**Données du mois de février :**

Revenus :
- Salaire : 2500€ (catégorie : Salaire)
- Remboursement sécu : 50€ (catégorie : Santé)
- ~~Intérêts Livret A : 5€~~ (EXCLU - revenu passif)

Dépenses :
- Loyer : 800€ (catégorie : Logement) - payé par virement bancaire
- Courses : 400€ (catégorie : Alimentation) - payé par CB
- Restaurants : 150€ (catégorie : Alimentation)
- Essence : 100€ (catégorie : Transport)
- ~~Virement Livret A : 500€~~ (EXCLU - virement interne)

**Affichage attendu :**

```
REVENUS PAR CATÉGORIE
├─ Salaire : 2500€
└─ Santé : 50€
TOTAL REVENUS : 2550€

DÉPENSES PAR CATÉGORIE
├─ Logement : 800€
├─ Alimentation : 550€ (Courses + Restaurants)
└─ Transport : 100€
TOTAL DÉPENSES : 1450€

CASH FLOW DU MOIS : +1100€
```

**Note importante** : Les 500€ virés sur le Livret A ne sont PAS comptés comme une dépense. Ils font partie de l'épargne générée (les +1100€).

### Format d'affichage suggéré
- Tableau ou liste avec nom de catégorie + montant
- Séparation claire Revenus / Dépenses
- Total pour chaque section
- Cash flow résultant (Revenus - Dépenses)

---

## Fonctionnalité 2 : Graphique de cash flow mensuel

### Description
Un graphique qui représente le cash flow de l'utilisateur mois par mois. Chaque point du graphique indique si l'utilisateur a généré de l'épargne (positif) ou s'il a puisé dans ses réserves (négatif) ce mois-là.

### Formule de calcul du cash flow mensuel

```
Cash Flow du mois = 
  Σ(Revenus actifs du mois) 
  - Σ(Dépenses du mois)
  
Où :
- Revenus actifs = revenus depuis des tiers (salaire, remboursements, etc.)
- Dépenses = dépenses vers des tiers (loyer, courses, etc.)
- HORS virements internes (transferts entre comptes de l'utilisateur)
- HORS intérêts et revenus passifs
```

### Périmètre des comptes

**Option recommandée : TOUS les comptes de l'utilisateur**

Pourquoi ?
- Vision consolidée et honnête de la situation financière
- Les virements internes s'annulent naturellement dans le calcul
- Détecte vraiment si l'utilisateur dépense plus que ce qu'il gagne, même s'il puise dans l'épargne

**Alternative (MVP) : Compte courant uniquement**
- Plus simple à implémenter
- Suffisant si l'utilisateur ne fait JAMAIS de dépenses depuis ses comptes d'épargne
- À privilégier si limitation technique au démarrage

### Exemple de calcul

**Mois de mars - Vue consolidée (tous comptes) :**

Transactions compte courant :
- Salaire : +2500€
- Loyer : -800€
- Courses : -400€
- Virement vers Livret A : -500€ (EXCLU du calcul)

Transactions Livret A :
- Virement reçu depuis compte courant : +500€ (EXCLU du calcul)
- Intérêts : +5€ (EXCLU - revenu passif)
- Achat exceptionnel : -300€ (dépense via CB Livret A)

**Calcul du cash flow :**
```
Revenus = 2500€
Dépenses = 800 + 400 + 300 = 1500€
Cash Flow = 2500 - 1500 = +1000€
```

**Point affiché sur le graphique pour mars : +1000€** ✅

### Interprétation du graphique

**Point positif (+500€)** : 
- L'utilisateur a épargné 500€ ce mois-là
- Ses revenus ont dépassé ses dépenses
- 🟢 Situation saine

**Point à zéro (0€)** :
- L'utilisateur est à l'équilibre
- Revenus = Dépenses exactement
- 🟡 Attention, pas d'épargne générée

**Point négatif (-200€)** :
- L'utilisateur a puisé 200€ dans ses réserves ce mois-là
- Ses dépenses ont dépassé ses revenus
- 🔴 Alerte, désépargne en cours

### Objectif utilisateur

L'utilisateur veut voir sur le temps s'il arrive à **rester dans le positif**, c'est-à-dire :
- Générer de l'épargne régulièrement
- Détecter rapidement les mois problématiques (négatifs)
- Identifier les tendances (amélioration ou dégradation)

### Caractéristiques du graphique

**Axe X** : Temps (mois)
- Afficher les 12 derniers mois par défaut
- Possibilité de filtrer sur une période (6 mois, 24 mois, depuis le début, etc.)

**Axe Y** : Montant du cash flow en €
- Échelle centrée sur zéro
- Valeurs positives au-dessus, négatives en-dessous

**Ligne de référence** : 
- Trait horizontal à Y=0 pour matérialiser l'équilibre
- Permet de voir immédiatement si le point est au-dessus (✅) ou en-dessous (❌)

**Éléments visuels suggérés** :
- **Code couleur** :
  - Points verts pour cash flow positif
  - Points rouges pour cash flow négatif
  - Points orange pour proche de zéro (ex : -10% à +10%)
  
- **Info-bulle au survol** :
  - Mois concerné
  - Montant du cash flow
  - Détail : Revenus, Dépenses, Résultat
  
- **Moyenne mobile optionnelle** (amélioration future) :
  - Ligne de tendance sur 3 mois
  - Permet de lisser les variations exceptionnelles
  - Montre la direction générale (hausse/baisse)

---

## Exemples de scénarios utilisateur

### Scénario 1 : Utilisateur qui épargne régulièrement

**Données sur 3 mois :**

Janvier :
- Revenus : 2500€
- Dépenses : 1800€
- Cash Flow : +700€

Février :
- Revenus : 2500€
- Dépenses : 1750€
- Cash Flow : +750€

Mars :
- Revenus : 2650€ (prime)
- Dépenses : 1900€
- Cash Flow : +750€

**Graphique attendu** :
- 3 points verts au-dessus de la ligne zéro
- Tendance stable/légèrement croissante
- Message implicite : ✅ "Vous gérez bien vos finances"

---

### Scénario 2 : Mois exceptionnel avec gros achat

**Données sur 3 mois :**

Janvier :
- Revenus : 2500€
- Dépenses : 1800€
- Cash Flow : +700€

Février :
- Revenus : 2500€
- Dépenses : 4000€ (achat ordinateur 2200€ + dépenses courantes 1800€)
- Cash Flow : -1500€

Mars :
- Revenus : 2500€
- Dépenses : 1750€
- Cash Flow : +750€

**Graphique attendu** :
- Janvier : Point vert (+700)
- Février : Point rouge (-1500) - creux visible
- Mars : Point vert (+750) - retour à la normale
- Message implicite : ⚠️ "Mois difficile en février, mais retour à l'équilibre"

**Note** : L'utilisateur voit clairement l'impact de son achat exceptionnel

---

### Scénario 3 : Détérioration progressive

**Données sur 4 mois :**

Janvier : +600€
Février : +300€
Mars : -100€
Avril : -400€

**Graphique attendu** :
- Ligne descendante claire
- Passage du vert au rouge
- Message implicite : 🚨 "Alerte, vous dépensez de plus en plus"

**Action attendue** : L'utilisateur doit réagir (réduire dépenses ou augmenter revenus)

---

## Règles de gestion importantes

### 1. Gestion des virements internes

**Principe** : Un virement interne n'affecte JAMAIS le cash flow

**Exemple** :
```
Transaction : Virement de 500€ du Compte Courant vers Livret A

Vue comptable :
- Compte Courant : -500€
- Livret A : +500€
- Patrimoine global : 0€ (inchangé)

Impact sur cash flow : 0€ (transaction exclue)
```

**Identification** : Un virement est interne si le compte source ET le compte destination appartiennent au même utilisateur.

---

### 2. Gestion des revenus passifs

**Principe** : Les revenus passifs n'affectent JAMAIS le cash flow (on mesure la capacité d'épargne ACTIVE)

**Exemples de revenus passifs à exclure** :
- Intérêts de Livret A, LDD, PEL
- Intérêts de compte épargne
- Dividendes d'actions
- Revenus de placements automatiques

**Exemples de revenus actifs à inclure** :
- Salaire
- Primes
- Remboursements (sécu, assurance, etc.)
- Aides (CAF, etc.)
- Revenus d'activité secondaire

---

### 3. Tous les moyens de paiement sont équivalents

**Une dépense est une dépense, peu importe comment elle est payée.**

Exemples équivalents pour une dépense de 800€ de loyer :
- Virement bancaire vers le propriétaire : -800€
- Chèque au propriétaire : -800€
- Prélèvement automatique : -800€

→ Dans tous les cas : Dépense de 800€ comptabilisée

**Seul critère** : Est-ce que l'argent sort vers un tiers ? Si oui → Dépense.

---

### 4. Période de calcul

**Par défaut** : Calcul mensuel (du 1er au dernier jour du mois)

**Alternative possible** : Permettre à l'utilisateur de choisir sa période de référence
- Par défaut : Mois calendaire (1er - 30/31)
- Optionnel : Mois personnalisé (ex : du 5 au 4 si salaire le 5)

---

## Cas limites à gérer

### Cas 1 : Premier mois d'utilisation incomplet

**Situation** : L'utilisateur s'inscrit le 15 février et commence à saisir ses transactions.

**Comportement attendu** :
- Afficher le cash flow de février basé uniquement sur les données saisies (15-28 février)
- Ajouter un indicateur visuel "Mois incomplet" ou "Données partielles"
- Ne pas fausser la moyenne si calcul de tendance

---

### Cas 2 : Mois sans aucune transaction

**Situation** : L'utilisateur n'a saisi aucune transaction en mars (oubli ou absence).

**Comportement attendu** :
- Afficher Cash Flow = 0€ pour ce mois
- Ajouter un indicateur "Aucune donnée" ou "Mois vide"
- Ne pas interpoler ou inventer des données

---

### Cas 3 : Utilisateur avec un seul compte

**Situation** : L'utilisateur n'a qu'un seul compte bancaire enregistré.

**Comportement attendu** :
- Calcul normal (pas de virements internes possibles)
- Même logique que multi-comptes
- Aucun traitement spécial nécessaire

---

### Cas 4 : Transaction saisie rétroactivement

**Situation** : L'utilisateur saisit en avril une dépense de mars qu'il avait oubliée.

**Comportement attendu** :
- Recalculer automatiquement le cash flow de mars
- Mettre à jour le graphique avec la nouvelle valeur
- Pas de notification particulière (mise à jour transparente)

---

## Messages et feedback utilisateur

### Interprétations suggérées

**Cash flow très positif (> +500€)** :
- Message : "✅ Excellent mois ! Vous avez épargné [montant]€"
- Couleur : Vert foncé

**Cash flow légèrement positif (0 à +500€)** :
- Message : "✅ Mois positif, [montant]€ d'épargne générée"
- Couleur : Vert clair

**Cash flow proche de zéro (-50€ à 0€)** :
- Message : "⚠️ À l'équilibre ce mois-ci"
- Couleur : Orange

**Cash flow négatif (-500€ à -50€)** :
- Message : "⚠️ Attention, vous avez puisé [montant]€ dans vos réserves"
- Couleur : Orange/Rouge

**Cash flow très négatif (< -500€)** :
- Message : "🚨 Alerte : forte désépargne de [montant]€"
- Couleur : Rouge foncé

---

## Évolutions futures possibles (hors scope MVP)

### 1. Moyenne mobile sur 3 mois
Lisser les variations pour voir la tendance réelle.

### 2. Cumul sur l'année
Afficher le cash flow cumulé depuis janvier.

### 3. Comparaison année N vs année N-1
"En mars 2026 : +500€ vs mars 2025 : +200€"

### 4. Prévisions
"Si vous continuez comme ça, vous épargnerez X€ sur l'année"

### 5. Alertes personnalisées
"Vous êtes en négatif depuis 2 mois consécutifs"

### 6. Export des données
Télécharger le graphique en PDF ou les données en CSV

---

## Résumé des règles métier

| Type de transaction | Inclus dans cash flow ? | Raison |
|---------------------|------------------------|--------|
| Dépense vers un tiers | ✅ OUI | Sortie réelle d'argent |
| Revenu depuis un tiers | ✅ OUI | Entrée réelle d'argent |
| Virement interne | ❌ NON | Mouvement entre mes comptes |
| Intérêts / Revenus passifs | ❌ NON | Pas lié à ma capacité d'épargne active |

**Formule finale** :
```
Cash Flow = Revenus actifs - Dépenses réelles
(hors virements internes et revenus passifs)
```

**Objectif utilisateur** : Voir si je reste dans le positif mois après mois.

---

FIN DU PROMPT FONCTIONNEL
