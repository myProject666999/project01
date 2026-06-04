import { ref, onBeforeUnmount } from 'vue'
import type { WebSocketMessage, PositionMessage, CoverageMessage } from '@/types'
import { getWebSocketUrl } from '@/utils/api'

export function useWebSocket(missionId: number) {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const positions = ref<Map<number, PositionMessage>>(new Map())
  const coverageUpdates = ref<Map<number, number>>(new Map())

  const connect = () => {
    if (ws.value?.readyState === WebSocket.OPEN) return

    const url = getWebSocketUrl(missionId)
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      isConnected.value = true
    }

    ws.value.onclose = () => {
      isConnected.value = false
      setTimeout(() => {
        if (ws.value?.readyState !== WebSocket.OPEN) {
          connect()
        }
      }, 3000)
    }

    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.value.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data)
        if (data.type === 'position') {
          positions.value.set(data.memberId, data)
        } else if (data.type === 'coverage') {
          coverageUpdates.value.set(data.subAreaId, data.coveragePercent)
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e)
      }
    }
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      isConnected.value = false
    }
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    isConnected,
    positions,
    coverageUpdates,
    connect,
    disconnect,
  }
}
