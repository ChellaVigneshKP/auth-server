class ThemeManager {
    constructor() {
        this.theme = this.detectTheme();
        this.init();
    }

    detectTheme() {
        try {
            return localStorage.getItem('theme') ||
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        } catch {
            return 'light';
        }
    }

    init() {
        document.body.classList.remove('no-theme-flash');
        this.applyTheme(this.theme, false);
        this.bindEvents();
        this.watchSystemTheme();
    }

    applyTheme(theme, withTransition = true) {
        const html = document.documentElement;

        if (!withTransition) html.classList.add('no-transition');
        html.classList.toggle('dark', theme === 'dark');

        // Update theme in storage
        try { localStorage.setItem('theme', theme); } catch {}
        this.theme = theme;
        this.updateTurnstileTheme(theme);

        if (!withTransition) setTimeout(() => html.classList.remove('no-transition'), 10);
    }

    bindEvents() {
        document.querySelector('.theme-toggle')?.addEventListener('click', e => {
            e.preventDefault();
            const newTheme = this.theme === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme, true);
        });
    }

    watchSystemTheme() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    updateTurnstileTheme(theme) {
        const container = document.getElementById('turnstile-container');
        const siteKey = document.querySelector('meta[name="turnstile-site-key"]')?.content;
        if (!container || !window.turnstile) return;

        // Remove previous widget cleanly
        if (container._cfTurnstileWidgetId) {
            turnstile.remove(container._cfTurnstileWidgetId);
        }

        // Re-render with current theme
        container._cfTurnstileWidgetId = turnstile.render("#turnstile-container", {
            sitekey: siteKey,
            theme: theme === 'dark' ? 'dark' : 'light',
            callback: () => {}
        });
    }
}

// Initialize after page load
document.addEventListener('DOMContentLoaded', () => new ThemeManager());
