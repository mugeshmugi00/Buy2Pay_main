import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InvoiceService } from '../../services/invoice.service';
import { AuthService } from '../../services/auth.service';
import { Invoice, Payment } from '../../models/invoice.model';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-blue-600">Buy2Pay</h1>
            <span class="ml-4 text-gray-500">Invoices</span> <!-- Change for Suppliers page -->
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
               <i class="fa fa-sign-out"style="color:red;" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Invoice Management</h1>
       
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <ul class="flex flex-wrap -mb-px">
          <li class="mr-2">
            <a 
              [class]="activeTab === 'pending' ? 'inline-block py-4 px-4 text-blue-600 border-b-2 border-blue-600 font-medium' : 'inline-block py-4 px-4 text-gray-500 hover:text-gray-700 border-b-2 border-transparent font-medium'"
              (click)="setActiveTab('pending')"
            >
              Pending Invoices
            </a>
          </li>
          <li class="mr-2">
            <a 
              [class]="activeTab === 'processed' ? 'inline-block py-4 px-4 text-blue-600 border-b-2 border-blue-600 font-medium' : 'inline-block py-4 px-4 text-gray-500 hover:text-gray-700 border-b-2 border-transparent font-medium'"
              (click)="setActiveTab('processed')"
            >
              Processed Invoices
            </a>
          </li>
          <li class="mr-2">
            <a 
              [class]="activeTab === 'payments' ? 'inline-block py-4 px-4 text-blue-600 border-b-2 border-blue-600 font-medium' : 'inline-block py-4 px-4 text-gray-500 hover:text-gray-700 border-b-2 border-transparent font-medium'"
              (click)="setActiveTab('payments')"
            >
              Payment History
            </a>
          </li>
        </ul>
      </div>

      <!-- Loading Indicator -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <!-- Pending Invoices Tab -->
      <div *ngIf="!loading && activeTab === 'pending'">
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">Pending Invoices</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PO #
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngIf="pendingInvoices.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    No pending invoices found
                  </td>
                </tr>
                <tr *ngFor="let invoice of pendingInvoices" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ invoice.invoiceNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ invoice.supplierName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ invoice.poNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{{ formatCurrency(invoice.totalAmount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(invoice.dueDate) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      [class]="getStatusClass(invoice.status)"
                    >
                      {{ invoice.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      *ngIf="invoice.status === 'submitted' || invoice.status === 'validated'"
                      (click)="reviewInvoice(invoice._id || '')" 
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Review
                    </button>
                    <button 
                      *ngIf="invoice.status === 'approved'"
                      (click)="processPayment(invoice)" 
                      class="text-green-600 hover:text-green-900"
                    >
                      Process Payment
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Processed Invoices Tab -->
      <div *ngIf="!loading && activeTab === 'processed'">
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">Processed Invoices</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PO #
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngIf="processedInvoices.length === 0">
                  <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    No processed invoices found
                  </td>
                </tr>
                <tr *ngFor="let invoice of processedInvoices" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ invoice.invoiceNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ invoice.supplierName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ invoice.poNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{{ formatCurrency(invoice.totalAmount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(invoice.invoiceDate) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      [class]="getStatusClass(invoice.status)"
                    >
                      {{ invoice.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Payments Tab -->
      <div *ngIf="!loading && activeTab === 'payments'">
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">Payment History</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment #
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngIf="payments.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    No payment records found
                  </td>
                </tr>
                <tr *ngFor="let payment of payments" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ payment.paymentNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ payment.invoiceNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ payment.supplierName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{{ formatCurrency(payment.amount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(payment.paymentDate) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatPaymentMethod(payment.paymentMethod) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      [class]="getPaymentStatusClass(payment.status)"
                    >
                      {{ payment.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class InvoicesComponent implements OnInit {
  activeTab: 'pending' | 'processed' | 'payments' = 'pending';
  loading = true;
  pendingInvoices: Invoice[] = [];
  processedInvoices: Invoice[] = [];
  payments: Payment[] = [];
  currentUser: any = null;

  constructor(
    private invoiceService: InvoiceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadPayments();
    this.currentUser = this.authService.getCurrentUser();
  }

  setActiveTab(tab: 'pending' | 'processed' | 'payments'): void {
    this.activeTab = tab;
  }

  loadInvoices(): void {
    this.loading = true;
    this.invoiceService.getInvoices().subscribe({
      next: (invoices) => {
        this.pendingInvoices = invoices.filter(invoice => 
          ['submitted', 'validated', 'approved'].includes(invoice.status)
        );
        this.processedInvoices = invoices.filter(invoice => 
          ['rejected', 'paid'].includes(invoice.status)
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.loading = false;
      }
    });
  }

  loadPayments(): void {
    this.invoiceService.getPayments().subscribe({
      next: (payments) => {
        this.payments = payments;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
      }
    });
  }

  reviewInvoice(id: string): void {
    // In a real application, this would open a detailed view or modal
    // For this example, we'll just approve the invoice
    this.validateInvoice(id, 'approved', 'Invoice validated and approved for payment');
  }

  validateInvoice(id: string, status: string, comments: string): void {
    this.invoiceService.validateInvoice(id, { status, comments }).subscribe({
      next: (result) => {
        this.loadInvoices(); // Refresh the list
      },
      error: (error) => {
        console.error('Error validating invoice:', error);
      }
    });
  }

  processPayment(invoice: Invoice): void {
    const payment = {
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      supplierId: invoice.supplierId,
      supplierName: invoice.supplierName,
      amount: invoice.totalAmount,
      paymentMethod: 'bank_transfer',
      paymentDate: new Date(),
      transactionReference: 'TXN-' + Date.now(),
      status: 'completed'
    };

    this.invoiceService.processPayment(payment).subscribe({
      next: (result) => {
        this.loadInvoices();
        this.loadPayments();
        this.setActiveTab('payments');
      },
      error: (error) => {
        console.error('Error processing payment:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    
    switch(status) {
      case 'submitted':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'validated':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'paid':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getPaymentStatusClass(status: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    
    switch(status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'processed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  formatPaymentMethod(method: string): string {
    switch(method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cheque':
        return 'Cheque';
      case 'upi':
        return 'UPI';
      default:
        return method;
    }
  }

  goBack(): void {
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

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}