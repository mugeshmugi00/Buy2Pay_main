export interface PurchaseOrderItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryDate: Date;
}

export interface SupplierConfirmation {
  confirmed: boolean;
  confirmedDate?: Date;
  supplierComments?: string;
}

export interface PurchaseOrder {
  _id?: string;
  poNumber?: string;
  requisitionId: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  terms?: string;
  deliveryAddress: string;
  status: 'sent' | 'confirmed' | 'partially_delivered' | 'partially_received' | 'received' | 'completed' | 'cancelled';
  supplierConfirmation?: SupplierConfirmation;
  createdAt?: Date;
  updatedAt?: Date;
}