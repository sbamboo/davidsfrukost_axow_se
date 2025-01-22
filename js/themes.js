class ThemeManager {
    constructor() {
        this.themeSelector = document.getElementById('themeSelector');
        this.currentTheme = 'history';
        this.init();
    }

    init() {
        this.themeSelector.addEventListener('change', () => this.setTheme(this.themeSelector.value));
        this.setTheme(this.currentTheme);
    }

    setTheme(themeName) {
        document.body.classList.remove(this.currentTheme);
        this.currentTheme = themeName;
        document.body.classList.add(themeName);
    }
}

const themeManager = new ThemeManager();