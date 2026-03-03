import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastService } from '../../../components/toast/services/toast.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UsersService } from './services/users.service';
import { RulesService as RolesService } from '../rules/services/rules.service';
import { User } from './models/user.models';
import { Rule as Role } from '../rules/models/rules.models';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
    users: User[] = [];
    totalCount = 0;
    currentPage = 1;
    pageSize = 10;
    totalPages = 0;
    isLoading = false;
    searchControl = new FormControl('');

    // Modal State
    showModal = false;
    selectedUser: User | null = null;
    availableRoles: Role[] = [];

    // Forms
    roleForm: FormGroup;
    permissionsForm: FormGroup;
    activeTab: 'roles' | 'permissions' = 'roles';

    private usersService = inject(UsersService);
    private rolesService = inject(RolesService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);
    private toastService = inject(ToastService);

    constructor() {
        this.roleForm = this.fb.group({
            roleName: ['', Validators.required]
        });

        this.permissionsForm = this.fb.group({
            permissions: ['', Validators.required] // Comma separated for now
        });
    }

    ngOnInit() {
        this.loadUsers();
        this.loadRoles();

        this.searchControl.valueChanges.pipe(
            debounceTime(150),
            distinctUntilChanged()
        ).subscribe(value => {
            this.currentPage = 1;
            this.loadUsers(value || '');
        });
    }

    loadUsers(search: string = '') {
        this.isLoading = true;
        this.usersService.getAllUsers(this.currentPage, this.pageSize, search).subscribe({
            next: (res: any) => {
                // Handle casing differences (camelCase vs PascalCase)
                const data = res.data || res.Data || [];

                this.users = Array.isArray(data) ? data.map((u: any) => ({
                    id: u.id || u.Id,
                    firstName: u.firstName || u.FirstName,
                    lastName: u.lastName || u.LastName,
                    username: u.username || u.Username,
                    email: u.email || u.Email,
                    emailConfirmed: u.emailConfirmed ?? u.EmailConfirmed,
                    bio: u.bio || u.Bio,
                    avatarUrl: u.avatarUrl || u.AvatarUrl,
                    role: u.role || u.Role,
                    lockoutEnabled: u.lockoutEnabled ?? u.LockoutEnabled,
                    lockoutEnd: u.lockoutEnd || u.LockoutEnd
                })) : [];

                this.totalCount = res.totalCount || res.TotalCount || 0;
                this.totalPages = res.totalPages || res.TotalPages || 0;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                const msg = err?.error?.error?.message || err?.error?.message || 'Failed to load users';
                this.toastService.error(msg);
                this.isLoading = false;
            }
        });
    }

    loadRoles() {
        this.rolesService.getAllRules().subscribe((res: any) => {
            const rolesData = res.data || res.Data || [];
            this.availableRoles = Array.isArray(rolesData) ? rolesData.map((r: any) => ({
                id: r.id || r.Id,
                name: r.name || r.Name,
                permissions: r.permissions || r.Permissions || [],
                contentLimit: r.contentLimit || r.ContentLimit
            })) : [];
        });
    }

    onPageChange(page: number) {
        this.currentPage = page;
        this.loadUsers(this.searchControl.value || '');
    }

    deleteUser(id: number) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.usersService.deleteUser(id).subscribe({
                next: () => {
                    this.toastService.success('User deleted successfully');
                    this.loadUsers();
                },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to delete user';
                    this.toastService.error(msg);
                }
            });
        }
    }

    openEditModal(user: User) {
        this.selectedUser = user;
        this.showModal = true;
        this.activeTab = 'roles';

        // Pre-fill forms if applicable (assuming user object has current role/permissions)
        this.roleForm.patchValue({ roleName: user.role || '' });
        // Permissions logic might require fetching specific user details if not in list
    }

    closeModal() {
        this.showModal = false;
        this.selectedUser = null;
    }

    updateRole() {
        if (this.selectedUser && this.roleForm.valid) {
            this.usersService.updateUserRole(this.selectedUser.id, this.roleForm.value.roleName)
                .subscribe({
                    next: () => {
                        this.toastService.success('Role updated successfully');
                        this.loadUsers();
                        this.closeModal();
                    },
                    error: (err) => {
                        const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update role';
                        this.toastService.error(msg);
                    }
                });
        }
    }

    updatePermissions() {
        if (this.selectedUser && this.permissionsForm.valid) {
            const perms = this.permissionsForm.value.permissions.split(',').map((p: string) => p.trim());
            this.usersService.updateUserPermissions(this.selectedUser.id, perms)
                .subscribe({
                    next: () => {
                        this.toastService.success('Permissions updated successfully');
                        this.closeModal();
                    },
                    error: (err) => {
                        const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update permissions';
                        this.toastService.error(msg);
                    }
                });
        }
    }
}
