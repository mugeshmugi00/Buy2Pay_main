import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GoodsReceipt } from '../models/goods-receipt.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoodsReceiptService {
  private apiUrl = `${environment.apiBaseUrl}/goods-receipts`;

  constructor(private http: HttpClient) {}

  getGoodsReceipts(): Observable<GoodsReceipt[]> {
    return this.http.get<GoodsReceipt[]>(this.apiUrl);
  }

  getGoodsReceipt(id: string): Observable<GoodsReceipt> {
    return this.http.get<GoodsReceipt>(`${this.apiUrl}/${id}`);
  }

  createGoodsReceipt(goodsReceipt: any): Observable<GoodsReceipt> {
    return this.http.post<GoodsReceipt>(this.apiUrl, goodsReceipt);
  }

  updateGoodsReceipt(id: string, goodsReceipt: Partial<GoodsReceipt>): Observable<GoodsReceipt> {
    return this.http.put<GoodsReceipt>(`${this.apiUrl}/${id}`, goodsReceipt);
  }

  // Get goods receipts by purchase order ID
  getGoodsReceiptsByPurchaseOrder(poId: string): Observable<GoodsReceipt[]> {
    return this.http.get<GoodsReceipt[]>(`${this.apiUrl}/by-po/${poId}`);
  }

  // Update goods receipt status
  updateStatus(id: string, status: string, comments?: string): Observable<GoodsReceipt> {
    return this.http.put<GoodsReceipt>(`${this.apiUrl}/${id}/status`, { status, comments });
  }
}