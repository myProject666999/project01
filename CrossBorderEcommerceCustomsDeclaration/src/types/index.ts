export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_name: string;
  sku: string;
  category: string;
  quantity: number;
  unit_price: number;
  hs_code: string;
  origin_country: string;
  hs_matched: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  platform_order_id: string;
  platform: string;
  order_date: string | null;
  customer_name: string;
  total_amount: number;
  currency: string;
  status: string;
  order_items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface HSCode {
  id: number;
  code: string;
  description: string;
  category: string;
  tax_rate: number;
  unit: string;
  remark: string;
  category_mappings?: CategoryMapping[];
  created_at: string;
  updated_at: string;
}

export interface CategoryMapping {
  id: number;
  category: string;
  hs_code: string;
  hs_code_ref?: HSCode;
  priority: number;
  auto_match: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeclarationItem {
  id: number;
  declaration_id: number;
  product_name: string;
  hs_code: string;
  quantity: number;
  unit_price: number;
  origin_country: string;
  declaration_amount: number;
  tax_no: string;
  created_at: string;
  updated_at: string;
}

export interface Declaration {
  id: number;
  declaration_no: string;
  status: string;
  total_amount: number;
  total_quantity: number;
  reject_reason: string;
  reject_type: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  released_at: string | null;
  declaration_items?: DeclarationItem[];
  created_at: string;
  updated_at: string;
}

export interface TariffItem {
  id: number;
  tariff_record_id: number;
  hs_code: string;
  tax_type: string;
  tax_rate: number;
  taxable_amount: number;
  tax_amount: number;
}

export interface TariffRecord {
  id: number;
  declaration_id: number;
  declaration_no: string;
  tariff_amount: number;
  currency: string;
  payment_status: string;
  payment_date: string | null;
  tariff_items?: TariffItem[];
  created_at: string;
  updated_at: string;
}

export interface CustomsArchive {
  id: number;
  declaration_id: number;
  declaration_no: string;
  archive_no: string;
  archive_date: string;
  document_url: string;
  status: string;
  created_at: string;
}

export interface DashboardStats {
  today_declared: number;
  pending_review: number;
  released: number;
  rejected: number;
}

export interface PendingTask {
  id: number;
  declaration_no: string;
  status: string;
  created_at: string;
}

export interface TrendItem {
  date: string;
  count: number;
}
