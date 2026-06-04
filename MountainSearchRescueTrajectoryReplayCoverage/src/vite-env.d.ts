/// <reference types="vite/client" />

declare module 'leaflet.heat' {
  import * as L from 'leaflet'

  export interface HeatLayerOptions extends L.LayerOptions {
    minOpacity?: number
    maxZoom?: number
    max?: number
    radius?: number
    blur?: number
    gradient?: Record<number, string>
  }

  export interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: L.LatLngTuple[]): this
    addLatLng(latlng: L.LatLngTuple): this
    setOptions(options: HeatLayerOptions): this
    redraw(): this
  }

  declare module 'leaflet' {
    function heatLayer(
      latlngs: L.LatLngTuple[],
      options?: HeatLayerOptions
    ): HeatLayer
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
