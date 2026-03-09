<template>
  <BaseModal :show="show" :large="step === 'preview'" @close="handleClose">
    <div class="import-modal">
      <!-- Étape 1 : Upload -->
      <div v-if="step === 'upload'">
        <h3>Importer un relevé CSV</h3>
        <p>Formats supportés : Crédit Mutuel, Helios</p>

        <div class="form-group">
          <label class="form-label">Compte d'import *</label>
          <select v-model="selectedAccountId" class="form-select">
            <option :value="null" disabled>Sélectionner un compte</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.name }}
            </option>
          </select>
        </div>

        <div class="upload-zone" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <input ref="fileInput" type="file" accept=".csv" hidden @change="handleFileSelect" />
          <div class="upload-icon">📄</div>
          <p v-if="!selectedFile">Cliquez ou glissez un fichier CSV ici</p>
          <p v-else class="file-selected">{{ selectedFile.name }}</p>
        </div>

        <div v-if="uploadError" class="error-message">{{ uploadError }}</div>

        <div class="modal-actions">
          <button class="btn" @click="handleClose">Annuler</button>
          <button
            class="btn btn-primary"
            :disabled="!selectedFile || !selectedAccountId || loading"
            @click="handlePreview"
          >
            {{ loading ? 'Analyse...' : 'Analyser le fichier' }}
          </button>
        </div>
      </div>

      <!-- Étape 2 : Preview -->
      <div v-if="step === 'preview'">
        <h3>Aperçu de l'import</h3>
        <p>Vérifiez les catégories. Pour les virements internes, cochez "Virement" et choisissez le compte lié.</p>

        <div class="preview-scroll">
          <CsvPreviewTable
            :lines="previewLines"
            :categories="categories"
            :accounts="accounts"
            :detected-format="detectedFormat"
            @update-category="handleCategoryUpdate"
            @toggle-transfer="handleToggleTransfer"
            @update-linked-account="handleLinkedAccountUpdate"
          />
        </div>

        <div class="learn-option">
          <label class="checkbox-label">
            <input type="checkbox" v-model="learnCategories" />
            Mémoriser mes choix de catégories pour les prochains imports
          </label>
        </div>

        <div v-if="uploadError" class="error-message">{{ uploadError }}</div>

        <div class="modal-actions">
          <button class="btn" @click="step = 'upload'">Retour</button>
          <button
            class="btn btn-success"
            :disabled="!allLinesReady || loading"
            @click="handleConfirm"
          >
            {{ loading ? 'Import en cours...' : `Importer ${previewLines.length} transactions` }}
          </button>
        </div>
      </div>

      <!-- Étape 3 : Résultat -->
      <div v-if="step === 'result'">
        <h3>Import terminé</h3>

        <div class="result-summary">
          <div class="result-item result-success">
            <span class="result-number">{{ importResult?.importedCount }}</span>
            <span>transactions importées</span>
          </div>
          <div v-if="importResult?.skippedCount" class="result-item result-warning">
            <span class="result-number">{{ importResult?.skippedCount }}</span>
            <span>transactions ignorées</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn" @click="handleNewFile">Importer un autre fichier</button>
          <button class="btn btn-primary" @click="handleCloseAfterImport">Fermer</button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '@/components/base/BaseModal.vue'
import CsvPreviewTable from '@/components/import/CsvPreviewTable.vue'
import csvImportService from '@/services/csvImportService'
import type { Account, Category, CsvPreviewLine, CsvImportResult } from '@/types'

const props = defineProps<{
  show: boolean
  accounts: Account[]
  categories: Category[]
}>()

const emit = defineEmits<{
  close: []
  imported: []
}>()

const router = useRouter()

// State
const step = ref<'upload' | 'preview' | 'result'>('upload')
const selectedAccountId = ref<number | null>(null)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()
const loading = ref(false)
const uploadError = ref<string | null>(null)
const learnCategories = ref(true)

// Preview data
const previewLines = ref<CsvPreviewLine[]>([])
const detectedFormat = ref('')
const importResult = ref<CsvImportResult | null>(null)

// Vérifier que toutes les lignes sont prêtes pour l'import
const allLinesReady = computed(() => {
  return previewLines.value.every(line => {
    const isTransfer = (line as any)._isTransfer === true
    if (isTransfer) {
      // Virement : besoin d'un compte lié
      return (line as any)._linkedAccountId != null && (line as any)._linkedAccountId > 0
    } else {
      // Transaction normale : besoin d'une catégorie
      return line.suggestedCategoryId != null && line.suggestedCategoryId > 0
    }
  })
})

// Actions
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    uploadError.value = null
  }
}

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.name.endsWith('.csv')) {
      selectedFile.value = file
      uploadError.value = null
    } else {
      uploadError.value = 'Seuls les fichiers .csv sont acceptés'
    }
  }
}

const handlePreview = async () => {
  if (!selectedFile.value || !selectedAccountId.value) return

  loading.value = true
  uploadError.value = null

  try {
    const response = await csvImportService.preview(selectedFile.value)
    // Pré-cocher les lignes détectées comme virements potentiels
    const mapped = response.lines.map(line => ({
      ...line,
      _isTransfer: line.transferCandidate,
      _linkedAccountId: null
    }))
    // Trier : revenus en haut, dépenses en bas
    mapped.sort((a, b) => {
      if (a.type === 'INCOME' && b.type !== 'INCOME') return -1
      if (a.type !== 'INCOME' && b.type === 'INCOME') return 1
      return 0
    })
    previewLines.value = mapped as any
    detectedFormat.value = response.detectedFormat
    step.value = 'preview'
  } catch (e: any) {
    uploadError.value = e.response?.data?.message || 'Erreur lors de l\'analyse du fichier'
  } finally {
    loading.value = false
  }
}

const handleCategoryUpdate = (lineNumber: number, categoryId: number) => {
  const line = previewLines.value.find(l => l.lineNumber === lineNumber)
  if (line) {
    line.suggestedCategoryId = categoryId
    const category = props.categories.find(c => c.id === categoryId)
    line.suggestedCategoryName = category?.name ?? null
  }
}

const handleToggleTransfer = (lineNumber: number) => {
  const line = previewLines.value.find(l => l.lineNumber === lineNumber) as any
  if (line) {
    line._isTransfer = !line._isTransfer
    if (!line._isTransfer) {
      line._linkedAccountId = null
    }
  }
}

const handleLinkedAccountUpdate = (lineNumber: number, accountId: number) => {
  const line = previewLines.value.find(l => l.lineNumber === lineNumber) as any
  if (line) {
    line._linkedAccountId = accountId
  }
}

const handleConfirm = async () => {
  if (!selectedAccountId.value) return

  loading.value = true
  uploadError.value = null

  try {
    const request = {
      accountId: selectedAccountId.value,
      learnCategories: learnCategories.value,
      lines: previewLines.value.map(line => {
        const isTransfer = (line as any)._isTransfer === true
        return {
          date: line.date,
          description: line.description,
          amount: line.amount,
          type: line.type,
          categoryId: isTransfer ? 0 : line.suggestedCategoryId!,
          transfer: isTransfer,
          linkedAccountId: isTransfer ? (line as any)._linkedAccountId : null
        }
      })
    }

    importResult.value = await csvImportService.confirmImport(request)
    step.value = 'result'
    emit('imported')
  } catch (e: any) {
    uploadError.value = e.response?.data?.message || 'Erreur lors de l\'import'
  } finally {
    loading.value = false
  }
}

const handleNewFile = () => {
  step.value = 'upload'
  selectedFile.value = null
  uploadError.value = null
  previewLines.value = []
  importResult.value = null
}

const handleCloseAfterImport = () => {
  handleClose()
  router.push('/comptes')
}

const handleClose = () => {
  step.value = 'upload'
  selectedFile.value = null
  uploadError.value = null
  previewLines.value = []
  importResult.value = null
  emit('close')
}
</script>

<style scoped>
.import-modal {
  min-width: 300px;
}

.preview-scroll {
  max-height: 55vh;
  overflow-y: auto;
  margin: 0 -8px;
  padding: 0 8px;
}

.upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  margin-bottom: 16px;
}

.upload-zone:hover {
  border-color: var(--primary-color);
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.file-selected {
  color: var(--primary-color);
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.learn-option {
  margin-top: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.result-summary {
  display: flex;
  gap: 16px;
  margin: 24px 0;
}

.result-item {
  flex: 1;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
}

.result-success {
  background: var(--bg-success-tint);
  color: var(--text-success-tint);
}

.result-warning {
  background: var(--bg-warning-tint);
  color: var(--text-warning-tint);
}

.result-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}
</style>
