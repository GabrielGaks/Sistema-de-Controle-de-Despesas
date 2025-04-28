// Initialize data structure
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM Elements
const balanceEl = document.getElementById('current-balance');
const incomeEl = document.getElementById('total-income');
const expensesEl = document.getElementById('total-expenses');
const transactionForm = document.getElementById('transaction-form');
const transactionsList = document.getElementById('transactions-list');
const filterType = document.getElementById('filter-type');
const filterMonth = document.getElementById('filter-month');
const lastUpdateEl = document.getElementById('last-update');

// Set current month as default for filter
filterMonth.value = new Date().toISOString().slice(0, 7);

// Load settings from localStorage
let appSettings = {};
function loadSettings() {
    const defaultSettings = {
        initialBalance: 0,
        currency: 'BRL',
        theme: 'light',
        primaryColor: 'blue',
        budgetAlerts: true,
        billReminders: true
    };
    
    const savedSettings = localStorage.getItem('financeSettings');
    appSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    
    // Apply settings
    applySettings();
}

// Apply settings to the dashboard
function applySettings() {
    // Apply currency format
    updateCurrencyFormat(appSettings.currency);
    
    // Apply theme
    applyTheme(appSettings.theme);
    
    // Apply color scheme
    applyColorScheme(appSettings.primaryColor);
    
    // Recalculate totals to reflect settings
    calculateTotals();
}

// Update currency format based on settings
function updateCurrencyFormat(currencyCode) {
    // Update the formatCurrency function to use the selected currency
    window.formatCurrency = (amount) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currencyCode
        }).format(amount);
    };
}

// Apply theme based on settings
function applyTheme(theme) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-dark', 'theme-light');
    
    // Add new theme class
    body.classList.add(`theme-${theme}`);
    
    // Apply dark mode styles if needed
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        // Add more specific dark mode styling here
    } else {
        document.documentElement.classList.remove('dark-mode');
    }
}

// Apply color scheme based on settings
function applyColorScheme(color) {
    // This would be expanded to apply the color scheme to various elements
    // For now, we'll just update a few key elements
    
    // Example: update header gradient
    const header = document.querySelector('header');
    if (header) {
        header.className = header.className.replace(/from-\w+-\d+ to-\w+-\d+/, `from-${color}-600 to-${color}-800`);
    }
}

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
};

// Update last update timestamp
const updateLastUpdateTimestamp = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    lastUpdateEl.textContent = `Atualizado: Hoje às ${hours}:${minutes}`;
};

// Calculate totals
const calculateTotals = () => {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + t.amount, 0);

    // Include initial balance from settings
    const initialBalance = parseFloat(appSettings.initialBalance) || 0;
    const balance = initialBalance + income - expenses;
    
    // Animação suave para atualização dos valores
    animateValue(balanceEl, balance);
    animateValue(incomeEl, income);
    animateValue(expensesEl, expenses);
    
    // Update the last update timestamp
    updateLastUpdateTimestamp();
};

// Função para animar a contagem dos valores
const animateValue = (element, endValue) => {
    // Remover classe de animação anterior se existir
    element.classList.remove('value-animate');
    
    // Obter valor atual (sem o símbolo da moeda)
    const currentText = element.textContent || '0';
    const currentValue = parseFloat(currentText.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
    
    // Se não houver grande mudança, apenas atualizar com animação simples
    if (Math.abs(currentValue - endValue) < 10) {
        element.textContent = formatCurrency(endValue);
        element.classList.add('value-animate');
        return;
    }
    
    // Para mudanças maiores, animar a contagem
    const duration = 800; // Duração da animação em ms
    const frameRate = 60; // Frames por segundo
    const totalFrames = duration / (1000 / frameRate);
    const increment = (endValue - currentValue) / totalFrames;
    
    let frame = 0;
    const counter = setInterval(() => {
        frame++;
        const newValue = currentValue + (increment * frame);
        element.textContent = formatCurrency(newValue);
        
        if (frame === totalFrames) {
            clearInterval(counter);
            // Garante que o valor final seja exato
            element.textContent = formatCurrency(endValue);
            element.classList.add('value-animate');
        }
    }, 1000 / frameRate);
};

// Add transaction
const addTransaction = (e) => {
    e.preventDefault();

    const transaction = {
        id: Date.now(),
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        icon: document.querySelector('.icon-option.selected')?.dataset.icon || (document.getElementById('type').value === 'income' ? 'payments' : 'shopping_cart')
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Dispatch custom event to notify other components (like calendario.js)
    window.dispatchEvent(new CustomEvent('transactionsUpdated', {
        detail: { transactions: transactions }
    }));

    transactionForm.reset();
    updateTransactionsList();
    calculateTotals();
    
    // Reset icon selection
    document.querySelectorAll('.icon-option').forEach(icon => {
        icon.classList.remove('selected');
    });
    initializeIconSelector();
};

// Delete transaction
const deleteTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Dispatch custom event to notify other components (like calendario.js)
    window.dispatchEvent(new CustomEvent('transactionsUpdated', {
        detail: { transactions: transactions }
    }));
    
    updateTransactionsList();
    calculateTotals();
};

// Format date
const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
};

// Update transactions list
const updateTransactionsList = () => {
    const selectedType = filterType.value;
    const selectedMonth = filterMonth.value;

    const filteredTransactions = transactions.filter(t => {
        const typeMatch = selectedType === 'all' || t.type === selectedType;
        const monthMatch = t.date.startsWith(selectedMonth);
        return typeMatch && monthMatch;
    });

    transactionsList.innerHTML = '';
    
    filteredTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach((transaction, index) => {
            const li = document.createElement('li');
            li.className = 'transaction-item p-3 flex justify-between items-center';
            li.style.setProperty('--index', index); // Para animação sequencial
            
            // Get icon for transaction or use default
            const icon = transaction.icon || (transaction.type === 'income' ? 'payments' : 'shopping_cart');
            
            li.innerHTML = `
                <div class="transaction-icon ${transaction.type}">
                    <span class="material-symbols-outlined">${icon}</span>
                </div>
                <div class="transaction-info flex-1">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-details">
                        ${formatDate(transaction.date)} | ${transaction.category}
                    </div>
                </div>
                <div class="transaction-amount font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-actions ml-4">
                    <button class="delete-btn text-red-500 hover:text-red-700" onclick="deleteTransaction(${transaction.id})">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;
            
            transactionsList.appendChild(li);
        });
};

// Event listeners
transactionForm.addEventListener('submit', addTransaction);
filterType.addEventListener('change', updateTransactionsList);
filterMonth.addEventListener('change', updateTransactionsList);

// Initial render
updateTransactionsList();
calculateTotals();

// Set transaction type
const setTransactionType = (type) => {
    document.getElementById('type').value = type;
    
    // Update button styles with animation
    document.querySelectorAll('.transaction-type').forEach(btn => {
        // Remove active state from all buttons
        btn.classList.remove('ring-2', 'ring-green-500', 'ring-red-500', 'scale-105');
        btn.classList.remove('animate-pulse');
        
        // Add active state to selected button
        if (btn.dataset.type === type) {
            btn.classList.add('ring-2', type === 'income' ? 'ring-green-500' : 'ring-red-500');
            
            // Add smoother animation
            btn.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            btn.classList.add('scale-105');
            
            // Create subtle pulse animation
            let pulseCount = 0;
            const pulsate = () => {
                if (pulseCount >= 2) return; // Stop after 2 pulses
                
                btn.animate([
                    { transform: 'scale(1.05)' },
                    { transform: 'scale(1.08)' },
                    { transform: 'scale(1.05)' }
                ], {
                    duration: 350,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                });
                
                pulseCount++;
                setTimeout(pulsate, 350);
            };
            
            pulsate();
        }
    });
    
    // Update categories based on transaction type
    updateCategoriesByType(type);
    
    // Update icon selector based on transaction type
    initializeIconSelector();
};

// Update categories based on transaction type
const updateCategoriesByType = (type) => {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = ''; // Clear existing options
    
    let categories = [];
    
    if (type === 'income') {
        categories = [
            { value: 'salary', label: 'Salário' },
            { value: 'investment', label: 'Investimento' },
            { value: 'bonus', label: 'Bônus' },
            { value: 'gift', label: 'Presente' },
            { value: 'other_income', label: 'Outros' }
        ];
    } else { // expense
        categories = [
            { value: 'food', label: 'Alimentação' },
            { value: 'transport', label: 'Transporte' },
            { value: 'housing', label: 'Moradia' },
            { value: 'utilities', label: 'Contas' },
            { value: 'entertainment', label: 'Lazer' },
            { value: 'health', label: 'Saúde' },
            { value: 'education', label: 'Educação' },
            { value: 'shopping', label: 'Compras' },
            { value: 'other_expense', label: 'Outros' }
        ];
    }
    
    // Add options to select
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.value;
        option.textContent = category.label;
        categorySelect.appendChild(option);
    });
    
    // Add animation to category dropdown
    categorySelect.classList.add('animate-fade');
    setTimeout(() => {
        categorySelect.classList.remove('animate-fade');
    }, 500);
};

// Initialize icon selector
const initializeIconSelector = () => {
    const iconSelectorContainer = document.getElementById('icon-selector-container');
    const transactionType = document.getElementById('type').value;
    
    // Define icons based on transaction type
    let icons = [];
    
    if (transactionType === 'income') {
        icons = ['payments', 'account_balance', 'savings', 'currency_exchange', 'attach_money', 'credit_card', 'redeem', 'paid', 'monetization_on', 'volunteer_activism'];
    } else { // expense
        icons = ['shopping_cart', 'restaurant', 'local_gas_station', 'home', 'directions_car', 'school', 'medical_services', 'movie', 'sports_esports', 'shopping_bag'];
    }
    
    // Create icon selector
    let iconSelectorHTML = `
        <label class="block text-sm font-medium text-gray-700 mb-1">Escolha um ícone</label>
        <div class="icon-selector">
    `;
    
    icons.forEach(icon => {
        iconSelectorHTML += `
            <div class="icon-option" data-icon="${icon}" onclick="selectIcon(this)">
                <span class="material-symbols-outlined">${icon}</span>
            </div>
        `;
    });
    
    iconSelectorHTML += `</div>`;
    iconSelectorContainer.innerHTML = iconSelectorHTML;
};

// Select icon
const selectIcon = (element) => {
    // Remove selected class from all icons
    document.querySelectorAll('.icon-option').forEach(icon => {
        icon.classList.remove('selected', 'animate-select');
    });
    
    // Add selected class to clicked icon
    element.classList.add('selected', 'animate-select');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        element.classList.remove('animate-select');
    }, 400);
};

// Initialize with default transaction type and load settings
document.addEventListener('DOMContentLoaded', () => {
    // Load settings first
    loadSettings();
    
    // Set default transaction type
    setTransactionType('income'); // Set default to income
    initializeIconSelector(); // Initialize icon selector
    
    // Listen for settings updates
    window.addEventListener('settingsUpdated', function(event) {
        // Update local settings
        appSettings = event.detail.settings;
        applySettings();
    });
    
    // Listen for data import events
    window.addEventListener('dataImported', function(event) {
        // Reload transactions and apply settings
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        appSettings = event.detail.settings;
        applySettings();
        updateTransactionsList();
        calculateTotals();
    });
});