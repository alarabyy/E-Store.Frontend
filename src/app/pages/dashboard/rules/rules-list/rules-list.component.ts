import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastService } from '../../../../components/toast/services/toast.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RulesService } from '../services/rules.service';
import { Rule } from '../models/rules.models';

@Component({
  selector: 'app-rules-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container fade-in">
      <div class="header">
        <h1>Rules Management</h1>
        <a routerLink="create" class="btn-primary">
          <i class="ri-add-line"></i> Add New Rule
        </a>
      </div>

      <div class="cards-grid">
        <div *ngFor="let rule of rules" class="rule-card">
          <div class="card-header">
            <div class="rule-info">
                <span class="id-badge">#{{ rule.id }}</span>
                <h3>{{ rule.name }}</h3>
            </div>
            <span class="badge limit-badge" [class.unlimited]="!rule.contentLimit">
                {{ rule.contentLimit ? rule.contentLimit + ' Limit' : 'Unlimited' }}
            </span>
          </div>
          
          <div class="card-body">
            <div class="permissions-section">
                <span class="label">Permissions</span>
                <div class="permissions-list">
                    <span *ngFor="let perm of rule.permissions.slice(0, 3)" class="badge perm-badge">{{ perm }}</span>
                    <span *ngIf="rule.permissions.length > 3" class="more-badge">+{{ rule.permissions.length - 3 }} more</span>
                    <span *ngIf="rule.permissions.length === 0" class="no-perms">No permissions assigned</span>
                </div>
            </div>
          </div>

          <div class="card-footer">
            <a [routerLink]="['edit', rule.id]" class="btn-action edit">
              <i class="ri-edit-line"></i> Edit
            </a>
            <button class="btn-action delete" (click)="deleteRule(rule.id)">
              <i class="ri-delete-bin-line"></i> Delete
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="rules.length === 0 && !isLoading" class="empty-state">
            <div class="icon">🛡️</div>
            <h3>No rules found</h3>
            <p>Create a new rule to get started.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    
    .dashboard-container { 
        padding: 2rem; 
        max-width: 1600px; 
        margin: 0 auto; 
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      
      h1 { 
          font-size: 2rem; 
          font-weight: 800; 
          color: #1e293b; 
          margin: 0;
          letter-spacing: -0.5px;
      }
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #4f46e5, #4338ca);
      color: white;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
      }
    }

    /* Cards Grid Layout */
    .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 1.5rem;
    }
    
    .rule-card {
        background: white;
        border-radius: 20px;
        border: 1px solid #f1f5f9;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        
        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1);
            border-color: #e2e8f0;
        }
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        
        .rule-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            
            .id-badge {
                background: #f1f5f9;
                color: #64748b;
                font-size: 0.75rem;
                padding: 2px 6px;
                border-radius: 6px;
                font-weight: 600;
            }
            
            h3 {
                margin: 0;
                font-size: 1.25rem;
                color: #1e293b;
                font-weight: 700;
            }
        }
    }

    .card-body {
        flex: 1;
        margin-bottom: 1.5rem;
        
        .label {
            display: block;
            color: #94a3b8;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.75rem;
        }
    }

    .permissions-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .badge {
        padding: 6px 10px;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 600;
        
        &.limit-badge {
            background: #fff1f2;
            color: #e11d48;
            border: 1px solid #ffe4e6;
            
            &.unlimited {
                background: #ecfdf5;
                color: #059669;
                border-color: #d1fae5;
            }
        }
        
        &.perm-badge {
            background: #eff6ff;
            color: #4f46e5;
            border: 1px solid #e0e7ff;
        }
    }
    
    .more-badge {
        font-size: 0.8rem;
        color: #64748b;
        background: #f8fafc;
        padding: 6px 10px;
        border-radius: 8px;
        border: 1px solid #f1f5f9;
        font-weight: 600;
    }
    
    .no-perms {
        color: #94a3b8;
        font-style: italic;
        font-size: 0.9rem;
    }

    .card-footer {
        display: flex;
        gap: 1rem;
        padding-top: 1.25rem;
        border-top: 1px solid #f1f5f9;
        
        .btn-action {
            flex: 1;
            padding: 0.75rem;
            border-radius: 10px;
            border: none;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            text-decoration: none;
            transition: all 0.2s;
            
            &.edit {
                background: #f8fafc;
                color: #475569;
                &:hover { background: #eff6ff; color: #4f46e5; }
            }
            
            &.delete {
                background: #fef2f2;
                color: #ef4444;
                &:hover { background: #fee2e2; }
            }
        }
    }
    
    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem;
        background: white;
        border-radius: 20px;
        border: 2px dashed #e2e8f0;
        color: #64748b;
        
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        h3 { color: #1e293b; margin: 0 0 0.5rem 0; font-size: 1.25rem; font-weight: 700; }
        p { margin: 0; }
    }
    
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* Mobile Responsive */
    @media (max-width: 768px) {
        .dashboard-container { padding: 1.5rem 1rem; }
        
        .header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
            
            h1 { font-size: 1.75rem; }
            .btn-primary { width: 100%; justify-content: center; }
        }
        
        .cards-grid {
            grid-template-columns: 1fr;
        }
    }
  `]
})
export class RulesListComponent implements OnInit {
  rules: Rule[] = [];
  isLoading = true;
  rulesService = inject(RulesService);
  toastService = inject(ToastService);
  cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadRules();
  }

  loadRules() {
    this.isLoading = true;
    this.rulesService.getAllRules().subscribe({
      next: (res: any) => {
        // Fallback for different response structures
        // Check for res.data (standard), res.Data (PascalCase), or if res itself is the array
        let rulesData = res.data || res.Data;

        if (!rulesData && Array.isArray(res)) {
          rulesData = res;
        }

        if (Array.isArray(rulesData)) {
          this.rules = rulesData.map((r: any) => ({
            id: r.id || r.Id,
            name: r.name || r.Name,
            permissions: r.permissions || r.Permissions || [],
            contentLimit: r.contentLimit || r.ContentLimit
          }));
        } else {
          this.rules = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const msg = err?.error?.error?.message || err?.error?.message || 'Failed to load rules';
        this.toastService.error(msg);
        this.isLoading = false;
      }
    });
  }

  deleteRule(id: number) {
    if (confirm('Are you sure you want to delete this rule? This cannot be undone.')) {
      this.rulesService.deleteRule(id).subscribe({
        next: () => {
          this.toastService.success('Rule deleted successfully');
          this.loadRules();
        },
        error: (err: any) => {
          const msg = err?.error?.error?.message || err?.error?.message || 'Failed to delete rule';
          this.toastService.error(msg);
        }
      });
    }
  }
}
