import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Requisition, CreateRequisitionRequest } from '../models/requisition.model';

@Injectable({
  providedIn: 'root'
})
export class RequisitionService {
  private apiUrl = '/api/requisitions';

  constructor(private http: HttpClient) {}

  createRequisition(requisition: CreateRequisitionRequest): Observable<Requisition> {
    return this.http.post<Requisition>(this.apiUrl, requisition);
  }

  getRequisitions(): Observable<Requisition[]> {
    return this.http.get<Requisition[]>(this.apiUrl);
  }

  getRequisition(id: string): Observable<Requisition> {
    return this.http.get<Requisition>(`${this.apiUrl}/${id}`);
  }

  approveRequisition(id: string, data: { action: string, comments: string }): Observable<Requisition> {
    return this.http.put<Requisition>(`${this.apiUrl}/${id}/approve`, data);
  }
}