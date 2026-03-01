import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../components/models/api-response.model';
import {
    User,
    UserListResponse,
    UpdateUserPermissionsRequest,
    UpdateUserRoleRequest
} from '../models/user.models';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private apiUrl = `${environment.apiUrl}/users-dashboard`;
    private http = inject(HttpClient);

    getAllUsers(page: number = 1, pageSize: number = 10, search: string = ''): Observable<UserListResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<UserListResponse>(`${this.apiUrl}/list`, { params });
    }

    getUserById(id: number): Observable<ApiResponse<User>> {
        return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
    }

    deleteUser(userId: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/delete/${userId}`);
    }

    updateUserPermissions(userId: number, permissions: string[]): Observable<ApiResponse<void>> {
        const payload: UpdateUserPermissionsRequest = { permissions };
        return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${userId}/permissions`, payload);
    }

    updateUserRole(userId: number, roleName: string): Observable<ApiResponse<void>> {
        const payload: UpdateUserRoleRequest = { roleName };
        return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${userId}/roles`, payload);
    }

    updateUserProfile(formData: FormData): Observable<ApiResponse<void>> {
        return this.http.put<ApiResponse<void>>(`${this.apiUrl}/update/profile`, formData);
    }
}
