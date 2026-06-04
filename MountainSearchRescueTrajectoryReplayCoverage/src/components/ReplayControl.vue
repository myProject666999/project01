<script setup lang="ts">
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  isPlaying: boolean
  progress: number
  currentTime: string
  playbackSpeed: number
  totalDuration: number
}>()

const emit = defineEmits<{
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'reset'): void
  (e: 'seek', percent: number): void
  (e: 'speedChange', speed: number): void
  (e: 'skip', seconds: number): void
}>()

const speedOptions = [
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '4x', value: 4 },
  { label: '8x', value: 8 },
]

const handleSeek = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('seek', Number(target.value))
}
</script>

<template>
  <div class="bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-700">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <button
            class="w-10 h-10 rounded-full bg-rescue-orange hover:bg-rescue-orange-dark transition-colors flex items-center justify-center text-white shadow-lg"
            @click="emit('skip', -30)"
            title="后退30秒"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>

          <button
            class="w-14 h-14 rounded-full bg-rescue-orange hover:bg-rescue-orange-dark transition-colors flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
            @click="isPlaying ? emit('pause') : emit('play')"
          >
            <Pause v-if="isPlaying" class="w-6 h-6" />
            <Play v-else class="w-6 h-6 ml-1" />
          </button>

          <button
            class="w-10 h-10 rounded-full bg-rescue-orange hover:bg-rescue-orange-dark transition-colors flex items-center justify-center text-white shadow-lg"
            @click="emit('skip', 30)"
            title="前进30秒"
          >
            <ChevronRight class="w-5 h-5" />
          </button>

          <button
            class="w-10 h-10 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors flex items-center justify-center text-white"
            @click="emit('reset')"
            title="重置"
          >
            <RotateCcw class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 flex items-center gap-3">
          <div class="text-sm text-zinc-400 font-mono">
            {{ currentTime }}
          </div>
          <div class="flex-1 relative">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              :value="progress"
              @input="handleSeek"
              class="w-full h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer"
              style="
                background: linear-gradient(to right, #E76F51 0%, #E76F51 {{ progress }}%, #3F3F46 {{ progress }}%, #3F3F46 100%);
              "
            />
          </div>
          <div class="text-sm text-zinc-400 font-mono">
            {{ Math.round(progress) }}%
          </div>
        </div>

        <div class="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
          <button
            v-for="opt in speedOptions"
            :key="opt.value"
            :class="[
              'px-3 py-1.5 rounded text-sm font-medium transition-colors',
              playbackSpeed === opt.value
                ? 'bg-rescue-orange text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700',
            ]"
            @click="emit('speedChange', opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #E76F51;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}
input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #E76F51;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}
</style>
