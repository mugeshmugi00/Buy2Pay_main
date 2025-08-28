import { Component, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterOutlet, Router, Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './app/components/login/login.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { RequisitionsComponent } from './app/components/requisitions/requisitions.component';
import { ApprovalsComponent } from './app/components/approvals/approvals.component';
import { InvoicesComponent } from './app/components/invoices/invoices.component';
import { SuppliersComponent } from './app/components/suppliers/suppliers.component';
import { PurchaseOrdersComponent } from './app/components/purchase-orders/purchase-orders.component';
import { GoodsReceiptsComponent } from './app/components/goods-receipts/goods-receipts.component';
import { AuthGuard } from './app/guards/auth.guard';
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['requester', 'approver', 'finance', 'admin'] }
  },
  { 
    path: 'requisitions', 
    component: RequisitionsComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['requester', 'admin'] }
  },
  { 
    path: 'approvals', 
    component: ApprovalsComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['approver', 'admin'] }
  },
  { 
    path: 'invoices', 
    component: InvoicesComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['finance', 'admin'] }
  },
  { 
    path: 'suppliers', 
    component: SuppliersComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  { 
    path: 'purchase-orders', 
    component: PurchaseOrdersComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['buyer', 'admin'] }
  },
  { 
    path: 'goods-receipts', 
    component: GoodsReceiptsComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['warehouse', 'admin'] }
  },
  { path: '**', redirectTo: '/login' }
];

// Auth Interceptor Function
function authInterceptor(req: any, next: any) {
  const token = localStorage.getItem('token');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      BrowserAnimationsModule,
      ReactiveFormsModule
    ),
    AuthGuard
  ]
});