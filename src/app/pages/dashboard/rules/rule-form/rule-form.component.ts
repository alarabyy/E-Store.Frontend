import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastService } from '../../../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RulesService } from '../services/rules.service';
import { CreateRuleRequest, UpdateRuleRequest } from '../models/rules.models';

@Component({
    selector: 'app-rule-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="dashboard-container fade-in">
      <div class="header">
        <h1>{{ isEditing ? 'Edit Rule' : 'Create New Rule' }}</h1>
        <a routerLink="/dashboard/rules" class="btn-secondary">
          <i class="ri-arrow-left-line"></i> Back to Rules
        </a>
      </div>

      <div class="form-panel glass-panel">
        <form [formGroup]="ruleForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label for="name">Rule Name</label>
            <input type="text" id="name" formControlName="name" placeholder="e.g. Content Manager" 
                [class.error]="ruleForm.get('name')?.invalid && ruleForm.get('name')?.touched">
            <small *ngIf="ruleForm.get('name')?.invalid && ruleForm.get('name')?.touched" class="error-msg">
                Name is required
            </small>
          </div>

          <div class="form-group">
            <label for="contentLimit">Content Limit (0 for Unlimited)</label>
            <input type="number" id="contentLimit" formControlName="contentLimit">
          </div>

          <div class="form-group">
            <label>Permissions</label>
            <p class="helper-text">Select the permissions for this rule.</p>
            
            <div class="permissions-grid">
                <div *ngFor="let group of availablePermissions" class="perm-group">
                    <h4 class="group-title">{{ group.category }}</h4>
                    <div class="options-list">
                        <label *ngFor="let perm of group.items" class="checkbox-label" [class.checked]="hasPermission(perm.value)">
                            <input type="checkbox" [checked]="hasPermission(perm.value)" (change)="togglePermission(perm.value)">
                            <span class="custom-checkbox"></span>
                            <span class="label-text">{{ perm.label }}</span>
                        </label>
                    </div>
                </div>
            </div>
            <small *ngIf="permissions.length === 0 && ruleForm.touched" class="warning-text">Note: No permissions selected.</small>
          </div>

          <div class="form-actions">
            <button type="button" routerLink="/dashboard/rules" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-submit" [disabled]="ruleForm.invalid || isLoading">
                {{ isLoading ? 'Saving...' : (isEditing ? 'Update Rule' : 'Create Rule') }}
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; width: 100%; }
    .dashboard-container { padding: 2rem; max-width: 900px; margin: 0 auto; }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      
      h1 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin: 0; }
    }
    
    .glass-panel {
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
    }
    
    .form-group {
      margin-bottom: 2rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #334155;
      }
      
      input[type="text"], input[type="number"] {
        width: 100%;
        padding: 0.85rem 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        font-size: 1rem;
        transition: all 0.2s;
        
        &:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        
        &.error { border-color: #ef4444; }
      }
    }
    
    .helper-text { color: #64748b; font-size: 0.9rem; margin-top: -0.25rem; margin-bottom: 1rem; }
    .warning-text { color: #f59e0b; font-size: 0.85rem; display: block; margin-top: 0.5rem; }

    /* Permissions Grid */
    .permissions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        background: #f8fafc;
        padding: 1.5rem;
        border-radius: 16px;
        border: 1px solid #f1f5f9;
    }

    .perm-group {
        background: white;
        padding: 1rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
    }

    .group-title {
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
        text-transform: uppercase;
        color: #64748b;
        font-weight: 700;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 0.5rem;
    }

    .options-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        font-size: 0.95rem;
        color: #334155;
        user-select: none;
        transition: color 0.2s;

        &:hover { color: #4f46e5; }
        
        input { display: none; } /* Hide default checkbox */
        
        .custom-checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid #cbd5e1;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            position: relative;
        }

        &.checked .custom-checkbox {
            background: #4f46e5;
            border-color: #4f46e5;
            
            &::after {
                content: '✓';
                color: white;
                font-size: 14px;
                font-weight: bold;
            }
        }
    }
    
    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid #f1f5f9;
        
        button {
            padding: 0.85rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
            
            &.btn-cancel {
                background: white;
                border: 1px solid #e2e8f0;
                color: #64748b;
                &:hover { background: #f8fafc; color: #334155; }
            }
            
            &.btn-submit {
                background: linear-gradient(135deg, #4f46e5, #4338ca);
                color: white;
                border: none;
                box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
                
                &:hover {
                    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
                    transform: translateY(-2px);
                }
                
                &:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
            }
        }
    }
    
    .btn-secondary {
        color: #64748b;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        transition: color 0.2s;
        
        &:hover { color: #334155; }
    }
    
    .error-msg { color: #ef4444; font-size: 0.85rem; margin-top: 0.5rem; display: block; }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
        .dashboard-container { padding: 1rem; }
        .header {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
            text-align: center;
            h1 { font-size: 1.5rem; width: 100%; }
            .btn-secondary { width: 100%; justify-content: center; }
        }
        .glass-panel { padding: 1.5rem 1rem; }
        .form-actions {
            flex-direction: column-reverse;
            gap: 1rem;
            button { width: 100%; }
        }
        .permissions-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RuleFormComponent implements OnInit {
    isEditing = false;
    ruleId: number | null = null;
    isLoading = false;
    ruleForm: FormGroup;

    rulesService = inject(RulesService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    fb = inject(FormBuilder);
    toastService = inject(ToastService);
    cdr = inject(ChangeDetectorRef);

    // Defined available permissions
    availablePermissions = [
        {
            category: 'Dashboard',
            items: [
                { label: 'View Dashboard', value: 'Permissions.Dashboard.View' }
            ]
        },
        {
            category: 'Roles Management',
            items: [
                { label: 'View Roles', value: 'Permissions.Roles.View' },
                { label: 'Create Roles', value: 'Permissions.Roles.Create' },
                { label: 'Edit Roles', value: 'Permissions.Roles.Edit' },
                { label: 'Delete Roles', value: 'Permissions.Roles.Delete' }
            ]
        },
        {
            category: 'Users Management',
            items: [
                { label: 'View Users', value: 'Permissions.Users.View' },
                { label: 'Edit Users', value: 'Permissions.Users.Edit' },
                { label: 'Delete Users', value: 'Permissions.Users.Delete' },
                { label: 'Update User Roles', value: 'Permissions.Users.UpdateRoles' },
                { label: 'Update User Permissions', value: 'Permissions.Users.UpdatePermissions' }
            ]
        }
    ];

    constructor() {
        this.ruleForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            contentLimit: [0],
            permissions: this.fb.array([])
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditing = true;
                this.ruleId = +params['id'];
                this.loadRule(this.ruleId);
            }
        });
    }

    get permissions() {
        return this.ruleForm.get('permissions') as FormArray;
    }

    hasPermission(value: string): boolean {
        return this.permissions.value.includes(value);
    }

    togglePermission(value: string) {
        const index = this.permissions.value.indexOf(value);
        if (index === -1) {
            this.permissions.push(this.fb.control(value));
        } else {
            this.permissions.removeAt(index);
        }
    }

    loadRule(id: number) {
        this.isLoading = true;
        this.rulesService.getRuleById(id).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.ruleForm.patchValue({
                        name: res.data.name,
                        contentLimit: res.data.contentLimit
                    });

                    // Clear and reload permissions
                    this.permissions.clear();
                    if (res.data.permissions) {
                        res.data.permissions.forEach(p => {
                            // Only add if it's not already there (safety check)
                            if (!this.hasPermission(p)) {
                                this.permissions.push(this.fb.control(p));
                            }
                        });
                    }
                    this.cdr.detectChanges();
                }
                this.isLoading = false;
            },
            error: (err) => {
                const msg = err?.error?.error?.message || err?.error?.message || 'Failed to load rule';
                this.toastService.error(msg);
                this.isLoading = false;
            }
        });
    }

    onSubmit() {
        if (this.ruleForm.invalid) return;

        this.isLoading = true;
        const formData = this.ruleForm.value;

        if (this.isEditing && this.ruleId) {
            const updateData: UpdateRuleRequest = {
                name: formData.name,
                contentLimit: formData.contentLimit,
                permissions: formData.permissions
            };

            this.rulesService.updateRule(this.ruleId, updateData).subscribe({
                next: () => {
                    this.toastService.success('Rule updated successfully');
                    this.router.navigate(['/dashboard/rules']);
                },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update rule';
                    this.toastService.error(msg);
                    this.isLoading = false;
                }
            });
        } else {
            const createData: CreateRuleRequest = {
                name: formData.name,
                contentLimit: formData.contentLimit,
                permissions: formData.permissions
            };

            this.rulesService.createRule(createData).subscribe({
                next: () => {
                    this.toastService.success('Rule created successfully');
                    this.router.navigate(['/dashboard/rules']);
                },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to create rule';
                    this.toastService.error(msg);
                    this.isLoading = false;
                }
            });
        }
    }
}
