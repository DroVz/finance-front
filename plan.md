# Plan d'implémentation - Import CSV

## Architecture globale

### Flow utilisateur
1. L'utilisateur clique sur "Importer CSV" dans la page Ajouter
2. Il sélectionne un fichier CSV + le compte de destination
3. Le backend parse le fichier, détecte le format, et retourne un aperçu des transactions
4. L'utilisateur voit les transactions parsées avec les catégories suggérées
5. Il peut modifier les catégories avant de confirmer
6. À la confirmation, les transactions sont créées en base + les associations catégorie/description sont mémorisées

---

## Backend (Java Spring Boot)

### 1. Nouveau modèle : CategoryMapping (apprentissage)
**Fichier** : `model/CategoryMapping.java`
- `id` (Long, auto)
- `descriptionPattern` (String) — le mot-clé extrait du libellé (ex: "CHRONO COURSE", "ARKADE")
- `category` (ManyToOne → Category)
- `createdAt` (LocalDateTime)

> Permet de retenir les associations description → catégorie faites par l'utilisateur.

### 2. Nouveaux DTOs

**`dto/CsvPreviewLineDTO.java`** — Une ligne parsée pour l'aperçu :
- `lineNumber` (int)
- `date` (LocalDate)
- `description` (String)
- `amount` (BigDecimal)
- `type` (TransactionType — EXPENSE ou INCOME)
- `suggestedCategoryId` (Long, nullable) — catégorie suggérée
- `suggestedCategoryName` (String, nullable)

**`dto/CsvPreviewResponseDTO.java`** — Réponse de l'aperçu :
- `detectedFormat` (String — "CREDIT_MUTUEL", "HELIOS", etc.)
- `totalLines` (int)
- `lines` (List<CsvPreviewLineDTO>)

**`dto/CsvImportLineDTO.java`** — Ligne confirmée par l'utilisateur :
- `date` (LocalDate)
- `description` (String)
- `amount` (BigDecimal)
- `type` (TransactionType)
- `categoryId` (Long)

**`dto/CsvImportRequestDTO.java`** — Requête de confirmation :
- `accountId` (Long)
- `lines` (List<CsvImportLineDTO>)
- `learnCategories` (boolean — mémoriser les associations)

**`dto/CsvImportResultDTO.java`** — Résultat de l'import :
- `importedCount` (int)
- `skippedCount` (int)

### 3. Parsers CSV (Strategy Pattern)

**Interface** : `service/csv/CsvParser.java`
```java
public interface CsvParser {
    String getFormatName();
    boolean canParse(String[] headerLine);
    List<CsvPreviewLineDTO> parse(InputStream inputStream);
}
```

**Implémentation 1** : `service/csv/CreditMutuelParser.java`
- Détection via les colonnes : "Date operation", "Date valeur", "Libelle", "Debit", "Credit"
- Séparateur `;`, champs entre `"`, décimales avec `,`
- Montant : Debit → EXPENSE, Credit → INCOME

**Implémentation 2** : `service/csv/HeliosParser.java`
- Détection via les colonnes : "Effectué le", "Compte émetteur", "Libellé", "Type", "Catégorie"
- Séparateur `;`, pas de quotes, BOM à gérer, décimales avec `.`
- Montant négatif → EXPENSE, positif → INCOME
- Utilise les catégories du CSV si elles correspondent à des catégories existantes

### 4. Service d'import

**`service/CsvImportService.java`**
- `preview(MultipartFile file)` :
  - Lit la première ligne pour détecter le format (parcourt les parsers)
  - Parse le fichier avec le bon parser
  - Pour chaque ligne, cherche une catégorie suggérée via CategoryMappingRepository
  - Retourne CsvPreviewResponseDTO
- `confirmImport(CsvImportRequestDTO request)` :
  - Crée les transactions via TransactionService
  - Si `learnCategories=true`, sauvegarde les associations description→catégorie dans CategoryMapping
  - Retourne CsvImportResultDTO

### 5. Repository

**`repository/CategoryMappingRepository.java`**
- `findByDescriptionPatternIgnoreCase(String pattern)` : Optional<CategoryMapping>
- `findAll()` : pour le matching par recherche

### 6. Controller

**`controller/CsvImportController.java`**
- `POST /api/import/preview` (MultipartFile) → CsvPreviewResponseDTO
- `POST /api/import/confirm` (CsvImportRequestDTO) → CsvImportResultDTO

---

## Frontend (Vue 3 + TypeScript)

### 1. Types
**Ajouts dans `src/types/index.ts`** :
```typescript
interface CsvPreviewLine {
  lineNumber: number
  date: string
  description: string
  amount: number
  type: TransactionType
  suggestedCategoryId: number | null
  suggestedCategoryName: string | null
}

interface CsvPreviewResponse {
  detectedFormat: string
  totalLines: number
  lines: CsvPreviewLine[]
}

interface CsvImportLine {
  date: string
  description: string
  amount: number
  type: TransactionType
  categoryId: number
}

interface CsvImportRequest {
  accountId: number
  lines: CsvImportLine[]
  learnCategories: boolean
}

interface CsvImportResult {
  importedCount: number
  skippedCount: number
}
```

### 2. Service API
**`src/services/csvImportService.ts`**
- `preview(file: File)` → POST multipart/form-data → CsvPreviewResponse
- `confirmImport(request: CsvImportRequest)` → POST → CsvImportResult

### 3. Composants

**`src/components/import/CsvImportModal.vue`** — Composant principal (dans BaseModal)
- Étape 1 : Upload fichier + sélection du compte
- Étape 2 : Tableau d'aperçu avec catégories modifiables
- Étape 3 : Résultat de l'import

**`src/components/import/CsvPreviewTable.vue`** — Tableau d'aperçu
- Affiche les lignes parsées : date, description, montant, type, catégorie (select)
- Colonne catégorie = dropdown avec les catégories existantes
- Couleur verte/rouge selon INCOME/EXPENSE

### 4. Modification existante
**`src/views/AddTransactionView.vue`** — Remplacer le placeholder du modal par `<CsvImportModal>`

---

## Fichiers à créer/modifier

### Backend (7 fichiers)
1. **CRÉER** `model/CategoryMapping.java`
2. **CRÉER** `repository/CategoryMappingRepository.java`
3. **CRÉER** `dto/CsvPreviewLineDTO.java`
4. **CRÉER** `dto/CsvPreviewResponseDTO.java`
5. **CRÉER** `dto/CsvImportRequestDTO.java` + `CsvImportLineDTO.java` + `CsvImportResultDTO.java`
6. **CRÉER** `service/csv/CsvParser.java` (interface)
7. **CRÉER** `service/csv/CreditMutuelParser.java`
8. **CRÉER** `service/csv/HeliosParser.java`
9. **CRÉER** `service/CsvImportService.java`
10. **CRÉER** `controller/CsvImportController.java`

### Frontend (5 fichiers)
1. **MODIFIER** `src/types/index.ts` — ajouter les types CSV
2. **CRÉER** `src/services/csvImportService.ts`
3. **CRÉER** `src/components/import/CsvImportModal.vue`
4. **CRÉER** `src/components/import/CsvPreviewTable.vue`
5. **MODIFIER** `src/views/AddTransactionView.vue` — intégrer CsvImportModal

---

## Notes d'extensibilité
Pour ajouter un nouveau format bancaire :
1. Créer une nouvelle classe qui implémente `CsvParser`
2. Ajouter l'annotation `@Component` — Spring l'injectera automatiquement dans la liste des parsers
3. C'est tout ! Le service d'import parcourt tous les parsers disponibles.
