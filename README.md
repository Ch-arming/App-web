# Control de Menú Diario - PWA

## Descripción

Aplicación web progresiva (PWA) para el control diario de ventas de menú en restaurantes. Permite gestionar platos, registrar ventas, mantener historial y generar estadísticas.

## Características

### 📱 **Funcionalidad Principal**
- ✅ **Gestión de Platos**: Agregar, editar y eliminar platos del menú
- ✅ **Categorización**: Organizar platos por categorías (Entradas, Principales, Postres, Bebidas)
- ✅ **Registro de Ventas**: Registrar ventas diarias con cantidad y precio
- ✅ **Historial Completo**: Mantener historial de todas las ventas
- ✅ **Estadísticas**: Gráficos y análisis de ventas
- ✅ **Exportación CSV**: Exportar datos a archivo CSV

### 🚀 **Características PWA**
- ✅ **Instalable**: Se puede instalar como app nativa en el móvil
- ✅ **Funciona Offline**: Todos los datos se guardan localmente
- ✅ **Responsive**: Optimizada para móviles, tablets y escritorio
- ✅ **Rápida**: Carga instantánea después de la primera visita
- ✅ **Segura**: Funciona solo con HTTPS

### 💾 **Almacenamiento Local**
- Todos los datos se guardan en el dispositivo (LocalStorage)
- No requiere conexión a internet para funcionar
- Los datos persisten entre sesiones

## Instalación

### Opción 1: Servidor Web Local

1. **Descargar archivos**: Descarga todos los archivos del proyecto
2. **Servidor web**: Ejecuta un servidor web local en la carpeta:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Python 2
   python -m SimpleHTTPServer 8000
   
   # Con Node.js (npx)
   npx serve .
   
   # Con PHP
   php -S localhost:8000
   ```
3. **Acceder**: Abre `http://localhost:8000` en tu navegador

### Opción 2: GitHub Pages

1. **Crear repositorio** en GitHub
2. **Subir archivos** del proyecto
3. **Activar GitHub Pages** en la configuración del repositorio
4. **Acceder** a la URL proporcionada por GitHub Pages

### Opción 3: Netlify/Vercel (Recomendado)

1. **Subir archivos** a un repositorio de GitHub
2. **Conectar** el repositorio con Netlify o Vercel
3. **Deploy automático** - La app estará disponible con HTTPS

## Instalación en Móvil

### Android (Chrome/Edge/Samsung Internet)
1. Abrir la aplicación web en el navegador
2. Buscar el ícono "Agregar a pantalla de inicio" en el menú
3. O esperar el prompt automático de instalación
4. Confirmar la instalación

### iOS (Safari)
1. Abrir la aplicación web en Safari
2. Tocar el botón "Compartir" (cuadrado con flecha)
3. Seleccionar "Agregar a pantalla de inicio"
4. Confirmar el nombre y tocar "Agregar"

## Uso de la Aplicación

### Panel de Control (Dashboard)
- **Resumen diario**: Total de platos, ventas e ingresos del día
- **Acciones rápidas**: Botones para agregar platos y registrar ventas
- **Exportación rápida**: Exportar ventas del día actual

### Gestión de Platos
- **Agregar platos**: Nombre, categoría, precio y descripción
- **Editar**: Modificar información de platos existentes
- **Eliminar**: Remover platos del menú
- **Filtrar**: Ver platos por categoría

### Registro de Ventas
- **Seleccionar plato**: Elegir del menú disponible
- **Cantidad**: Especificar unidades vendidas
- **Registro automático**: Guarda fecha, hora y total
- **Resumen diario**: Ver todas las ventas del día

### Historial
- **Vista cronológica**: Ventas organizadas por fecha
- **Filtros**: Seleccionar rango de fechas
- **Exportación**: Generar archivo CSV del período seleccionado

### Estadísticas
- **Gráfico de ventas**: Ingresos por día (línea)
- **Platos más vendidos**: Top 5 en gráfico circular
- **Ingresos por categoría**: Análisis por tipo de plato
- **Períodos**: Última semana, mes o año

## Exportación de Datos

La aplicación permite exportar datos en formato CSV:

### Campos incluidos:
- Fecha de venta
- Nombre del plato
- Categoría
- Cantidad vendida
- Precio unitario
- Total de la venta

### Opciones de exportación:
- **Ventas del día**: Solo las ventas de hoy
- **Rango personalizado**: Seleccionar fechas específicas
- **Historial completo**: Todas las ventas registradas

## Datos de Ejemplo

La aplicación incluye datos de ejemplo para comenzar:

- **Hamburguesa Clásica** (Principales) - $12.50
- **Pizza Margherita** (Principales) - $15.00
- **Ensalada César** (Entradas) - $8.50
- **Coca Cola** (Bebidas) - $3.00
- **Tiramisú** (Postres) - $6.50

## Estructura del Proyecto

```
control-menu-web/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── app.js             # Lógica de la aplicación
├── manifest.json      # Configuración PWA
├── sw.js             # Service Worker
├── README.md         # Este archivo
└── icons/            # Íconos para PWA (opcional)
```

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño responsive con Grid y Flexbox
- **JavaScript ES6+**: Lógica de aplicación
- **Chart.js**: Gráficos y estadísticas
- **Font Awesome**: Iconografía
- **LocalStorage**: Almacenamiento local
- **Service Worker**: Funcionalidad offline
- **Web App Manifest**: Configuración PWA

## Compatibilidad

### Navegadores soportados:
- ✅ Chrome 67+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Samsung Internet 8.0+

### Funcionalidades PWA:
- ✅ **Instalación**: Chrome, Edge, Samsung Internet, Opera
- ⚠️ **iOS**: Limitaciones en Service Worker, pero funcional
- ✅ **Offline**: Todos los navegadores modernos

## Personalización

### Colores del tema:
```css
/* En styles.css */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --background-color: #f5f7fa;
}
```

### Categorías de platos:
```javascript
// En app.js, función initializeDatabase()
const categories = ['Entradas', 'Principales', 'Postres', 'Bebidas'];
```

## Licencia

Este proyecto está bajo la Licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

## Soporte

Si tienes problemas o sugerencias:
1. Revisa que estés usando HTTPS o localhost
2. Verifica que tu navegador soporte PWAs
3. Limpia la caché del navegador si hay problemas
4. En móviles, asegúrate de usar el navegador nativo

## Actualizaciones Futuras

### Características planeadas:
- 🔄 Sincronización con servidor
- 📊 Más tipos de gráficos
- 🖨️ Impresión de reportes
- 🔔 Notificaciones push
- 📱 Mejores animaciones
- 🌐 Soporte para múltiples idiomas

---

**¡Disfruta usando Control de Menú Diario!** 🍽️📊

*Creado por MiniMax Agent*