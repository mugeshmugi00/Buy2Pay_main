import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { AnalyticsDashboard } from '../../models/analytics.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-blue-600">Buy2Pay</h1>
              <span class="ml-4 text-gray-500">P2P Procurement Dashboard</span>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">Welcome, {{ currentUser?.name }}</span>
              <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {{ currentUser?.role | titlecase }}
              </span>
              <button 
                (click)="logout()"
                class="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                 <i class="fa fa-sign-out" style="color:red;" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span class="text-white font-semibold">₹</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Spend</dt>
                    <dd class="text-lg font-medium text-gray-900">
                      ₹{{ formatCurrency(analytics.summary.totalSpend) }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span class="text-white font-semibold">✓</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Approval Rate</dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ analytics.summary.approvalRate }}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span class="text-white font-semibold">#</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total POs</dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ analytics.summary.totalPOs }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span class="text-white font-semibold">⚡</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Payment Rate</dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ analytics.summary.paymentRate }}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
       <!-- heare -->

        <!-- Workflow Navigation -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            *ngIf="canAccess(['requester', 'admin'])"
            class="p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500"style="background-color: #1E3A8A;"
            (click)="navigate('requisitions')"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Requisitions</h3>
            <p class="text-sm"style="color:white;">Create and manage purchase requisitions</p>            
            <div class="mt-4 text-2xl font-bold text-blue-600">
              {{ analytics.summary.totalRequisitions }}
            </div>
          </div>

          <div 
            *ngIf="canAccess(['approver', 'admin'])"
            class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-green-500"
            style="background-color: #1E3A8A;"
            (click)="navigate('approvals')"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Approvals</h3>
            <p class="text-sm "style="color:white">Review and approve requisitions</p>
            <div class="mt-4 text-2xl font-bold text-green-600">
              {{ analytics.summary.approvedRequisitions }}
            </div>
          </div>

          <div 
            *ngIf="canAccess(['buyer', 'admin'])"
            class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-green-500"
            (click)="navigate('purchase-orders')"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Purchase Orders</h3>
            <p class="text-sm text-gray-600">Create and manage purchase orders</p>
            <div class="mt-4 text-2xl font-bold text-yellow-600">
              {{ analytics.summary.totalPOs }}
            </div>
          </div>

          <div 
            *ngIf="canAccess(['warehouse', 'admin'])"
            class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-indigo-500"
            (click)="navigate('goods-receipts')"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Goods Receipts</h3>
            <p class="text-sm text-gray-600">Record and manage goods receipts</p>
            <div class="mt-4 text-2xl font-bold text-indigo-600">
              0
            </div>
          </div>

          <div 
            *ngIf="canAccess(['finance', 'admin'])"
            class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-purple-500"
            (click)="navigate('invoices')"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Invoices</h3>
            <p class="text-sm text-gray-600">Process invoices and payments</p>
            <div class="mt-4 text-2xl font-bold text-purple-600">
              {{ analytics.summary.totalInvoices }}
            </div>
          </div>

          <div 
            *ngIf="canAccess(['admin'])"
            class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-orange-500"
            (click)="navigate('suppliers')"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Suppliers</h3>
            <p class="text-sm text-gray-600">Manage supplier relationships</p>
            <div class="mt-4 text-2xl font-bold text-orange-600">
              {{ analytics.summary.totalSuppliers }}
            </div>
          </div>
        </div>

        <!-- Supplier Performance -->
        <div class="bg-white shadow rounded-lg mb-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Top Supplier Performance</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spend (₹)
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    On-Time Delivery
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality Rating
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Orders
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let supplier of analytics?.supplierPerformance?.slice(0, 5)" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ supplier.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{{ formatCurrency(supplier.totalSpend || 0) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center w-32">
                      <div class="relative w-full h-3 bg-gray-200 rounded-full mr-2">
                        <div 
                          class="absolute top-0 left-0 h-3 bg-green-500 rounded-full"
                          [style.width.%]="supplier.onTimeDeliveryRate"
                          [style.transition]="'width 0.5s'"
                        ></div>
                      </div>
                      <span class="text-sm text-gray-900 font-semibold">{{ supplier.onTimeDeliveryRate || 0 }}%</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span class="text-sm text-gray-900 mr-2">{{ supplier.qualityRating || 0 }}/5</span>
                      <div class="flex">
                        <ng-container *ngFor="let star of [1,2,3,4,5]">
                          <span 
                            [ngClass]="star <= supplier.qualityRating ? 'text-yellow-400' : 'text-gray-300'"
                            class="text-lg"
                          >★</span>
                        </ng-container>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ supplier.totalOrders }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Monthly Spend Trend -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Monthly Spend Trend (₹)</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-12 gap-2 h-64">
              <div 
                *ngFor="let month of analytics.monthlySpend" 
                class="bg-blue-500 rounded-t flex flex-col justify-end items-center relative"
                [style.height.%]="getBarHeight(month.total, getMaxSpend())"
              >
                <div class="text-xs text-white font-semibold mb-1">
                  ₹{{ formatCurrency(month.total) }}
                </div>
                <div class="text-xs text-gray-600 mt-1 absolute -bottom-6">
                  {{ getMonthName(month._id.month) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  analytics: AnalyticsDashboard = {
    summary: {
      totalRequisitions: 0,
      approvedRequisitions: 0,
      totalPOs: 0,
      totalSuppliers: 0,
      totalInvoices: 0,
      paidInvoices: 0,
      totalSpend: 0,
      approvalRate: '0',
      paymentRate: '0'
    },
    supplierPerformance: [],
    monthlySpend: []
  };
  currentUser = this.authService.currentUserValue;
  loading = true;

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.analyticsService.getDashboardData().subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN').format(amount);
  }

  canAccess(roles: string[]): boolean {
    return this.authService.hasRole(roles);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getBarHeight(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }

  getMaxSpend(): number {
    if (!this.analytics.monthlySpend.length) return 0;
    return Math.max(...this.analytics.monthlySpend.map(m => m.total));
  }

  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  }
}