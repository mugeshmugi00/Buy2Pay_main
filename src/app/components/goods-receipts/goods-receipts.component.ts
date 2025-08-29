import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { GoodsReceiptService } from '../../services/goods-receipt.service';
import { SupplierService } from '../../services/supplier.service';
import { PurchaseOrder, PurchaseOrderItem } from '../../models/purchase-order.model';
import { GoodsReceipt } from '../../models/goods-receipt.model';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-goods-receipts',
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
              <span class="ml-4 text-gray-500">Goods Receipts</span>
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
        <!-- Tabs -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              (click)="activeTab = 'list'"
              class="py-4 px-1 border-b-2 font-medium text-sm"
              [ngClass]="activeTab === 'list' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Goods Receipts
            </button>
            <button
              *ngIf="canCreateGRN() && !poIdFromRoute"
              (click)="activeTab = 'create'"
              class="py-4 px-1 border-b-2 font-medium text-sm"
              [ngClass]="activeTab === 'create' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Record Goods Receipt
            </button>
          </nav>
        </div>

        <!-- Goods Receipts List -->
        <div *ngIf="activeTab === 'list'">
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Goods Receipts</h3>
              <div class="flex space-x-2">
                <select 
                  [(ngModel)]="statusFilter"
                  (change)="filterGoodsReceipts()"
                  class=" py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="received">Received</option>
                  <option value="inspected">Inspected</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button 
                  *ngIf="canCreateGRN()"
                  (click)="activeTab = 'create'"
                  class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Record Receipt
                </button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GRN #</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO #</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received By</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngIf="loading">
                    <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                  </tr>
                  <tr *ngIf="!loading && filteredGoodsReceipts.length === 0">
                    <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">No goods receipts found</td>
                  </tr>
                  <tr *ngFor="let grn of filteredGoodsReceipts" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{{ grn.grnNumber }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ grn.poNumber }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ getSupplierName(grn.supplierId) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ grn.receivedBy }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(grn.receivedDate) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': grn.status === 'received',
                          'bg-blue-100 text-blue-800': grn.status === 'inspected',
                          'bg-green-100 text-green-800': grn.status === 'accepted',
                          'bg-red-100 text-red-800': grn.status === 'rejected'
                        }"
                      >
                        {{ grn.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button (click)="viewGoodsReceipt(grn._id)" class="text-green-600 hover:text-green-900">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Create Goods Receipt Form -->
        <div *ngIf="activeTab === 'create'" class="bg-white shadow rounded-lg p-6">
          <form [formGroup]="grnForm" (ngSubmit)="submitGoodsReceipt()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Purchase Order</label>
              <select formControlName="poId" (change)="onPurchaseOrderChange()" class="mt-1 block w-full border-gray-300 rounded-md">
                <option value="">Select PO</option>
                <option *ngFor="let po of availablePurchaseOrders" [value]="po._id">{{ po.poNumber }} - {{ po.supplierName || getSupplierName(po.supplierId) }}</option>
              </select>
            </div>
            <div *ngIf="selectedPurchaseOrder">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Supplier</label>
                <input type="text" class="mt-1 block w-full border-gray-300 rounded-md" [value]="selectedPurchaseOrder.supplierName || getSupplierName(selectedPurchaseOrder.supplierId)" [disabled]="true">
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Received By</label>
                <input type="text" formControlName="receivedBy" class="mt-1 block w-full border-gray-300 rounded-md" [disabled]="true">
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Received Date</label>
                <input type="date" formControlName="receivedDate" class="mt-1 block w-full border-gray-300 rounded-md">
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Inspection Report</label>
                <textarea formControlName="inspectionReport" class="mt-1 block w-full border-gray-300 rounded-md"></textarea>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Items Received</label>
                <div formArrayName="items">
                  <div *ngFor="let item of items.controls; let i = index" [formGroupName]="i" class="border p-2 mb-2 rounded">
                    <div class="flex space-x-2">
                      <input type="text" formControlName="itemName" class="w-1/4 border-gray-300 rounded-md" [disabled]="true">
                      <input type="number" formControlName="orderedQuantity" class="w-1/6 border-gray-300 rounded-md" [disabled]="true">
                      <input type="number" formControlName="receivedQuantity" class="w-1/6 border-gray-300 rounded-md" (change)="calculateItemTotal(i)">
                      <input type="number" formControlName="unitPrice" class="w-1/6 border-gray-300 rounded-md" [disabled]="true">
                      <input type="number" formControlName="totalAmount" class="w-1/6 border-gray-300 rounded-md" [disabled]="true">
                      <select formControlName="condition" class="w-1/6 border-gray-300 rounded-md">
                        <option value="good">Good</option>
                        <option value="damaged">Damaged</option>
                      </select>
                      <input type="text" formControlName="remarks" class="w-1/4 border-gray-300 rounded-md" placeholder="Remarks">
                    </div>
                  </div>
                </div>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Total Amount</label>
                <input type="number" [value]="calculateTotalAmount()" class="mt-1 block w-full border-gray-300 rounded-md" [disabled]="true">
              </div>
              <button type="submit" [disabled]="submitting" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                {{ submitting ? 'Recording...' : 'Record Goods Receipt' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add this after your main content, outside the table -->
      <div 
        *ngIf="selectedGRN" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
          <button 
            (click)="closeGRN()" 
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Close"
          >&times;</button>
          <h2 class="text-2xl font-bold mb-4 text-green-700">Goods Receipt Details</h2>
          <div class="mb-2"><strong>GRN Number:</strong> {{ selectedGRN.grnNumber }}</div>
          <div class="mb-2"><strong>PO Number:</strong> {{ selectedGRN.poNumber }}</div>
          <div class="mb-2"><strong>Supplier:</strong> {{ getSupplierName(selectedGRN.supplierId) }}</div>
          <div class="mb-2"><strong>Received By:</strong> {{ selectedGRN.receivedBy }}</div>
          <div class="mb-2"><strong>Received Date:</strong> {{ formatDate(selectedGRN.receivedDate) }}</div>
          <div class="mb-2"><strong>Status:</strong> {{ selectedGRN.status | titlecase }}</div>
          <div class="mb-2"><strong>Inspection Report:</strong> {{ selectedGRN.inspectionReport }}</div>
          <h3 class="text-lg font-semibold mb-2">Items Received</h3>
          <table class="min-w-full divide-y divide-gray-200 mb-4">
            <thead>
              <tr>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Item Name</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Ordered Qty</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Received Qty</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Unit Price</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Total</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Condition</th>
                <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of selectedGRN.items">
                <td class="px-2 py-1">{{ item.itemName }}</td>
                <td class="px-2 py-1">{{ item.orderedQuantity }}</td>
                <td class="px-2 py-1">{{ item.receivedQuantity }}</td>
                <td class="px-2 py-1">₹{{ formatCurrency(item.unitPrice) }}</td>
                <td class="px-2 py-1">₹{{ formatCurrency(item.totalAmount) }}</td>
                <td class="px-2 py-1">{{ item.condition | titlecase }}</td>
                <td class="px-2 py-1">{{ item.remarks }}</td>
              </tr>
            </tbody>
          </table>
          <div class="mb-2"><strong>Total Amount:</strong> ₹{{ formatCurrency(selectedGRN.totalAmount) }}</div>
        </div>
      </div>
    </div>
  `
})
export class GoodsReceiptsComponent implements OnInit {
  activeTab: 'list' | 'create' = 'list';
  loading = true;
  submitting = false;
  statusFilter = 'all';
  poIdFromRoute: string | null = null;
  
  goodsReceipts: GoodsReceipt[] = [];
  filteredGoodsReceipts: GoodsReceipt[] = [];
  availablePurchaseOrders: PurchaseOrder[] = [];
  selectedPurchaseOrder: PurchaseOrder | null = null;
  suppliers: Supplier[] = [];
  
  grnForm: FormGroup;
  currentUser = this.authService.currentUserValue;
  selectedGRN: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private purchaseOrderService: PurchaseOrderService,
    private goodsReceiptService: GoodsReceiptService,
    private supplierService: SupplierService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.grnForm = this.fb.group({
      poId: ['', Validators.required],
      poNumber: [''],
      supplierId: [''],
      receivedBy: [this.currentUser?.name || '', Validators.required],
      receivedDate: [new Date().toISOString().split('T')[0], Validators.required],
      inspectionReport: [''],
      items: this.fb.array([]),
      status: ['received']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['poId']) {
        this.poIdFromRoute = params['poId'];
        this.grnForm.patchValue({ poId: this.poIdFromRoute });
        this.activeTab = 'create';
        if (this.poIdFromRoute) {
          this.loadPurchaseOrderDetails(this.poIdFromRoute);
        }
      }
    });
    
    this.loadGoodsReceipts();
    this.loadAvailablePurchaseOrders();
  }

  get items(): FormArray {
    return this.grnForm.get('items') as FormArray;
  }

  loadGoodsReceipts(): void {
    this.loading = true;
    this.goodsReceiptService.getGoodsReceipts().subscribe({
      next: (data: GoodsReceipt[]) => {
        this.goodsReceipts = data;
        this.filteredGoodsReceipts = data;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading goods receipts:', error);
        this.loading = false;
      }
    });
  }

  loadAvailablePurchaseOrders(): void {
    this.purchaseOrderService.getPurchaseOrders().subscribe({
      next: (data) => {
        this.availablePurchaseOrders = data.filter(po => 
          po.status === 'sent' || po.status === 'partially_received'
        );
      },
      error: (error: Error) => {
        console.error('Error loading available purchase orders:', error);
      }
    });
    
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: (error: Error) => {
        console.error('Error loading suppliers:', error);
      }
    });
  }

  loadPurchaseOrderDetails(poId: string): void {
    this.purchaseOrderService.getPurchaseOrderById(poId).subscribe({
      next: (data) => {
        this.selectedPurchaseOrder = data;
        
        if (this.selectedPurchaseOrder && this.selectedPurchaseOrder.supplierId && !this.selectedPurchaseOrder.supplierName) {
          this.supplierService.getSupplier(this.selectedPurchaseOrder.supplierId).subscribe({
            next: (supplier) => {
              if (this.selectedPurchaseOrder) {
                this.selectedPurchaseOrder.supplierName = supplier.name;
              }
            },
            error: (error: Error) => {
              console.error('Error loading supplier details:', error);
            }
          });
        }
        
        if (this.selectedPurchaseOrder) {
          this.grnForm.patchValue({
            poNumber: this.selectedPurchaseOrder.poNumber,
            supplierId: this.selectedPurchaseOrder.supplierId
          });
          
          while (this.items.length) {
            this.items.removeAt(0);
          }
          
          this.selectedPurchaseOrder.items.forEach((item: PurchaseOrderItem) => {
            this.items.push(this.fb.group({
              itemName: [item.itemName],
              orderedQuantity: [item.quantity],
              receivedQuantity: [item.quantity, [Validators.required, Validators.min(0)]],
              unitPrice: [item.unitPrice],
              totalAmount: [item.totalAmount],
              condition: ['good'],
              remarks: ['']
            }));
          });
        }
      },
      error: (error: Error) => {
        console.error('Error loading purchase order details:', error);
      }
    });
  }

  filterGoodsReceipts(): void {
    if (this.statusFilter === 'all') {
      this.filteredGoodsReceipts = this.goodsReceipts;
    } else {
      this.filteredGoodsReceipts = this.goodsReceipts.filter(grn => grn.status === this.statusFilter);
    }
  }

  onPurchaseOrderChange(): void {
    const poId = this.grnForm.get('poId')?.value;
    if (poId && typeof poId === 'string') {
      this.loadPurchaseOrderDetails(poId);
    }
  }

  calculateItemTotal(index: number): void {
    const item = this.items.at(index);
    const receivedQuantity = item.get('receivedQuantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    const totalAmount = receivedQuantity * unitPrice;
    
    item.patchValue({
      totalAmount: totalAmount
    });
  }

  calculateTotalAmount(): number {
    return this.items.controls.reduce((total, item) => {
      return total + (item.get('totalAmount')?.value || 0);
    }, 0);
  }

  submitGoodsReceipt(): void {
    if (this.grnForm.invalid) return;
    
    this.submitting = true;
    
    const grnData = {
      ...this.grnForm.value,
      totalAmount: this.calculateTotalAmount(),
      grnNumber: 'GRN-' + Date.now()
    };
    
    this.goodsReceiptService.createGoodsReceipt(grnData).subscribe({
      next: (result: any) => { 
        console.log('Goods Receipt recorded:', result);
        
        this.createInvoiceFromGoodsReceipt(result);
        
        this.submitting = false;
        this.activeTab = 'list';
        this.loadGoodsReceipts();
        
        if (this.selectedPurchaseOrder && this.selectedPurchaseOrder._id) {
          this.updatePurchaseOrderStatus(this.selectedPurchaseOrder._id);
        }
      },
      error: (error: Error) => {
        console.error('Error creating goods receipt:', error);
        this.submitting = false;
      }
    });
  }

  createInvoiceFromGoodsReceipt(grn: any): void {
    if (!grn || !this.selectedPurchaseOrder) return;
    
    const invoiceData = {
      invoiceNumber: 'INV-' + Date.now(),
      supplierId: grn.supplierId,
      supplierName: this.selectedPurchaseOrder.supplierName || this.getSupplierName(grn.supplierId),
      poId: grn.poId,
      poNumber: grn.poNumber,
      grnId: grn._id,
      grnNumber: grn.grnNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: grn.items.map((item: any) => ({
        itemName: item.itemName,
        quantity: item.receivedQuantity,
        unitPrice: item.unitPrice,
        totalAmount: item.totalAmount,
        taxRate: 18,
        taxAmount: item.totalAmount * 0.18
      })),
      subtotal: grn.totalAmount,
      totalTax: grn.totalAmount * 0.18,
      totalAmount: grn.totalAmount * 1.18,
      paymentTerms: 'Net 30',
      status: 'submitted'
    };
    
    this.http.post<any>('https://buy2pay-main.onrender.com/api/invoices', invoiceData).subscribe({
      next: (invoice: any) => {
        console.log('Invoice created automatically:', invoice);
      },
      error: (error: Error) => {
        console.error('Error creating invoice:', error);
      }
    });
  }

  viewGoodsReceipt(id: string | undefined): void {
    if (!id) return;
    const grn = this.filteredGoodsReceipts.find(g => g._id === id);
    if (grn) {
      this.selectedGRN = grn;
    }
  }

  closeGRN(): void {
    this.selectedGRN = null;
  }

  getSupplierName(supplierId: string | any): string {
    let id: string;
    
    if (typeof supplierId === 'object' && supplierId !== null) {
      id = supplierId._id || supplierId.id || supplierId.toString();
    } else {
      id = supplierId as string;
    }
    
    const supplier = this.suppliers.find(s => s._id === id);
    if (supplier) {
      return supplier.name;
    }
    
    this.supplierService.getSupplier(id).subscribe({
      next: (supplier) => {
        if (!this.suppliers.some(s => s._id === supplier._id)) {
          this.suppliers.push(supplier);
        }
        this.filteredGoodsReceipts = [...this.filteredGoodsReceipts];
      },
      error: (error: Error) => {
        console.error('Error fetching supplier:', error);
      }
    });
    
    return 'Loading...';
  }
  
  updatePurchaseOrderStatus(poId: string): void {
    this.purchaseOrderService.updatePurchaseOrderStatus(poId, 'received').subscribe({
      next: () => {
        console.log('Purchase order status updated');
      },
      error: (error: Error) => {
        console.error('Error updating purchase order status:', error);
      }
    });
  }

  canCreateGRN(): boolean {
    return this.authService.hasRole(['warehouse', 'admin']);
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
