import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequisitionService } from '../../services/requisition.service';
import { AuthService } from '../../services/auth.service';
import { Requisition, RequisitionItem } from '../../models/requisition.model';

@Component({
  selector: 'app-requisitions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-blue-600">Buy2Pay</h1>
            <span class="ml-4 text-gray-500">Purchase Requisitions</span>
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
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="mb-8">
        <div class="flex items-center mb-4">
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Purchase Requisitions</h1>
        <p class="mt-2 text-gray-600">Manage your procurement requests</p>
      </div>

      <!-- Create New Requisition -->
      <div class="bg-white shadow rounded-lg mb-8" *ngIf="canCreateRequisition()">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Create New Requisition</h3>
        </div>
        <div class="p-6">
          <form [formGroup]="requisitionForm" (ngSubmit)="createRequisition()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select 
                  formControlName="department"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select 
                  formControlName="priority"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Justification</label>
              <textarea
                formControlName="justification"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide justification for this requisition"
              ></textarea>
            </div>

            <!-- Items Section -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-4">
                <h4 class="text-lg font-medium text-gray-900">Items</h4>
                <button
                  type="button"
                  (click)="addItem()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Item
                </button>
              </div>

              <div formArrayName="items" class="space-y-4">
                <div 
                  *ngFor="let item of items.controls; let i = index" 
                  [formGroupName]="i"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex justify-between items-start mb-4">
                    <h5 class="text-md font-medium text-gray-800">Item {{ i + 1 }}</h5>
                    <button
                      type="button"
                      (click)="removeItem(i)"
                      class="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                      <input
                        type="text"
                        formControlName="itemName"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter item name"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        formControlName="category"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="IT Equipment">IT Equipment</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Software">Software</option>
                        <option value="Services">Services</option>
                        <option value="Raw Materials">Raw Materials</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        formControlName="quantity"
                        (input)="calculateItemTotal(i)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="1"
                      >
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹)</label>
                      <input
                        type="number"
                        formControlName="unitPrice"
                        (input)="calculateItemTotal(i)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      >
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
                      <input
                        type="number"
                        formControlName="totalAmount"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                        readonly
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                      <input
                        type="date"
                        formControlName="deliveryDate"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                    </div>
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
                    <textarea
                      formControlName="specifications"
                      rows="2"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional specifications or requirements"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-semibold text-gray-900">Total Requisition Amount:</span>
                  <span class="text-2xl font-bold text-blue-600">₹{{ formatCurrency(getTotalAmount()) }}</span>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="button"
                (click)="goBack()"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="requisitionForm.invalid || submitting"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {{ submitting ? 'Submitting...' : 'Submit Requisition' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Existing Requisitions -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Your Requisitions</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requisition #
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount (₹)
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let requisition of requisitions" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {{ requisition.requisitionNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ requisition.department }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{{ formatCurrency(requisition.totalAmount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    [ngClass]="getPriorityClass(requisition.priority)"
                  >
                    {{ requisition.priority | titlecase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    [ngClass]="getStatusClass(requisition.status)"
                  >
                    {{ requisition.status | titlecase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(requisition.createdAt) }}
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
export class RequisitionsComponent implements OnInit {
  requisitionForm: FormGroup;
  requisitions: Requisition[] = [];
  submitting = false;
  loading = true;
  currentUser: any = null; // Initialize as null

  constructor(
    private fb: FormBuilder,
    private requisitionService: RequisitionService,
    private authService: AuthService,
    private router: Router
  ) {
    this.requisitionForm = this.fb.group({
      department: ['', Validators.required],
      priority: ['medium', Validators.required],
      justification: ['', Validators.required],
      items: this.fb.array([])
    });

    this.addItem(); // Add one item by default
  }

  ngOnInit(): void {
    this.loadRequisitions();
    this.currentUser = this.authService.getCurrentUser(); // <-- Fix: fetch user here
  }

  get items(): FormArray {
    return this.requisitionForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemForm = this.fb.group({
      itemName: ['', Validators.required],
      category: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      totalAmount: [0],
      specifications: [''],
      deliveryDate: ['', Validators.required]
    });

    this.items.push(itemForm);
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  calculateItemTotal(index: number): void {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    const totalAmount = quantity * unitPrice;
    
    item.patchValue({ totalAmount });
  }

  getTotalAmount(): number {
    return this.items.controls.reduce((total, item) => {
      return total + (item.get('totalAmount')?.value || 0);
    }, 0);
  }

  createRequisition(): void {
    if (this.requisitionForm.invalid) return;

    this.submitting = true;
    const formData = {
      ...this.requisitionForm.value,
      totalAmount: this.getTotalAmount()
    };

    this.requisitionService.createRequisition(formData).subscribe({
      next: (requisition) => {
        this.submitting = false;
        this.requisitions.unshift(requisition);
        this.requisitionForm.reset();
        this.items.clear();
        this.addItem();
        
        // Show success message with option to go back
        const goBackToDashboard = confirm('Requisition submitted successfully! Do you want to go back to the dashboard?');
        if (goBackToDashboard) {
          this.goBack();
        }
      },
      error: (error) => {
        this.submitting = false;
        alert('Error submitting requisition: ' + (error.error?.error || error.message));
      }
    });
  }

  loadRequisitions(): void {
    this.requisitionService.getRequisitions().subscribe({
      next: (requisitions) => {
        this.requisitions = requisitions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading requisitions:', error);
        this.loading = false;
      }
    });
  }

  canCreateRequisition(): boolean {
    return this.authService.hasRole(['requester', 'admin']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN').format(amount);
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString('en-IN');
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

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'modified': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}