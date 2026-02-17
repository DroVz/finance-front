# UC1.1 - Créer un objectif d'épargne
## Spécification Fonctionnelle pour Développeurs

**Version** : 1.0  
**Date** : 08/02/2026  
**Auteur** : Product Owner  
**Statut** : Prêt pour pré-affinage

---

## 📋 Vue d'ensemble

### Objectif
Permettre aux utilisateurs de créer des objectifs d'épargne pour structurer leur gestion financière et suivre leur progression vers leurs projets.

### Règles métier essentielles
- ✅ Maximum **5 objectifs actifs** par utilisateur
- ✅ **Montant cible** obligatoire, **date limite** optionnelle
- ✅ **Compte bancaire** associé optionnel (recommandé)
- ✅ Pas de limite de montant (confirmation si > 100 000€)
- ✅ Création autorisée dès l'inscription (pas d'attente)
- ✅ Suppression définitive possible (pas d'archivage)

---

## 🎯 User Story

**En tant qu'** utilisateur de l'application  
**Je veux** créer un objectif d'épargne  
**Afin de** structurer mon épargne et suivre ma progression vers mes projets

### Critères d'acceptation clés

1. **Accès** : Bouton "Créer un objectif" visible depuis le dashboard et la page objectifs
2. **Formulaire** : 4 champs (Nom, Montant, Date optionnelle, Compte optionnel)
3. **Validation** : Messages d'erreur clairs en temps réel
4. **Calculs automatiques** : Effort mensuel affiché si date définie
5. **Limite** : Blocage si déjà 5 objectifs actifs
6. **Confirmation** : Succès affiché + redirection dashboard

---

## 📝 Spécifications fonctionnelles

### 1. Champs du formulaire

#### 1.1 Nom de l'objectif
| Attribut | Valeur |
|----------|--------|
| Type | Texte libre |
| Obligatoire | ✅ Oui |
| Longueur | 3-50 caractères |
| Validation | Temps réel |
| Message erreur | "Le nom doit faire au moins 3 caractères" |
| Placeholder | "Ex: Vacances été 2026, Nouvelle voiture" |

**Règles** :
- Trim automatique des espaces
- Pas de blocage sur doublons (warning uniquement)

---

#### 1.2 Montant cible
| Attribut | Valeur |
|----------|--------|
| Type | Numérique (décimal) |
| Obligatoire | ✅ Oui |
| Minimum | 1€ |
| Maximum | Aucun (confirmation si > 100 000€) |
| Précision | 2 décimales |
| Format | Séparateur de milliers (espace), symbole € |
| Message erreur | "Le montant doit être supérieur à 0€" |

**Règles** :
- Si montant > 100 000€ → popup confirmation
- Affichage dynamique de l'effort mensuel (si date saisie)

---

#### 1.3 Date limite
| Attribut | Valeur |
|----------|--------|
| Type | Date (sélecteur) |
| Obligatoire | ❌ Non |
| Option | Case "Pas de date limite" |
| Date minimum | Demain |
| Format | JJ/MM/AAAA |
| Message erreur | "La date limite doit être dans le futur" |

**Règles** :
- Si "Pas de date limite" coché → champ date masqué + valeur NULL en base
- Raccourcis suggérés : "+3 mois", "+6 mois", "+1 an"
- Affichage du nombre de mois restants

---

#### 1.4 Compte associé
| Attribut | Valeur |
|----------|--------|
| Type | Sélecteur (dropdown) |
| Obligatoire | ❌ Non |
| Options | Liste comptes utilisateur + "Aucun compte" |
| Défaut | "Aucun compte spécifique" |

**Règles** :
- Si compte sélectionné → tracking automatique de progression
- Si aucun compte → suivi manuel via versements déclarés
- Un objectif = un seul compte maximum

---

### 2. Calculs automatiques

#### 2.1 Effort mensuel

**Condition** : Montant ET date définis

**Formule** :
```
mois_restants = ARRONDI_SUP((date_limite - aujourd'hui) / 30.44)
effort_mensuel = montant_cible / mois_restants
```

**Affichage** :
```
"Pour atteindre [montant]€ d'ici le [date], 
il faudra épargner ~[effort]€/mois"

"⏱️ Il reste [X] mois"
```

**Si pas de date** :
```
"Épargnez à votre rythme !"

Si historique disponible (≥2 mois) :
"À votre rythme actuel (~[capacité]€/mois), 
vous atteindrez cet objectif en [durée] mois"
```

---

#### 2.2 Indicateur de faisabilité

**Condition** : Historique ≥ 2 mois ET date définie

**Logique** :
```
ratio = effort_mensuel / revenus_moyens

Si ratio ≤ 30% → VERT "Objectif réaliste"
Si ratio 30-50% → ORANGE "Objectif ambitieux"  
Si ratio > 50% → ROUGE "Attention : très difficile"
```

**Si pas d'historique** :
```
"💡 Après 2 mois d'utilisation, vous recevrez 
des recommandations personnalisées"
```

---

### 3. Validations

#### 3.1 Validations bloquantes

| Règle | Condition | Message |
|-------|-----------|---------|
| Nom vide | `name.length == 0` | "Veuillez donner un nom à votre objectif" |
| Nom trop court | `name.length < 3` | "Le nom doit faire au moins 3 caractères" |
| Montant invalide | `amount <= 0` | "Le montant doit être supérieur à 0€" |
| Date passée | `target_date < today` | "La date limite doit être dans le futur" |
| Limite atteinte | `active_objectives >= 5` | "Maximum 5 objectifs actifs. Supprimez-en un pour continuer." |

#### 3.2 Validations avec confirmation

| Règle | Condition | Message |
|-------|-----------|---------|
| Montant élevé | `amount > 100 000` | "⚠️ Vous avez saisi [X]€. Confirmez-vous ?" |
| Doublon nom | `exists(name)` | "ℹ️ Un objectif '[nom]' existe déjà. Continuer ?" |

---

### 4. Workflow utilisateur

```
1. Utilisateur clique sur "Créer un objectif"
   ↓
2. Système vérifie si < 5 objectifs actifs
   ├─ Non → Message bloquant + stop
   └─ Oui → Affiche formulaire
   ↓
3. Utilisateur remplit Nom + Montant + Date (opt) + Compte (opt)
   ↓
4. Système valide en temps réel chaque champ
   ↓
5. Système calcule et affiche :
   - Effort mensuel (si date)
   - Faisabilité (si historique + date)
   - Temps restant
   ↓
6. Utilisateur clique "Créer l'objectif"
   ↓
7. Système valide toutes les données
   ├─ Erreurs → Messages d'erreur
   ├─ Montant > 100k → Confirmation
   └─ OK → Création
   ↓
8. Système enregistre en base
   ↓
9. Notification succès "✅ Objectif créé !"
   ↓
10. Redirection vers dashboard (objectif visible)
```

---

## 🗄️ Modèle de données

### Table `objectives`

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | NOT NULL, FK | ID utilisateur |
| `name` | VARCHAR(50) | NOT NULL | Nom de l'objectif |
| `target_amount` | DECIMAL(10,2) | NOT NULL, > 0 | Montant cible (€) |
| `target_date` | DATE | NULL | Date limite (NULL si pas de deadline) |
| `account_id` | UUID | NULL, FK | Compte associé (NULL si aucun) |
| `category` | VARCHAR(50) | NULL | Catégorie (optionnel) |
| `description` | TEXT | NULL | Description (optionnel) |
| `priority` | INT | 1-5, DEFAULT 3 | Priorité |
| `status` | VARCHAR(20) | DEFAULT 'active' | Statut : active, completed, archived |
| `current_amount` | DECIMAL(10,2) | DEFAULT 0, ≥ 0 | Montant épargné |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date création |
| `updated_at` | TIMESTAMP | ON UPDATE NOW() | Dernière MAJ |
| `completed_at` | TIMESTAMP | NULL | Date complétion |

**Relations** :
- `user_id` → `users.id` (CASCADE DELETE)
- `account_id` → `accounts.id` (SET NULL si compte supprimé)

**Index nécessaires** :
- `user_id` (récupérer objectifs d'un user)
- `status` (filtrer actifs/complétés)
- `target_date` (trier par échéance)

---

## 🔧 Actions Backend

### Action 1 : Créer un objectif

**Route** : `POST /api/objectives`  
**Authentification** : Requise (JWT)

**Input** :
```json
{
  "name": "Vacances été 2026",
  "target_amount": 5000.00,
  "target_date": "2026-12-15",
  "account_id": "uuid-compte",
  "category": "Vacances",
  "description": "Voyage en Grèce",
  "priority": 4
}
```

**Étapes** :
1. Vérifier authentification (token valide)
2. Valider les données (nom, montant, date)
3. Compter les objectifs actifs de l'utilisateur
4. Si ≥ 5 → Erreur 400 "LIMIT_REACHED"
5. Si compte fourni → Vérifier qu'il existe et appartient à l'user
6. Insérer en base avec `status='active'` et `current_amount=0`
7. Retourner l'objectif créé

**Output succès (201)** :
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Vacances été 2026",
    "target_amount": 5000.00,
    "target_date": "2026-12-15",
    "account_id": "uuid",
    "status": "active",
    "current_amount": 0.00,
    "created_at": "2026-02-08T10:30:00Z",
    ...
  },
  "message": "Objectif créé avec succès"
}
```

**Erreurs possibles** :
- `400 INVALID_NAME` : Nom < 3 caractères
- `400 INVALID_AMOUNT` : Montant ≤ 0
- `400 INVALID_DATE` : Date passée
- `400 LIMIT_REACHED` : 5 objectifs déjà actifs
- `404 ACCOUNT_NOT_FOUND` : Compte inexistant
- `401 UNAUTHORIZED` : Token invalide

**Validations côté serveur** :
- ✅ Nom : 3-50 caractères, trim
- ✅ Montant : > 0, décimal
- ✅ Date : future ou NULL
- ✅ Compte : existe et appartient à l'user
- ✅ Limite : max 5 actifs

---

### Action 2 : Compter les objectifs actifs

**Route** : `GET /api/objectives/count-active`  
**Authentification** : Requise

**Output** :
```json
{
  "success": true,
  "data": {
    "active_count": 3,
    "limit": 5,
    "remaining": 2
  }
}
```

**Utilité** : Afficher "3/5 objectifs actifs" dans l'UI

**Requête SQL suggérée** :
```sql
SELECT COUNT(*) 
FROM objectives 
WHERE user_id = ? AND status = 'active'
```

---

### Action 3 : Récupérer les stats financières

**Route** : `GET /api/user/financial-stats?months=3`  
**Authentification** : Requise

**Output** :
```json
{
  "success": true,
  "data": {
    "has_sufficient_history": true,
    "average_monthly_income": 2800.00,
    "average_monthly_expenses": 2280.00,
    "average_monthly_savings": 520.00,
    "history_months": 4
  }
}
```

**Utilité** : Calculer la faisabilité côté frontend

**Étapes** :
1. Compter le nombre de mois d'historique (transactions groupées par mois)
2. Si < 2 mois → `has_sufficient_history = false`
3. Calculer moyenne revenus mensuels sur X derniers mois
4. Calculer moyenne dépenses mensuelles
5. Calculer capacité d'épargne (revenus - dépenses)

**Requêtes SQL suggérées** :
```sql
-- Revenus moyens
SELECT AVG(monthly_income) 
FROM (
  SELECT DATE_TRUNC('month', date) as month, 
         SUM(amount) as monthly_income
  FROM transactions
  WHERE user_id = ? AND type = 'income' 
    AND date >= NOW() - INTERVAL '3 months'
  GROUP BY month
)

-- Dépenses moyennes
SELECT AVG(monthly_expense) 
FROM (
  SELECT DATE_TRUNC('month', date) as month, 
         SUM(amount) as monthly_expense
  FROM transactions
  WHERE user_id = ? AND type = 'expense' 
    AND date >= NOW() - INTERVAL '3 months'
  GROUP BY month
)
```

---

## 💻 Actions Frontend

### Action 1 : Afficher le formulaire

**Composant** : `ObjectiveCreationForm`

**État local nécessaire** :
```
formData {
  name: string
  target_amount: number
  target_date: date | null
  has_deadline: boolean
  account_id: uuid | null
  category: string
  description: string
  priority: number (1-5)
}

errors: object
isLoading: boolean
userStats: object | null
activeCount: number
```

**Props** :
- `onSuccess(objective)` : Callback après création
- `userAccounts[]` : Liste des comptes bancaires

**Affichage** :
- Formulaire en modal ou page dédiée
- Champs obligatoires marqués avec *
- Messages d'erreur inline sous chaque champ
- Bouton "Créer" désactivé si erreurs

---

### Action 2 : Valider en temps réel

**Fonction** : `validateField(fieldName, value)`

**Déclencheurs** :
- `onChange` : validation immédiate
- `onBlur` : validation finale

**Logique par champ** :

**Nom** :
```
Si vide → erreur "Veuillez donner un nom"
Si < 3 caractères → erreur "Minimum 3 caractères"
Sinon → OK
```

**Montant** :
```
Si vide ou ≤ 0 → erreur "Montant > 0€"
Si non numérique → erreur "Montant invalide"
Sinon → OK
```

**Date** :
```
Si has_deadline = true ET date saisie :
  Si date < aujourd'hui → erreur "Date future uniquement"
  Sinon → OK
```

**Mise à jour** : État `errors` mis à jour dynamiquement

---

### Action 3 : Calculer l'effort mensuel

**Fonction** : `calculateMonthlyEffort(amount, date)`

**Déclencheur** : Changement de montant OU date

**Logique** :
```
Si amount ET date définis :
  jours_restants = (date - aujourd'hui) en jours
  mois_restants = ARRONDI_SUP(jours_restants / 30.44)
  effort = amount / mois_restants
  
  Afficher :
  "Pour atteindre [amount]€ d'ici le [date], 
   il faudra épargner ~[effort]€/mois"
  "⏱️ Il reste [mois_restants] mois"

Sinon :
  Masquer l'affichage
```

---

### Action 4 : Calculer la faisabilité

**Fonction** : `calculateFeasibility(monthlyEffort, userStats)`

**Déclencheur** : Changement d'effort mensuel

**Logique** :
```
Si pas de userStats OU historique insuffisant :
  Afficher "💡 Recommandations après 2 mois"
  Retour

ratio = monthlyEffort / userStats.average_monthly_income

Si ratio ≤ 0.30 :
  Niveau = "facile"
  Couleur = vert
  Message = "✅ Objectif réaliste ! Vous épargnez [savings]€/mois"

Si 0.30 < ratio ≤ 0.50 :
  Niveau = "ambitieux"
  Couleur = orange
  Message = "⚠️ Objectif ambitieux. Il faudra [effort]€/mois 
             (vs [savings]€/mois actuellement)"

Si ratio > 0.50 :
  Niveau = "difficile"
  Couleur = rouge
  Message = "🔴 Attention : [effort]€/mois nécessaires, 
             soit [%]% de vos revenus"
```

**Affichage** : Bandeau coloré avec icône et message

---

### Action 5 : Gérer "Pas de date limite"

**Fonction** : `toggleDeadline(hasDeadline)`

**Déclencheur** : Clic sur checkbox "Pas de date limite"

**Logique** :
```
Si checkbox cochée :
  has_deadline = false
  target_date = null
  Masquer champ date
  Afficher "Épargnez à votre rythme !"
  
  Si userStats disponible :
    duree = montant / capacité_moyenne
    Afficher "À votre rythme (~[capacité]€/mois), 
              objectif atteint en [durée] mois"

Sinon :
  has_deadline = true
  Afficher champ date
  Masquer messages "à votre rythme"
```

---

### Action 6 : Vérifier la limite

**Fonction** : `checkActiveObjectivesLimit()`

**Déclencheur** : Chargement du composant (useEffect)

**Logique** :
```
Appeler GET /api/objectives/count-active

Si activeCount >= 5 :
  Afficher message bloquant
  Désactiver tout le formulaire
  Proposer lien vers page objectifs

Sinon :
  Afficher "X/5 objectifs actifs"
  Formulaire activé
```

---

### Action 7 : Charger les stats

**Fonction** : `loadUserStats()`

**Déclencheur** : Chargement du composant (useEffect)

**Logique** :
```
Appeler GET /api/user/financial-stats?months=3

Stocker dans state userStats

Utiliser pour :
- Calcul faisabilité
- Estimation durée si pas de date
```

---

### Action 8 : Soumettre le formulaire

**Fonction** : `handleSubmit(event)`

**Déclencheur** : Clic sur "Créer l'objectif"

**Étapes** :
```
1. Empêcher rechargement page (preventDefault)

2. Valider tous les champs
   Si erreurs → Afficher + stop

3. Si montant > 100 000€ :
   Demander confirmation (window.confirm)
   Si refus → stop

4. Activer loader (isLoading = true)

5. Appeler POST /api/objectives avec :
   {
     name: formData.name.trim(),
     target_amount: parseFloat(formData.target_amount),
     target_date: has_deadline ? formData.target_date : null,
     account_id: formData.account_id || null,
     ...
   }

6. Si succès (201) :
   - Afficher notification "✅ Objectif créé !"
   - Appeler onSuccess(objective)
   - Rediriger vers dashboard après 2s

7. Si erreur :
   - Afficher message d'erreur
   - Désactiver loader

8. Dans tous les cas :
   - isLoading = false
```

---

### Action 9 : Afficher la notification succès

**Composant** : `SuccessNotification` (toast)

**Contenu** :
```
✅ Objectif "[nom]" créé avec succès !

🎯 Objectif : [montant]€
📅 Échéance : [date] (si définie)
💰 Épargne recommandée : [effort]€/mois (si date définie)
   OU "Épargnez à votre rythme !" (si pas de date)
```

**Comportement** :
- Apparition en haut/coin de l'écran
- Auto-disparition après 5 secondes
- Cliquable pour fermer immédiatement

---

### Action 10 : Rediriger après création

**Fonction** : `redirectToDashboard(objective)`

**Déclencheur** : Callback onSuccess

**Logique** :
```
Attendre 2 secondes (laisser lire la notification)

Rediriger vers :
- Option A : /dashboard (objectif visible dans liste)
- Option B : /objectives (page dédiée objectifs)
- Option C : /objectives/:id (détail de l'objectif créé)
```

**Recommandation** : Option A (dashboard) pour fluidité UX

---

## 🎨 Interface utilisateur

### Composants suggérés

```
Pages/
├── ObjectiveCreationPage
│   └── Container principal

Components/
├── ObjectiveCreationForm
│   ├── Formulaire complet
│   └── Gestion de l'état
│
├── FormFields/
│   ├── NameInput
│   ├── AmountInput
│   ├── DateInput (avec toggle "Pas de date")
│   └── AccountSelector
│
├── Displays/
│   ├── MonthlyEffortDisplay
│   │   └── Affichage effort mensuel + temps restant
│   └── FeasibilityIndicator
│       └── Bandeau coloré vert/orange/rouge
│
└── Notifications/
    └── SuccessToast
```

### Éléments visuels clés

**Formulaire** :
- Champs marqués * pour obligatoire
- Messages d'erreur en rouge sous les champs
- Icônes info (💡) pour les aides contextuelles
- Bouton "Créer" principal (bleu, gros)
- Bouton "Annuler" secondaire (gris)

**Calculs automatiques** :
- Zone info avec fond clair
- Icônes : 💰 (argent), ⏱️ (temps), 🎯 (objectif)
- Mise à jour en temps réel (pas de bouton)

**Indicateur faisabilité** :
- Bandeau horizontal avec icône
- Vert ✅ / Orange ⚠️ / Rouge 🔴
- Texte explicatif clair

**Notification succès** :
- Toast en haut à droite
- Animation d'apparition
- Fond vert clair
- Icône ✅

---

## 🧪 Scénarios de test

### Test 1 : Création basique réussie
```
1. Utilisateur connecté avec 0 objectif actif
2. Clique sur "Créer un objectif"
3. Saisit nom "Vacances 2026"
4. Saisit montant 5000€
5. Saisit date 15/12/2026
6. Clique "Créer l'objectif"

Résultat attendu :
✅ Objectif créé en base
✅ Notification succès affichée
✅ Redirection vers dashboard
✅ Objectif visible avec "0€ / 5000€"
```

### Test 2 : Validation nom trop court
```
1. Formulaire ouvert
2. Saisit nom "AB" (2 caractères)
3. Sort du champ (blur)

Résultat attendu :
✅ Message erreur "Le nom doit faire au moins 3 caractères"
✅ Bouton "Créer" désactivé
```

### Test 3 : Validation montant invalide
```
1. Formulaire ouvert
2. Saisit montant "-100"
3. Sort du champ

Résultat attendu :
✅ Message erreur "Le montant doit être supérieur à 0€"
✅ Bouton "Créer" désactivé
```

### Test 4 : Validation date passée
```
1. Formulaire ouvert
2. Saisit date "01/01/2025" (passée)
3. Sort du champ

Résultat attendu :
✅ Message erreur "La date limite doit être dans le futur"
✅ Bouton "Créer" désactivé
```

### Test 5 : Limite 5 objectifs atteints
```
1. Utilisateur a déjà 5 objectifs actifs
2. Clique "Créer un objectif"

Résultat attendu :
✅ Message bloquant affiché
✅ Formulaire désactivé
✅ Lien vers "Mes objectifs" proposé
```

### Test 6 : Confirmation montant élevé
```
1. Formulaire ouvert
2. Saisit montant 150 000€
3. Clique "Créer l'objectif"

Résultat attendu :
✅ Popup confirmation "Vous avez saisi 150 000€. Confirmez ?"
✅ Si annulation → retour formulaire
✅ Si confirmation → création normale
```

### Test 7 : Objectif sans date limite
```
1. Formulaire ouvert
2. Saisit nom "Épargne libre"
3. Saisit montant 10 000€
4. Coche "Pas de date limite"
5. Clique "Créer"

Résultat attendu :
✅ Champ date masqué
✅ Message "Épargnez à votre rythme" affiché
✅ Objectif créé avec target_date = NULL
✅ Pas de calcul d'effort mensuel
```

### Test 8 : Calcul effort mensuel
```
1. Formulaire ouvert
2. Saisit montant 6000€
3. Saisit date dans 12 mois

Résultat attendu :
✅ Affichage "~500€/mois"
✅ Affichage "Il reste 12 mois"
✅ Mise à jour automatique si montant/date change
```

### Test 9 : Indicateur faisabilité (avec historique)
```
Contexte : User avec historique 3 mois, revenus moyens 2500€/mois

1. Formulaire ouvert
2. Saisit montant 3000€
3. Saisit date dans 10 mois (→ 300€/mois)

Résultat attendu :
✅ Ratio = 300/2500 = 12% → VERT
✅ Message "✅ Objectif réaliste !"
```

### Test 10 : Compte associé
```
1. Formulaire ouvert
2. Sélectionne "Livret A" dans dropdown
3. Crée objectif

Résultat attendu :
✅ account_id enregistré en base
✅ Message "La progression sera calculée automatiquement"
```

---

## 📊 Données de référence

### Exemples de montants types
- Petit objectif : 500€ - 2 000€
- Moyen objectif : 2 000€ - 10 000€
- Grand objectif : 10 000€ - 50 000€
- Très grand objectif : > 50 000€

### Durées types
- Court terme : 1-6 mois
- Moyen terme : 6-18 mois
- Long terme : 18 mois - 5 ans
- Très long terme : > 5 ans

### Catégories suggérées
- Vacances
- Véhicule
- Immobilier
- Fonds d'urgence
- Éducation
- Achat important
- Autre

---

## ⚠️ Points d'attention

### Performance
- Calculer effort mensuel et faisabilité **côté frontend** (réactivité)
- Valider données **côté backend** (sécurité)
- Debounce sur les inputs pour éviter trop de calculs (300ms)

### Sécurité
- ✅ Validation stricte côté serveur (ne pas faire confiance au client)
- ✅ Protection CSRF sur les formulaires
- ✅ Sanitization des inputs texte (prévention XSS)
- ✅ Rate limiting pour éviter spam de création

### Accessibilité
- ✅ Labels explicites sur tous les champs
- ✅ Messages d'erreur associés (`aria-describedby`)
- ✅ Navigation clavier fonctionnelle (Tab, Enter)
- ✅ Contraste suffisant pour codes couleurs (vert/orange/rouge)

### UX
- ✅ Feedback immédiat sur chaque action
- ✅ Pas de rechargement de page (SPA)
- ✅ Messages clairs et bienveillants
- ✅ Temps de création < 1 minute

---

## 🚀 Définition de "Done"

L'US est considérée terminée quand :

- ✅ Backend : Endpoint POST `/api/objectives` fonctionnel avec toutes validations
- ✅ Backend : Endpoint GET `/api/objectives/count-active` fonctionnel
- ✅ Backend : Endpoint GET `/api/user/financial-stats` fonctionnel
- ✅ Frontend : Formulaire complet avec tous les champs
- ✅ Frontend : Validations temps réel opérationnelles
- ✅ Frontend : Calculs automatiques affichés correctement
- ✅ Frontend : Gestion des erreurs complète
- ✅ Frontend : Notification succès + redirection
- ✅ Base de données : Table `objectives` créée avec index
- ✅ Tests : Tous les scénarios de test validés
- ✅ Code : Revu et approuvé (code review)
- ✅ Documentation : API documentée (Swagger ou équivalent)

---

## 📅 Estimation

### Complexité
**Points de story** : 8 (Fibonacci)

**Détail** :
- Backend : 3 points (3 endpoints + validations)
- Frontend : 4 points (formulaire + calculs + validations)
- Base de données : 1 point (table + index)

### Temps estimé
- Backend : 1.5 jours
- Frontend : 2 jours
- Tests : 0.5 jour
- **Total : ~4 jours** (1 développeur full-stack)

---

## 📎 Dépendances

### Techniques
- Table `users` doit exister
- Table `accounts` doit exister
- Système d'authentification JWT opérationnel
- Table `transactions` pour calcul stats financières

### Fonctionnelles
- Aucune dépendance bloquante
- Peut être développée en parallèle d'autres US

### Bloquants potentiels
- Si système d'auth non prêt → bloquer
- Si table accounts non créée → bloquer

---

## 🔗 User Stories liées

### Suivantes (séquence logique)
- **UC1.2** : Consulter la progression d'un objectif
- **UC1.3** : Recevoir des recommandations d'épargne
- **UC1.4** : Ajuster automatiquement les recommandations
- **UC1.5** : Modifier un objectif
- **UC1.6** : Supprimer un objectif
- **UC1.7** : Marquer un objectif comme atteint

### Complémentaires
- **UC3.x** : Mode flash mensuel (pré-remplissage récurrences)
- **UC2.x** : Score de santé financière (utilise les objectifs)

---

## 📝 Questions ouvertes

### Pour la Product Team
1. Message d'accueil pour un nouvel utilisateur sans objectif ?
   - Suggestion : "Créez votre premier objectif d'épargne !"

2. Redirection après création : dashboard ou page objectifs ?
   - Recommandation : Dashboard (plus fluide)

3. Animation de célébration pour le 1er objectif ?
   - Suggestion : Confettis légers

### Pour l'équipe Dev
1. Framework frontend utilisé ? (React, Vue, Angular ?)
2. ORM backend ? (Sequelize, Prisma, TypeORM ?)
3. Base de données ? (PostgreSQL, MySQL, MongoDB ?)
4. Librairie de gestion de formulaires ? (react-hook-form, Formik ?)
5. Librairie de notifications ? (react-toastify, notistack ?)

---

## 📚 Ressources complémentaires

### Maquettes / Design
- [À fournir] Maquettes Figma du formulaire
- [À fournir] Design system / charte graphique

### Documentation technique
- [À créer] Documentation API (Swagger)
- [À définir] Architecture de la base de données

### Références
- Bonnes pratiques formulaires : https://www.nngroup.com/articles/web-form-design/
- Validation UX : https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/

---

**Prochaine étape** : Affinage en équipe (poker planning + questions techniques)
