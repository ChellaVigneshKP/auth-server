class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.bindEvents();
    }

    applyTheme(theme) {
        const html = document.documentElement;

        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
        this.currentTheme = theme;

        // Update the theme icon
        this.updateThemeIcon();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            if (this.currentTheme === 'dark') {
                themeIcon.className = 'ti ti-sun';
            } else {
                themeIcon.className = 'ti ti-moon';
            }
        }
    }

    bindEvents() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
    }
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});