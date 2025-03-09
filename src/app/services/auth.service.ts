import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { User, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private apiUrl = 'http://localhost:3000'; // JSON Server URL
  private apiUrl = 'https://json-server-backend-en89.onrender.com'; // JSON Server URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    const user = localStorage.getItem('current_user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(user: Omit<User, 'id'>): Observable<AuthResponse> {
    // First check if user with this email already exists
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${user.email}`).pipe(
      switchMap(users => {
        if (users.length > 0) {
          // User already exists
          throw new Error('User with this email already exists');
        }
        
        // Create a new user with empty registeredEvents array
        const newUser = {
          ...user,
          registeredEvents: []
        };
        
        // Create a new user
        return this.http.post<User>(`${this.apiUrl}/users`, newUser);
      }),
      map(newUser => {
        // Generate a mock token
        const token = 'mock-jwt-token-' + Math.random().toString(36).substr(2);
        const authResponse: AuthResponse = { user: newUser, token };
        
        this.handleAuthentication(authResponse);
        return authResponse;
      }),
      catchError(error => {
        console.error('Registration failed', error);
        throw error;
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}&password=${password}`).pipe(
      map(users => {
        if (users.length === 0) {
          throw new Error('Invalid email or password');
        }
        
        const user = users[0];
        const token = 'mock-jwt-token-' + Math.random().toString(36).substr(2);
        return { user, token } as AuthResponse;
      }),
      tap(response => this.handleAuthentication(response)),
      catchError(error => {
        console.error('Login failed', error);
        return of({ user: null, token: null } as unknown as AuthResponse);
      })
    );
  }

  private handleAuthentication(response: AuthResponse): void {
    if (response && response.user && response.token) {
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    }
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'admin';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
} 