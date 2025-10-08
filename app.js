class MenuControlApp {
    constructor() {
        this.dishes = JSON.parse(localStorage.getItem('dishes')) || [];
        this.sales = JSON.parse(localStorage.getItem('sales')) || [];
        this.categories = ['Desayuno', 'Almuerzo', 'Cena', 'Bebidas', 'Postres'];
        this.currentEditingDish = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadData();
        this.updateStats();
        
        console.log('📱 Aplicación de Control de Menú inicializada');
    }

    initializeElements() {
        // Elementos principales
        this.dishModal = document.getElementById('dish-modal');
        this.saleModal = document.getElementById('sale-modal');
        this.dishForm = document.getElementById('dish-form');
        this.saleForm = document.getElementById('sale-form');
        
        // Botones
        this.addDishBtn = document.getElementById('add-dish-btn');
        this.addSaleBtn = document.getElementById('add-sale-btn');
        this.closeModalBtn = document.getElementById('close-modal');
        this.closeSaleModalBtn = document.getElementById('close-sale-modal');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.cancelSaleBtn = document.getElementById('cancel-sale-btn');
        
        // Listas
        this.dishesList = document.getElementById('dishes-list');
        this.salesList = document.getElementById('sales-list');
        
        // Búsqueda y filtros
        this.searchDishes = document.getElementById('search-dishes');
        this.filterCategory = document.getElementById('filter-category');
        
        // Estadísticas
        this.totalDishesEl = document.getElementById('total-dishes');
        this.totalSalesEl = document.getElementById('total-sales');
        this.totalRevenueEl = document.getElementById('total-revenue');
        this.lowStockEl = document.getElementById('low-stock');
        
        // Formularios
        this.dishNameInput = document.getElementById('dish-name');
        this.dishPriceInput = document.getElementById('dish-price');
        this.dishQuantityInput = document.getElementById('dish-quantity');
        this.dishCategoryInput = document.getElementById('dish-category');
        this.dishDescriptionInput = document.getElementById('dish-description');
        
        this.saleDishSelect = document.getElementById('sale-dish');
        this.saleQuantityInput = document.getElementById('sale-quantity');
        this.saleTotalInput = document.getElementById('sale-total');
        
        // Actividad reciente
        this.recentActivityList = document.getElementById('recent-activity-list');
    }

    bindEvents() {
        // Botones principales
        this.addDishBtn.addEventListener('click', () => this.openDishModal());
        this.addSaleBtn.addEventListener('click', () => this.openSaleModal());
        
        // Cerrar modales
        this.closeModalBtn.addEventListener('click', () => this.closeDishModal());
        this.closeSaleModalBtn.addEventListener('click', () => this.closeSaleModal());
        this.cancelBtn.addEventListener('click', () => this.closeDishModal());
        this.cancelSaleBtn.addEventListener('click', () => this.closeSaleModal());
        
        // Formularios
        this.dishForm.addEventListener('submit', (e) => this.handleDishSubmit(e));
        this.saleForm.addEventListener('submit', (e) => this.handleSaleSubmit(e));
        
        // Búsqueda y filtros
        this.searchDishes.addEventListener('input', () => this.filterDishes());
        this.filterCategory.addEventListener('change', () => this.filterDishes());
        
        // Cálculo automático en ventas
        this.saleDishSelect.addEventListener('change', () => this.updateSaleTotal());
        this.saleQuantityInput.addEventListener('input', () => this.updateSaleTotal());
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === this.dishModal) this.closeDishModal();
            if (e.target === this.saleModal) this.closeSaleModal();
        });
    }

    // Gestión de Platos
    openDishModal(dish = null) {
        this.currentEditingDish = dish;
        const modalTitle = document.getElementById('modal-title');
        const saveBtn = document.getElementById('save-dish-btn');
        
        if (dish) {
            modalTitle.textContent = 'Editar Plato';
            saveBtn.textContent = 'Actualizar';
            this.fillDishForm(dish);
        } else {
            modalTitle.textContent = 'Agregar Nuevo Plato';
            saveBtn.textContent = 'Guardar';
            this.dishForm.reset();
        }
        
        this.dishModal.style.display = 'block';
        this.dishNameInput.focus();
    }

    closeDishModal() {
        this.dishModal.style.display = 'none';
        this.currentEditingDish = null;
        this.dishForm.reset();
    }

    fillDishForm(dish) {
        this.dishNameInput.value = dish.name;
        this.dishPriceInput.value = dish.price;
        this.dishQuantityInput.value = dish.quantity;
        this.dishCategoryInput.value = dish.category;
        this.dishDescriptionInput.value = dish.description || '';
    }

    handleDishSubmit(e) {
        e.preventDefault();
        
        const dishData = {
            name: this.dishNameInput.value.trim(),
            price: parseFloat(this.dishPriceInput.value),
            quantity: parseInt(this.dishQuantityInput.value),
            category: this.dishCategoryInput.value,
            description: this.dishDescriptionInput.value.trim()
        };
        
        if (this.currentEditingDish) {
            this.updateDish({ ...this.currentEditingDish, ...dishData });
        } else {
            this.addDish({
                ...dishData,
                id: Date.now(),
                createdAt: new Date().toISOString()
            });
        }
        
        this.closeDishModal();
    }

    addDish(dish) {
        this.dishes.push(dish);
        this.saveDishes();
        this.loadDishes();
        this.updateStats();
        this.updateSaleDishOptions();
        
        this.addActivity(`Plato agregado: ${dish.name}`);
        
        // Notificación
        this.showNotification(`✅ Plato "${dish.name}" agregado exitosamente`, 'success');
        
        console.log('Plato agregado:', dish);
    }

    updateDish(updatedDish) {
        const index = this.dishes.findIndex(dish => dish.id === updatedDish.id);
        if (index !== -1) {
            this.dishes[index] = updatedDish;
            this.saveDishes();
            this.loadDishes();
            this.updateStats();
            this.updateSaleDishOptions();
            
            this.addActivity(`Plato actualizado: ${updatedDish.name}`);
            this.showNotification(`✅ Plato "${updatedDish.name}" actualizado`, 'success');
        }
    }

    deleteDish(dishId) {
        const dish = this.dishes.find(d => d.id === dishId);
        if (dish && confirm(`¿Estás seguro de eliminar "${dish.name}"?`)) {
            this.dishes = this.dishes.filter(d => d.id !== dishId);
            this.saveDishes();
            this.loadDishes();
            this.updateStats();
            this.updateSaleDishOptions();
            
            this.addActivity(`Plato eliminado: ${dish.name}`);
            this.showNotification(`🗑️ Plato "${dish.name}" eliminado`, 'warning');
        }
    }

    // Gestión de Ventas
    openSaleModal() {
        this.updateSaleDishOptions();
        this.saleForm.reset();
        this.saleModal.style.display = 'block';
        this.saleDishSelect.focus();
    }

    closeSaleModal() {
        this.saleModal.style.display = 'none';
        this.saleForm.reset();
    }

    updateSaleDishOptions() {
        this.saleDishSelect.innerHTML = '<option value="">Seleccionar plato</option>';
        
        this.dishes
            .filter(dish => dish.quantity > 0)
            .forEach(dish => {
                const option = document.createElement('option');
                option.value = dish.id;
                option.textContent = `${dish.name} - S/${dish.price.toFixed(2)} (Stock: ${dish.quantity})`;
                option.dataset.price = dish.price;
                option.dataset.maxQuantity = dish.quantity;
                this.saleDishSelect.appendChild(option);
            });
    }

    updateSaleTotal() {
        const selectedOption = this.saleDishSelect.selectedOptions[0];
        const quantity = parseInt(this.saleQuantityInput.value) || 0;
        
        if (selectedOption && quantity > 0) {
            const price = parseFloat(selectedOption.dataset.price);
            const maxQuantity = parseInt(selectedOption.dataset.maxQuantity);
            
            // Validar cantidad disponible
            if (quantity > maxQuantity) {
                this.saleQuantityInput.value = maxQuantity;
                this.showNotification(`⚠️ Cantidad máxima disponible: ${maxQuantity}`, 'warning');
                return;
            }
            
            const total = price * quantity;
            this.saleTotalInput.value = total.toFixed(2);
        } else {
            this.saleTotalInput.value = '';
        }
    }

    handleSaleSubmit(e) {
        e.preventDefault();
        
        const dishId = parseInt(this.saleDishSelect.value);
        const quantity = parseInt(this.saleQuantityInput.value);
        const total = parseFloat(this.saleTotalInput.value);
        
        const dish = this.dishes.find(d => d.id === dishId);
        if (!dish) {
            this.showNotification('❌ Error: Plato no encontrado', 'error');
            return;
        }
        
        if (quantity > dish.quantity) {
            this.showNotification('❌ Error: Cantidad insuficiente en stock', 'error');
            return;
        }
        
        const sale = {
            id: Date.now(),
            dishId: dishId,
            dishName: dish.name,
            quantity: quantity,
            unitPrice: dish.price,
            total: total,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        this.addSale(sale);
        this.closeSaleModal();
    }

    addSale(sale) {
        // Agregar venta
        this.sales.push(sale);
        this.saveSales();
        
        // Reducir stock
        const dish = this.dishes.find(d => d.id === sale.dishId);
        if (dish) {
            dish.quantity -= sale.quantity;
            this.saveDishes();
        }
        
        this.loadSales();
        this.loadDishes();
        this.updateStats();
        this.updateSaleDishOptions();
        
        this.addActivity(`Venta registrada: ${sale.quantity}x ${sale.dishName} - S/${sale.total.toFixed(2)}`);
        this.showNotification(`💰 Venta registrada: S/${sale.total.toFixed(2)}`, 'success');
        
        console.log('Venta agregada:', sale);
    }

    deleteSale(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (sale && confirm(`¿Eliminar venta de ${sale.dishName}?`)) {
            // Restaurar stock
            const dish = this.dishes.find(d => d.id === sale.dishId);
            if (dish) {
                dish.quantity += sale.quantity;
                this.saveDishes();
            }
            
            // Eliminar venta
            this.sales = this.sales.filter(s => s.id !== saleId);
            this.saveSales();
            
            this.loadSales();
            this.loadDishes();
            this.updateStats();
            this.updateSaleDishOptions();
            
            this.addActivity(`Venta eliminada: ${sale.dishName}`);
            this.showNotification(`🗑️ Venta eliminada`, 'warning');
        }
    }

    // Carga de datos
    loadData() {
        this.loadDishes();
        this.loadSales();
        this.updateSaleDishOptions();
        this.loadRecentActivity();
    }

    loadDishes() {
        this.dishesList.innerHTML = '';
        
        const filteredDishes = this.getFilteredDishes();
        
        if (filteredDishes.length === 0) {
            this.dishesList.innerHTML = '<div class="empty-state">📝 No hay platos que coincidan con tu búsqueda</div>';
            return;
        }
        
        filteredDishes.forEach(dish => {
            const dishElement = this.createDishElement(dish);
            this.dishesList.appendChild(dishElement);
        });
    }

    createDishElement(dish) {
        const dishDiv = document.createElement('div');
        dishDiv.className = 'dish-item';
        dishDiv.innerHTML = `
            <div class="dish-info">
                <div class="dish-name">${dish.name}</div>
                <div class="dish-details">
                    ${dish.category} • Stock: ${dish.quantity} unidades
                    ${dish.description ? `• ${dish.description}` : ''}
                </div>
            </div>
            <div class="dish-price">S/${dish.price.toFixed(2)}</div>
            <div class="dish-actions">
                <button class="edit-btn" onclick="window.menuApp.openDishModal(${JSON.stringify(dish).replace(/"/g, '&quot;')})">
                    ✏️ Editar
                </button>
                <button class="delete-btn" onclick="window.menuApp.deleteDish(${dish.id})">
                    🗑️ Eliminar
                </button>
            </div>
        `;
        
        // Marcar platos con stock bajo
        if (dish.quantity < 5) {
            dishDiv.style.borderLeft = '4px solid var(--warning-color)';
            dishDiv.style.backgroundColor = '#fff3cd';
        }
        
        return dishDiv;
    }

    loadSales() {
        this.salesList.innerHTML = '';
        
        // Filtrar ventas del día actual
        const today = new Date().toDateString();
        const todaySales = this.sales.filter(sale => {
            return new Date(sale.date).toDateString() === today;
        }).sort((a, b) => b.timestamp - a.timestamp);
        
        if (todaySales.length === 0) {
            this.salesList.innerHTML = '<div class="empty-state">💰 No hay ventas registradas hoy</div>';
            return;
        }
        
        todaySales.forEach(sale => {
            const saleElement = this.createSaleElement(sale);
            this.salesList.appendChild(saleElement);
        });
    }

    createSaleElement(sale) {
        const saleDiv = document.createElement('div');
        saleDiv.className = 'sale-item';
        
        const saleTime = new Date(sale.date).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        saleDiv.innerHTML = `
            <div class="sale-info">
                <div class="sale-dish">${sale.dishName}</div>
                <div class="sale-details">
                    ${saleTime} • Cantidad: ${sale.quantity} • S/${sale.unitPrice.toFixed(2)} c/u
                </div>
            </div>
            <div class="sale-total">S/${sale.total.toFixed(2)}</div>
            <div class="sale-actions">
                <button class="delete-btn" onclick="window.menuApp.deleteSale(${sale.id})">
                    🗑️ Eliminar
                </button>
            </div>
        `;
        
        return saleDiv;
    }

    // Filtros y búsqueda
    getFilteredDishes() {
        let filtered = [...this.dishes];
        
        // Filtro por búsqueda
        const searchTerm = this.searchDishes.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(dish => 
                dish.name.toLowerCase().includes(searchTerm) ||
                dish.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filtro por categoría
        const selectedCategory = this.filterCategory.value;
        if (selectedCategory) {
            filtered = filtered.filter(dish => dish.category === selectedCategory);
        }
        
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    filterDishes() {
        this.loadDishes();
    }

    // Estadísticas
    updateStats() {
        const totalDishes = this.dishes.length;
        const lowStockCount = this.dishes.filter(dish => dish.quantity < 5).length;
        
        // Ventas del día
        const today = new Date().toDateString();
        const todaySales = this.sales.filter(sale => 
            new Date(sale.date).toDateString() === today
        );
        
        const totalSales = todaySales.length;
        const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
        
        // Actualizar elementos
        this.totalDishesEl.textContent = totalDishes;
        this.totalSalesEl.textContent = totalSales;
        this.totalRevenueEl.textContent = `S/${totalRevenue.toFixed(2)}`;
        this.lowStockEl.textContent = lowStockCount;
        
        // Cambiar color si hay stock bajo
        if (lowStockCount > 0) {
            this.lowStockEl.style.color = 'var(--danger-color)';
        } else {
            this.lowStockEl.style.color = 'var(--primary-color)';
        }
    }

    // Actividad reciente
    addActivity(message) {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        const activity = {
            id: Date.now(),
            message: message,
            timestamp: new Date().toISOString()
        };
        
        activities.unshift(activity);
        
        // Mantener solo las últimas 20 actividades
        if (activities.length > 20) {
            activities.splice(20);
        }
        
        localStorage.setItem('activities', JSON.stringify(activities));
        this.loadRecentActivity();
    }

    loadRecentActivity() {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        if (this.recentActivityList) {
            this.recentActivityList.innerHTML = '';
            
            if (activities.length === 0) {
                this.recentActivityList.innerHTML = '<div class="empty-state">📊 No hay actividad reciente</div>';
                return;
            }
            
            activities.slice(0, 10).forEach(activity => {
                const activityElement = document.createElement('div');
                activityElement.className = 'activity-item';
                
                const timeAgo = this.getTimeAgo(activity.timestamp);
                
                activityElement.innerHTML = `
                    <div>${activity.message}</div>
                    <div class="activity-time">${timeAgo}</div>
                `;
                
                this.recentActivityList.appendChild(activityElement);
            });
        }
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
        
        return time.toLocaleDateString('es-PE');
    }

    // Notificaciones
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationColor(type) {
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3'
        };
        return colors[type] || colors.info;
    }

    // Almacenamiento
    saveDishes() {
        localStorage.setItem('dishes', JSON.stringify(this.dishes));
    }

    saveSales() {
        localStorage.setItem('sales', JSON.stringify(this.sales));
    }

    // Exportar datos
    exportData() {
        const data = {
            dishes: this.dishes,
            sales: this.sales,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `menu-control-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('📁 Datos exportados exitosamente', 'success');
    }
}

// Funciones globales para compatibilidad con el asistente IA
window.addDish = function(dish) {
    if (window.menuApp) {
        window.menuApp.addDish(dish);
    }
};

window.updateDish = function(dish) {
    if (window.menuApp) {
        window.menuApp.updateDish(dish);
    }
};

window.deleteDish = function(dishId) {
    if (window.menuApp) {
        window.menuApp.deleteDish(dishId);
    }
};

window.addSale = function(sale) {
    if (window.menuApp) {
        window.menuApp.addSale(sale);
    }
};

// Agregar estilos de animación
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(300px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(300px);
        }
    }
    
    .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #6c757d;
        font-style: italic;
    }
`;
document.head.appendChild(animationStyles);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.menuApp = new MenuControlApp();
    console.log('🚀 Aplicación completamente inicializada');
});