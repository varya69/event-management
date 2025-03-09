import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeKey = 'theme_mode';
  private darkThemeClass = 'dark-theme';
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem(this.themeKey) as ThemeMode;
    
    // If no saved preference, check system preference
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light', false);
    } else {
      this.setTheme(savedTheme, false);
    }
  }

  public toggleTheme(): void {
    const newTheme = this.isDarkModeSubject.value ? 'light' : 'dark';
    this.setTheme(newTheme, true);
  }

  public setTheme(theme: ThemeMode, savePreference: boolean = true): void {
    const isDark = theme === 'dark';
    
    // Update DOM
    if (isDark) {
      document.body.classList.add(this.darkThemeClass);
    } else {
      document.body.classList.remove(this.darkThemeClass);
    }
    
    // Save preference if requested
    if (savePreference) {
      localStorage.setItem(this.themeKey, theme);
    }
    
    // Update subject
    this.isDarkModeSubject.next(isDark);
  }

  public getCurrentTheme(): ThemeMode {
    return this.isDarkModeSubject.value ? 'dark' : 'light';
  }
} 