import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupplierService } from '../../services/supplier.service';
import { AuthService } from '../../services/auth.service';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-suppliers',
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
             <i class="fa fa-sign-out" style="color:red;"aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center">
          
          <h1 class="text-2xl font-bold text-gray-900">Supplier Management</h1>
        </div>
        <button 
          *ngIf="canAccess(['admin'])"
          (click)="showAddSupplierForm = true" 
          class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <span class="mr-2">+</span> Add New Supplier
        </button>
      </div>

      <!-- Loading Indicator -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>

      <!-- Add/Edit Supplier Form -->
      <div *ngIf="showAddSupplierForm || showEditSupplierForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">{{ showEditSupplierForm ? 'Edit Supplier' : 'Add New Supplier' }}</h2>
            <button 
              (click)="cancelForm()" 
              class="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>

          <form [formGroup]="supplierForm" (ngSubmit)="submitForm()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input 
                  type="text" 
                  formControlName="name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter supplier name"
                >
                <div *ngIf="supplierForm.get('name')?.invalid && supplierForm.get('name')?.touched" class="text-red-500 text-sm mt-1">
                  Supplier name is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  formControlName="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter email address"
                >
                <div *ngIf="supplierForm.get('email')?.invalid && supplierForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
                  Valid email is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="text" 
                  formControlName="phone"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter phone number"
                >
                <div *ngIf="supplierForm.get('phone')?.invalid && supplierForm.get('phone')?.touched" class="text-red-500 text-sm mt-1">
                  Phone number is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  formControlName="address"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter address"
                >
                <div *ngIf="supplierForm.get('address')?.invalid && supplierForm.get('address')?.touched" class="text-red-500 text-sm mt-1">
                  Address is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input 
                  type="text" 
                  formControlName="gst"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter GST number"
                >
                <div *ngIf="supplierForm.get('gst')?.invalid && supplierForm.get('gst')?.touched" class="text-red-500 text-sm mt-1">
                  GST number is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                <input 
                  type="text" 
                  formControlName="pan"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter PAN number"
                >
                <div *ngIf="supplierForm.get('pan')?.invalid && supplierForm.get('pan')?.touched" class="text-red-500 text-sm mt-1">
                  PAN number is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Supplier Code</label>
                <input 
                  type="text" 
                  formControlName="supplierCode"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter supplier code"
                >
                <div *ngIf="supplierForm.get('supplierCode')?.invalid && supplierForm.get('supplierCode')?.touched" class="text-red-500 text-sm mt-1">
                  Supplier code is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                <select 
                  multiple
                  formControlName="categories"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 max-h-32 overflow-y-auto"
                  style="display: block; position: relative; z-index: 10;"
                >
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="IT Equipment">IT Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Software">Software</option>
                  <option value="Services">Services</option>
                  <option value="Raw Materials">Raw Materials</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  formControlName="isActive"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option [ngValue]="true">Active</option>
                  <option [ngValue]="false">Inactive</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button 
                type="button"
                (click)="cancelForm()" 
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                [disabled]="supplierForm.invalid || submitting"
                class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed"
              >
                {{ submitting ? 'Saving...' : (showEditSupplierForm ? 'Update Supplier' : 'Add Supplier') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Supplier List -->
      <div *ngIf="!loading" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Suppliers</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">A list of all suppliers in the system</p>
        </div>
        
        <!-- Search and Filter -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div class="w-full md:w-1/3">
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                (input)="filterSuppliers()"
                placeholder="Search suppliers..." 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
            </div>
            <div class="flex space-x-2">
              <select 
                [(ngModel)]="statusFilter" 
                (change)="filterSuppliers()"
                class=" py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select 
                [(ngModel)]="categoryFilter" 
                (change)="filterSuppliers()"
                class=" py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="IT Equipment">IT Equipment</option>
                <option value="Furniture">Furniture</option>
                <option value="Software">Software</option>
                <option value="Services">Services</option>
                <option value="Raw Materials">Raw Materials</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categories
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let supplier of filteredSuppliers" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ supplier.name }}</div>
                      <div class="text-sm text-gray-500">Code: {{ supplier.supplierCode }}</div>
                      <div class="text-sm text-gray-500">GST: {{ supplier.gst }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ supplier.email }}</div>
                  <div class="text-sm text-gray-500">{{ supplier.phone }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span 
                      *ngFor="let category of supplier.categories" 
                      class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800"
                    >
                      {{ category }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="text-sm text-gray-900 mr-1">{{ supplier.qualityRating }}/5</span>
                    <div class="flex text-yellow-400" style="z-index: 1;">
                      <span *ngFor="let star of getStars(supplier.qualityRating)">★</span>
                    </div>
                  </div>
                  <div class="flex items-center mt-1">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        class="bg-green-600 h-2 rounded-full" 
                        [style.width.%]="supplier.onTimeDeliveryRate"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-500">{{ supplier.onTimeDeliveryRate }}% on-time</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full" 
                    [ngClass]="supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ supplier.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    *ngIf="canAccess(['admin'])"
                    (click)="editSupplier(supplier)" 
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button 
                    *ngIf="canAccess(['admin'])"
                    (click)="deleteSupplier(supplier._id)" 
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr *ngIf="filteredSuppliers.length === 0">
                <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                  <div class="flex flex-col items-center justify-center">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="mt-2 text-lg font-medium">No suppliers found</p>
                    <p class="mt-1">{{ searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Add a new supplier to get started' }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  loading = true;
  submitting = false;
  showAddSupplierForm = false;
  showEditSupplierForm = false;
  searchTerm = '';
  statusFilter = 'all';
  categoryFilter = 'all';
  supplierForm: FormGroup;
  currentSupplier: Supplier | null = null;
  currentUser: any = null;

  constructor(
    private supplierService: SupplierService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.supplierForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      gst: ['', Validators.required],
      pan: ['', Validators.required],
      supplierCode: ['SUP-' + Math.floor(100000 + Math.random() * 900000), Validators.required],
      categories: [[]],
      rating: [3],
      onTimeDeliveryRate: [0],
      qualityRating: [3],
      totalOrders: [0],
      completedOrders: [0],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.currentUser = this.authService.getCurrentUser();
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  loadSuppliers(): void {
    this.loading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filteredSuppliers = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.loading = false;
      }
    });
  }

  filterSuppliers(): void {
    this.filteredSuppliers = this.suppliers.filter(supplier => {
      // Filter by search term
      const matchesSearch = this.searchTerm ? 
        supplier.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.gst.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.pan.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      
      // Filter by status
      const matchesStatus = this.statusFilter === 'all' ? true :
        this.statusFilter === 'active' ? supplier.isActive : !supplier.isActive;
      
      // Filter by category
      const matchesCategory = this.categoryFilter === 'all' ? true :
        supplier.categories.includes(this.categoryFilter);
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  editSupplier(supplier: Supplier): void {
    this.currentSupplier = supplier;
    this.supplierForm.patchValue({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      gst: supplier.gst,
      pan: supplier.pan,
      supplierCode: supplier.supplierCode || ('SUP-' + Math.floor(100000 + Math.random() * 900000)),
      categories: supplier.categories,
      isActive: supplier.isActive
    });
    this.showEditSupplierForm = true;
  }

  deleteSupplier(id?: string): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => {
          this.suppliers = this.suppliers.filter(s => s._id !== id);
          this.filterSuppliers();
        },
        error: (error) => {
          console.error('Error deleting supplier:', error);
        }
      });
    }
  }

  submitForm(): void {
    if (this.supplierForm.invalid) return;
    
    this.submitting = true;
    const supplierData = this.supplierForm.value;
    
    if (this.showEditSupplierForm && this.currentSupplier?._id) {
      // Update existing supplier
      this.supplierService.updateSupplier(this.currentSupplier._id, supplierData).subscribe({
        next: (updatedSupplier) => {
          const index = this.suppliers.findIndex(s => s._id === updatedSupplier._id);
          if (index !== -1) {
            this.suppliers[index] = updatedSupplier;
          }
          this.filterSuppliers();
          this.cancelForm();
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error updating supplier:', error);
          this.submitting = false;
        }
      });
    } else {
      // Create new supplier
      this.supplierService.createSupplier(supplierData).subscribe({
        next: (newSupplier) => {
          this.suppliers.unshift(newSupplier);
          this.filterSuppliers();
          this.cancelForm();
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error creating supplier:', error);
          this.submitting = false;
        }
      });
    }
  }

  cancelForm(): void {
    this.showAddSupplierForm = false;
    this.showEditSupplierForm = false;
    this.currentSupplier = null;
    this.supplierForm.reset({
      isActive: true,
      categories: []
    });
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  canAccess(roles: string[]): boolean {
    const currentUser = this.authService.currentUserValue;
    return !!currentUser && roles.includes(currentUser.role);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}