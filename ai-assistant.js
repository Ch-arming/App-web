class AIAssistant {
    constructor() {
        this.apiKey = '';
        this.isListening = false;
        this.recognition = null;
        this.isVoiceEnabled = true;
        this.currentCamera = 'environment';
        this.stream = null;
        this.video = null;
        this.canvas = null;
        
        this.initializeElements();
        this.initializeSpeechRecognition();
        this.initializeEventListeners();
        
        // Mostrar alerta si no hay API key
        setTimeout(() => this.checkAPIKey(), 1000);
    }

    initializeElements() {
        // Chat elements
        this.chatContainer = document.getElementById('chat-container');
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.voiceButton = document.getElementById('voice-button');
        this.toggleVoiceButton = document.getElementById('toggle-voice');
        
        // Camera elements
        this.cameraModal = document.getElementById('camera-modal');
        this.video = document.getElementById('camera-preview');
        this.canvas = document.getElementById('capture-canvas');
        this.previewContainer = document.getElementById('image-preview-container');
        this.previewImage = document.getElementById('preview-image');
        this.analyzeButton = document.getElementById('analyze-button');
        this.fileInput = document.getElementById('comanda-file-input');
        
        // Control elements
        this.configModal = document.getElementById('config-modal');
        this.apiKeyInput = document.getElementById('api-key-input');
        this.saveConfigButton = document.getElementById('save-config');
        
        // Load saved API key
        this.loadConfig();
        
        console.log('Elementos del asistente IA inicializados');
    }

    checkAPIKey() {
        if (!this.apiKey || this.apiKey.trim() === '') {
            this.addMessage('🔧 **Configuración requerida**: Para usar el asistente IA, necesitas configurar tu clave API de Gemini.', 'assistant');
            this.addMessage('👉 Toca el botón "⚙️" para configurar tu API key.', 'assistant');
            this.addMessage('📚 **Cómo obtener tu API key:**\n1. Ve a https://makersuite.google.com\n2. Inicia sesión con Google\n3. Crea una nueva API key\n4. Copia y pega aquí', 'assistant');
        } else {
            this.addMessage('✅ **API configurada** - ¡Asistente IA listo para usar!', 'assistant');
        }
    }

    loadConfig() {
        const savedKey = localStorage.getItem('gemini-api-key');
        if (savedKey) {
            this.apiKey = savedKey;
            if (this.apiKeyInput) {
                this.apiKeyInput.value = savedKey;
            }
        }
    }

    saveConfig() {
        const apiKey = this.apiKeyInput.value.trim();
        if (apiKey) {
            this.apiKey = apiKey;
            localStorage.setItem('gemini-api-key', apiKey);
            this.configModal.style.display = 'none';
            this.addMessage('✅ **API Key configurada correctamente**. ¡Ya puedes usar el asistente IA!', 'assistant');
            
            // Test the API key with a simple request
            this.testAPIKey();
        } else {
            alert('Por favor, ingresa una API key válida.');
        }
    }

    async testAPIKey() {
        try {
            const response = await this.getAIResponse('¡Hola!');
            this.addMessage('🎉 **Conexión exitosa** - El asistente está funcionando correctamente.', 'assistant');
        } catch (error) {
            this.addMessage('⚠️ **Error de API** - Verifica que tu clave sea válida y tengas cuota disponible.', 'assistant');
        }
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'es-ES';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.sendMessage();
            };

            this.recognition.onerror = (event) => {
                console.error('Error de reconocimiento de voz:', event.error);
                this.addMessage('❌ **Error en el reconocimiento de voz**. Intenta de nuevo.', 'assistant');
                this.stopListening();
            };

            this.recognition.onend = () => {
                this.stopListening();
            };
        } else {
            console.warn('Reconocimiento de voz no disponible');
            if (this.voiceButton) {
                this.voiceButton.disabled = true;
                this.voiceButton.innerHTML = '🎤❌';
            }
        }
    }

    initializeEventListeners() {
        // Chat events
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        if (this.userInput) {
            this.userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        if (this.voiceButton) {
            this.voiceButton.addEventListener('click', () => this.toggleListening());
        }
        
        if (this.toggleVoiceButton) {
            this.toggleVoiceButton.addEventListener('click', () => this.toggleVoiceResponse());
        }

        // Camera events
        const openCameraButton = document.getElementById('open-camera-button');
        if (openCameraButton) {
            openCameraButton.addEventListener('click', () => this.openCamera());
        }

        const captureButton = document.getElementById('capture-image-button');
        if (captureButton) {
            captureButton.addEventListener('click', () => this.captureImage());
        }

        const closeCameraButton = document.getElementById('close-camera-button');
        if (closeCameraButton) {
            closeCameraButton.addEventListener('click', () => this.closeCamera());
        }

        const switchCameraButton = document.getElementById('switch-camera-button');
        if (switchCameraButton) {
            switchCameraButton.addEventListener('click', () => this.switchCamera());
        }

        if (this.analyzeButton) {
            this.analyzeButton.addEventListener('click', () => this.analyzeImage());
        }

        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Config events
        if (this.saveConfigButton) {
            this.saveConfigButton.addEventListener('click', () => this.saveConfig());
        }

        const openConfigButton = document.getElementById('open-config-button');
        if (openConfigButton) {
            openConfigButton.addEventListener('click', () => {
                this.configModal.style.display = 'flex';
            });
        }

        const closeConfigButton = document.getElementById('close-config-button');
        if (closeConfigButton) {
            closeConfigButton.addEventListener('click', () => {
                this.configModal.style.display = 'none';
            });
        }
        
        console.log('Event listeners del asistente IA configurados');
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.userInput.value = '';

        // Verificar si hay API key
        if (!this.apiKey || this.apiKey.trim() === '') {
            this.addMessage('⚠️ **API Key no configurada**. Por favor configura tu clave API de Gemini para usar el asistente.', 'assistant');
            this.addMessage('👉 Toca el botón "⚙️" en la esquina superior derecha para configurar.', 'assistant');
            return;
        }

        // Mostrar indicador de que está pensando
        const thinkingId = this.addMessage('🤔 Pensando...', 'assistant');

        try {
            const response = await this.getAIResponse(message);
            this.removeMessage(thinkingId);
            this.addMessage(response, 'assistant');
            
            if (this.isVoiceEnabled) {
                this.speak(response);
            }
        } catch (error) {
            this.removeMessage(thinkingId);
            console.error('Error al obtener respuesta de IA:', error);
            
            let errorMessage = '❌ **Error de conexión con la IA**. ';
            if (error.message.includes('API_KEY_INVALID')) {
                errorMessage += 'La API key no es válida. Por favor verifica tu configuración en el botón ⚙️.';
            } else if (error.message.includes('QUOTA_EXCEEDED')) {
                errorMessage += 'Se ha excedido la cuota de la API. Intenta más tarde o verifica tu cuenta de Google AI.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage += 'Problema de conectividad. Verifica tu conexión a internet e intenta de nuevo.';
            } else {
                errorMessage += 'No pude procesar tu solicitud. Verifica tu conexión e intenta de nuevo.';
            }
            
            this.addMessage(errorMessage, 'assistant');
        }
    }

    async getAIResponse(message) {
        // CORRECTED: Updated API endpoint for Gemini 1.5 Flash (2025)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: `Eres un asistente especializado para un restaurante peruano. El usuario dice: "${message}". Responde de manera útil y amigable en español, siendo conciso pero informativo. Si te preguntan sobre precios, menciona que están en soles peruanos (S/). Si preguntan sobre funciones, explica que puedes ayudar con el menú, tomar órdenes, analizar comandas con IA, y brindar información del restaurante.`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        console.log('🔧 DEBUGGING - API URL:', apiUrl);
        console.log('🔧 DEBUGGING - Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('🔧 DEBUGGING - HTTP Status:', response.status);
        console.log('🔧 DEBUGGING - Response OK:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('🔧 DEBUGGING - Error response:', errorText);
            
            if (response.status === 400) {
                throw new Error('API_KEY_INVALID');
            } else if (response.status === 429) {
                throw new Error('QUOTA_EXCEEDED');
            } else {
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
        }

        const data = await response.json();
        console.log('🔧 DEBUGGING - Response data:', JSON.stringify(data, null, 2));
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('🔧 DEBUGGING - Unexpected response structure:', data);
            throw new Error('Respuesta inesperada de la API');
        }
    }

    addMessage(message, sender) {
        const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const messageDiv = document.createElement('div');
        messageDiv.id = messageId;
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = this.formatMessage(message);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        return messageId;
    }

    removeMessage(messageId) {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            messageElement.remove();
        }
    }

    formatMessage(message) {
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (this.recognition) {
            this.isListening = true;
            this.voiceButton.innerHTML = '🔴';
            this.voiceButton.classList.add('listening');
            this.recognition.start();
            this.addMessage('🎤 Escuchando...', 'assistant');
        }
    }

    stopListening() {
        this.isListening = false;
        this.voiceButton.innerHTML = '🎤';
        this.voiceButton.classList.remove('listening');
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    toggleVoiceResponse() {
        this.isVoiceEnabled = !this.isVoiceEnabled;
        this.toggleVoiceButton.innerHTML = this.isVoiceEnabled ? '🔊' : '🔇';
        
        const status = this.isVoiceEnabled ? 'activadas' : 'desactivadas';
        this.addMessage(`🎵 Respuestas por voz ${status}`, 'assistant');
    }

    speak(text) {
        if ('speechSynthesis' in window && this.isVoiceEnabled) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        }
    }

    async openCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: this.currentCamera,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            this.video.srcObject = this.stream;
            this.cameraModal.style.display = 'flex';
            
            // Esperar a que el video esté listo
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve();
                };
            });
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            alert('Error al acceder a la cámara. Verifica los permisos y que estés usando HTTPS.');
        }
    }

    closeCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.cameraModal.style.display = 'none';
        this.hidePreview();
    }

    async switchCamera() {
        this.currentCamera = this.currentCamera === 'user' ? 'environment' : 'user';
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: this.currentCamera,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            this.video.srcObject = this.stream;
        } catch (error) {
            console.error('Error al cambiar cámara:', error);
            alert('Error al cambiar la cámara.');
        }
    }

    captureImage() {
        if (!this.video || this.video.videoWidth === 0) {
            alert('La cámara no está lista. Espera un momento.');
            return;
        }

        const context = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        context.drawImage(this.video, 0, 0);
        
        const imageDataUrl = this.canvas.toDataURL('image/jpeg', 0.8);
        this.showPreview(imageDataUrl);
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.showPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Por favor selecciona un archivo de imagen válido.');
        }
    }

    showPreview(imageDataUrl) {
        this.previewImage.src = imageDataUrl;
        this.previewContainer.style.display = 'block';
        this.analyzeButton.style.display = 'block';
    }

    hidePreview() {
        this.previewContainer.style.display = 'none';
        this.analyzeButton.style.display = 'none';
        if (this.fileInput) {
            this.fileInput.value = '';
        }
    }

    async analyzeImage() {
        if (!this.apiKey || this.apiKey.trim() === '') {
            alert('⚠️ API Key no configurada. Configure su clave API de Gemini primero tocando ⚙️.');
            return;
        }

        const imageDataUrl = this.previewImage.src;
        if (!imageDataUrl) {
            alert('No hay imagen para analizar.');
            return;
        }

        // Mostrar indicador de análisis
        const originalText = this.analyzeButton.textContent;
        this.analyzeButton.textContent = 'Analizando... 🔍';
        this.analyzeButton.disabled = true;

        try {
            const analysisResult = await this.analyzeImageWithAI(imageDataUrl);
            
            // Cerrar modal de cámara
            this.closeCamera();
            
            // Mostrar resultado en el chat
            this.addMessage('📸 **Análisis de comanda completado:**', 'assistant');
            this.addMessage(analysisResult, 'assistant');
            
            if (this.isVoiceEnabled) {
                this.speak('Análisis de comanda completado');
            }
        } catch (error) {
            console.error('Error al analizar imagen:', error);
            let errorMessage = '❌ **Error al analizar la imagen**. ';
            
            if (error.message.includes('API_KEY_INVALID')) {
                errorMessage += 'La API key no es válida. Verifica tu configuración.';
            } else if (error.message.includes('QUOTA_EXCEEDED')) {
                errorMessage += 'Se ha excedido la cuota de la API.';
            } else {
                errorMessage += 'Verifica tu conexión e intenta de nuevo.';
            }
            
            this.addMessage(errorMessage, 'assistant');
        } finally {
            this.analyzeButton.textContent = originalText;
            this.analyzeButton.disabled = false;
        }
    }

    async analyzeImageWithAI(imageDataUrl) {
        const base64Image = imageDataUrl.split(',')[1];
        // CORRECTED: Updated API endpoint for Gemini 1.5 Flash (supports both text and images)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: "Analiza esta imagen de una comanda o menú de restaurante peruano. Extrae y lista todos los elementos pedidos, cantidades, precios (convértelos a soles peruanos S/ si están en otra moneda) y calcula el total. Responde en español de manera clara y organizada. Si ves precios, agrégalos al final con el total."
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.4,
                topK: 32,
                topP: 1,
                maxOutputTokens: 2048,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        console.log('🔧 DEBUGGING - Image Analysis API URL:', apiUrl);
        console.log('🔧 DEBUGGING - Image Analysis Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('🔧 DEBUGGING - Image Analysis HTTP Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('🔧 DEBUGGING - Image Analysis Error response:', errorText);
            
            if (response.status === 400) {
                throw new Error('API_KEY_INVALID');
            } else if (response.status === 429) {
                throw new Error('QUOTA_EXCEEDED');
            } else {
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
        }

        const data = await response.json();
        console.log('🔧 DEBUGGING - Image Analysis Response data:', JSON.stringify(data, null, 2));
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('🔧 DEBUGGING - Unexpected image analysis response:', data);
            throw new Error('Respuesta inesperada de la API');
        }
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aiAssistant = new AIAssistant();
        console.log('🤖 Asistente IA inicializado correctamente');
    });
} else {
    window.aiAssistant = new AIAssistant();
    console.log('🤖 Asistente IA inicializado correctamente');
}