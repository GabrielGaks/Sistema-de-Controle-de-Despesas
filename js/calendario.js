// Calendar state
let currentDate = new Date();
let selectedDate = null;

// DOM Elements
const monthButton = document.getElementById('month-button');
const monthDropdown = document.getElementById('month-dropdown');
const currentMonthSpan = document.getElementById('current-month');
const calendarDates = document.getElementById('calendar-dates');
const transactionDetails = document.getElementById('transaction-details');
const selectedDateTitle = document.getElementById('selected-date-title');
const selectedDateTotal = document.getElementById('selected-date-total');
const selectedDateTransactions = document.getElementById('selected-date-transactions');
const dateExpenseChart = document.getElementById('date-expense-chart');
const expenseCategoriesLegend = document.getElementById('expense-categories-legend');

// Chart instance
let expenseChart = null;

// Get transactions from localStorage or initialize empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Category labels and icons
const getCategoryLabel = (category) => {
    const labels = {
        'salary': 'Salário',
        'investment': 'Investimento',
        'freelance': 'Freelance',
        'gift': 'Presente',
        'other_income': 'Outros',
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
    return labels[category] || category;
};

const getCategoryIcon = (category, type) => {
    if (type === 'income') {
        const incomeIcons = {
            'salary': 'payments',
            'investment': 'trending_up',
            'freelance': 'work',
            'gift': 'redeem',
            'other_income': 'paid'
        };
        return incomeIcons[category] || 'payments';
    } else {
        const expenseIcons = {
            'food': 'restaurant',
            'transport': 'directions_car',
            'housing': 'home',
            'utilities': 'receipt_long',
            'entertainment': 'movie',
            'health': 'medical_services',
            'education': 'school',
            'shopping': 'shopping_bag',
            'other_expense': 'shopping_bag'
        };
        return expenseIcons[category] || 'shopping_bag';
    }
};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);
};

// Format date
const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};

// Update month display
const updateMonthDisplay = () => {
    const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    currentMonthSpan.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    
    // Update active states in dropdown
    document.querySelectorAll('.month-option').forEach(button => {
        const month = parseInt(button.dataset.month);
        button.classList.remove('bg-blue-100', 'selected', 'font-medium');
        if (month === currentDate.getMonth()) {
            button.classList.add('bg-blue-100', 'selected', 'font-medium');
        }
    });
    
    document.querySelectorAll('.year-option').forEach(button => {
        const year = parseInt(button.dataset.year);
        button.classList.remove('bg-blue-100', 'selected', 'font-medium');
        if (year === currentDate.getFullYear()) {
            button.classList.add('bg-blue-100', 'selected', 'font-medium');
        }
    });
};

// Get days in month
const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

// Get first day of month
const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

// Get transactions for date
const getTransactionsForDate = (date) => {
    // Format date as YYYY-MM-DD for comparison
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // Ensure we have latest transactions data
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Filter transactions for the specific date
    return transactions.filter(t => t.date === dateString);
};

// Calculate total for date
const calculateDateTotal = (transactions) => {
    return transactions.reduce((total, t) => {
        return total + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
};

// Update calendar grid
const updateCalendar = () => {
    calendarDates.innerHTML = '';
    
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Create date objects for comparison
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const today = new Date();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'text-center text-gray-400 py-4'; // Increased padding
        calendarDates.appendChild(emptyCell);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        
        const dateTransactions = getTransactionsForDate(date);
        const hasIncome = dateTransactions.some(t => t.type === 'income');
        const hasExpense = dateTransactions.some(t => t.type === 'expense');
        
        const hasTransactions = dateTransactions.length > 0;
        const dateTotal = calculateDateTotal(dateTransactions);
        
        // Check if this is today
        const isToday = date.getDate() === today.getDate() && 
                        date.getMonth() === today.getMonth() && 
                        date.getFullYear() === today.getFullYear();
                        
        // Check if this date is selected
        const isSelected = selectedDate && 
                          date.getDate() === selectedDate.getDate() && 
                          date.getMonth() === selectedDate.getMonth() && 
                          date.getFullYear() === selectedDate.getFullYear();

        const dayCell = document.createElement('button');
        dayCell.className = `relative w-full h-full p-3 text-center rounded-md transition-all 
            ${isToday ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'} 
            ${isSelected ? 'ring-2 ring-blue-500' : ''} 
            ${hasTransactions ? 'font-medium' : ''}`;
        
        // Add day number
        dayCell.innerHTML = `
            <span class="text-sm ${isToday ? 'font-bold text-blue-600' : ''}">${day}</span>
        `;
        
        // Add transaction indicators if there are transactions
        if (hasTransactions) {
            // Create container for indicators
            const indicatorContainer = document.createElement('div');
            indicatorContainer.className = 'absolute bottom-1 left-0 right-0 flex justify-center gap-1';
            
            // Add indicators based on transaction types
            if (hasIncome) {
                const incomeIndicator = document.createElement('span');
                incomeIndicator.className = 'h-2 w-2 rounded-full bg-green-500';
                indicatorContainer.appendChild(incomeIndicator);
            }
            
            if (hasExpense) {
                const expenseIndicator = document.createElement('span');
                expenseIndicator.className = 'h-2 w-2 rounded-full bg-red-500';
                indicatorContainer.appendChild(expenseIndicator);
            }
            
            dayCell.appendChild(indicatorContainer);
        }

        dayCell.addEventListener('click', () => {
            // Remove selected class from previous selection
            const prevSelected = calendarDates.querySelector('.ring-2');
            if (prevSelected) {
                prevSelected.classList.remove('ring-2', 'ring-blue-500');
            }
            
            // Add selected class to this element
            dayCell.classList.add('ring-2', 'ring-blue-500');
            
            selectDate(date);
        });
        
        calendarDates.appendChild(dayCell);
    }
};

// Update transaction details
const updateTransactionDetails = (date) => {
    const dateTransactions = getTransactionsForDate(date);
    const dateTotal = calculateDateTotal(dateTransactions);

    selectedDateTitle.textContent = `Transações em ${formatDate(date)}`;
    selectedDateTotal.textContent = formatCurrency(dateTotal);
    selectedDateTotal.className = dateTotal >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';

    selectedDateTransactions.innerHTML = '';
    if (dateTransactions.length === 0) {
        selectedDateTransactions.innerHTML = `
            <div class="flex justify-center items-center p-4 text-gray-500">
                <span class="material-symbols-outlined mr-2">info</span>
                Nenhuma transação nesta data
            </div>
        `;
        return;
    }

    // Adicionar transações com efeito de atraso em cascata
    dateTransactions.forEach((transaction, index) => {
        const transactionEl = document.createElement('div');
        // Removido "bg-white" da classe para permitir que o tema escuro seja aplicado
        transactionEl.className = 'flex items-center p-3 rounded-lg border border-gray-100 transaction-item';
        transactionEl.style.setProperty('--index', index);
        
        const iconClass = transaction.type === 'income' ? 'text-green-600' : 'text-red-600';
        const bgClass = transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100';
        const amountClass = transaction.type === 'income' ? 'text-green-600' : 'text-red-600';
        const amountPrefix = transaction.type === 'income' ? '+' : '-';
        
        // Use custom icon if available, otherwise use category icon
        const icon = transaction.icon || getCategoryIcon(transaction.category, transaction.type);
        
        transactionEl.innerHTML = `
            <div class="transaction-icon ${transaction.type}">
                <span class="material-symbols-outlined">${icon}</span>
            </div>
            <div class="transaction-info flex-1">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-details">
                    ${getCategoryLabel(transaction.category)}
                </div>
            </div>
            <div class="transaction-amount font-bold ${amountClass}">
                ${amountPrefix}${formatCurrency(transaction.amount).replace('R$', 'R$ ')}
            </div>
        `;
        
        selectedDateTransactions.appendChild(transactionEl);
    });

    updateExpenseChart(dateTransactions);
};

// Função para animar a contagem dos valores
const animateValue = (element, endValue) => {
    if (!element) return;
    
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

// Update expense chart
const updateExpenseChart = (dateTransactions) => {
    const expenses = dateTransactions.filter(t => t.type === 'expense');
    
    // Group expenses by category
    const expensesByCategory = {};
    expenses.forEach(t => {
        if (!expensesByCategory[t.category]) {
            expensesByCategory[t.category] = 0;
        }
        expensesByCategory[t.category] += t.amount;
    });

    // Prepare chart data
    const labels = [];
    const data = [];
    const backgroundColors = [
        '#3b82f6', // blue-500
        '#8b5cf6', // purple-500
        '#22c55e', // green-500
        '#eab308', // yellow-500
        '#ef4444', // red-500
        '#ec4899', // pink-500
        '#14b8a6', // teal-500
        '#f97316', // orange-500
        '#6366f1'  // indigo-500
    ];

    for (const category in expensesByCategory) {
        labels.push(getCategoryLabel(category));
        data.push(expensesByCategory[category]);
    }

    // Update or create chart
    if (expenseChart) {
        expenseChart.destroy();
    }

    if (data.length === 0) {
        dateExpenseChart.style.display = 'none';
        expenseCategoriesLegend.innerHTML = `
            <div class="col-span-2 flex justify-center items-center p-4 text-gray-500">
                <span class="material-symbols-outlined mr-2">info</span>
                Nenhuma despesa nesta data
            </div>
        `;
        return;
    }

    dateExpenseChart.style.display = 'block';
    expenseChart = new Chart(dateExpenseChart, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, data.length),
                borderWidth: 1
            }]
        },
        options: {
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
            }
        }
    });

    // Update legend
    expenseCategoriesLegend.innerHTML = '';
    labels.forEach((label, index) => {
        const percentage = Math.round((data[index] / data.reduce((a, b) => a + b, 0)) * 100);
        const legendItem = document.createElement('div');
        legendItem.className = 'flex items-center';
        legendItem.innerHTML = `
            <span class="h-3 w-3 rounded-full mr-2" style="background-color: ${backgroundColors[index]}"></span>
            <span class="text-sm">${label} (${percentage}%)</span>
        `;
        expenseCategoriesLegend.appendChild(legendItem);
    });
};

// Select date
const selectDate = (date) => {
    selectedDate = date;
    
    // Revelar o painel de detalhes com animação suave
    if (transactionDetails.classList.contains('hidden')) {
        transactionDetails.classList.remove('hidden');
        transactionDetails.style.opacity = '0';
        transactionDetails.style.transform = 'translateY(20px)';
        
        // Animar a entrada do painel
        setTimeout(() => {
            transactionDetails.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            transactionDetails.style.opacity = '1';
            transactionDetails.style.transform = 'translateY(0)';
        }, 50);
    }
    
    updateTransactionDetails(date);
};

// Event listeners
monthButton.addEventListener('click', (e) => {
    e.stopPropagation();
    monthDropdown.classList.toggle('hidden');
});

document.querySelectorAll('.month-option').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const month = parseInt(button.dataset.month);
        currentDate.setMonth(month);
        updateMonthDisplay();
        updateCalendar();
        monthDropdown.classList.add('hidden');
    });
});

document.querySelectorAll('.year-option').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const year = parseInt(button.dataset.year);
        currentDate.setFullYear(year);
        updateMonthDisplay();
        updateCalendar();
        monthDropdown.classList.add('hidden');
    });
});

// Close month dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!monthButton.contains(e.target) && !monthDropdown.contains(e.target)) {
        monthDropdown.classList.add('hidden');
    }
});

// Calculate totals for dashboard
const calculateTotals = () => {
    // Get latest transactions data
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + t.amount, 0);

    const balance = income - expenses;

    if (document.getElementById('current-balance')) {
        animateValue(document.getElementById('current-balance'), balance);
    }
    if (document.getElementById('total-income')) {
        animateValue(document.getElementById('total-income'), income);
    }
    if (document.getElementById('total-expenses')) {
        animateValue(document.getElementById('total-expenses'), expenses);
    }
    
    // Update last update time
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (document.getElementById('last-update')) {
        document.getElementById('last-update').textContent = `Atualizado: Hoje às ${timeString}`;
    }
};

// Update transactions when data changes
const updateTransactionsFromStorage = () => {
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    updateCalendar();
    calculateTotals();
    if (selectedDate) {
        updateTransactionDetails(selectedDate);
    }
};

// Listen for storage changes and custom events
window.addEventListener('storage', (e) => {
    if (e.key === 'transactions') {
        updateTransactionsFromStorage();
    }
});

// Listen for custom transactionsUpdated event
window.addEventListener('transactionsUpdated', () => {
    updateTransactionsFromStorage();
});

document.addEventListener('transactionsUpdated', () => {
    updateTransactionsFromStorage();
});

// Initialize calendar
document.addEventListener('DOMContentLoaded', () => {
    // Make sure DOM elements exist before trying to use them
    if (!calendarDates || !monthButton || !currentMonthSpan) {
        console.error('Required DOM elements for calendar not found');
        return;
    }

    // Initialize with current date
    currentDate = new Date();
    
    // Set to first day of month for proper calendar rendering
    currentDate.setDate(1);
    
    // Set today as selected date
    selectedDate = new Date();
    
    // Update UI
    updateMonthDisplay();
    updateCalendar();
    calculateTotals();
    
    // Load transactions and show details for today
    updateTransactionsFromStorage();
    selectDate(selectedDate);
    
    // Make sure month dropdown works correctly
    document.querySelectorAll('.month-option').forEach(button => {
        const month = parseInt(button.dataset.month);
        if (month === currentDate.getMonth()) {
            button.classList.add('bg-blue-100', 'font-medium');
        } else {
            button.classList.remove('bg-blue-100', 'font-medium');
        }
    });

    document.querySelectorAll('.year-option').forEach(button => {
        const year = parseInt(button.dataset.year);
        if (year === currentDate.getFullYear()) {
            button.classList.add('bg-blue-100', 'font-medium');
        } else {
            button.classList.remove('bg-blue-100', 'font-medium');
        }
    });
});

// Variáveis de estado para controlar a visualização
let currentView = 'month'; // 'month' ou 'year'
let previousView = null; // Armazena a visualização anterior
const calendarDays = document.getElementById('calendar-days');

// Função para obter transações do mês inteiro
const getTransactionsForMonth = (year, month) => {
    // Ensure we have latest transactions data
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Format month as MM for comparison (1-12 format to 01-12 format)
    const monthStr = String(month + 1).padStart(2, '0');
    
    // Filter transactions for the specific month
    return transactions.filter(t => {
        return t.date.startsWith(`${year}-${monthStr}`);
    });
};

// Calcular totais para um mês específico
const calculateMonthTotals = (transactions) => {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + t.amount, 0);
        
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + t.amount, 0);
        
    return {
        income,
        expenses,
        balance: income - expenses
    };
};

// Função para criar botão de voltar
const createBackButton = () => {
    // Verificar se já existe um botão de voltar
    let backButton = document.getElementById('back-to-year-view');
    if (backButton) {
        return backButton;
    }
    
    // Criar botão de voltar
    backButton = document.createElement('button');
    backButton.id = 'back-to-year-view';
    backButton.className = 'flex items-center text-sm bg-blue-500 text-white rounded-md px-3 py-2 hover:bg-blue-600 transition-colors mb-6';
    backButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        <span>Voltar para visão anual</span>
    `;
    
    // Adicionar evento de clique
    backButton.addEventListener('click', () => {
        switchView('year');
    });
    
    // Inicialmente escondido
    backButton.style.opacity = '0';
    backButton.style.transform = 'translateY(-10px)';
    backButton.style.display = 'none';
    
    // Inserir no DOM no contêiner do calendário
    const calendarContainer = document.querySelector('.bg-white.p-6.rounded-xl.shadow-md.mb-8, .bg-gray-800.p-6.rounded-xl.shadow-md.mb-8');
    if (calendarContainer) {
        // Criar um wrapper div para o botão com margem adicional
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'mb-4'; // Adiciona margem abaixo do wrapper
        buttonWrapper.appendChild(backButton);
        
        // Inserir antes do título do calendário
        const calendarTitle = calendarContainer.querySelector('.flex.justify-between.items-center.mb-6');
        if (calendarTitle) {
            calendarTitle.parentNode.insertBefore(buttonWrapper, calendarTitle);
        } else {
            calendarContainer.insertBefore(buttonWrapper, calendarContainer.firstChild);
        }
    }
    
    return backButton;
};

// Alternar entre visualizações do mês e do ano
const switchView = (view) => {
    previousView = currentView; // Guardar visualização anterior
    currentView = view;
    
    // Obter ou criar o botão de voltar
    const backButton = createBackButton();
    
    if (view === 'month') {
        // Mostrar cabeçalhos dos dias da semana
        calendarDays.classList.remove('hidden');
        
        // Configurar o container para ter o mesmo estilo visual do calendário default
        const calendarContainer = document.querySelector('.bg-white.p-6.rounded-xl.shadow-md.mb-8, .bg-gray-800.p-6.rounded-xl.shadow-md.mb-8');
        if (calendarContainer) {
            // Aplicar o mesmo estilo de fundo do calendário default
            calendarContainer.classList.remove('bg-white');
            calendarContainer.style.backgroundColor = '#1e2130';
            calendarContainer.style.color = '#ffffff';
        }

        // Ajustar o grid do calendário de volta para 7 colunas (dias da semana)
        calendarDates.className = 'grid grid-cols-7 gap-2';
        
        // Atualizar visualização do mês
        updateCalendar();
        
        // Mostrar botão de voltar apenas se a visualização anterior era anual
        if (previousView === 'year') {
            backButton.style.display = 'flex';
            setTimeout(() => {
                backButton.style.transition = 'all 0.3s ease';
                backButton.style.opacity = '1';
                backButton.style.transform = 'translateY(0)';
            }, 10);
        } else {
            backButton.style.opacity = '0';
            backButton.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                backButton.style.display = 'none';
            }, 300);
        }
    } else {
        // Ocultar cabeçalhos dos dias da semana para a visualização anual
        calendarDays.classList.add('hidden');
        
        // Atualizar visualização do ano
        updateYearView();
        
        // Esconder botão de voltar na visualização anual
        backButton.style.opacity = '0';
        backButton.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            backButton.style.display = 'none';
        }, 300);
    }
    
    // Ocultar detalhes de transação quando mudar de visualização
    if (!transactionDetails.classList.contains('hidden')) {
        transactionDetails.classList.add('hidden');
    }
};

// Atualizar visualização do ano
const updateYearView = () => {
    calendarDates.innerHTML = '';
    
    const currentYear = currentDate.getFullYear();
    const today = new Date();
    
    // Criar grid de meses (3 colunas)
    calendarDates.className = 'grid grid-cols-3 gap-4 calendar-year-view';
    
    // Nome dos meses em português
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Criar card para cada mês
    for (let month = 0; month < 12; month++) {
        // Obter transações do mês
        const monthTransactions = getTransactionsForMonth(currentYear, month);
        const totals = calculateMonthTotals(monthTransactions);
        
        // Verificar se é o mês atual
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === currentYear;
        
        // Criar elemento do mês com o estilo do tema escuro do calendário principal
        const monthCard = document.createElement('div');
        monthCard.className = `p-4 rounded-lg border border-gray-700 hover:shadow-lg transition-all cursor-pointer year-view-card`;
        
        // Determinar classe de cor baseada no saldo
        let balanceClass = 'text-gray-300';
        if (totals.balance > 0) balanceClass = 'text-green-500';
        if (totals.balance < 0) balanceClass = 'text-red-500';
        
        // Criar indicadores de transação
        const hasTransactions = monthTransactions.length > 0;
        let transactionIndicators = '';
        
        if (hasTransactions) {
            const hasIncome = monthTransactions.some(t => t.type === 'income');
            const hasExpense = monthTransactions.some(t => t.type === 'expense');
            
            transactionIndicators = `
                <div class="flex justify-center gap-2 mt-2">
                    ${hasIncome ? '<span class="h-2 w-2 rounded-full bg-green-500"></span>' : ''}
                    ${hasExpense ? '<span class="h-2 w-2 rounded-full bg-red-500"></span>' : ''}
                </div>
            `;
        }
        
        // Mini-calendário representativo do mês
        const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, month, 1).getDay();
        
        // Criar grid para mini-calendário com o mesmo estilo do calendário principal
        let miniCalendar = `<div class="grid grid-cols-7 gap-1 mt-3 mini-calendar">`;
        
        // Adicionar cabeçalhos dos dias (abreviados)
        const dayAbbr = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        dayAbbr.forEach(day => {
            miniCalendar += `<div class="text-center text-xs text-gray-400">${day}</div>`;
        });
        
        // Adicionar espaços em branco para os dias antes do primeiro dia do mês
        for (let i = 0; i < firstDayOfMonth; i++) {
            miniCalendar += `<div class="text-center text-xs"></div>`;
        }
        
        // Adicionar dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            // Verificar se é o dia atual
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === currentYear;
            
            // Verificar se há transações nesta data
            const date = new Date(currentYear, month, day);
            const dateTransactions = getTransactionsForDate(date);
            const hasTransactions = dateTransactions.length > 0;
            
            // Estilo para destacar o dia atual
            let dayStyle = '';
            let dayClass = '';
            
            if (isToday) {
                // Se for o dia atual, usar círculo azul perfeito com texto centralizado
                dayClass = 'text-white';
                dayStyle = `style="
                    background-color: #3b82f6; 
                    border-radius: 50%; 
                    font-weight: 500;
                    width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                "`;
            } else {
                // Estilo padrão para os outros dias
                dayClass = hasTransactions ? 'font-medium text-white' : 'text-gray-300';
            }
            
            // Indicadores de transação - pequenos círculos coloridos
            let indicators = '';
            if (hasTransactions) {
                const hasIncome = dateTransactions.some(t => t.type === 'income');
                const hasExpense = dateTransactions.some(t => t.type === 'expense');
                
                if (hasIncome || hasExpense) {
                    indicators = '<div class="flex justify-center gap-1 mt-0.5">';
                    if (hasIncome) indicators += '<span class="h-1 w-1 rounded-full bg-green-500"></span>';
                    if (hasExpense) indicators += '<span class="h-1 w-1 rounded-full bg-red-500"></span>';
                    indicators += '</div>';
                }
            }
            
            // Criar célula do dia com o mesmo estilo visual do calendário principal
            if (isToday) {
                // Célula especial para o dia atual com div interno centralizado
                miniCalendar += `
                    <div class="text-center text-xs flex justify-center items-center">
                        <div ${dayStyle}>${day}</div>
                        ${indicators}
                    </div>
                `;
            } else {
                // Célula normal para os outros dias
                miniCalendar += `
                    <div class="text-center text-xs ${dayClass}">
                        ${day}
                        ${indicators}
                    </div>
                `;
            }
        }
        
        miniCalendar += `</div>`;
        
        // Adicionar conteúdo ao card
        monthCard.innerHTML = `
            <div class="text-center">
                <h3 class="font-medium ${isCurrentMonth ? 'text-blue-500' : 'text-white'}">${monthNames[month]}</h3>
                ${miniCalendar}
                
                <div class="mt-3 font-semibold ${balanceClass}">
                    ${formatCurrency(totals.balance)}
                </div>
                <div class="flex justify-between text-xs mt-1">
                    <span class="text-green-500">+${formatCurrency(totals.income)}</span>
                    <span class="text-red-500">-${formatCurrency(totals.expenses)}</span>
                </div>
                ${transactionIndicators}
            </div>
        `;
        
        // Evento de clique para navegar para o mês
        monthCard.addEventListener('click', () => {
            currentDate.setMonth(month);
            updateMonthDisplay();
            switchView('month');
        });
        
        calendarDates.appendChild(monthCard);
    }
};

// Adicionar modificação nas funções de evento click para os botões de visualização
const viewMonthBtn = document.getElementById('view-month');
const viewYearBtn = document.getElementById('view-year');

if (viewMonthBtn && viewYearBtn) {
    viewMonthBtn.addEventListener('click', () => {
        viewMonthBtn.classList.add('bg-blue-600', 'text-white');
        viewMonthBtn.classList.remove('hover:bg-gray-200');
        viewYearBtn.classList.remove('bg-blue-600', 'text-white');
        viewYearBtn.classList.add('hover:bg-gray-200', 'dark:hover:bg-gray-600');
        
        // Alternar para visualização de mês
        switchView('month');
    });

    viewYearBtn.addEventListener('click', () => {
        viewYearBtn.classList.add('bg-blue-600', 'text-white');
        viewYearBtn.classList.remove('hover:bg-gray-200');
        viewMonthBtn.classList.remove('bg-blue-600', 'text-white');
        viewMonthBtn.classList.add('hover:bg-gray-200', 'dark:hover:bg-gray-600');
        
        // Alternar para visualização de ano
        switchView('year');
    });
}