<template>
  <div class="picker-wrapper" ref="wrapperRef">
    <button type="button" class="picker-trigger" @click="open = !open">
      <span
        class="picker-preview"
        :style="modelValue ? { background: modelValue } : {}"
        :class="{ empty: !modelValue }"
      ></span>
      <span class="picker-arrow">▾</span>
    </button>
    <div v-if="open" class="picker-dropdown">
      <span
        class="color-option"
        :class="{ active: !modelValue }"
        @click="select(undefined)"
      >
        <span class="no-color">✕</span>
      </span>
      <span
        v-for="color in colors"
        :key="color"
        class="color-option"
        :class="{ active: modelValue === color }"
        :style="{ background: color }"
        @click="select(color)"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  modelValue: string | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']
const open = ref(false)
const wrapperRef = ref<HTMLElement>()

const select = (color: string | undefined) => {
  emit('update:modelValue', color)
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
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.2s;
}

.picker-trigger:hover {
  border-color: var(--primary-color);
}

.picker-preview {
  width: 22px;
  height: 22px;
  border-radius: 50%;
}

.picker-preview.empty {
  border: 2px dashed var(--border-color, #d1d5db);
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
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  padding: 10px;
  background: white;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.color-option {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-option:hover {
  transform: scale(1.2);
}

.color-option.active {
  border-color: var(--text-primary, #1f2937);
  box-shadow: 0 0 0 2px white, 0 0 0 4px var(--text-primary, #1f2937);
}

.no-color {
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--bg-light, #f3f4f6);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
