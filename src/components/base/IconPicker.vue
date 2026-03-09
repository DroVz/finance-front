<template>
  <div class="picker-wrapper" ref="wrapperRef">
    <button type="button" class="picker-trigger" @click="open = !open">
      <span class="picker-preview">{{ modelValue }}</span>
      <span class="picker-arrow">▾</span>
    </button>
    <div v-if="open" class="picker-dropdown">
      <span
        v-for="icon in icons"
        :key="icon"
        class="picker-option"
        :class="{ active: modelValue === icon }"
        @click="select(icon)"
      >
        {{ icon }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const icons = ['💳', '🏦', '💰', '🐷', '📈', '🏠', '🚗', '💎', '🎓', '💼', '🛒', '✈️']
const open = ref(false)
const wrapperRef = ref<HTMLElement>()

const select = (icon: string) => {
  emit('update:modelValue', icon)
  open.value = false
}

const onClickOutside = (e: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.picker-wrapper {
  position: relative;
  display: inline-block;
}

.picker-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.2s;
}

.picker-trigger:hover {
  border-color: var(--primary-color);
}

.picker-preview {
  font-size: 24px;
  line-height: 1;
}

.picker-arrow {
  font-size: 12px;
  color: var(--text-secondary);
}

.picker-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  z-index: 10;
}

.picker-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.picker-option:hover {
  background: var(--bg-selected);
}

.picker-option.active {
  background: var(--bg-selected);
  outline: 2px solid var(--primary-color);
}
</style>
