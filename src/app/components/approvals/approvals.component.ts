import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequisitionService } from '../../services/requisition.service';
import { AuthService } from '../../services/auth.service';
import { Requisition } from '../../models/requisition.model';

@Component({
  selector: 'app-approvals',
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
              <span class="ml-4 text-gray-500">Approvals</span>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">Welcome, {{ currentUser?.name }}</span>
              <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {{ currentUser?.role | titlecase }}
              </span>
              <button 
                (click)="navigateToDashboard()"
                class="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Dashboard
              </button>
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
        <div class="mb-8">
          <div class="flex items-center mb-4">
            <!-- Removed Back to Dashboard button and icon -->
          </div>
          <h1 class="text-3xl font-bold text-gray-900">Requisition Approvals</h1>
          <p class="mt-2 text-gray-600">Review and approve purchase requisitions</p>
        </div>

        <!-- Pending Approvals Table -->
        <div class="bg-white shadow rounded-lg mb-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Pending Approvals</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requisition #
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requester
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Submitted
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngIf="loading">
                  <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
                <tr *ngIf="!loading && pendingRequisitions.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                    No pending requisitions found
                  </td>
                </tr>
                <tr *ngFor="let requisition of pendingRequisitions" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {{ requisition.requisitionNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ requisition.requesterName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ requisition.department }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{{ formatCurrency(requisition.totalAmount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      [ngClass]="{
                        'bg-red-100 text-red-800': requisition.priority === 'urgent',
                        'bg-yellow-100 text-yellow-800': requisition.priority === 'high',
                        'bg-blue-100 text-blue-800': requisition.priority === 'medium',
                        'bg-green-100 text-green-800': requisition.priority === 'low'
                      }"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ requisition.priority | titlecase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(requisition.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      (click)="reviewRequisition(requisition._id || '')" 
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Approve<i class="fa fa-angle-double-right" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recently Approved/Rejected -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Recent Decisions</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requisition #
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requester
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Decision Date
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngIf="loading">
                  <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
                <tr *ngIf="!loading && processedRequisitions.length === 0">
                  <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                    No processed requisitions found
                  </td>
                </tr>
                <tr *ngFor="let requisition of processedRequisitions" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {{ requisition.requisitionNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ requisition.requesterName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ requisition.department }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{{ formatCurrency(requisition.totalAmount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      [ngClass]="{
                        'bg-green-100 text-green-800': requisition.status === 'approved',
                        'bg-red-100 text-red-800': requisition.status === 'rejected',
                        'bg-yellow-100 text-yellow-800': requisition.status === 'modified'
                      }"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ requisition.status | titlecase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(requisition.updatedAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ApprovalsComponent implements OnInit {
  pendingRequisitions: Requisition[] = [];
  processedRequisitions: Requisition[] = [];
  loading = true;
  currentUser: any = null;

  constructor(
    private requisitionService: RequisitionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequisitions();
    this.currentUser = this.authService.getCurrentUser();
  }

  loadRequisitions(): void {
    this.requisitionService.getRequisitions().subscribe({
      next: (requisitions) => {
        this.pendingRequisitions = requisitions.filter(req => req.status === 'submitted');
        this.processedRequisitions = requisitions.filter(
          req => ['approved', 'rejected', 'modified'].includes(req.status)
        ).slice(0, 10); // Show only the 10 most recent
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading requisitions:', error);
        this.loading = false;
      }
    });
  }

  reviewRequisition(id: string): void {
    if (id) {
      // Navigate to a detailed review page (to be implemented)
      // this.router.navigate(['/requisition-review', id]);
      console.log('Review requisition:', id);
      // For now, just approve the requisition directly
      this.approveRequisition(id, 'approved', 'Approved by approver');
    }
  }

  approveRequisition(id: string, action: 'approved' | 'rejected' | 'modified', comments: string): void {
    this.requisitionService.approveRequisition(id, { action, comments }).subscribe({
      next: (result) => {
        this.loadRequisitions(); // Refresh the list
      },
      error: (error) => {
        console.error('Error approving requisition:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN').format(amount);
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString('en-IN');
  }
}