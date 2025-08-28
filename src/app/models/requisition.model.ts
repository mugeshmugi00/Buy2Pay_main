export interface RequisitionItem {
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  specifications?: string;
  deliveryDate: Date;
}

export interface ApprovalHistory {
  approverId?: string;
  approverName?: string;
  action: 'approved' | 'rejected' | 'modified';
  comments?: string;
  date?: Date;
}

export interface Requisition {
  _id?: string;
  requisitionNumber?: string;
  requesterId?: string;
  requesterName?: string;
  department: string;
  items: RequisitionItem[];
  totalAmount: number;
  justification: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'modified';
  approvalHistory?: ApprovalHistory[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRequisitionRequest {
  department: string;
  items: RequisitionItem[];
  totalAmount: number;
  justification: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}