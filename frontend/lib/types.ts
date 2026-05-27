export interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history: HistoryItem[];
}

export interface ChatResponse {
  text: string;
  table: Record<string, string>[] | null;
  draft_email: string | null;
  action_items: string[] | null;
}

export interface MaintenanceRecord {
  id: string;
  unit: string;
  category: string;
  description: string;
  priority: "urgent" | "high" | "medium" | "low";
  status: string;
  created_date: string;
  name?: string;
}

export interface ExpiringLease {
  tenant_id: string;
  name: string;
  unit: string;
  email: string;
  end_date: string;
  days_remaining: number;
  monthly_rent: number;
  status: string;
}

export interface DashboardStats {
  total_units: number;
  occupied: number;
  vacant: number;
  occupancy_rate: number;
  total_monthly_revenue: number;
  expiring_soon: number;
  delinquent_count: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recent_maintenance: MaintenanceRecord[];
  expiring_leases: ExpiringLease[];
}
