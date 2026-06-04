import { ref, computed, onBeforeUnmount } from 'vue'
import type { GPSPoint, Member } from '@/types'

interface ReplayState {
  isPlaying: boolean
  currentTime: number
  playbackSpeed: number
  startTime: number
  endTime: number
}

export function useReplay(trajectories: GPSPoint[], members: Member[]) {
  const state = ref<ReplayState>({
    isPlaying: false,
    currentTime: 0,
    playbackSpeed: 1,
    startTime: 0,
    endTime: 0,
  })

  let animationFrameId: number | null = null
  let lastTimestamp: number = 0

  const timeRange = computed(() => {
    if (trajectories.length === 0) return { start: 0, end: 0 }
    const times = trajectories.map(p => new Date(p.timestamp).getTime())
    return {
      start: Math.min(...times),
      end: Math.max(...times),
    }
  })

  const duration = computed(() => {
    return timeRange.value.end - timeRange.value.start
  })

  const progress = computed(() => {
    if (duration.value === 0) return 0
    return ((state.value.currentTime - timeRange.value.start) / duration.value) * 100
  })

  const currentTimeFormatted = computed(() => {
    return new Date(state.value.currentTime).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  })

  const visiblePoints = computed(() => {
    const cutoffTime = state.value.currentTime
    const result: Map<number, GPSPoint[]> = new Map()

    members.forEach(m => {
      result.set(m.id, [])
    })

    trajectories.forEach(point => {
      const pointTime = new Date(point.timestamp).getTime()
      if (pointTime <= cutoffTime) {
        const memberPoints = result.get(point.memberId)
        if (memberPoints) {
          memberPoints.push(point)
        }
      }
    })

    return result
  })

  const currentPositions = computed(() => {
    const cutoffTime = state.value.currentTime
    const result: Map<number, GPSPoint | null> = new Map()

    members.forEach(m => {
      result.set(m.id, null)
    })

    trajectories.forEach(point => {
      const pointTime = new Date(point.timestamp).getTime()
      if (pointTime <= cutoffTime) {
        const current = result.get(point.memberId)
        if (!current || pointTime > new Date(current.timestamp).getTime()) {
          result.set(point.memberId, point)
        }
      }
    })

    return result
  })

  const init = () => {
    state.value.startTime = timeRange.value.start
    state.value.endTime = timeRange.value.end
    state.value.currentTime = timeRange.value.start
  }

  const play = () => {
    if (state.value.currentTime >= state.value.endTime) {
      state.value.currentTime = state.value.startTime
    }
    state.value.isPlaying = true
    lastTimestamp = performance.now()
    animationLoop()
  }

  const pause = () => {
    state.value.isPlaying = false
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  const animationLoop = () => {
    if (!state.value.isPlaying) return

    const now = performance.now()
    const deltaReal = now - lastTimestamp
    lastTimestamp = now

    const deltaReplay = deltaReal * state.value.playbackSpeed * 1000
    state.value.currentTime = Math.min(
      state.value.currentTime + deltaReplay,
      state.value.endTime
    )

    if (state.value.currentTime >= state.value.endTime) {
      state.value.isPlaying = false
      return
    }

    animationFrameId = requestAnimationFrame(animationLoop)
  }

  const seek = (time: number) => {
    state.value.currentTime = Math.max(
      state.value.startTime,
      Math.min(time, state.value.endTime)
    )
  }

  const seekProgress = (percent: number) => {
    const time = state.value.startTime + (percent / 100) * duration.value
    seek(time)
  }

  const setSpeed = (speed: number) => {
    state.value.playbackSpeed = speed
  }

  const reset = () => {
    pause()
    state.value.currentTime = state.value.startTime
  }

  onBeforeUnmount(() => {
    pause()
  })

  return {
    state,
    progress,
    currentTimeFormatted,
    visiblePoints,
    currentPositions,
    init,
    play,
    pause,
    seek,
    seekProgress,
    setSpeed,
    reset,
  }
}
