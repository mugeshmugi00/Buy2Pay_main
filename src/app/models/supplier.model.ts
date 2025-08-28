export interface Supplier {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gst: string;
  pan: string;
  supplierCode: string;
  categories: string[];
  rating: number;
  onTimeDeliveryRate: number;
  qualityRating: number;
  totalOrders: number;
  completedOrders: number;
  isActive: boolean;
  createdAt?: Date;
}