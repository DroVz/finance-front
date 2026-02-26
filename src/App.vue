<template>
  <div id="app">
    <Header v-if="!isLoginPage" />
    <main class="main-content" :class="{ 'no-header': isLoginPage }">
      <div class="container" :class="{ 'full-height': isLoginPage }">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import Header from '@/components/Header.vue';

const route = useRoute();
const isLoginPage = computed(() => route.name === 'Login');
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
</style>
