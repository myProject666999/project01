<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-secondary-light">
    <Inbox class="w-16 h-16 mb-4 text-cream-dark" />
    <p class="text-xl2">{{ message || '暂无数据' }}</p>
  </div>
</template>
