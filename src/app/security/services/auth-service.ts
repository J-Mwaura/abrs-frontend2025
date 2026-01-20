import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import * as jwtDecode from 'jwt-decode';
import { PasswordLoginRequest } from 'src/app/dtos/security/password-login-request';
import { PinLoginRequest } from 'src/app/dtos/security/pin-login-request';
import { JwtResponse } from 'src/app/dtos/security/response/JwtResponse ';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private baseUrl = environment.apiUrl + 'api/auth';
  private accessTokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';
  private rolesKey = 'roles';

  constructor(private http: HttpClient) {}

  // ----------------------
  // Password login
  // ----------------------
  loginWithPassword(request: PasswordLoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(
      `${this.baseUrl}/login/password`,
      request
    ).pipe(
      tap((response) => this.storeTokens(response))
    );
  }

  // ----------------------
  // PIN login
  // ----------------------
  loginWithPin(request: PinLoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(
      `${this.baseUrl}/login/pin`,
      request
    ).pipe(
      tap((response) => this.storeTokens(response))
    );
  }

  // ----------------------
  // Refresh token
  // ----------------------
  refreshToken(): Observable<JwtResponse> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) throw new Error('No refresh token found');

    return this.http.post<JwtResponse>(
      `${this.baseUrl}/refresh-token`,
      { refreshToken }
    ).pipe(
      tap((response) => this.storeTokens(response))
    );
  }

  // ----------------------
  // Logout
  // ----------------------
  logout(): Observable<any> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    return this.http.post<any>(
      `${this.baseUrl}/logout`,
      { refreshToken }
    ).pipe(
      tap(() => this.clearTokens())
    );
  }

  // ----------------------
  // Token & roles helpers
  // ----------------------
  private storeTokens(response: JwtResponse) {
    localStorage.setItem(this.accessTokenKey, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    }
    if (response.roles) {
      localStorage.setItem(this.rolesKey, JSON.stringify(response.roles));
    }
  }

  private clearTokens() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.rolesKey);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  // ----------------------
  // Roles handling
  // ----------------------
  getRoles(): string[] {
    const roles = localStorage.getItem(this.rolesKey);
    return roles ? JSON.parse(roles) : [];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasAnyRole(allowedRoles: string[]): boolean {
    const roles = this.getRoles();
    return allowedRoles.some(r => roles.includes(r));
  }

  // ----------------------
  // Decode JWT roles (optional)
  // ----------------------
  getRolesFromToken(): string[] {
    const token = this.getAccessToken();
    if (!token) return [];
    const decoded: any = (jwtDecode as any).default(token);
    return decoded['authz.roles'] || [];
  }
}
