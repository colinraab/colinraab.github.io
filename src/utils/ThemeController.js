/**
 * Theme Controller
 * Handles dark/light mode switching
 */

export class ThemeController {
  constructor() {
    this.theme = this.getStoredTheme() || 'dark';
    this.callbacks = [];
    this.init();
  }

  init() {
    this.applyTheme();
    this.setupMediaQuery();
  }

  getStoredTheme() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme');
    }
    return null;
  }

  setStoredTheme(theme) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }

  setupMediaQuery() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addListener(() => {
        if (!this.getStoredTheme()) {
          this.theme = mediaQuery.matches ? 'dark' : 'light';
          this.applyTheme();
        }
      });
    }
  }

  applyTheme() {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', this.theme);
      document.documentElement.classList.remove('theme-light', 'theme-dark');
      document.documentElement.classList.add(`theme-${this.theme}`);
    }
    
    this.callbacks.forEach(callback => callback(this.theme));
  }

  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.setStoredTheme(this.theme);
    this.applyTheme();
    return this.theme;
  }

  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.theme = theme;
      this.setStoredTheme(theme);
      this.applyTheme();
    }
  }

  getCurrentTheme() {
    return this.theme;
  }

  onThemeChange(callback) {
    this.callbacks.push(callback);
    // Call immediately with current theme
    callback(this.theme);
  }

  removeThemeChangeListener(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
}
