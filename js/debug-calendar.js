/**
 * Calendar debugging utilities
 * Add this script to calendario-page.html to help troubleshoot calendar issues
 */

function debugCalendar() {
    console.log("=== Calendar Debug Info ===");
    
    // Check essential DOM elements
    const elements = [
        'calendar-dates', 
        'calendar-days', 
        'month-button', 
        'current-month',
        'transaction-details',
        'selected-date-transactions'
    ];
    
    console.log("Checking DOM elements:");
    elements.forEach(id => {
        const el = document.getElementById(id);
        console.log(`${id}: ${el ? 'Found ✓' : 'MISSING ⚠️'}`);
    });
    
    // Check calendar state
    console.log("\nCalendar state:");
    console.log("Current date:", window.currentDate || "Not set");
    console.log("Selected date:", window.selectedDate || "Not set");
    
    // Check transactions
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    console.log("\nTransactions:");
    console.log(`Total transactions: ${transactions.length}`);
    
    if (transactions.length > 0) {
        console.log("Sample transaction:", transactions[0]);
        
        // Check if there are transactions in the current month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
        
        console.log(`Transactions in current month: ${currentMonthTransactions.length}`);
        
        if (currentMonthTransactions.length > 0) {
            // Group by date
            const byDate = {};
            currentMonthTransactions.forEach(t => {
                if (!byDate[t.date]) byDate[t.date] = [];
                byDate[t.date].push(t);
            });
            
            console.log(`Days with transactions: ${Object.keys(byDate).length}`);
            console.log("First day with transactions:", Object.keys(byDate)[0]);
        }
    }
    
    // Check rendering
    const calendarDates = document.getElementById('calendar-dates');
    if (calendarDates) {
        console.log("\nCalendar rendering:");
        console.log(`Calendar cells: ${calendarDates.children.length}`);
        console.log(`Empty cells: ${Array.from(calendarDates.children).filter(el => !el.textContent.trim()).length}`);
        console.log(`Day cells: ${Array.from(calendarDates.children).filter(el => el.textContent.trim()).length}`);
    }
}

// Run debug automatically when added to the page
window.addEventListener('DOMContentLoaded', () => {
    console.log("Calendar debugging script loaded");
    
    // Add debug button to the page
    const header = document.querySelector('header');
    if (header) {
        const debugBtn = document.createElement('button');
        debugBtn.className = 'bg-red-500 text-white px-3 py-1 rounded text-sm';
        debugBtn.textContent = 'Debug Calendar';
        debugBtn.style.position = 'absolute';
        debugBtn.style.top = '10px';
        debugBtn.style.right = '10px';
        debugBtn.addEventListener('click', debugCalendar);
        header.appendChild(debugBtn);
    }
    
    // Debug automatically after 2 seconds (allows time for everything to load)
    setTimeout(debugCalendar, 2000);
});
