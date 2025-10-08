// Sistema de Control de Menú - Funcionalidad Principal
class MenuControlSystem {
    constructor() {
        this.dishes = [
            { id: 1, name: '🥗 Ensalada César', price: 42.99, available: true },
            { id: 2, name: '🍝 Pasta Carbonara', price: 48.99, available: true },
            { id: 3, name: '🥩 Filete de Res', price: 89.99, available: false },
            { id: 4, name: '🍕 Pizza Margherita', price: 52.99, available: true },
            { id: 5, name: '🥘 Ensalada Griega', price: 38.99, available: true },
            { id: 6, name: '🍗 Pollo a la Parrilla', price: 65.99, available: true },
            { id: 7, name: '🍜 Ramen Especial', price: 28.99, available: true }
        ];
        
        this.stats = {
            orders: 87,
            sales: 3420,
            topDishes: 5,
            satisfaction: 94
        };
        
        this.initializeApp();
    }

    initializeApp() {
        console.log('Inicializando sistema de menú...');
        
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupUI();
            });
        } else {
            this.setupUI();
        }
    }

    setupUI() {
        this.renderDishes();
        this.renderStats();
        this.initializeEventListeners();
        this.initializeServiceWorker();
        
        // Actualizar estadísticas periódicamente
        setInterval(() => this.updateStats(), 15000); // Cada 15 segundos
        
        console.log('Sistema de menú inicializado correctamente');
    }

    initializeEventListeners() {
        // Toggle del asistente IA
        const toggleAI = document.getElementById('toggle-ai');
        const aiContainer = document.getElementById('ai-container');
        
        if (toggleAI && aiContainer) {
            toggleAI.addEventListener('click', () => {
                const isHidden = aiContainer.style.display === 'none';
                aiContainer.style.display = isHidden ? 'block' : 'none';
                toggleAI.textContent = isHidden ? 'Ocultar IA' : 'Mostrar IA';
            });
        }
        
        // Click en platos para toggle disponibilidad
        document.addEventListener('click', (e) => {
            if (e.target.closest('.dish-item')) {
                const dishElement = e.target.closest('.dish-item');
                const dishId = parseInt(dishElement.dataset.dishId);
                if (dishId) {
                    this.toggleDishAvailability(dishId);
                }
            }
        });
        
        console.log('Event listeners inicializados');
    }

    renderDishes() {
        const container = document.getElementById('available-dishes');
        if (!container) {
            console.warn('Contenedor de platos no encontrado');
            return;
        }
        
        const dishesHTML = this.dishes.map(dish => `
            <div class="dish-item" data-dish-id="${dish.id}" style="cursor: pointer;" title="Click para cambiar disponibilidad">
                <span class="dish-name">${dish.name}</span>
                <span class="dish-price">S/ ${dish.price.toFixed(2)}</span>
                <span class="dish-status ${dish.available ? 'available' : 'unavailable'}">
                    ${dish.available ? 'Disponible' : 'Agotado'}
                </span>
            </div>
        `).join('');
        
        container.innerHTML = dishesHTML;
        console.log('Platos renderizados:', this.dishes.length);
    }

    renderStats() {
        const statsContainer = document.querySelector('.stats-grid');
        if (!statsContainer) {
            console.warn('Contenedor de estadísticas no encontrado');
            return;
        }
        
        const statsHTML = `
            <div class="stat-item">
                <div class="stat-number">${this.stats.orders}</div>
                <div class="stat-label">Órdenes</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">S/ ${this.stats.sales}</div>
                <div class="stat-label">Ventas</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${this.stats.topDishes}</div>
                <div class="stat-label">Platos Top</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${this.stats.satisfaction}%</div>
                <div class="stat-label">Satisfacción</div>
            </div>
        `;
        
        statsContainer.innerHTML = statsHTML;
        console.log('Estadísticas renderizadas:', this.stats);
    }

    toggleDishAvailability(dishId) {
        const dish = this.dishes.find(d => d.id === dishId);
        if (dish) {
            dish.available = !dish.available;
            this.renderDishes();
            
            // Notificar cambio
            this.showNotification(
                `${dish.name} ${dish.available ? 'está disponible' : 'agotado'} ahora`,
                dish.available ? 'success' : 'warning'
            );
            
            console.log(`Plato ${dishId} cambiado a: ${dish.available ? 'disponible' : 'agotado'}`);
        }
    }

    updateStats() {
        // Simular actualización de estadísticas
        const oldOrders = this.stats.orders;
        this.stats.orders += Math.floor(Math.random() * 2);
        
        if (this.stats.orders > oldOrders) {
            this.stats.sales += Math.floor(Math.random() * 100) + 30;
        }
        
        this.stats.satisfaction = Math.max(88, Math.min(98, this.stats.satisfaction + (Math.random() - 0.5) * 3));
        this.stats.satisfaction = Math.round(this.stats.satisfaction);
        
        this.renderStats();
        console.log('Estadísticas actualizadas:', this.stats);
    }

    showNotification(message, type = 'info') {
        // Crear notificación visual
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos de la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#6366f1',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            zIndex: '10000',
            maxWidth: '300px',
            fontSize: '14px',
            fontWeight: '500',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('ServiceWorker registrado correctamente:', registration);
            } catch (error) {
                console.log('Error al registrar ServiceWorker:', error);
            }
        }
    }

    // Métodos para la API del menú
    addDish(name, price) {
        const newDish = {
            id: Math.max(...this.dishes.map(d => d.id)) + 1,
            name,
            price: parseFloat(price),
            available: true
        };
        
        this.dishes.push(newDish);
        this.renderDishes();
        this.showNotification(`${name} agregado al menú`, 'success');
        
        return newDish;
    }

    removeDish(dishId) {
        const dishIndex = this.dishes.findIndex(d => d.id === dishId);
        if (dishIndex !== -1) {
            const removedDish = this.dishes.splice(dishIndex, 1)[0];
            this.renderDishes();
            this.showNotification(`${removedDish.name} eliminado del menú`, 'warning');
            return removedDish;
        }
        return null;
    }

    updateDishPrice(dishId, newPrice) {
        const dish = this.dishes.find(d => d.id === dishId);
        if (dish) {
            const oldPrice = dish.price;
            dish.price = parseFloat(newPrice);
            this.renderDishes();
            this.showNotification(
                `Precio de ${dish.name} actualizado: S/ ${oldPrice} → S/ ${dish.price}`,
                'info'
            );
            return dish;
        }
        return null;
    }

    // Obtener resumen del menú
    getMenuSummary() {
        const available = this.dishes.filter(d => d.available);
        const unavailable = this.dishes.filter(d => !d.available);
        
        return {
            total: this.dishes.length,
            available: available.length,
            unavailable: unavailable.length,
            avgPrice: this.dishes.reduce((sum, d) => sum + d.price, 0) / this.dishes.length,
            dishes: this.dishes
        };
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.menuSystem = new MenuControlSystem();
        console.log('🍽️ Sistema de Control de Menú iniciado correctamente');
    });
} else {
    window.menuSystem = new MenuControlSystem();
    console.log('🍽️ Sistema de Control de Menú iniciado correctamente');
}