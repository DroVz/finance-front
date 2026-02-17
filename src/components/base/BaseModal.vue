<template>
  <div v-if="show" class="modal-overlay" @click="handleClose">
    <div class="modal-content" :class="{ 'modal-large': large }" @click.stop>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  large?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: var(--radius);
  max-width: 500px;
  width: 90%;
}

.modal-content h3 {
  margin-bottom: 16px;
}

.modal-content p {
  margin-bottom: 24px;
  color: var(--text-secondary);
}

.modal-large {
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
