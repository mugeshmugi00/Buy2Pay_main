import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { RequisitionService } from '../../services/requisition.service';
import { SupplierService } from '../../services/supplier.service';
import { PurchaseOrder } from '../../models/purchase-order.model';
import { Requisition } from '../../models/requisition.model';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-blue-600">Buy2Pay</h1>
              <span class="ml-4 text-gray-500">Purchase Orders</span>
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
                <i class="fa fa-sign-out" style="color:red;"aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Tabs -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              (click)="activeTab = 'list'"
              class="py-4 px-1 border-b-2 font-medium text-sm"
              [ngClass]="activeTab === 'list' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Purchase Orders
            </button>
            <button
              *ngIf="canCreatePO()"
              (click)="activeTab = 'create'"
              class="py-4 px-1 border-b-2 font-medium text-sm"
              [ngClass]="activeTab === 'create' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Create Purchase Order
            </button>
          </nav>
        </div>

        <!-- Purchase Orders List -->
        <div *ngIf="activeTab === 'list'">
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Purchase Orders</h3>
              <div class="flex space-x-2">
                <select 
                  [(ngModel)]="statusFilter"
                  (change)="filterPurchaseOrders()"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="partially_delivered">Partially Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button 
                  *ngIf="canCreatePO()"
                  (click)="activeTab = 'create'"
                  class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Create PO
                </button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PO #
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
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
                  <tr *ngIf="loading">
                    <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                      Loading...
                    </td>
                  </tr>
                  <tr *ngIf="!loading && filteredPurchaseOrders.length === 0">
                    <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                      No purchase orders found
                    </td>
                  </tr>
                  <tr *ngFor="let po of filteredPurchaseOrders" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                      {{ po.poNumber }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ po.supplierName }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                      <div *ngFor="let item of po.items" class="mb-1">
                        {{ item.quantity }} x {{ item.itemName }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{{ formatCurrency(po.totalAmount) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': po.status === 'sent',
                          'bg-green-100 text-green-800': po.status === 'confirmed',
                          'bg-blue-100 text-blue-800': po.status === 'partially_delivered',
                          'bg-purple-100 text-purple-800': po.status === 'completed',
                          'bg-red-100 text-red-800': po.status === 'cancelled'
                        }"
                      >
                        {{ po.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        (click)="viewPurchaseOrder(po._id)"
                        class="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        View
                      </button>
                      <button 
                        *ngIf="po.status === 'confirmed' || po.status === 'partially_delivered'"
                        (click)="recordGoodsReceipt(po._id)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Record Receipt
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Create Purchase Order Form -->
        <div *ngIf="activeTab === 'create'">
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Create Purchase Order</h3>
            </div>
            <div class="p-6">
              <form [formGroup]="poForm" (ngSubmit)="submitPurchaseOrder()">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Select Requisition</label>
                    <select 
                      formControlName="requisitionId"
                      (change)="onRequisitionChange()"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">-- Select Requisition --</option>
                      <option *ngFor="let req of approvedRequisitions" [value]="req._id">
                        {{ req.requisitionNumber }} - {{ req.requesterName }}
                      </option>
                    </select>
                    <div *ngIf="poForm.get('requisitionId')?.invalid && poForm.get('requisitionId')?.touched" class="text-red-500 text-sm mt-1">
                      Requisition is required
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Select Supplier</label>
                    <select 
                      formControlName="supplierId"
                      (change)="onSupplierChange()"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">-- Select Supplier --</option>
                      <option *ngFor="let supplier of suppliers" [value]="supplier._id">
                        {{ supplier.name }}
                      </option>
                    </select>
                    <div *ngIf="poForm.get('supplierId')?.invalid && poForm.get('supplierId')?.touched" class="text-red-500 text-sm mt-1">
                      Supplier is required
                    </div>
                  </div>
                </div>
                
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea 
                    formControlName="deliveryAddress"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                  ></textarea>
                  <div *ngIf="poForm.get('deliveryAddress')?.invalid && poForm.get('deliveryAddress')?.touched" class="text-red-500 text-sm mt-1">
                    Delivery address is required
                  </div>
                </div>
                
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Terms</label>
                  <input 
                    type="text"
                    formControlName="terms"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. Net 30"
                  >
                </div>
                
                <div class="mb-6">
                  <h4 class="text-md font-medium text-gray-900 mb-3">Items</h4>
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item Name
                          </th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price (₹)
                          </th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total (₹)
                          </th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivery Date
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200" formArrayName="items">
                        <tr *ngFor="let item of items.controls; let i = index" [formGroupName]="i" class="hover:bg-gray-50">
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {{ item.get('itemName')?.value }}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <input 
                              type="number"
                              formControlName="quantity"
                              (input)="calculateItemTotal(i)"
                              class="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                              min="1"
                            >
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <input 
                              type="number"
                              formControlName="unitPrice"
                              (input)="calculateItemTotal(i)"
                              class="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                              min="0"
                            >
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            ₹{{ formatCurrency(item.get('totalAmount')?.value) }}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <input 
                              type="date"
                              formControlName="deliveryDate"
                              class="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="3" class="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            Total Amount:
                          </td>
                          <td class="px-4 py-3 text-sm font-bold text-gray-900">
                            ₹{{ formatCurrency(calculateTotalAmount()) }}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                <div class="flex justify-end space-x-3">
                  <button 
                    type="button"
                    (click)="activeTab = 'list'"
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    [disabled]="poForm.invalid || submitting"
                    class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ submitting ? 'Creating...' : 'Create Purchase Order' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Add this after your main content, outside the table -->
      <div 
        *ngIf="selectedPO" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
          <button 
            (click)="closePO()" 
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Close"
          >&times;</button>
          <h2 class="text-2xl font-bold mb-4 text-purple-700">Purchase Order Details</h2>
          <div class="mb-2"><strong>PO Number:</strong> {{ selectedPO.poNumber }}</div>
          <div class="mb-2"><strong>Supplier:</strong> {{ selectedPO.supplierName }}</div>
          <div class="mb-2"><strong>Requester:</strong> {{ selectedPO.requesterName }}</div>
          <div class="mb-2"><strong>Status:</strong> {{ selectedPO.status | titlecase }}</div>
          <div class="mb-2"><strong>Total Amount:</strong> ₹{{ formatCurrency(selectedPO.totalAmount) }}</div>
          <div class="mb-2"><strong>Delivery Address:</strong> {{ selectedPO.deliveryAddress }}</div>
          <div class="mb-2"><strong>Terms:</strong> {{ selectedPO.terms }}</div>
          <div class="mb-4"><strong>Created At:</strong> {{ selectedPO.createdAt | date:'medium' }}</div>
          <h3 class="text-lg font-semibold mb-2">Items</h3>
          <table class="min-w-full divide-y divide-gray-200 mb-4">
            <thead>
              <tr>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Item Name</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Qty</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Unit Price</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Total</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Delivery Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of selectedPO.items">
                <td class="px-2 py-1">{{ item.itemName }}</td>
                <td class="px-2 py-1">{{ item.quantity }}</td>
                <td class="px-2 py-1">₹{{ formatCurrency(item.unitPrice) }}</td>
                <td class="px-2 py-1">₹{{ formatCurrency(item.totalAmount) }}</td>
                <td class="px-2 py-1">{{ item.deliveryDate | date:'mediumDate' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PurchaseOrdersComponent implements OnInit {
  activeTab: 'list' | 'create' = 'list';
  loading = true;
  submitting = false;
  statusFilter = 'all';
  
  purchaseOrders: PurchaseOrder[] = [];
  filteredPurchaseOrders: PurchaseOrder[] = [];
  approvedRequisitions: Requisition[] = [];
  suppliers: Supplier[] = [];
  selectedRequisition: Requisition | null = null;
  selectedPO: any = null;

  poForm: FormGroup;
  currentUser = this.authService.currentUserValue;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private purchaseOrderService: PurchaseOrderService,
    private requisitionService: RequisitionService,
    private supplierService: SupplierService,
    private router: Router
  ) {
    this.poForm = this.fb.group({
      requisitionId: ['', Validators.required],
      supplierId: ['', Validators.required],
      supplierName: [''],
      deliveryAddress: ['', Validators.required],
      terms: ['Net 30'],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadPurchaseOrders();
    this.loadApprovedRequisitions();
    this.loadSuppliers();
  }

  get items(): FormArray {
    return this.poForm.get('items') as FormArray;
  }

  loadPurchaseOrders(): void {
    this.loading = true;
    this.purchaseOrderService.getPurchaseOrders().subscribe({
      next: (data) => {
        this.purchaseOrders = data;
        this.filteredPurchaseOrders = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading purchase orders:', error);
        this.loading = false;
      }
    });
  }

  loadApprovedRequisitions(): void {
    this.requisitionService.getRequisitions().subscribe({
      next: (data) => {
        // Filter to only include approved requisitions
        this.approvedRequisitions = data.filter(req => req.status === 'approved');
      },
      error: (error) => {
        console.error('Error loading approved requisitions:', error);
      }
    });
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
      }
    });
  }

  filterPurchaseOrders(): void {
    if (this.statusFilter === 'all') {
      this.filteredPurchaseOrders = this.purchaseOrders;
    } else {
      this.filteredPurchaseOrders = this.purchaseOrders.filter(po => po.status === this.statusFilter);
    }
  }

  onRequisitionChange(): void {
    const requisitionId = this.poForm.get('requisitionId')?.value;
    if (requisitionId) {
      this.selectedRequisition = this.approvedRequisitions.find(req => req._id === requisitionId) || null;
      
      // Clear existing items
      while (this.items.length) {
        this.items.removeAt(0);
      }
      
      // Add items from the selected requisition
      if (this.selectedRequisition) {
        this.selectedRequisition.items.forEach(item => {
          this.items.push(this.fb.group({
            itemName: [item.itemName],
            quantity: [item.quantity, [Validators.required, Validators.min(1)]],
            unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
            totalAmount: [item.totalAmount],
            deliveryDate: [new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], Validators.required]
          }));
        });
      }
    }
  }

  onSupplierChange(): void {
    const supplierId = this.poForm.get('supplierId')?.value;
    if (supplierId) {
      const supplier = this.suppliers.find(s => s._id === supplierId);
      if (supplier) {
        this.poForm.patchValue({
          supplierName: supplier.name
        });
      }
    }
  }

  calculateItemTotal(index: number): void {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    const totalAmount = quantity * unitPrice;
    
    item.patchValue({
      totalAmount: totalAmount
    });
  }

  calculateTotalAmount(): number {
    return this.items.controls.reduce((total, item) => {
      return total + (item.get('totalAmount')?.value || 0);
    }, 0);
  }

  submitPurchaseOrder(): void {
    if (this.poForm.invalid) return;
    
    this.submitting = true;
    
    const poData = {
      ...this.poForm.value,
      totalAmount: this.calculateTotalAmount(),
      status: 'sent'
    };
    
    this.purchaseOrderService.createPurchaseOrder(poData).subscribe({
      next: (result) => {
        console.log('Purchase Order created:', result);
        this.submitting = false;
        this.activeTab = 'list';
        this.loadPurchaseOrders();
      },
      error: (error) => {
        console.error('Error creating purchase order:', error);
        this.submitting = false;
      }
    });
  }

  viewPurchaseOrder(poId: string | undefined): void {
    if (!poId) return;
    const po = this.filteredPurchaseOrders.find(p => p._id === poId);
    if (po) {
      this.selectedPO = po;
    }
  }

  closePO(): void {
    this.selectedPO = null;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN').format(amount);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  canCreatePO(): boolean {
    return !!this.currentUser && ['buyer', 'admin'].includes(this.currentUser.role || '');
  }

  recordGoodsReceipt(poId: string | undefined): void {
    if (!poId) return;
    // TODO: Implement goods receipt logic or open a modal
    alert('Record Goods Receipt for PO: ' + poId);
  }
}