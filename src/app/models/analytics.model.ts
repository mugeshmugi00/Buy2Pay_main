export interface DashboardSummary {
  totalRequisitions: number;
  approvedRequisitions: number;
  totalPOs: number;
  totalSuppliers: number;
  totalInvoices: number;
  paidInvoices: number;
  totalSpend: number;
  approvalRate: string;
  paymentRate: string;
}

export interface SupplierPerformance {
  _id: string;
  name: string;
  rating: number;
  onTimeDeliveryRate: number;
  qualityRating: number;
  totalOrders: number;
  totalSpend: number;
  avgOrderValue: number;
}

export interface MonthlySpend {
  _id: {
    year: number;
    month: number;
  };
  total: number;
  count: number;
}

export interface AnalyticsDashboard {
  summary: DashboardSummary;
  supplierPerformance: SupplierPerformance[];
  monthlySpend: MonthlySpend[];
}