<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <div class="container">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import Header from '@/components/Header.vue';
import { useAccountStore } from '@/stores/accountStore';
import { useCategoryStore } from '@/stores/categoryStore';

const accountStore = useAccountStore();
const categoryStore = useCategoryStore();

// Charge les données initiales au montage
onMounted(() => {
  accountStore.fetchAccounts();
  categoryStore.fetchCategories();
});
</script>

<style scoped>
.main-content {
  padding: 24px 0;
  min-height: calc(100vh - 80px);
}
</style>
