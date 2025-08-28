import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsDashboard, SupplierPerformance } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'https://buy2pay-main.onrender.com/api/analytics';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<AnalyticsDashboard> {
    return this.http.get<AnalyticsDashboard>(`${this.apiUrl}/dashboard`);
  }

  getSupplierPerformance(): Observable<SupplierPerformance[]> {
    return this.http.get<SupplierPerformance[]>(`${this.apiUrl}/supplier-performance`);
  }
}