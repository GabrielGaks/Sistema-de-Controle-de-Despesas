// Theme management for Finance Master

// Load and apply theme settings on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load theme settings from localStorage
    loadThemeSettings();
    
    // Listen for theme changes
    window.addEventListener('settingsUpdated', function(event) {
        // Update theme based on new settings
        if (event.detail && event.detail.settings) {
            applyTheme(event.detail.settings.theme);
        }
    });
});

// Load theme settings from localStorage
function loadThemeSettings() {
    const defaultSettings = {
        theme: 'light',
        primaryColor: 'blue'
    };
    
    // Get settings from localStorage
    const savedSettings = localStorage.getItem('financeSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    
    // Apply theme
    applyTheme(settings.theme);
    
    // Apply color scheme if needed
    if (settings.primaryColor) {
        applyColorScheme(settings.primaryColor);
    }
}

// Apply theme based on settings
function applyTheme(theme) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-dark', 'theme-light', 'theme-system');
    
    // Add new theme class
    body.classList.add(`theme-${theme}`);
    
    // Apply dark mode styles if needed
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark-mode');
    }
}

// Apply color scheme based on settings
function applyColorScheme(color) {
    // Update header gradient
    const header = document.querySelector('header');
    if (header) {
        header.className = header.className.replace(/from-\w+-\d+ to-\w+-\d+/, `from-${color}-600 to-${color}-800`);
    }
}