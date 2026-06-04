import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export function useMap(containerId: string) {
  const map = shallowRef<L.Map | null>(null)
  const isReady = ref(false)

  const initMap = (center: [number, number] = [30.5, 114.3], zoom: number = 13) => {
    if (map.value) return map.value

    const osmDark = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }
    )

    const osmLight = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }
    )

    map.value = L.map(containerId, {
      center,
      zoom,
      layers: [osmDark],
    })

    const baseMaps = {
      '深色地图': osmDark,
      '浅色地图': osmLight,
    }

    L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(map.value)
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map.value)

    fixLeafletIcons()

    isReady.value = true
    return map.value
  }

  const fixLeafletIcons = () => {
    const iconProto = L.Icon.Default.prototype as any
    delete iconProto._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  }

  const fitToBounds = (latlngs: [number, number][]) => {
    if (!map.value || latlngs.length === 0) return
    const bounds = L.latLngBounds(latlngs)
    map.value.fitBounds(bounds, { padding: [50, 50] })
  }

  onBeforeUnmount(() => {
    if (map.value) {
      map.value.remove()
      map.value = null
      isReady.value = false
    }
  })

  return {
    map,
    isReady,
    initMap,
    fitToBounds,
  }
}
