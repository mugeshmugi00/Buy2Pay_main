export interface GoodsReceiptItem {
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalAmount: number;
  condition: 'good' | 'damaged' | 'defective';
  remarks?: string;
}

export interface GoodsReceipt {
  _id?: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplier?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  receivedBy: string;
  receivedDate: Date;
  items: GoodsReceiptItem[];
  totalAmount: number;
  inspectionReport?: string;
  status: 'received' | 'inspected' | 'accepted' | 'rejected';
  createdAt?: Date;
}