export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'operator' | 'hazardous_admin';
  phone?: string;
  createdAt: string;
}

export interface Vehicle {
  id: number;
  plateNumber: string;
  vin: string;
  owner: string;
  ownerPhone?: string;
  scrapReason?: string;
  transferDate?: string;
  status: 'registered' | 'dismantling' | 'completed';
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DismantlingTask {
  id: number;
  vehicleId: number;
  vehicle?: Vehicle;
  status: 'pending' | 'in_progress' | 'completed';
  startDate?: string;
  endDate?: string;
  operatorId?: number;
  parts?: DismantlingPart[];
  createdAt: string;
  updatedAt: string;
}

export type MajorAssemblyType = 'engine' | 'transmission' | 'frame' | 'front_axle' | 'rear_axle' | 'steering' | 'none';

export interface DismantlingPart {
  id: number;
  taskId: number;
  name: string;
  category?: string;
  weight: number;
  isReusable: boolean;
  isHazardous: boolean;
  isMajorAssembly: boolean;
  majorAssemblyType: MajorAssemblyType;
  status: 'pending' | 'dismantled' | 'stocked' | 'disposed';
  dismantledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: number;
  partId: number;
  partName: string;
  quantity: number;
  weight: number;
  location?: string;
  inDate: string;
  outDate?: string;
  price?: number;
  buyer?: string;
  status: 'in_stock' | 'sold';
  createdAt: string;
  updatedAt: string;
}

export type HazardousWasteType = 'oil' | 'antifreeze' | 'battery' | 'other';

export interface HazardousWaste {
  id: number;
  partId?: number;
  type: HazardousWasteType;
  name: string;
  weight: number;
  vehicleId: number;
  waybillId?: number;
  status: 'pending' | 'transferred' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Waybill {
  id: number;
  waybillNo: string;
  disposalFactory: string;
  factoryQualification?: string;
  transferDate: string;
  totalWeight: number;
  signedBack: boolean;
  signedBackAt?: string;
  signedBackBy?: number;
  notes?: string;
  status: 'pending' | 'transferred' | 'completed';
  wastes?: HazardousWaste[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyReport {
  id: number;
  reportMonth: string;
  totalVehicles: number;
  totalWeight: number;
  reusableWeight: number;
  hazardousWeight: number;
  majorAssembliesCount: number;
  generatedBy?: number;
  generatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
