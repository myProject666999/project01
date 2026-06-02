export interface User {
  id: number;
  username: string;
  realName: string;
  phone: string;
  role: 'admin' | 'inspector';
}

export interface Vehicle {
  id: number;
  vin: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  licensePlate: string;
  color: string;
  firstRegistrationDate: string;
  createdAt: string;
}

export interface InspectionCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  weight: number;
}

export interface InspectionItem {
  id: number;
  categoryId: number;
  code: string;
  name: string;
  description: string;
  standard: string;
  sortOrder: number;
  scoreOk: number;
  scoreAttention: number;
  scoreAbnormal: number;
  needPhoto: number;
}

export interface InspectionPhoto {
  id: number;
  resultId: number;
  reportId: number;
  itemId: number;
  filePath: string;
  fileName: string;
  fileSize: number;
}

export interface RepairSuggestion {
  id: number;
  resultId: number;
  reportId: number;
  itemName: string;
  problemDescription: string;
  suggestion: string;
  estimatedCost: number;
  urgency: 'low' | 'medium' | 'high';
}

export interface InspectionResult {
  id: number;
  reportId: number;
  itemId: number;
  categoryId: number;
  result: 'ok' | 'attention' | 'abnormal';
  score: number;
  remark: string;
  item?: InspectionItem;
  photos?: InspectionPhoto[];
  repairSuggestion?: RepairSuggestion;
}

export interface CategoryScore {
  id: number;
  reportId: number;
  categoryId: number;
  categoryName: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
}

export interface InspectionReport {
  id: number;
  reportNo: string;
  vehicleId: number;
  inspectorId: number;
  status: 'draft' | 'submitted' | 'expired';
  totalScore: number;
  level: string;
  inspectionDate: string;
  mileage: number;
  remark: string;
  shareToken?: string;
  shareExpireAt?: string;
  createdAt: string;
  vehicle?: Vehicle;
  inspector?: User;
  categoryScores?: CategoryScore[];
  results?: InspectionResult[];
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PageData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
