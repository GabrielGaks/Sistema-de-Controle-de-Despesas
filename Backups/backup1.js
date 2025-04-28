// Calendar functionality for Finance Master

// DOM Elements
const calendarDates = document.getElementById('calendar-dates');
const currentMonthEl = document.getElementById('current-month');
const monthButton = document.getElementById('month-button');
const monthDropdown = document.getElementById('month-dropdown');
const monthOptions = document.querySelectorAll('.month-option');
const yearOptions = document.querySelectorAll('.year-option');
const viewMonthBtn = document.getElementById('view-month');
const viewYearBtn = document.getElementById('view-year');
const transactionDetails = document.getElementById('transaction-details');
const selectedDateTitle = document.getElementById('selected-date-title');
const selectedDateTotal = document.getElementById('selected-date-total');
const selectedDateTransactions = document.getElementById('selected-date-transactions');
const expenseCategoriesLegend = document.getElementById('expense-categories-legend');
const incomeCategoriesLegend = document.getElementById('income-categories-legend');

// Charts
let expenseChart = null;
let incomeChart = null;

// Current date state
let currentDate = new Date();
let selectedDate = null;
let currentView = 'month'; // 'month' or 'year'

// Get transactions from localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Format currency (reusing from app.js)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
};

// Format date (reusing from app.js)
const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
};

// Format date for title
const formatDateTitle = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
};

// Update month display
const updateMonthDisplay = () => {
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    currentMonthEl.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Update active month in dropdown
    monthOptions.forEach(option => {
        const month = parseInt(option.dataset.month);
        if (month === currentDate.getMonth()) {
            option.classList.add('bg-blue-100', 'font-medium');
        } else {
            option.classList.remove('bg-blue-100', 'font-medium');
            option.classList.add('hover:bg-blue-50');
        }
    });
    
    // Update active year in dropdown
    yearOptions.forEach(option => {
        const year = parseInt(option.dataset.year);
        if (year === currentDate.getFullYear()) {
            option.classList.add('bg-blue-100', 'font-medium');
        } else {
            option.classList.remove('bg-blue-100', 'font-medium');
            option.classList.add('hover:bg-blue-50');
        }
    });
};

// Get transactions for a specific date
const getTransactionsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return transactions.filter(t => t.date === dateString);
};

// Calculate total for a specific date
const calculateDailyTotal = (date) => {
    const dateTransactions = getTransactionsForDate(date);
    
    const income = dateTransactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + t.amount, 0);
        
    const expenses = dateTransactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + t.amount, 0);
        
    return { income, expenses, balance: income - expenses };
};

// Render calendar based on current view
const renderCalendar = () => {
    if (currentView === 'year') {
        renderYearCalendar();
    } else {
        renderMonthCalendar();
    }
};

// Render calendar for current month
const renderMonthCalendar = () => {
    calendarDates.innerHTML = '';
    
    // Get first day of month and last day of month
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const firstDayIndex = firstDay.getDay();
    
    // Calculate days from previous month to display
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const prevMonthDays = prevMonthLastDay.getDate();
    
    // Add cells for days from previous month
    for (let i = 0; i < firstDayIndex; i++) {
        const day = prevMonthDays - firstDayIndex + i + 1;
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
        const dateCell = document.createElement('div');
        dateCell.className = 'calendar-date p-1 rounded-lg cursor-pointer hover:bg-blue-50 transition-all adjacent-month';
        
        // Create date content
        dateCell.innerHTML = `
            <div class="flex flex-col h-full">
                <div class="text-right font-medium text-sm text-gray-400">${day}</div>
            </div>
        `;
        
        // Add click event to show transactions for this date
        dateCell.addEventListener('click', () => {
            selectDate(date);
        });
        
        calendarDates.appendChild(dateCell);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateCell = document.createElement('div');
        dateCell.className = 'calendar-date p-1 rounded-lg cursor-pointer hover:bg-blue-50 transition-all';
        
        // Check if it's today
        const today = new Date();
        if (date.getDate() === today.getDate() && 
            date.getMonth() === today.getMonth() && 
            date.getFullYear() === today.getFullYear()) {
            dateCell.classList.add('bg-blue-100', 'font-bold');
        }
        
        // Check if it's selected date
        if (selectedDate && 
            date.getDate() === selectedDate.getDate() && 
            date.getMonth() === selectedDate.getMonth() && 
            date.getFullYear() === selectedDate.getFullYear()) {
            dateCell.classList.add('selected');
        }
        
        // Calculate daily totals
        const { income, expenses, balance } = calculateDailyTotal(date);
        
        // Create date content
        dateCell.innerHTML = `
            <div class="flex flex-col h-full">
                <div class="text-right font-medium text-sm">${day}</div>
                ${(income > 0 || expenses > 0) ? `
                    <div class="mt-auto pt-1 flex justify-center">
                        ${balance >= 0 ? `<div class="h-2 w-2 rounded-full bg-green-500 mx-1"></div>` : `<div class="h-2 w-2 rounded-full bg-red-500 mx-1"></div>`}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add indicator dot if there are transactions
        if (income > 0 || expenses > 0) {
            dateCell.classList.add('has-transactions');
            
            // Add color indicator based on balance
            if (balance > 0) {
                dateCell.classList.add('income-day');
            } else if (balance < 0) {
                dateCell.classList.add('expense-day');
            }
        }
        
        // Add click event to show transactions for this date
        dateCell.addEventListener('click', () => {
            selectDate(date);
        });
        
        calendarDates.appendChild(dateCell);
    }

    // Calculate remaining cells to fill with next month's days
    const totalDays = firstDayIndex + lastDay.getDate();
    const remainingDays = 42 - totalDays; // 6 rows × 7 days = 42 total cells

    // Add cells for days from next month
    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
        const dateCell = document.createElement('div');
        dateCell.className = 'calendar-date p-1 rounded-lg cursor-pointer hover:bg-blue-50 transition-all adjacent-month';
        
        // Create date content
        dateCell.innerHTML = `
            <div class="flex flex-col h-full">
                <div class="text-right font-medium text-sm text-gray-400">${i}</div>
            </div>
        `;
        
        // Add click event to show transactions for this date
        dateCell.addEventListener('click', () => {
            selectDate(date);
        });
        
        calendarDates.appendChild(dateCell);
    }
};

// Select a date and show its transactions
const selectDate = (date) => {
    selectedDate = date;
    renderCalendar(); // Re-render to update selected date styling
    
    // Get transactions for selected date
    const dateTransactions = getTransactionsForDate(date);
    
    // Show transaction details section
    transactionDetails.classList.remove('hidden');
    
    // Update title with selected date
    selectedDateTitle.textContent = `Transações em ${formatDateTitle(date)}`;
    
    // Calculate totals for the day
    const { income, expenses, balance } = calculateDailyTotal(date);
    
    // Update total display
    selectedDateTotal.textContent = formatCurrency(balance);
    selectedDateTotal.className = balance >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
    
    // Clear previous transactions
    selectedDateTransactions.innerHTML = '';
    
    if (dateTransactions.length === 0) {
        selectedDateTransactions.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                Nenhuma transação nesta data
            </div>
        `;
    } else {
        // Sort transactions by type (income first) and then by amount (highest first)
        dateTransactions
            .sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'income' ? -1 : 1;
                }
                return b.amount - a.amount;
            })
            .forEach(transaction => {
                const transactionEl = document.createElement('div');
                transactionEl.className = 'transaction-item p-3 border border-gray-200 rounded-lg flex justify-between items-center';
                
                // Get icon for transaction or use default
                const icon = transaction.icon || (transaction.type === 'income' ? 'payments' : 'shopping_cart');
                
                transactionEl.innerHTML = `
                    <div class="transaction-icon ${transaction.type}">
                        <span class="material-symbols-outlined">${icon}</span>
                    </div>
                    <div class="transaction-info flex-1">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-details">
                            ${transaction.category}
                        </div>
                    </div>
                    <div class="transaction-amount font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                        ${formatCurrency(transaction.amount)}
                    </div>
                `;
                
                selectedDateTransactions.appendChild(transactionEl);
            });
    }
    
    // Update charts
    updateCharts(dateTransactions);
};

// Update charts for selected date
const updateCharts = (dateTransactions) => {
    // Process expense data
    const expenseData = processChartData(dateTransactions.filter(t => t.type === 'expense'));
    updateChart('expense', expenseData);
    
    // Process income data
    const incomeData = processChartData(dateTransactions.filter(t => t.type === 'income'));
    updateChart('income', incomeData);
};

// Process data for charts
const processChartData = (transactions) => {
    const categoryTotals = {};
    
    transactions.forEach(transaction => {
        if (!categoryTotals[transaction.category]) {
            categoryTotals[transaction.category] = 0;
        }
        categoryTotals[transaction.category] += transaction.amount;
    });
    
    return {
        labels: Object.keys(categoryTotals),
        data: Object.values(categoryTotals)
    };
};

// Update chart
const updateChart = (type, chartData) => {
    const chartElement = document.getElementById(`date-${type}-chart`);
    const legendElement = document.getElementById(`${type}-categories-legend`);
    
    // Clear previous legend
    legendElement.innerHTML = '';
    
    // Define colors based on type
    const colors = type === 'expense' ? [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
        '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#6366f1'
    ] : [
        '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
        '#84cc16', '#4ade80', '#34d399', '#2dd4bf', '#06b6d4'
    ];
    
    // Create chart data
    const data = {
        labels: chartData.labels,
        datasets: [{
            data: chartData.data,
            backgroundColor: colors.slice(0, chartData.labels.length),
            borderWidth: 0
        }]
    };
    
    // Chart options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const value = context.raw;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${formatCurrency(value)} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '70%'
    };
    
    // Destroy previous chart if exists
    if (type === 'expense' && expenseChart) {
        expenseChart.destroy();
    } else if (type === 'income' && incomeChart) {
        incomeChart.destroy();
    }
    
    // Create new chart
    if (chartData.labels.length > 0) {
        const newChart = new Chart(chartElement, {
            type: 'doughnut',
            data: data,
            options: options
        });
        
        if (type === 'expense') {
            expenseChart = newChart;
        } else {
            incomeChart = newChart;
        }
        
        // Create legend
        chartData.labels.forEach((label, index) => {
            const amount = chartData.data[index];
            const total = chartData.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((amount / total) * 100);
            
            const legendItem = document.createElement('div');
            legendItem.className = 'flex items-center text-xs';
            legendItem.innerHTML = `
                <div class="w-3 h-3 rounded-full mr-1" style="background-color: ${colors[index]}"></div>
                <div class="truncate">${getCategoryLabel(label)}: ${percentage}%</div>
            `;
            
            legendElement.appendChild(legendItem);
        });
    } else {
        // No data
        legendElement.innerHTML = `
            <div class="text-center py-2 text-gray-500 col-span-2">
                Nenhuma transação deste tipo
            </div>
        `;
    }
};

// Get category label
const getCategoryLabel = (categoryValue) => {
    const categoryLabels = {
        // Income categories
        'salary': 'Salário',
        'investment': 'Investimento',
        'bonus': 'Bônus',
        'gift': 'Presente',
        'other_income': 'Outros',
        
        // Expense categories
        'food': 'Alimentação',
        'transport': 'Transporte',
        'housing': 'Moradia',
        'utilities': 'Contas',
        'entertainment': 'Lazer',
        'health': 'Saúde',
        'education': 'Educação',
        'shopping': 'Compras',
        'other_expense': 'Outros'
    };
    
    return categoryLabels[categoryValue] || categoryValue;
};

// Toggle month dropdown
monthButton.addEventListener('click', () => {
    monthDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!monthButton.contains(e.target) && !monthDropdown.contains(e.target)) {
        monthDropdown.classList.add('hidden');
    }
});

// Month selection
monthOptions.forEach(option => {
    option.addEventListener('click', () => {
        const month = parseInt(option.dataset.month);
        currentDate.setMonth(month);
        updateMonthDisplay();
        renderCalendar();
        monthDropdown.classList.add('hidden');
        
        // Hide transaction details when changing month
        transactionDetails.classList.add('hidden');
        selectedDate = null;
    });
});

// Year selection
yearOptions.forEach(option => {
    option.addEventListener('click', () => {
        const year = parseInt(option.dataset.year);
        currentDate.setFullYear(year);
        updateMonthDisplay();
        renderCalendar();
        monthDropdown.classList.add('hidden');
        
        // Hide transaction details when changing year
        transactionDetails.classList.add('hidden');
        selectedDate = null;
    });
});

// View toggle (month/year)
viewMonthBtn.addEventListener('click', () => {
    if (currentView !== 'month') {
        currentView = 'month';
        viewMonthBtn.classList.add('bg-blue-600', 'text-white');
        viewMonthBtn.classList.remove('hover:bg-gray-200');
        viewYearBtn.classList.remove('bg-blue-600', 'text-white');
        viewYearBtn.classList.add('hover:bg-gray-200');
        
        // Show calendar days header when in month view
        document.getElementById('calendar-days').classList.remove('hidden');
        
        // Enable month selection in month view
        monthButton.disabled = false;
        monthButton.classList.remove('opacity-50', 'cursor-not-allowed');
        monthButton.classList.add('cursor-pointer');
        
        renderCalendar();
    }
});

viewYearBtn.addEventListener('click', () => {
    if (currentView !== 'year') {
        currentView = 'year';
        viewYearBtn.classList.add('bg-blue-600', 'text-white');
        viewYearBtn.classList.remove('hover:bg-gray-200');
        viewMonthBtn.classList.remove('bg-blue-600', 'text-white');
        viewMonthBtn.classList.add('hover:bg-gray-200');
        
        // Hide calendar days header when in year view
        document.getElementById('calendar-days').classList.add('hidden');
        
        // Disable month selection in year view
        monthButton.disabled = true;
        monthButton.classList.add('opacity-50', 'cursor-not-allowed');
        monthButton.classList.remove('cursor-pointer');
        
        renderYearCalendar();
    }
});

// Update calendar when transactions change
window.addEventListener('transactionsUpdated', (event) => {
    transactions = event.detail.transactions;
    renderCalendar();
    
    // Update selected date if there is one
    if (selectedDate) {
        selectDate(selectedDate);
    }
    
    // Update totals in the header
    updateTotals();
});

// Update totals in the header (similar to app.js)
const updateTotals = () => {
    const currentMonth = currentDate.toISOString().slice(0, 7);
    
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    
    const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + t.amount, 0);

    const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + t.amount, 0);

    const balance = income - expenses;

    // Update the DOM elements
    document.getElementById('current-balance').textContent = formatCurrency(balance);
    document.getElementById('total-income').textContent = formatCurrency(income);
    document.getElementById('total-expenses').textContent = formatCurrency(expenses);
    
    // Update last update timestamp
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('last-update').textContent = `Atualizado: Hoje às ${hours}:${minutes}`;
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateMonthDisplay();
    renderCalendar();
    updateTotals();
});

// Calculate total for a specific month
const calculateMonthlyTotal = (year, month) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= startDate && date <= endDate;
    });
    
    const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + t.amount, 0);
        
    const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + t.amount, 0);
        
    return { income, expenses, balance: income - expenses, transactions: monthTransactions };
};

// Select a month and show its transactions summary
const selectMonth = (year, month) => {
    // Get transactions for selected month
    const { income, expenses, balance, transactions: monthTransactions } = calculateMonthlyTotal(year, month);
    
    // Show transaction details section
    transactionDetails.classList.remove('hidden');
    
    // Update title with selected month
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    selectedDateTitle.textContent = `Resumo de ${monthNames[month]} ${year}`;
    
    // Update total display
    selectedDateTotal.textContent = formatCurrency(balance);
    selectedDateTotal.className = balance >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
    
    // Clear previous transactions list - we won't show individual transactions for month view
    selectedDateTransactions.innerHTML = `
        <div class="text-center py-4 text-gray-500">
            ${monthTransactions.length === 0 ? 
                'Nenhuma transação neste mês' : 
                `Total de ${monthTransactions.length} transações neste mês`}
        </div>
    `;
    
    // Update charts with monthly data
    updateCharts(monthTransactions);
};

// Render calendar for current year
const renderYearCalendar = () => {
    calendarDates.innerHTML = '';
    
    // Update header to show year only
    currentMonthEl.textContent = currentDate.getFullYear().toString();
    
    // Create month cells
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Create month grid (4x3)
    for (let month = 0; month < 12; month++) {
        const monthCell = document.createElement('div');
        monthCell.className = 'calendar-date p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition-all';
        
        // Calculate monthly totals
        const { income, expenses, balance } = calculateMonthlyTotal(currentDate.getFullYear(), month);
        
        // Create month content
        monthCell.innerHTML = `
            <div class="flex flex-col h-full">
                <div class="text-center font-medium mb-2">${monthNames[month]}</div>
                ${(income > 0 || expenses > 0) ? `
                    <div class="text-sm text-center mb-2">
                        ${formatCurrency(balance)}
                    </div>
                    <div class="flex justify-center">
                        ${balance >= 0 ? 
                            `<div class="h-2 w-2 rounded-full bg-green-500 mx-1"></div>` : 
                            `<div class="h-2 w-2 rounded-full bg-red-500 mx-1"></div>`}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add indicator if there are transactions
        if (income > 0 || expenses > 0) {
            monthCell.classList.add('has-transactions');
            if (balance > 0) {
                monthCell.classList.add('income-day');
            } else if (balance < 0) {
                monthCell.classList.add('expense-day');
            }
        }
        
        // Add click event to show month's transactions
        monthCell.addEventListener('click', () => {
            // Instead of switching to month view, show month summary
            selectMonth(currentDate.getFullYear(), month);
        });
        
        calendarDates.appendChild(monthCell);
    }
};

// Update view toggle (month/year)
viewMonthBtn.addEventListener('click', () => {
    if (currentView !== 'month') {
        currentView = 'month';
        viewMonthBtn.classList.add('bg-blue-600', 'text-white');
        viewMonthBtn.classList.remove('hover:bg-gray-200');
        viewYearBtn.classList.remove('bg-blue-600', 'text-white');
        viewYearBtn.classList.add('hover:bg-gray-200');
        renderCalendar();
    }
});

viewYearBtn.addEventListener('click', () => {
    if (currentView !== 'year') {
        currentView = 'year';
        viewYearBtn.classList.add('bg-blue-600', 'text-white');
        viewYearBtn.classList.remove('hover:bg-gray-200');
        viewMonthBtn.classList.remove('bg-blue-600', 'text-white');
        viewMonthBtn.classList.add('hover:bg-gray-200');
        renderYearCalendar();
    }
});