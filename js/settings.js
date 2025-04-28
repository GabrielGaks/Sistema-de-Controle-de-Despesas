// Settings management for Finance Master

document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings when the page loads
    loadSettings();
    
    // Set up event listeners
    setupEventListeners();
});

// Load settings from localStorage
function loadSettings() {
    // Get settings from localStorage or use defaults
    const settings = getSettings();
    
    // Apply settings to form elements
    document.getElementById('initial-balance').value = settings.initialBalance;
    document.getElementById('currency').value = settings.currency;
    document.getElementById('theme').value = settings.theme;
    
    // Apply theme immediately
    applyTheme(settings.theme);
    
    // Set toggle switches based on notification settings
    const toggles = document.querySelectorAll('input[type="checkbox"]');
    toggles[0].checked = settings.budgetAlerts;
    toggles[1].checked = settings.billReminders;
    
    // Set color theme
    setActiveColorButton(settings.primaryColor);
}

// Get settings from localStorage with defaults
function getSettings() {
    const defaultSettings = {
        initialBalance: 0,
        currency: 'BRL',
        theme: 'light',
        primaryColor: 'blue',
        budgetAlerts: true,
        billReminders: true
    };
    
    const savedSettings = localStorage.getItem('financeSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
}

// Set up all event listeners
function setupEventListeners() {
    // Save button
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    // Theme selector
    document.getElementById('theme').addEventListener('change', function(e) {
        applyTheme(e.target.value);
    });
    
    // Color buttons
    const colorButtons = document.querySelectorAll('.rounded-full');
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get color from background class
            const bgClass = Array.from(this.classList).find(cls => cls.startsWith('bg-'));
            const color = bgClass.replace('bg-', '').replace('-600', '');
            
            // Set as active
            setActiveColorButton(color);
        });
    });
    
    // Clear data button
    const clearDataBtn = document.querySelector('button:has(.material-symbols-outlined:contains("delete"))');
    clearDataBtn.addEventListener('click', function() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            // Clear all data except settings
            localStorage.removeItem('transactions');
            alert('Todos os dados de transações foram removidos.');
        }
    });
    
    // Export data button
    const exportDataBtn = document.querySelector('button:has(.material-symbols-outlined:contains("backup"))');
    exportDataBtn.addEventListener('click', exportData);
    
    // Add import data functionality
    const importBtn = document.createElement('button');
    importBtn.className = 'bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center mt-2';
    importBtn.innerHTML = '<span class="material-symbols-outlined mr-2">upload</span> Importar Dados';
    importBtn.addEventListener('click', importData);
    
    // Add the import button after the export button
    exportDataBtn.parentNode.appendChild(importBtn);
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        initialBalance: parseFloat(document.getElementById('initial-balance').value) || 0,
        currency: document.getElementById('currency').value,
        theme: document.getElementById('theme').value,
        primaryColor: getActiveColorButton(),
        budgetAlerts: document.querySelectorAll('input[type="checkbox"]')[0].checked,
        billReminders: document.querySelectorAll('input[type="checkbox"]')[1].checked
    };
    
    // Save to localStorage
    localStorage.setItem('financeSettings', JSON.stringify(settings));
    
    // Show success message
    showNotification('Configurações salvas com sucesso!');
    
    // Apply settings to all pages
    applyGlobalSettings(settings);
}

// Apply theme
function applyTheme(theme) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-dark', 'theme-light');
    
    // Add new theme class
    body.classList.add(`theme-${theme}`);
    
    // Apply dark mode styles if needed
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        // You would add more specific dark mode styling here
    } else {
        document.documentElement.classList.remove('dark-mode');
    }
}

// Set active color button
function setActiveColorButton(color) {
    const colorButtons = document.querySelectorAll('.rounded-full');
    colorButtons.forEach(button => {
        // Remove existing ring from all buttons
        button.classList.remove('ring-2', 'ring-offset-2');
        
        // Add ring to the active button
        if (button.classList.contains(`bg-${color}-600`)) {
            button.classList.add('ring-2', 'ring-offset-2');
        }
    });
}

// Get active color button
function getActiveColorButton() {
    const activeButton = document.querySelector('.rounded-full.ring-2');
    const bgClass = Array.from(activeButton.classList).find(cls => cls.startsWith('bg-'));
    return bgClass.replace('bg-', '').replace('-600', '');
}

// Apply settings globally (would affect other pages when they load)
function applyGlobalSettings(settings) {
    // Dispatch a custom event to notify other components about settings changes
    window.dispatchEvent(new CustomEvent('settingsUpdated', {
        detail: { settings: settings }
    }));
    
    // If we're on the dashboard page, apply settings immediately
    if (window.location.href.includes('index2.html')) {
        // Apply theme
        applyTheme(settings.theme);
        
        // Apply color scheme
        const header = document.querySelector('header');
        if (header) {
            header.className = header.className.replace(/from-\w+-\d+ to-\w+-\d+/, `from-${settings.primaryColor}-600 to-${settings.primaryColor}-800`);
        }
    }
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 translate-y-20 opacity-0';
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.remove('translate-y-20', 'opacity-0');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Export data as JSON file
function exportData() {
    // Get all data from localStorage
    const data = {
        settings: JSON.parse(localStorage.getItem('financeSettings') || '{}'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]')
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_master_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data from JSON file
function importData() {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Parse the JSON data
                const data = JSON.parse(e.target.result);
                
                // Validate the data structure
                if (!data.settings || !data.transactions) {
                    throw new Error('Formato de arquivo inválido');
                }
                
                // Confirm before overwriting
                if (confirm('Isso substituirá seus dados atuais. Deseja continuar?')) {
                    // Save the imported data to localStorage
                    localStorage.setItem('financeSettings', JSON.stringify(data.settings));
                    localStorage.setItem('transactions', JSON.stringify(data.transactions));
                    
                    // Reload settings
                    loadSettings();
                    
                    // Show success message
                    showNotification('Dados importados com sucesso!');
                    
                    // Notify other components about the data change
                    window.dispatchEvent(new CustomEvent('dataImported', {
                        detail: { settings: data.settings, transactions: data.transactions }
                    }));
                }
            } catch (error) {
                alert('Erro ao importar dados: ' + error.message);
            }
        };
        reader.readAsText(file);
    });
    
    // Trigger file selection dialog
    fileInput.click();
}

// Listen for settings updates from other pages
window.addEventListener('settingsUpdated', function(event) {
    // Update local settings
    const settings = event.detail.settings;
    loadSettings();
});

// Listen for data import events
window.addEventListener('dataImported', function(event) {
    // Reload the page to apply imported settings
    if (confirm('Dados importados. Recarregar a página para aplicar as alterações?')) {
        window.location.reload();
    }
});

// Update index2.html and other pages to use settings
// This would be implemented in the respective JS files for those pages
// For example, in app.js, you would add code to load and apply settings