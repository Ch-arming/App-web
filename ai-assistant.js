class AIAssistant {
    constructor() {
        this.apiKey = localStorage.getItem('gemini-api-key') || '';
        this.voiceEnabled = localStorage.getItem('voice-enabled') !== 'false';
        this.voiceSpeed = parseFloat(localStorage.getItem('voice-speed')) || 1.0;
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isSpeaking = false;
        this.currentStream = null;
        this.currentCameraMode = 'user'; // 'user' para frontal, 'environment' para posterior
        
        this.initializeElements();
        this.initializeSpeechRecognition();
        this.bindEvents();
        this.updateUI();
        
        console.log('🤖 Asistente IA inicializado');
    }

    initializeElements() {
        // Elementos principales
        this.aiAssistant = document.getElementById('ai-assistant');
        this.voiceBtn = document.getElementById('voice-btn');
        this.cameraBtn = document.getElementById('camera-btn');
        this.voiceToggle = document.getElementById('voice-toggle');
        this.settingsBtn = document.getElementById('settings-btn');
        this.toggleAiBtn = document.getElementById('toggle-ai');
        
        // Chat
        this.aiChat = document.getElementById('ai-chat');
        this.aiStatus = document.getElementById('ai-status');
        this.statusIndicator = document.getElementById('status-indicator');
        
        // Modales
        this.cameraModal = document.getElementById('camera-modal');
        this.settingsModal = document.getElementById('ai-settings-modal');
        
        // Cámara
        this.cameraVideo = document.getElementById('camera-video');
        this.cameraCanvas = document.getElementById('camera-canvas');
        this.captureBtn = document.getElementById('capture-btn');
        this.fileInputBtn = document.getElementById('file-input-btn');
        this.fileInput = document.getElementById('file-input');
        this.switchCameraBtn = document.getElementById('switch-camera-btn');
        this.imagePreview = document.getElementById('image-preview');
        this.analysisResult = document.getElementById('analysis-result');
        
        // Configuración
        this.apiKeyInput = document.getElementById('api-key');
        this.voiceSpeedInput = document.getElementById('voice-speed');
        this.voiceEnabledInput = document.getElementById('voice-enabled');
        this.saveSettingsBtn = document.getElementById('save-settings');
        this.speedValue = document.getElementById('speed-value');
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'es-PE'; // Español de Perú
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateStatus('Escuchando...', 'listening');
                this.voiceBtn.classList.add('listening');
            };
            
            this.recognition.onresult = (event) => {
                const command = event.results[0][0].transcript;
                this.addChatMessage('user', `🗣️ Tú: ${command}`);
                this.processVoiceCommand(command);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Error de reconocimiento:', event.error);
                this.updateStatus('Error al escuchar', 'error');
                this.speak('Hubo un error al escuchar. Inténtalo de nuevo.');
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateStatus('Listo para escuchar', 'ready');
                this.voiceBtn.classList.remove('listening');
            };
        } else {
            console.warn('Speech Recognition no soportado en este navegador');
            this.updateStatus('Reconocimiento de voz no disponible', 'error');
        }
    }

    bindEvents() {
        // Botones principales
        this.voiceBtn.addEventListener('click', () => this.toggleListening());
        this.cameraBtn.addEventListener('click', () => this.openCamera());
        this.voiceToggle.addEventListener('click', () => this.toggleVoiceResponse());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.toggleAiBtn.addEventListener('click', () => this.toggleAssistant());
        
        // Cámara
        this.captureBtn.addEventListener('click', () => this.captureImage());
        this.fileInputBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.switchCameraBtn.addEventListener('click', () => this.switchCamera());
        
        // Configuración
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.voiceSpeedInput.addEventListener('input', (e) => {
            this.speedValue.textContent = `${e.target.value}x`;
        });
        
        // Cerrar modales
        document.getElementById('close-camera').addEventListener('click', () => this.closeCamera());
        document.getElementById('close-settings').addEventListener('click', () => this.closeSettings());
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === this.cameraModal) this.closeCamera();
            if (e.target === this.settingsModal) this.closeSettings();
        });
    }

    updateUI() {
        if (this.apiKeyInput) this.apiKeyInput.value = this.apiKey;
        if (this.voiceEnabledInput) this.voiceEnabledInput.checked = this.voiceEnabled;
        if (this.voiceSpeedInput) {
            this.voiceSpeedInput.value = this.voiceSpeed;
            this.speedValue.textContent = `${this.voiceSpeed}x`;
        }
        
        this.voiceToggle.textContent = this.voiceEnabled ? '🔊' : '🔇';
        this.voiceToggle.title = this.voiceEnabled ? 'Desactivar respuestas por voz' : 'Activar respuestas por voz';
        
        // Actualizar texto del botón de cambiar cámara
        if (this.switchCameraBtn) {
            this.switchCameraBtn.textContent = this.currentCameraMode === 'user' ? '🔄 Cámara Posterior' : '🔄 Cámara Frontal';
        }
    }

    toggleAssistant() {
        const isVisible = this.aiAssistant.style.display !== 'none';
        this.aiAssistant.style.display = isVisible ? 'none' : 'block';
        this.toggleAiBtn.textContent = isVisible ? '🤖 Mostrar IA' : '🤖 Ocultar IA';
    }

    toggleListening() {
        if (!this.recognition) {
            this.speak('El reconocimiento de voz no está disponible en este navegador.');
            return;
        }
        
        if (this.isListening) {
            this.recognition.stop();
        } else {
            if (!this.apiKey) {
                this.speak('Necesitas configurar tu clave API de Gemini primero.');
                this.openSettings();
                return;
            }
            this.recognition.start();
        }
    }

    toggleVoiceResponse() {
        this.voiceEnabled = !this.voiceEnabled;
        localStorage.setItem('voice-enabled', this.voiceEnabled);
        this.updateUI();
        
        const message = this.voiceEnabled ? 'Respuestas por voz activadas' : 'Respuestas por voz desactivadas';
        this.addChatMessage('ai', `🤖 Asistente: ${message}`);
        if (this.voiceEnabled) this.speak(message);
    }

    async processVoiceCommand(command) {
        this.updateStatus('Procesando...', 'processing');
        
        try {
            // Análisis de comando con IA
            const response = await this.callGeminiAPI({
                prompt: `Eres un asistente para un sistema de gestión de restaurante. Analiza este comando de voz y responde en JSON con la acción a realizar.
                
Comando: "${command}"
                
Acciones posibles:
                - add_dish: Agregar plato (requiere: name, price, quantity, category)
                - edit_dish: Editar plato (requiere: name, field, value)
                - delete_dish: Eliminar plato (requiere: name)
                - add_sale: Registrar venta (requiere: dish_name, quantity)
                - query_sales: Consultar ventas
                - query_dishes: Consultar platos
                - query_stats: Consultar estadísticas
                - analyze_image: Solicitud de análisis de imagen
                - help: Solicitar ayuda
                - unknown: Comando no reconocido
                
Responde SOLO con JSON válido:
                {
                    "action": "nombre_accion",
                    "parameters": {...},
                    "response": "mensaje de confirmación amigable"
                }`,
                model: 'gemini-2.0-flash-exp'
            });
            
            const commandData = JSON.parse(response);
            await this.executeCommand(commandData);
            
        } catch (error) {
            console.error('Error procesando comando:', error);
            const errorMessage = 'No pude entender el comando. ¿Puedes repetirlo?';
            this.addChatMessage('ai', `🤖 Asistente: ${errorMessage}`);
            this.speak(errorMessage);
        }
        
        this.updateStatus('Listo para escuchar', 'ready');
    }

    async executeCommand(commandData) {
        const { action, parameters, response } = commandData;
        
        this.addChatMessage('ai', `🤖 Asistente: ${response}`);
        
        switch (action) {
            case 'add_dish':
                await this.addDishViaVoice(parameters);
                break;
            case 'edit_dish':
                await this.editDishViaVoice(parameters);
                break;
            case 'delete_dish':
                await this.deleteDishViaVoice(parameters);
                break;
            case 'add_sale':
                await this.addSaleViaVoice(parameters);
                break;
            case 'query_sales':
                await this.querySales();
                break;
            case 'query_dishes':
                await this.queryDishes();
                break;
            case 'query_stats':
                await this.queryStats();
                break;
            case 'analyze_image':
                this.openCamera();
                break;
            case 'help':
                await this.showHelp();
                break;
            default:
                this.speak('Comando no reconocido. Di "ayuda" para ver los comandos disponibles.');
        }
        
        if (this.voiceEnabled && response) {
            this.speak(response);
        }
    }

    async addDishViaVoice(params) {
        try {
            const { name, price, quantity, category } = params;
            
            if (!name || !price || !quantity) {
                throw new Error('Faltan datos del plato');
            }
            
            const dish = {
                id: Date.now(),
                name: name,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                category: category || 'Sin categoría',
                description: '',
                createdAt: new Date().toISOString()
            };
            
            // Usar la función de la aplicación principal
            if (window.addDish) {
                window.addDish(dish);
                const successMessage = `Plato "${name}" agregado exitosamente por S/${price}. Stock: ${quantity} unidades.`;
                this.addChatMessage('ai', `🤖 Asistente: ${successMessage}`);
                this.speak(successMessage);
            }
        } catch (error) {
            const errorMessage = 'Error al agregar el plato. Verifica los datos.';
            this.addChatMessage('ai', `🤖 Asistente: ${errorMessage}`);
            this.speak(errorMessage);
        }
    }

    async querySales() {
        const sales = JSON.parse(localStorage.getItem('sales') || '[]');
        const today = new Date().toDateString();
        const todaySales = sales.filter(sale => new Date(sale.date).toDateString() === today);
        
        const totalSales = todaySales.length;
        const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
        
        const message = `Hoy tienes ${totalSales} ventas por un total de S/${totalRevenue.toFixed(2)}.`;
        this.addChatMessage('ai', `🤖 Asistente: ${message}`);
        this.speak(message);
    }

    async queryDishes() {
        const dishes = JSON.parse(localStorage.getItem('dishes') || '[]');
        const lowStock = dishes.filter(dish => dish.quantity < 5);
        
        let message = `Tienes ${dishes.length} platos en el menú.`;
        if (lowStock.length > 0) {
            message += ` ${lowStock.length} platos tienen stock bajo.`;
        }
        
        this.addChatMessage('ai', `🤖 Asistente: ${message}`);
        this.speak(message);
    }

    async queryStats() {
        const dishes = JSON.parse(localStorage.getItem('dishes') || '[]');
        const sales = JSON.parse(localStorage.getItem('sales') || '[]');
        
        const totalDishes = dishes.length;
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        
        const message = `Estadísticas: ${totalDishes} platos, ${totalSales} ventas totales, S/${totalRevenue.toFixed(2)} ingresos acumulados.`;
        this.addChatMessage('ai', `🤖 Asistente: ${message}`);
        this.speak(message);
    }

    async showHelp() {
        const helpMessage = `Puedes decir comandos como: "Agregar plato Caldo de Gallina precio 6 soles cantidad 13", "¿Cuántas ventas tengo?", "Mostrar estadísticas", o "Analizar comanda".`;
        this.addChatMessage('ai', `🤖 Asistente: ${helpMessage}`);
        this.speak(helpMessage);
    }

    // Funciones de cámara y análisis de imágenes (CORREGIDAS)
    async openCamera() {
        this.cameraModal.style.display = 'block';
        this.analysisResult.innerHTML = '';
        this.imagePreview.innerHTML = '';
        
        try {
            await this.startCamera();
        } catch (error) {
            console.error('Error accediendo a la cámara:', error);
            this.analysisResult.innerHTML = '<p style="color: red;">❌ Error: No se pudo acceder a la cámara. Usa la opción de seleccionar archivo.</p>';
        }
    }

    async startCamera() {
        // Detener stream anterior si existe
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
        }
        
        const constraints = {
            video: {
                facingMode: this.currentCameraMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        try {
            this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.cameraVideo.srcObject = this.currentStream;
            this.cameraVideo.style.display = 'block';
            
            // Actualizar botón de cambiar cámara
            this.updateUI();
            
        } catch (error) {
            throw new Error('No se pudo acceder a la cámara: ' + error.message);
        }
    }

    async switchCamera() {
        // Cambiar entre cámara frontal y posterior
        this.currentCameraMode = this.currentCameraMode === 'user' ? 'environment' : 'user';
        
        try {
            await this.startCamera();
            const cameraType = this.currentCameraMode === 'user' ? 'frontal' : 'posterior';
            this.addChatMessage('ai', `🤖 Asistente: Cambiando a cámara ${cameraType}`);
        } catch (error) {
            console.error('Error cambiando cámara:', error);
            // Revertir el cambio si falla
            this.currentCameraMode = this.currentCameraMode === 'user' ? 'environment' : 'user';
            this.updateUI();
            this.analysisResult.innerHTML = '<p style="color: orange;">⚠️ No se pudo cambiar de cámara. Verifica que tu dispositivo tenga ambas cámaras.</p>';
        }
    }

    closeCamera() {
        this.cameraModal.style.display = 'none';
        
        // Detener todas las cámaras
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
        
        this.cameraVideo.srcObject = null;
        this.imagePreview.innerHTML = '';
        this.analysisResult.innerHTML = '';
    }

    captureImage() {
        if (!this.cameraVideo.videoWidth || !this.cameraVideo.videoHeight) {
            this.analysisResult.innerHTML = '<p style="color: red;">❌ Error: La cámara no está lista. Espera un momento e intenta de nuevo.</p>';
            return;
        }
        
        const canvas = this.cameraCanvas;
        const video = this.cameraVideo;
        
        // Configurar canvas con las dimensiones del video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir a blob y analizar
        canvas.toBlob(blob => {
            if (blob) {
                this.analyzeImage(blob);
            } else {
                this.analysisResult.innerHTML = '<p style="color: red;">❌ Error al capturar la imagen. Inténtalo de nuevo.</p>';
            }
        }, 'image/jpeg', 0.9);
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) {
            this.analysisResult.innerHTML = '<p style="color: orange;">⚠️ No se seleccionó ningún archivo.</p>';
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            this.analysisResult.innerHTML = '<p style="color: red;">❌ Error: Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).</p>';
            return;
        }
        
        // Mostrar preview del archivo seleccionado
        const reader = new FileReader();
        reader.onload = (e) => {
            this.imagePreview.innerHTML = `
                <div class="selected-file-preview">
                    <p>📁 Archivo seleccionado: ${file.name}</p>
                    <img src="${e.target.result}" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px;">
                </div>
            `;
        };
        reader.readAsDataURL(file);
        
        // Analizar la imagen
        this.analyzeImage(file);
        
        // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
        event.target.value = '';
    }

    async analyzeImage(imageBlob) {
        if (!this.apiKey) {
            this.analysisResult.innerHTML = '<p style="color: red;">❌ Necesitas configurar tu clave API de Gemini primero. Ve a ⚙️ Configurar IA.</p>';
            return;
        }
        
        this.analysisResult.innerHTML = '<div class="analyzing">🤖 Analizando imagen, por favor espera...</div>';
        
        try {
            // Convertir imagen a base64
            const base64 = await this.blobToBase64(imageBlob);
            
            // Si no hay preview, mostrarla
            if (!this.imagePreview.innerHTML) {
                this.imagePreview.innerHTML = `<img src="${base64}" style="max-width: 100%; height: auto; border-radius: 8px;">`;
            }
            
            const response = await this.callGeminiAPI({
                prompt: `Analiza esta imagen de una comanda o menú de restaurante. Extrae TODOS los platos, cantidades y precios que puedas identificar. 
                
Responde en JSON con este formato exacto:
                {
                    "items": [
                        {
                            "name": "nombre del plato",
                            "quantity": número,
                            "price": precio_unitario,
                            "total": precio_total
                        }
                    ],
                    "total_order": precio_total_pedido,
                    "summary": "resumen amigable de lo encontrado"
                }`,
                image: base64.split(',')[1], // Quitar el prefijo data:image
                model: 'gemini-2.0-flash-exp'
            });
            
            const analysis = JSON.parse(response);
            this.displayAnalysisResult(analysis);
            
        } catch (error) {
            console.error('Error analizando imagen:', error);
            this.analysisResult.innerHTML = '<p style="color: red;">❌ Error al analizar la imagen. Verifica tu conexión e intenta de nuevo.</p>';
        }
    }

    displayAnalysisResult(analysis) {
        let html = `<div class="analysis-success">`;
        html += `<h4>📋 Análisis de Comanda</h4>`;
        html += `<p>${analysis.summary}</p>`;
        
        if (analysis.items && analysis.items.length > 0) {
            html += `<div class="items-list">`;
            analysis.items.forEach((item, index) => {
                html += `<div class="item">`;
                html += `<strong>${item.name}</strong> - Cantidad: ${item.quantity} - S/${item.price} c/u`;
                if (item.total) html += ` - Total: S/${item.total}`;
                html += `</div>`;
            });
            html += `</div>`;
            
            if (analysis.total_order) {
                html += `<div class="total-order"><strong>Total del Pedido: S/${analysis.total_order}</strong></div>`;
            }
            
            html += `<button onclick="window.aiAssistant.addAnalyzedItems(${JSON.stringify(analysis.items).replace(/"/g, '&quot;')})" class="add-items-btn">📋 Agregar al Sistema</button>`;
        }
        
        html += `</div>`;
        this.analysisResult.innerHTML = html;
        
        // Respuesta por voz
        const voiceMessage = `He analizado la comanda. ${analysis.summary}`;
        this.addChatMessage('ai', `🤖 Asistente: ${voiceMessage}`);
        this.speak(voiceMessage);
    }

    addAnalyzedItems(items) {
        items.forEach(item => {
            const dish = {
                id: Date.now() + Math.random(),
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                category: 'Comanda',
                description: 'Agregado desde análisis de comanda',
                createdAt: new Date().toISOString()
            };
            
            if (window.addDish) {
                window.addDish(dish);
            }
        });
        
        const message = `He agregado ${items.length} platos desde la comanda al sistema.`;
        this.addChatMessage('ai', `🤖 Asistente: ${message}`);
        this.speak(message);
        this.closeCamera();
    }

    // Configuración
    openSettings() {
        this.settingsModal.style.display = 'block';
    }

    closeSettings() {
        this.settingsModal.style.display = 'none';
    }

    saveSettings() {
        this.apiKey = this.apiKeyInput.value.trim();
        this.voiceEnabled = this.voiceEnabledInput.checked;
        this.voiceSpeed = parseFloat(this.voiceSpeedInput.value);
        
        localStorage.setItem('gemini-api-key', this.apiKey);
        localStorage.setItem('voice-enabled', this.voiceEnabled);
        localStorage.setItem('voice-speed', this.voiceSpeed);
        
        this.updateUI();
        this.closeSettings();
        
        const message = 'Configuración guardada exitosamente.';
        this.addChatMessage('ai', `🤖 Asistente: ${message}`);
        this.speak(message);
    }

    // Utilidades
    async callGeminiAPI(params) {
        const { prompt, image, model = 'gemini-2.0-flash-exp' } = params;
        
        const requestBody = {
            contents: [{
                parts: [
                    { text: prompt }
                ]
            }]
        };
        
        // Si hay imagen, agregarla
        if (image) {
            requestBody.contents[0].parts.push({
                inline_data: {
                    mime_type: 'image/jpeg',
                    data: image
                }
            });
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Error API: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    speak(text) {
        if (!this.voiceEnabled || this.isSpeaking) return;
        
        // Cancelar síntesis anterior
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = this.voiceSpeed;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.updateStatus('Hablando...', 'speaking');
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateStatus('Listo para escuchar', 'ready');
        };
        
        this.synthesis.speak(utterance);
    }

    addChatMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.innerHTML = message;
        
        this.aiChat.appendChild(messageDiv);
        this.aiChat.scrollTop = this.aiChat.scrollHeight;
        
        // Limitar mensajes (mantener solo los últimos 20)
        const messages = this.aiChat.children;
        if (messages.length > 20) {
            this.aiChat.removeChild(messages[0]);
        }
    }

    updateStatus(text, status) {
        if (this.aiStatus) {
            this.aiStatus.querySelector('.status-text').textContent = text;
            this.statusIndicator.className = `status-indicator ${status}`;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});