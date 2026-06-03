export enum VoyageStatus {
  PLANNED = 'planned',
  SHIPPING = 'shipping',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
}

export enum VoyageSupplyStatus {
  PENDING = 'pending',
  STOCKED_IN = 'stocked_in',
}

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
}

export enum MemberRole {
  STATION_CHIEF = 'station_chief',
  LOGISTICS = 'logistics',
  RESEARCHER = 'researcher',
}

export enum PurposeType {
  PERSONAL = 'personal',
  PROJECT = 'project',
}

export enum RequisitionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum InventoryRecordType {
  IN = 'in',
  OUT = 'out',
}

export enum AlertLevel {
  CRITICAL = 'critical',
  WARNING = 'warning',
  NOTICE = 'notice',
}

export enum DemandListStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  SUBMITTED = 'submitted',
}

export enum StocktakingScopeType {
  WAREHOUSE = 'warehouse',
  CATEGORY = 'category',
  ALL = 'all',
}

export enum StocktakingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  APPROVED = 'approved',
}
