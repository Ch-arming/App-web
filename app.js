// Sistema de Control de Menú - Funcionalidad Principal
class MenuControlSystem {
    constructor() {
        this.dishes = [
            { id: 1, name: '🥗 Ensalada César', price: 12.99, available: true },
            { id: 2, name: '🍝 Pasta Carbonara', price: 14.99, available: true },
            { id: 3, name: '🥩 Filete de Res', price: 24.99, available: false },
            { id: 4, name: '🍕 Pizza Margherita', price: 16.99, available: true },
            { id: 5, name: '🥘 Ensalada Griega', price: 11.99, available: true }
        ];
        
        this.stats = {
            orders: 45,
            sales: 680,
            topDishes: 12,
            satisfaction: 95
        };
        
        this.initializeApp();
    }

    initializeApp() {
        this.renderDishes();
        this.renderStats();
        this.initializeEventListeners();
        this.initializeServiceWorker();
        
        // Actualizar estadísticas periódicamente
        setInterval(() => this.updateStats(), 30000); // Cada 30 segundos
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
    }

    renderDishes() {
        const container = document.getElementById('available-dishes');
        if (!container) return;
        
        container.innerHTML = this.dishes.map(dish => `
            <div class="dish-item" data-dish-id="${dish.id}" style="cursor: pointer;" title="Click para cambiar disponibilidad">
                <span class="dish-name">${dish.name}</span>
                <span class="dish-price">$${dish.price.toFixed(2)}</span>
                <span class="dish-status ${dish.available ? 'available' : 'unavailable'}">
                    ${dish.available ? 'Disponible' : 'Agotado'}
                </span>
            </div>
        `).join('');
    }

    renderStats() {
        const statsContainer = document.querySelector('.stats-grid');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${this.stats.orders}</div>
                <div class="stat-label">Órdenes</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">$${this.stats.sales}</div>
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
        }
    }

    updateStats() {
        // Simular actualización de estadísticas
        this.stats.orders += Math.floor(Math.random() * 3);
        this.stats.sales += Math.floor(Math.random() * 50);
        this.stats.satisfaction = Math.max(85, Math.min(100, this.stats.satisfaction + (Math.random() - 0.5) * 2));
        
        this.renderStats();
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
                const registration = await navigator.serviceWorker.register('/sw.js');
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
                `Precio de ${dish.name} actualizado: $${oldPrice} → $${dish.price}`,
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
document.addEventListener('DOMContentLoaded', () => {
    window.menuSystem = new MenuControlSystem();
    
    // Mensaje de bienvenida en consola
    console.log('🍽️ Sistema de Control de Menú iniciado correctamente');
    console.log('Usa window.menuSystem para acceder a las funciones del sistema');
});