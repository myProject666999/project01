<template>
  <div
    class="bg-white rounded-lg border border-ink-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    @click="handleClick"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="text-lg font-serif text-ink-900">第 {{ page.pageNumber }} 页</div>
      <span
        v-if="page.status === 'finalized' || frozen"
        class="text-pine-500"
      >
        <Lock class="w-4 h-4" />
      </span>
      <span v-else-if="page.status === 'proofreading'" class="text-xs text-indigo-500">
        第{{ page.claimRound }}轮
      </span>
      <span v-else-if="page.status === 'first_done'" class="text-xs text-ink-500">
        已1轮
      </span>
    </div>
    <div v-if="page.claimant" class="text-sm text-ink-500 mb-3">
      <div class="flex items-center gap-1">
        <User class="w-3 h-3" />
        <span>{{ page.claimant }}</span>
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        v-if="page.status === 'unclaimed'"
        @click.stop="$emit('claim')"
        class="w-full py-2 text-sm bg-vermilion-500 hover:bg-vermilion-600 text-white rounded transition-colors"
      >
        认领校对
      </button>
      <button
        v-else-if="page.status === 'proofreading' && !frozen"
        @click.stop="$emit('open')"
        class="w-full py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors"
      >
        继续校对
      </button>
      <button
        v-else-if="page.status === 'pending_review' && !frozen"
        @click.stop="$emit('review')"
        class="w-full py-2 text-sm bg-vermilion-500 hover:bg-vermilion-600 text-white rounded transition-colors"
      >
        审稿定稿
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock, User } from 'lucide-vue-next'

defineProps<{
  page: any
  frozen?: boolean
}>()

defineEmits<{
  claim: []
  open: []
  review: []
}>()

function handleClick() {}
</script>
