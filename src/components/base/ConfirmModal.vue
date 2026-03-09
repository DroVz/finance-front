<template>
  <BaseModal :show="show" @close="$emit('cancel')">
    <h3 class="confirm-title">{{ title }}</h3>
    <p class="confirm-message">{{ message }}</p>
    <div class="confirm-actions">
      <button class="btn btn-secondary" @click="$emit('cancel')">Annuler</button>
      <button class="btn btn-danger" @click="$emit('confirm')">{{ confirmLabel ?? 'Supprimer' }}</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue'

defineProps<{
  show: boolean
  title: string
  message: string
  confirmLabel?: string
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.confirm-message {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
