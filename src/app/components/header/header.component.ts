import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isDarkMode$: Observable<boolean>;
  
  constructor(
    private authService: AuthService, 
    private router: Router,
    private themeService: ThemeService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.logout();
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
  
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
} 