export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

export interface Mission {
  id: number
  name: string
  status: 'planning' | 'active' | 'completed'
  searchArea: GeoJSONPolygon | null
  createdAt: string
  updatedAt: string
  coveragePercent?: number
  teamCount?: number
}

export interface SubArea {
  id: number
  missionId: number
  name: string
  boundary: GeoJSONPolygon
  teamId: number | null
  status: 'unassigned' | 'searching' | 'completed'
  color: string
  createdAt: string
  updatedAt: string
  coveragePercent?: number
}

export interface RescueTeam {
  id: number
  name: string
  leaderId: number | null
  color: string
  createdAt: string
  memberCount?: number
}

export interface Member {
  id: number
  name: string
  teamId: number
  phone: string
  createdAt: string
  team?: RescueTeam
}

export interface GPSPoint {
  id: number
  memberId: number
  missionId: number
  lat: number
  lng: number
  altitude: number | null
  speed: number | null
  timestamp: string
  isCached: boolean
}

export interface Discovery {
  id: number
  missionId: number
  memberId: number
  type: 'footprint' | 'clothing' | 'person' | 'other'
  description: string
  lat: number
  lng: number
  imageUrl: string | null
  timestamp: string
  member?: Member
}

export interface SubAreaCoverage {
  subAreaId: number
  totalAreaSqM: number
  coveredAreaSqM: number
  coveragePercent: number
  heatmapData: [number, number, number][]
}

export interface CoverageResult {
  missionId: number
  totalAreaSqM: number
  coveredAreaSqM: number
  coveragePercent: number
  subAreas: SubAreaCoverage[]
}

export interface PositionMessage {
  type: 'position'
  memberId: number
  lat: number
  lng: number
  altitude: number | null
  speed: number | null
  timestamp: string
}

export interface CoverageMessage {
  type: 'coverage'
  subAreaId: number
  coveragePercent: number
}

export type WebSocketMessage = PositionMessage | CoverageMessage

export interface BatchGPSRequest {
  missionId: number
  points: Omit<GPSPoint, 'id' | 'missionId' | 'createdAt'>[]
}

export interface MemberPosition {
  memberId: number
  lat: number
  lng: number
  altitude: number | null
  speed: number | null
  timestamp: string
}
