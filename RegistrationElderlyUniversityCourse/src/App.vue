<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import BottomNav from '@/components/BottomNav.vue'
</script>

<template>
  <div class="min-h-screen bg-cream">
    <NavBar />
    <main class="pb-24 pt-16">
      <router-view />
    </main>
    <BottomNav />
  </div>
</template>
