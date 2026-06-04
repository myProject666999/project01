<script setup lang="ts">
import { ref, watch, onMounted, shallowRef } from 'vue'
import L from 'leaflet'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import type { GeoJSONPolygon } from '@/types'

const props = defineProps<{
  map: L.Map | null
  existingArea: GeoJSONPolygon | null
  isDrawing: boolean
}>()

const emit = defineEmits<{
  (e: 'drawStart'): void
  (e: 'drawComplete', polygon: GeoJSONPolygon): void
  (e: 'drawCancel'): void
}>()

const drawnItems = shallowRef<L.FeatureGroup | null>(null)
const drawControl = shallowRef<L.Control.Draw | null>(null)
const existingLayer = shallowRef<L.Polygon | null>(null)

const coordToLatLng = (coords: number[][][]): L.LatLngExpression[] => {
  return coords[0].map(c => [c[1], c[0]])
}

const latLngToGeoJSON = (latlngs: L.LatLng[]): GeoJSONPolygon => {
  const coords = latlngs.map(l => [l.lng, l.lat])
  if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
    coords.push([coords[0][0], coords[0][1]])
  }
  return {
    type: 'Polygon',
    coordinates: [coords],
  }
}

const renderExisting = () => {
  if (!props.map) return

  if (existingLayer.value) {
    if (props.map.hasLayer(existingLayer.value)) {
      props.map.removeLayer(existingLayer.value)
    }
    existingLayer.value = null
  }

  if (props.existingArea) {
    const latlngs = coordToLatLng(props.existingArea.coordinates)
    existingLayer.value = L.polygon(latlngs as L.LatLngTuple[], {
      color: '#1B4332',
      weight: 3,
      opacity: 1,
      fillColor: '#1B4332',
      fillOpacity: 0.15,
      dashArray: '10, 5',
    })
    existingLayer.value.addTo(props.map)
  }
}

const initDraw = () => {
  if (!props.map || drawnItems.value) return

  drawnItems.value = new L.FeatureGroup()
  drawnItems.value.addTo(props.map)

  drawControl.value = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems.value,
      edit: false,
      remove: false,
    },
    draw: {
      polygon: {
        allowIntersection: false,
        drawError: {
          color: '#e1e100',
          message: '<strong>错误:</strong> 多边形不能自相交!',
        },
        shapeOptions: {
          color: '#1B4332',
          weight: 3,
          fillColor: '#1B4332',
          fillOpacity: 0.2,
        },
        showArea: true,
        metric: true,
      },
      polyline: false,
      rectangle: false,
      circle: false,
      circlemarker: false,
      marker: false,
    },
    position: 'topleft',
  })

  props.map.addControl(drawControl.value)

  props.map.on(L.Draw.Event.CREATED, (event: any) => {
    const layer = event.layer
    drawnItems.value?.addLayer(layer)

    const latlngs = layer.getLatLngs()[0]
    const polygon = latLngToGeoJSON(latlngs)
    emit('drawComplete', polygon)
  })

  props.map.on(L.Draw.Event.DRAWSTART, () => {
    emit('drawStart')
  })

  props.map.on(L.Draw.Event.DRAWSTOP, () => {
    if (drawnItems.value && drawnItems.value.getLayers().length === 0) {
      emit('drawCancel')
    }
  })
}

const setDrawing = (enabled: boolean) => {
  if (!props.map) return

  if (enabled) {
    initDraw()
  } else {
    if (drawControl.value) {
      props.map.removeControl(drawControl.value)
      drawControl.value = null
    }
    if (drawnItems.value) {
      if (props.map.hasLayer(drawnItems.value)) {
        props.map.removeLayer(drawnItems.value)
      }
      drawnItems.value = null
    }
  }
}

watch(
  () => props.isDrawing,
  (val) => setDrawing(val)
)

watch(
  () => props.existingArea,
  () => renderExisting(),
  { deep: true }
)

watch(
  () => props.map,
  (val) => {
    if (val) {
      renderExisting()
      if (props.isDrawing) initDraw()
    }
  }
)

onMounted(() => {
  if (props.map) {
    renderExisting()
    if (props.isDrawing) initDraw()
  }
})

defineExpose({
  clearDrawing: () => {
    drawnItems.value?.clearLayers()
  },
})
</script>
