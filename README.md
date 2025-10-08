# 🍽️ Sistema de Control de Menú v2.1 - Robusto

## 📱 Aplicación Web Progresiva (PWA) con Asistente IA Integrado

Una aplicación completa para la gestión de menús de restaurante con inteligencia artificial avanzada para análisis de comandas y asistencia al usuario.

---

## ✨ **Características Principales**

### 🤖 **Asistente de Inteligencia Artificial**
- **Chat interactivo** con tecnología Google Gemini
- **Reconocimiento de voz** para comandos hablados
- **Síntesis de voz** para respuestas audibles
- **Análisis OCR de comandas** mediante cámara o archivo
- **Cambio automático de cámara** (frontal/trasera)

### 📊 **Control de Menú**
- **Gestión en tiempo real** del estado de platos
- **Estadísticas dinámicas** de ventas y pedidos
- **Toggle rápido** de disponibilidad
- **Notificaciones visuales** de cambios

### 🔧 **Características Técnicas**
- **PWA completa** - Instalable en dispositivos
- **Funcionamiento offline** con Service Worker
- **Diseño responsive** para móviles y desktop
- **Interfaz intuitiva** con animaciones suaves
- **Almacenamiento local** seguro de configuración

---

## 🚀 **Configuración Inicial**

### **Paso 1: Obtener API Key de Google Gemini**

1. **Accede a Google AI Studio:**
   - Ve a: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Inicia sesión con tu cuenta de Google

2. **Crear la API Key:**
   - Haz clic en **"Create API Key"**
   - Selecciona un proyecto existente o crea uno nuevo
   - Haz clic en **"Create"**
   - **¡IMPORTANTE!** Copia la clave inmediatamente

3. **Configurar en la App:**
   - Abre la aplicación
   - Toca el botón **⚙️** en la esquina superior derecha
   - Pega tu API key en el campo correspondiente
   - Haz clic en **"💾 Guardar"**

### **Paso 2: Configuración de Seguridad (Recomendado)**

Para mayor seguridad, configura restricciones HTTP en tu API key:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Encuentra tu API key y haz clic en el ícono de edición
3. En "Application restrictions", selecciona "HTTP referrers"
4. Agrega: `https://tu-dominio.github.io/*`
5. Guarda los cambios

---

## 📱 **Instalación como PWA**

### **En Móviles:**
- **Android Chrome:** Toca "⋮" → "Instalar app"
- **iOS Safari:** Toca "🔗" → "Agregar a pantalla de inicio"

### **En Desktop:**
- **Chrome/Edge:** Busca el ícono "💻" en la barra de direcciones
- **Firefox:** Menú → "Instalar sitio como app"

---

## 🎯 **Guía de Uso**

### **🤖 Asistente IA**

#### **Chat de Texto:**
1. Escribe tu mensaje en el campo de texto
2. Presiona **"📤"** o **Enter** para enviar
3. El asistente responderá automáticamente

#### **Control por Voz:**
1. Toca el botón **"🎤"** para comenzar a hablar
2. Habla claramente en español
3. El mensaje se enviará automáticamente

#### **Análisis de Comandas:**
1. **Por Cámara:**
   - Toca **"📷 Analizar Comanda"**
   - Usa **"🔄 Cambiar Cámara"** para alternar entre frontal/trasera
   - Apunta la cámara al documento
   - Toca **"📸 Capturar"**
   - Toca **"🔍 Analizar Comanda"**

2. **Por Archivo:**
   - Toca **"📁 Cargar Archivo"**
   - Selecciona una imagen de tu dispositivo
   - Toca **"🔍 Analizar Comanda"**

### **📊 Control de Menú**

#### **Cambiar Disponibilidad:**
- **Toca cualquier plato** para alternar entre "Disponible" y "Agotado"
- Recibirás una notificación visual del cambio

#### **Ver Estadísticas:**
- Las estadísticas se actualizan automáticamente cada 30 segundos
- Incluyen: órdenes, ventas, platos top y satisfacción

---

## 🔧 **Solución de Problemas**

### **❌ "API Key no configurada"**
- **Problema:** No se ha configurado la clave de Gemini
- **Solución:** Sigue el "Paso 1" de configuración inicial

### **❌ "La API key no es válida"**
- **Problema:** La clave introducida es incorrecta o está restringida
- **Solución:** 
  1. Verifica que hayas copiado la clave completa
  2. Comprueba las restricciones en Google Cloud Console
  3. Genera una nueva clave si es necesario

### **❌ "Se ha excedido la cuota de la API"**
- **Problema:** Has agotado tu cuota gratuita de Gemini
- **Solución:** Espera a que se renueve tu cuota o configura facturación

### **❌ Error de cámara**
- **Problema:** No se puede acceder a la cámara
- **Solución:**
  1. Verifica permisos de cámara en tu navegador
  2. Asegúrate de usar HTTPS
  3. Intenta recargar la página

### **❌ Reconocimiento de voz no funciona**
- **Problema:** El navegador no soporta reconocimiento de voz
- **Solución:**
  1. Usa Chrome/Edge en dispositivos compatibles
  2. Verifica permisos de micrófono
  3. Asegúrate de usar HTTPS

---

## 🛠️ **Características Técnicas Avanzadas**

### **📱 PWA Features:**
- ✅ **Instalable** en todos los dispositivos
- ✅ **Funciona offline** para funciones básicas
- ✅ **Actualizaciones automáticas** del cache
- ✅ **Notificaciones push** (futuro)
- ✅ **Sincronización en segundo plano** (futuro)

### **🎨 Diseño:**
- ✅ **Material Design** moderno
- ✅ **Responsive** - Móvil, tablet, desktop
- ✅ **Modo oscuro** automático según preferencias del sistema
- ✅ **Animaciones suaves** y transiciones
- ✅ **Accesibilidad** optimizada

### **🔐 Seguridad:**
- ✅ **Almacenamiento local** encriptado
- ✅ **HTTPS** obligatorio para funciones avanzadas
- ✅ **No tracking** - Datos permanecen en tu dispositivo
- ✅ **API key segura** - No se comparte con terceros

---

## 📋 **Requisitos del Sistema**

### **Navegadores Compatibles:**
- ✅ **Chrome 90+** (Recomendado)
- ✅ **Edge 90+** 
- ✅ **Safari 14+**
- ✅ **Firefox 88+**

### **Dispositivos:**
- ✅ **Android 7.0+**
- ✅ **iOS 13+**
- ✅ **Windows 10+**
- ✅ **macOS 10.15+**
- ✅ **Linux** (distribuciones modernas)

### **Conexión:**
- 📶 **Internet requerido** para funciones IA
- 💾 **Funciona offline** para gestión básica del menú

---

## 🆕 **Novedades en v2.1**

### **🔧 Mejoras de Robustez:**
- ✅ **Manejo robusto de errores** sin API key
- ✅ **Mensajes informativos** sobre configuración
- ✅ **Guías paso a paso** integradas en la app
- ✅ **Validación mejorada** de entradas
- ✅ **Recuperación automática** de errores de conexión

### **🎯 Nuevas Características:**
- ✅ **Modal de configuración** mejorado con instrucciones
- ✅ **Detección automática** de problemas de configuración
- ✅ **Mensajes de estado** más claros
- ✅ **Enlaces directos** a herramientas de configuración

---

## 🤝 **Soporte y Contacto**

### **📚 Documentación:**
- Lee esta guía completa antes de usar la aplicación
- Todos los pasos están detallados para facilitar el uso

### **🐛 Reportar Problemas:**
- Describe claramente el problema encontrado
- Incluye información del navegador y dispositivo
- Proporciona pasos para reproducir el error

### **💡 Sugerencias:**
- Las ideas para nuevas funciones son bienvenidas
- Comparte tus casos de uso específicos

---

## 📄 **Licencia y Términos**

### **📋 Uso:**
- ✅ **Uso comercial** permitido
- ✅ **Modificación** permitida
- ✅ **Distribución** permitida

### **⚠️ Responsabilidades:**
- El usuario es responsable de su API key de Google
- Los costos de la API Gemini corren por cuenta del usuario
- Los datos se procesan según los términos de Google AI

---

## 🚀 **¡Comienza Ahora!**

1. **Obtén tu API key** siguiendo el "Paso 1"
2. **Configura la aplicación** con el botón ⚙️
3. **¡Disfruta de tu asistente IA** para restaurante!

---

**¡Bienvenido al futuro de la gestión de restaurantes con IA! 🍽️🤖**