import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = '/api/invoices';
  private paymentsUrl = '/api/payments';

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getInvoice(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  validateInvoice(id: string, data: { status: string, comments?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/validate`, data);
  }

  processPayment(payment: any): Observable<any> {
    return this.http.post<any>(this.paymentsUrl, payment);
  }

  getPayments(): Observable<any[]> {
    return this.http.get<any[]>(this.paymentsUrl);
  }
}