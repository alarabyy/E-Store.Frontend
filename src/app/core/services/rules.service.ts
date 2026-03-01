import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Rule, CreateRuleRequest, UpdateRuleRequest, RuleListResponse, RuleDetailResponse } from '../../pages/dashboard/rules/models/rules.models';

@Injectable({
    providedIn: 'root'
})
export class RulesService {
    private apiUrl = `${environment.apiUrl}/roles-dashboard`;
    private http = inject(HttpClient);

    getAllRules(): Observable<RuleListResponse> {
        return this.http.get<RuleListResponse>(`${this.apiUrl}/all`);
    }

    getRuleById(roleId: number): Observable<RuleDetailResponse> {
        return this.http.get<RuleDetailResponse>(`${this.apiUrl}/${roleId}`);
    }

    createRule(rule: CreateRuleRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/create`, rule);
    }

    updateRule(roleId: number, rule: UpdateRuleRequest): Observable<ApiResponse<void>> {
        return this.http.put<ApiResponse<void>>(`${this.apiUrl}/edit/${roleId}`, rule);
    }

    deleteRule(roleId: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/delete/${roleId}`);
    }
}
