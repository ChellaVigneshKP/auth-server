class ThemeManager {
    constructor() {
        this.theme = window.__initialTheme || this.detectTheme();
        this.init();
    }

    detectTheme() {
        try {
            return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        } catch {
            return 'light';
        }
    }

    init() {
        // Show content now that theme is ready
        this.showContent();
        this.updateIcon();
        this.bindEvents();

        // Listen for system theme changes
        this.watchSystemTheme();
    }

    showContent() {
        document.body.classList.remove('no-theme-flash');
        document.body.classList.add('theme-loaded');
    }

    applyTheme(theme, withTransition = true) {
        const html = document.documentElement;

        if (!withTransition) {
            html.classList.add('no-transition');
        }

        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }

        // Force reflow
        void html.offsetWidth;

        if (!withTransition) {
            setTimeout(() => {
                html.classList.remove('no-transition');
            }, 10);
        }

        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
        }

        this.theme = theme;
        this.updateIcon();
    }

    updateIcon() {
        const icon = document.querySelector('.theme-toggle i');
        if (icon) {
            icon.className = this.theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
    }

    toggle() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme, true);
    }

    bindEvents() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }
    }

    watchSystemTheme() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only apply system theme if no user preference is saved
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light', true);
                }
            });
        }
    }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeManager();
    });
} else {
    new ThemeManager();
}

// Fallback initialization
setTimeout(() => {
    if (!window.themeManagerInitialized) {
        new ThemeManager();
    }
}, 100);