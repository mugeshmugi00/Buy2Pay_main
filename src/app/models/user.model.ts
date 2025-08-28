export interface User {
  id?: string;
  email: string;
  name: string;
  role: 'requester' | 'approver' | 'finance' | 'admin';
  department: string;
  isActive?: boolean;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'requester' | 'approver' | 'finance' | 'admin';
  department: string;
}