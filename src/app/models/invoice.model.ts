export interface InvoiceItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
}

export interface ThreeWayMatching {
  poMatch: boolean;
  grnMatch: boolean;
  priceMatch: boolean;
  quantityMatch: boolean;
  isMatched: boolean;
}

export interface Invoice {
  _id?: string;
  invoiceNumber?: string;
  supplierId: string;
  supplierName: string;
  poId: string;
  poNumber: string;
  grnId?: string;
  grnNumber?: string;
  invoiceDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  threeWayMatching?: ThreeWayMatching;
  status: 'submitted' | 'validated' | 'approved' | 'rejected' | 'paid';
  paymentTerms?: string;
  discrepancies?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Payment {
  _id?: string;
  paymentNumber?: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'cheque' | 'upi';
  paymentDate: Date;
  transactionReference: string;
  status: 'pending' | 'processed' | 'completed' | 'failed';
  processedBy: string;
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  createdAt?: Date;
}