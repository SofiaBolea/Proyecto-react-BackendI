# Proyecto Backend I - Gestión de Productos y Carritos

Servidor de gestión de productos y carritos construido con **Node.js**, **Express**, **Handlebars**, **MongoDB** y **Socket.io**. El proyecto implementa arquitectura MVC con patrones REST + vistas renderizadas en el backend, incluyendo una vista en tiempo real con WebSockets y paginación completa.

## Características principales

### Backend
- **CRUD de productos y carritos** con persistencia en **MongoDB** usando Mongoose.
- **Endpoints REST** para integraciones (`/api/products`, `/api/carts`).
- **Rutas de vistas HTTP** clásicas renderizadas con **Handlebars**.
- **Sistema de paginación** con filtros (stock, categoría, precio) usando `mongoose-paginate-v2`.
- **Vista en tiempo real** (`/realtimeproducts`) con **Socket.io** sincronizada entre clientes.
- **Gestión completa de carritos**: crear, leer, actualizar cantidad, eliminar productos individuales, vaciar carrito.

### Frontend (server-side rendered)
- Formularios HTTP para crear, editar y eliminar productos/carritos.
- **Confirmaciones con SweetAlert2** para operaciones sensibles.
- **Búsqueda y filtros** por categoría, precio, estado de stock.
- **Paginación dinámica** en listados.
- Interfaz responsiva con **Bootstrap 5** y **Font Awesome**.

### Arquitectura
- **Repository Pattern**: Acceso a datos centralizado y reutilizable.
- **MVC separado**: Models, Controllers, Routes bien organizados.
- **WebSockets con paginación**: Sincronización en tiempo real con control de páginas.
- **Routers modularizados**: Cada funcionalidad tiene su propio router (productos, carritos, tiempo real, vistas).

## 📋 Estructura de routers

En `server.js` se registran todos los routers de la aplicación:

```javascript
app.use('/api/products', apiProductsRouter);      // API REST + vistas productos
app.use('/api/carts', apiCartsRouter);            // API REST + vistas carritos
app.use('/realtimeproducts', realtimeRouter);     // Vista tiempo real (WebSocket)
app.use(viewsRouter);                             // Rutas generales (home)
```

Cada router es independiente y maneja sus propias rutas y lógica.

## 🏗 Estructura del proyecto

```
src/
├── config/
│   └── db-connection.js         # Conexión MongoDB
├── controllers/
│   ├── product-controller.js    # Lógica de productos
│   └── cart-controller.js       # Lógica de carritos
├── models/
│   ├── product-model.js         # Schema Mongoose productos
│   └── cart-models.js           # Schema Mongoose carritos
├── repositories/
│   ├── product-repository.js    # Data access productos
│   └── cart-repository.js       # Data access carritos
├── routes/
│   ├── products.router.js       # Rutas API/vistas productos
│   ├── carts.router.js          # Rutas API/vistas carritos
│   ├── realtime.routes.js       # Rutas vista tiempo real (WebSocket)
│   └── views.router.js          # Rutas principales vistas
├── views/
│   ├── home.handlebars          # Lista productos (paginada)
│   ├── product.handlebars       # Detalle producto
│   ├── cart.handlebars          # Detalle carrito
│   ├── carts.handlebars         # Lista carritos
│   ├── realTimeProducts.handlebars  # Productos tiempo real
│   ├── error.handlebars         # Página error
│   └── layouts/main.handlebars  # Layout base
├── public/
│   ├── products.js              # JS vistas productos
│   ├── cart.js                  # JS carrito (cantidad, eliminar)
│   ├── realtime.js              # JS WebSocket página real-time
│   └── styles.css               # Estilos
├── middlewares/
│   └── error-handler.js         # Manejo centralizado de errores
└── server.js                    # Express + Socket.io + Handlebars
```

## 🚀 Puesta en marcha

### Requisitos
- Node.js v20+
- MongoDB (local o atlas)
- npm

### Instalación

1. **Clonar repositorio**
   ```bash
   git clone <repo-url>
   cd Proyecto-react-BackendI
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno** (crear `.env`)
   ```env
   MONGO_URL=mongodb://localhost:27017/tu-base-datos
   PORT=8080
   ```

4. **Iniciar servidor**
   ```bash
   npm start      # Modo normal
   npm run dev    # Modo watch (reloads automáticos)
   ```

5. **Acceder a la aplicación**
   - Interfaz web: [http://localhost:8080](http://localhost:8080)
   - Productos tiempo real: [http://localhost:8080/realtimeproducts](http://localhost:8080/realtimeproducts)

## 📡 Endpoints REST API

### Productos (`/api/products`)

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| `GET` | `/` | Listar productos paginados | - |
| `GET` | `?page=1&limit=10&sort=asc&status=available&query=electronica` | Filtros: paginación, precio, stock, categoría | - |
| `GET` | `/all` | Todos los productos (sin paginación) | - |
| `GET` | `/:pid` | Obtener producto por ID | - |
| `POST` | `/` | Crear producto | `{title, description, code, price, stock, category, thumbnails?}` |
| `PUT` | `/:pid` | Actualizar producto | `{campos a actualizar}` |
| `DELETE` | `/:pid` | Eliminar producto | - |

### Carritos (`/api/carts`)

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| `POST` | `/` | Crear carrito vacío | - |
| `GET` | `/:cid` | Obtener contenido carrito | - |
| `POST` | `/:cid/products/:pid` | Agregar producto a carrito | `{quantity?}` |
| `PUT` | `/:cid` | Actualizar todos los productos del carrito | `[{product: id, quantity}, ...]` |
| `PUT` | `/:cid/products/:pid` | Actualizar cantidad de producto | `{quantity}` |
| `DELETE` | `/:cid/products/:pid` | Eliminar producto del carrito | - |
| `DELETE` | `/:cid` | Vaciar carrito (eliminar todos productos) | - |

## 🧩 Vistas (Handlebars + HTTP)

| Ruta | Router | Método | Descripción |
|------|--------|--------|-------------|
| `/` | views.router | GET | Inicio - redirige a `/api/products/view` |
| `/api/products/view` | products.router | GET | Formulario crear producto + tabla paginada |
| `/product/:pid` | products.router | GET | Detalle de producto + formulario actualización |
| `/carts` | carts.router | GET | Listado de carritos |
| `/cart/:cid` | carts.router | GET | Detalle carrito - gestionar cantidades, eliminar productos, vaciar |
| `/realtimeproducts` | realtime.routes | GET | Tabla tiempo real sincronizada por WebSocket |

## 🔌 WebSocket (Socket.io)

### Eventos desde servidor → cliente

```javascript
// Inicial + tras cambios
socket.emit('products', {
  docs: [...productos],
  page: 1,
  totalPages: 5,
  hasPrevPage: false,
  hasNextPage: true,
  prevPage: null,
  nextPage: 2
})

// Errores
socket.emit('productError', 'Mensaje de error')
```

### Eventos desde cliente → servidor

```javascript
// Solicitar página específica
socket.emit('requestPage', { page: 2, limit: 10 })

// Usuario conectado (notifica a otros)
socket.emit('newUserFront', { username: 'Juan' })
```

## 🔐 Validaciones

### Productos
- `title`, `description`, `code`, `price`, `stock`, `category`: **requeridos**
- `code`: debe ser **único** en la BD
- `price`, `stock`: deben ser **números**
- `thumbnails`: array de strings o vacío

### Carritos
- Permite agregar los mismos productos múltiples veces (suma cantidades)
- Actualizar carrito requiere array de objetos con `product` e `quantity`

## ✅ Características implementadas

- ✅ Paginación con filtros avanzados
- ✅ Arquitectura MVC + Repository Pattern
- ✅ MongoDB + Mongoose
- ✅ CRUD completo productos y carritos
- ✅ WebSocket sincronizado con paginación
- ✅ Manejo de errores centralizado
- ✅ Interfaz responsiva Bootstrap 5
- ✅ Confirmaciones SweetAlert2

## 📦 Dependencias principales

```json
{
  "express": "^4.x",
  "mongoose": "^8.x",
  "mongoose-paginate-v2": "^1.x",
  "express-handlebars": "^7.x",
  "socket.io": "^4.x"
}
```

## 📝 Ejemplos de uso (cURL/Postman)

### Crear producto
```bash
curl -X POST http://localhost:8080/api/products/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Laptop Dell",
    "description": "Gaming laptop",
    "code": "DELL-001",
    "price": 1299.99,
    "stock": 10,
    "category": "Computadoras"
  }'
```

### Obtener productos paginados
```bash
curl "http://localhost:8080/api/products?page=1&limit=10&sort=asc&status=available"
```

### Agregar producto a carrito
```bash
curl -X POST http://localhost:8080/api/carts/cartId123/products/productId456 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'
```

## 🐛 Troubleshooting

**Problema**: "ValidationError: category is required"
- **Solución**: Asegúrate de enviar JSON (no form-data) con Content-Type correcta en Postman

**Problema**: "Carrito no encontrado"
- **Solución**: Verifica que el ID sea válido (24 chars hex) y exista en MongoDB

**Problema**: WebSocket no se conecta
- **Solución**: Verifica que el servidor esté corriendo en puerto 8080 y `socket.io` esté habilitado

---

**Desarrollado como práctica de Backend I**


