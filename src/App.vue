<template>
  <div id="app">
    <Header v-if="!isLoginPage" />
    <main class="main-content" :class="{ 'no-header': isLoginPage }">
      <div class="container" :class="{ 'full-height': isLoginPage }">
        <RouterView />
      </div>
    </main>

    <!-- FAB Ajouter une transaction -->
    <button
      v-if="!isLoginPage"
      class="fab"
      title="Ajouter une transaction"
      @click="showAddModal = true"
    >
      ＋
    </button>

    <AddTransactionModal
      v-if="!isLoginPage"
      :show="showAddModal"
      @close="showAddModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import Header from '@/components/Header.vue';
import AddTransactionModal from '@/components/transaction/AddTransactionModal.vue';

const route = useRoute();
const isLoginPage = computed(() => route.name === 'Login');
const showAddModal = ref(false);
</script>

<style scoped>
.main-content {
  padding: 24px 0;
  min-height: calc(100vh - 80px);
}

.main-content.no-header {
  padding: 0;
  min-height: 100vh;
}

.container.full-height {
  height: 100%;
  padding: 0;
  max-width: 100%;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  font-size: 28px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: transform 0.15s, box-shadow 0.15s;
  z-index: 200;
}

.fab:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
}

.fab:active {
  transform: scale(0.96);
}

@media (max-width: 768px) {
  .fab {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
}
</style>
