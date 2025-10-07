// Menu Control App - JavaScript

// Global variables
let deferredPrompt;
let editingDishId = null;
let salesChart, dishesChart, categoryChart;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize database
    initializeDatabase();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
    loadDishes();
    loadTodaySales();
    loadHistory();
    
    // Setup install prompt
    setupInstallPrompt();
    
    // Set current date
    updateDateDisplays();
    
    // Register service worker
    registerServiceWorker();
}

// Database operations using LocalStorage (simplified for demo)
class MenuDatabase {
    constructor() {
        this.dishes = JSON.parse(localStorage.getItem('menu_dishes') || '[]');
        this.sales = JSON.parse(localStorage.getItem('menu_sales') || '[]');
    }
    
    // Dishes CRUD
    addDish(dish) {
        dish.id = Date.now().toString();
        dish.createdAt = new Date().toISOString();
        this.dishes.push(dish);
        this.saveDishes();
        return dish;
    }
    
    updateDish(id, updatedDish) {
        const index = this.dishes.findIndex(d => d.id === id);
        if (index !== -1) {
            this.dishes[index] = { ...this.dishes[index], ...updatedDish };
            this.saveDishes();
            return this.dishes[index];
        }
        return null;
    }
    
    deleteDish(id) {
        this.dishes = this.dishes.filter(d => d.id !== id);
        this.saveDishes();
    }
    
    getDishes(category = '') {
        return category ? this.dishes.filter(d => d.category === category) : this.dishes;
    }
    
    getDish(id) {
        return this.dishes.find(d => d.id === id);
    }
    
    // Sales CRUD
    addSale(sale) {
        sale.id = Date.now().toString();
        sale.date = new Date().toISOString().split('T')[0];
        sale.timestamp = new Date().toISOString();
        this.sales.push(sale);
        this.saveSales();
        return sale;
    }
    
    getSales(startDate = '', endDate = '') {
        let filtered = this.sales;
        if (startDate) {
            filtered = filtered.filter(s => s.date >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter(s => s.date <= endDate);
        }
        return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    getTodaySales() {
        const today = new Date().toISOString().split('T')[0];
        return this.sales.filter(s => s.date === today);
    }
    
    // Save to localStorage
    saveDishes() {
        localStorage.setItem('menu_dishes', JSON.stringify(this.dishes));
    }
    
    saveSales() {
        localStorage.setItem('menu_sales', JSON.stringify(this.sales));
    }
}

// Initialize database instance
let db;

function initializeDatabase() {
    db = new MenuDatabase();
    
    // Add sample data if empty
    if (db.dishes.length === 0) {
        const sampleDishes = [
            {
                name: "Hamburguesa Clásica",
                category: "Principales",
                price: 12.50,
                description: "Hamburguesa con carne, lechuga, tomate y queso"
            },
            {
                name: "Pizza Margherita",
                category: "Principales",
                price: 15.00,
                description: "Pizza con salsa de tomate, mozzarella y albahaca"
            },
            {
                name: "Ensalada César",
                category: "Entradas",
                price: 8.50,
                description: "Ensalada con lechuga, pollo, crutones y aderezo césar"
            },
            {
                name: "Coca Cola",
                category: "Bebidas",
                price: 3.00,
                description: "Refresco de cola 350ml"
            },
            {
                name: "Tiramisú",
                category: "Postres",
                price: 6.50,
                description: "Postre italiano con café y mascarpone"
            }
        ];
        
        sampleDishes.forEach(dish => db.addDish(dish));
    }
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            showSection(section);
        });
    });
    
    // Mobile menu toggle
    document.getElementById('menuToggle').addEventListener('click', function() {
        document.getElementById('appNav').classList.toggle('active');
    });
    
    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', function() {
        loadDishes(this.value);
    });
    
    // Stats range
    document.getElementById('statsRange').addEventListener('change', function() {
        loadStatistics();
    });
    
    // Dish form
    document.getElementById('dishForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveDish();
    });
    
    // Modal close on background click
    document.getElementById('dishModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDishModal();
        }
    });
}

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    document.getElementById(sectionName).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Hide mobile menu
    document.getElementById('appNav').classList.remove('active');
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'dishes':
            loadDishes();
            break;
        case 'sales':
            loadSalesForm();
            loadTodaySales();
            break;
        case 'history':
            loadHistory();
            break;
        case 'stats':
            loadStatistics();
            break;
    }
}

// Dashboard
function loadDashboardData() {
    const dishes = db.getDishes();
    const todaySales = db.getTodaySales();
    
    // Update stats cards
    document.getElementById('totalDishes').textContent = dishes.length;
    document.getElementById('todaySales').textContent = todaySales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    const todayRevenue = todaySales.reduce((sum, sale) => {
        const dish = db.getDish(sale.dishId);
        return sum + (dish ? dish.price * sale.quantity : 0);
    }, 0);
    
    document.getElementById('todayRevenue').textContent = `$${todayRevenue.toFixed(2)}`;
}

// Dishes Management
function loadDishes(category = '') {
    const dishes = db.getDishes(category);
    const grid = document.getElementById('dishesGrid');
    
    if (dishes.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No hay platos registrados</h3>
                <p>Agrega tu primer plato para comenzar</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = dishes.map(dish => `
        <div class="dish-card">
            <div class="dish-header">
                <div class="dish-info">
                    <h4>${dish.name}</h4>
                    <span class="dish-category">${dish.category}</span>
                </div>
            </div>
            <div class="dish-price">$${dish.price.toFixed(2)}</div>
            <div class="dish-description">${dish.description || 'Sin descripción'}</div>
            <div class="dish-actions">
                <button class="btn-icon edit" onclick="editDish('${dish.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="deleteDish('${dish.id}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function showDishModal(dishId = null) {
    editingDishId = dishId;
    const modal = document.getElementById('dishModal');
    const form = document.getElementById('dishForm');
    
    if (dishId) {
        // Editing existing dish
        const dish = db.getDish(dishId);
        document.getElementById('modalTitle').textContent = 'Editar Plato';
        document.getElementById('dishName').value = dish.name;
        document.getElementById('dishCategory').value = dish.category;
        document.getElementById('dishPrice').value = dish.price;
        document.getElementById('dishDescription').value = dish.description || '';
    } else {
        // Adding new dish
        document.getElementById('modalTitle').textContent = 'Agregar Plato';
        form.reset();
    }
    
    modal.classList.add('active');
}

function closeDishModal() {
    document.getElementById('dishModal').classList.remove('active');
    editingDishId = null;
}

function saveDish() {
    const name = document.getElementById('dishName').value.trim();
    const category = document.getElementById('dishCategory').value;
    const price = parseFloat(document.getElementById('dishPrice').value);
    const description = document.getElementById('dishDescription').value.trim();
    
    if (!name || !category || !price) {
        showMessage('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    const dishData = { name, category, price, description };
    
    if (editingDishId) {
        db.updateDish(editingDishId, dishData);
        showMessage('Plato actualizado correctamente', 'success');
    } else {
        db.addDish(dishData);
        showMessage('Plato agregado correctamente', 'success');
    }
    
    closeDishModal();
    loadDishes();
    loadSalesForm();
    loadDashboardData();
}

function editDish(dishId) {
    showDishModal(dishId);
}

function deleteDish(dishId) {
    if (confirm('¿Estás seguro de que quieres eliminar este plato?')) {
        db.deleteDish(dishId);
        showMessage('Plato eliminado correctamente', 'success');
        loadDishes();
        loadSalesForm();
        loadDashboardData();
    }
}

// Sales Management
function loadSalesForm() {
    const dishes = db.getDishes();
    const select = document.getElementById('dishSelect');
    
    select.innerHTML = '<option value="">Seleccione un plato...</option>' +
        dishes.map(dish => `<option value="${dish.id}">${dish.name} - $${dish.price.toFixed(2)}</option>`).join('');
}

function addSale() {
    const dishId = document.getElementById('dishSelect').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    
    if (!dishId || !quantity || quantity < 1) {
        showMessage('Por favor selecciona un plato y una cantidad válida', 'error');
        return;
    }
    
    const dish = db.getDish(dishId);
    if (!dish) {
        showMessage('Plato no encontrado', 'error');
        return;
    }
    
    const sale = {
        dishId,
        dishName: dish.name,
        quantity,
        price: dish.price,
        total: dish.price * quantity
    };
    
    db.addSale(sale);
    showMessage('Venta registrada correctamente', 'success');
    
    // Reset form
    document.getElementById('dishSelect').value = '';
    document.getElementById('quantity').value = '1';
    
    // Reload data
    loadTodaySales();
    loadDashboardData();
}

function loadTodaySales() {
    const sales = db.getTodaySales();
    const list = document.getElementById('salesList');
    
    if (sales.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hay ventas registradas hoy</p>';
    } else {
        list.innerHTML = sales.map(sale => `
            <div class="sale-item">
                <div class="sale-info">
                    <div class="sale-name">${sale.dishName}</div>
                    <div class="sale-details">Cantidad: ${sale.quantity} x $${sale.price.toFixed(2)}</div>
                </div>
                <div class="sale-amount">$${sale.total.toFixed(2)}</div>
            </div>
        `).join('');
    }
    
    // Update summary
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
    
    document.getElementById('totalQuantity').textContent = totalQuantity;
    document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
}

// History
function loadHistory() {
    const sales = db.getSales();
    const list = document.getElementById('historyList');
    
    if (sales.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hay historial de ventas</p>';
        return;
    }
    
    // Group sales by date
    const groupedSales = sales.reduce((groups, sale) => {
        const date = sale.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(sale);
        return groups;
    }, {});
    
    list.innerHTML = Object.entries(groupedSales).map(([date, daySales]) => {
        const dayTotal = daySales.reduce((sum, sale) => sum + sale.total, 0);
        const dayQuantity = daySales.reduce((sum, sale) => sum + sale.quantity, 0);
        
        return `
            <div class="history-date">
                ${formatDate(date)} - ${dayQuantity} platos - $${dayTotal.toFixed(2)}
            </div>
            <div class="history-items">
                ${daySales.map(sale => `
                    <div class="history-item">
                        <div>
                            <strong>${sale.dishName}</strong><br>
                            <small>Cantidad: ${sale.quantity} x $${sale.price.toFixed(2)}</small>
                        </div>
                        <div>$${sale.total.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

function filterHistory() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const sales = db.getSales(startDate, endDate);
    const list = document.getElementById('historyList');
    
    if (sales.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hay ventas en el rango seleccionado</p>';
        return;
    }
    
    // Same grouping logic as loadHistory but with filtered data
    const groupedSales = sales.reduce((groups, sale) => {
        const date = sale.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(sale);
        return groups;
    }, {});
    
    list.innerHTML = Object.entries(groupedSales).map(([date, daySales]) => {
        const dayTotal = daySales.reduce((sum, sale) => sum + sale.total, 0);
        const dayQuantity = daySales.reduce((sum, sale) => sum + sale.quantity, 0);
        
        return `
            <div class="history-date">
                ${formatDate(date)} - ${dayQuantity} platos - $${dayTotal.toFixed(2)}
            </div>
            <div class="history-items">
                ${daySales.map(sale => `
                    <div class="history-item">
                        <div>
                            <strong>${sale.dishName}</strong><br>
                            <small>Cantidad: ${sale.quantity} x $${sale.price.toFixed(2)}</small>
                        </div>
                        <div>$${sale.total.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

// Statistics
function loadStatistics() {
    const range = document.getElementById('statsRange').value;
    let startDate;
    
    const now = new Date();
    switch(range) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const sales = db.getSales(startDateStr);
    
    // Destroy existing charts
    if (salesChart) salesChart.destroy();
    if (dishesChart) dishesChart.destroy();
    if (categoryChart) categoryChart.destroy();
    
    // Create charts
    createSalesChart(sales, range);
    createDishesChart(sales);
    createCategoryChart(sales);
}

function createSalesChart(sales, range) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Group sales by date
    const salesByDate = sales.reduce((groups, sale) => {
        const date = sale.date;
        if (!groups[date]) {
            groups[date] = 0;
        }
        groups[date] += sale.total;
        return groups;
    }, {});
    
    const labels = Object.keys(salesByDate).sort();
    const data = labels.map(date => salesByDate[date]);
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(date => formatDate(date)),
            datasets: [{
                label: 'Ingresos ($)',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

function createDishesChart(sales) {
    const ctx = document.getElementById('dishesChart').getContext('2d');
    
    // Group sales by dish
    const salesByDish = sales.reduce((groups, sale) => {
        const dishName = sale.dishName;
        if (!groups[dishName]) {
            groups[dishName] = 0;
        }
        groups[dishName] += sale.quantity;
        return groups;
    }, {});
    
    // Get top 5 dishes
    const topDishes = Object.entries(salesByDish)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const labels = topDishes.map(([dish]) => dish);
    const data = topDishes.map(([, quantity]) => quantity);
    
    dishesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createCategoryChart(sales) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // Group sales by category
    const salesByCategory = sales.reduce((groups, sale) => {
        const dish = db.getDish(sale.dishId);
        if (dish) {
            const category = dish.category;
            if (!groups[category]) {
                groups[category] = 0;
            }
            groups[category] += sale.total;
        }
        return groups;
    }, {});
    
    const labels = Object.keys(salesByCategory);
    const data = labels.map(category => salesByCategory[category]);
    
    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ingresos ($)',
                data: data,
                backgroundColor: '#667eea',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Export functions
function exportToday() {
    const sales = db.getTodaySales();
    exportSalesToCSV(sales, `ventas_${new Date().toISOString().split('T')[0]}.csv`);
}

function exportHistory() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const sales = db.getSales(startDate, endDate);
    
    const filename = startDate && endDate ? 
        `ventas_${startDate}_${endDate}.csv` : 
        'ventas_historial.csv';
    
    exportSalesToCSV(sales, filename);
}

function exportSalesToCSV(sales, filename) {
    if (sales.length === 0) {
        showMessage('No hay datos para exportar', 'info');
        return;
    }
    
    const headers = ['Fecha', 'Plato', 'Categoría', 'Cantidad', 'Precio Unitario', 'Total'];
    const csvData = [headers];
    
    sales.forEach(sale => {
        const dish = db.getDish(sale.dishId);
        csvData.push([
            sale.date,
            sale.dishName,
            dish ? dish.category : 'N/A',
            sale.quantity,
            sale.price.toFixed(2),
            sale.total.toFixed(2)
        ]);
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('Archivo CSV descargado correctamente', 'success');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updateDateDisplays() {
    const now = new Date();
    const dateString = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('currentDate').textContent = dateString;
    document.getElementById('salesDate').textContent = dateString;
    
    // Set default date filters
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    document.getElementById('endDate').value = today;
    document.getElementById('startDate').value = weekAgo;
}

function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Insert at top of main content
    const main = document.querySelector('.app-main');
    main.insertBefore(messageDiv, main.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// PWA Install
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install prompt after 30 seconds
        setTimeout(() => {
            showInstallPrompt();
        }, 30000);
    });
    
    document.getElementById('installBtn').addEventListener('click', installApp);
}

function showInstallPrompt() {
    if (deferredPrompt) {
        document.getElementById('installPrompt').classList.add('show');
    }
}

function hideInstallPrompt() {
    document.getElementById('installPrompt').classList.remove('show');
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showMessage('¡App instalada correctamente!', 'success');
            }
            deferredPrompt = null;
            hideInstallPrompt();
        });
    }
}

// Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('Service Worker registrado:', registration);
            })
            .catch((error) => {
                console.log('Error al registrar Service Worker:', error);
            });
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showSection('dashboard');
                break;
            case '2':
                e.preventDefault();
                showSection('dishes');
                break;
            case '3':
                e.preventDefault();
                showSection('sales');
                break;
            case '4':
                e.preventDefault();
                showSection('history');
                break;
            case '5':
                e.preventDefault();
                showSection('stats');
                break;
        }
    }
});

// Handle offline/online status
window.addEventListener('online', function() {
    showMessage('Conexión restaurada', 'success');
});

window.addEventListener('offline', function() {
    showMessage('Sin conexión - Los datos se guardan localmente', 'info');
});