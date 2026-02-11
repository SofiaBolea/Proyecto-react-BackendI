# Proyecto React Backend I

Servidor de gestión de productos y carritos construido con **Node.js**, **Express**, **Handlebars** y **Socket.io**. El proyecto practica la arquitectura de servidores REST + vistas renderizadas en el backend, incorporando una vista en tiempo real con WebSockets.

## ✨ Características principales

### Backend
- CRUD de productos y carritos con persistencia en archivos JSON (sin base de datos externa).
- Endpoints REST para integraciones (`/api/products`, `/api/carts`).
- Rutas de vistas HTTP clásicas (`/`, `/products/:pid`, `/carts`, `/carts/:cid`) renderizadas con Handlebars.
- Vista `/realtimeproducts` que trabaja exclusivamente con **WebSockets** (Socket.io) para actualizar la lista de productos en tiempo real al crear o eliminar.

### Frontend (server-side rendered)
- Formularios clásicos (HTTP POST) para crear, editar y eliminar productos/carritos en las vistas tradicionales.
- Confirmaciones y mensajes de error con **SweetAlert2**.
- Búsqueda rápida por ID desde la vista principal.
- Interfaz responsiva basada en **Bootstrap 5** y **Font Awesome**.

### Tiempo real (WebSockets)
- La vista `/realtimeproducts` se conecta por Socket.io al servidor.
- Cada vez que un cliente crea o elimina un producto desde esa vista, **todos los clientes conectados** reciben la lista actualizada automáticamente.
- Registro simple de usuario al ingresar (SweetAlert) con notificaciones Toastify cuando se conectan otros usuarios.

## 🏗 Estructura del proyecto

```
├── data/                        # Archivos JSON de persistencia
│   ├── products.json
│   └── carts.json
├── managers/                    # Lógica de negocio
│   ├── ProductManager.js
│   └── CartManager.js
├── public/                      # JS del cliente (realtime)
│   └── index.js                 # Lógica Socket.io + SweetAlert (solo corre en /realtimeproducts)
└── src/
    ├── server.js                # Express + Socket.io + Handlebars
    ├── public/                  # Assets estáticos (CSS)
    │   └── styles.css
    ├── routes/
    │   ├── products.router.js   # API REST Productos
    │   ├── carts.router.js      # API REST Carritos
    │   └── views.routes.js      # Todas las vistas (HTTP + /realtimeproducts)
    └── views/
        ├── layouts/main.handlebars  # Layout con navbar y scripts globales
        ├── home.handlebars          # Lista de productos (HTTP)
        ├── product.handlebars       # Detalle de producto (HTTP)
        ├── carts.handlebars         # Lista de carritos (HTTP)
        ├── cart.handlebars          # Detalle de carrito (HTTP)
        ├── realTimeProducts.handlebars  # Productos en tiempo real (WebSocket)
        └── error.handlebars         # Página de error
```

## 🚀 Puesta en marcha

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor:
   ```bash
   npm run dev   # modo watch (reinicia con cambios)
   npm start     # modo normal
   ```
4. Abrir [http://localhost:8080](http://localhost:8080).

## 📡 Endpoints REST

### Productos (`/api/products`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/products` | Listar todos los productos |
| `GET` | `/api/products/:pid` | Obtener producto por ID |
| `POST` | `/api/products` | Crear producto (title, description, code, price, stock, category; thumbnails opcional) |
| `PUT` | `/api/products/:pid` | Actualizar campos enviados |
| `DELETE` | `/api/products/:pid` | Eliminar producto |

### Carritos (`/api/carts`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/carts` | Crear carrito vacío |
| `GET` | `/api/carts` | Listar todos los carritos |
| `GET` | `/api/carts/:cid` | Obtener contenido del carrito |
| `POST` | `/api/carts/:cid/product/:pid` | Agregar producto al carrito |

## 🧩 Vistas (Handlebars)

| Ruta | Método | Descripción |
| --- | --- | --- |
| `/` | HTTP | Formulario para crear productos y tabla con acciones ver/eliminar |
| `/products/:pid` | HTTP | Detalle del producto + formulario de actualización |
| `/carts` | HTTP | Listado de carritos con botones para ver/eliminar |
| `/carts/:cid` | HTTP | Detalle del carrito con productos enriquecidos |
| `/realtimeproducts` | **WebSocket** | Formulario + tabla sincronizados en tiempo real vía Socket.io |

## 🔌 Arquitectura WebSocket

1. En `server.js` se crea el servidor Socket.io sobre el servidor HTTP de Express.
2. Al conectarse un cliente a `/realtimeproducts`, recibe la lista completa de productos.
3. Cuando un cliente emite `newProduct` o `deleteProduct`, el servidor ejecuta la operación y emite `products` a **todos** los clientes conectados.
4. Los errores de validación (código duplicado, campos faltantes) se envían solo al cliente que los originó mediante el evento `productError`.

## ✅ Futuras mejoras

## ❓ ¿Cómo utilizar un emit de Socket.io dentro de un POST HTTP?

En este proyecto, la vista `/realtimeproducts` maneja la creación y eliminación de productos **directamente por WebSocket** (el cliente emite eventos y el servidor los procesa dentro de `socketServer.on('connection', ...)`). Sin embargo, si quisiéramos que una ruta HTTP clásica (como un `POST`) también notifique a los clientes conectados por WebSocket, el enfoque sería el siguiente:

### Paso 1 — Guardar la instancia de Socket.io en Express

En `server.js`, después de crear el servidor de sockets, lo almacenamos en `app` para que esté disponible en cualquier router:

```js
// server.js
const socketServer = new Server(httpServer);
app.set('io', socketServer);  // ← clave: guardamos la instancia
```

### Paso 2 — Recuperar `io` dentro del handler POST

Desde cualquier ruta HTTP accedemos a la instancia con `req.app.get('io')` y emitimos el evento que necesitemos:

```js
// Ejemplo: en views.routes.js, el POST que crea un producto vía formulario
router.post('/products', async (req, res) => {
    try {
        await productManager.addProduct(req.body);

        // Notificar a todos los clientes WebSocket conectados
        const io = req.app.get('io');
        if (io) {
            const products = await productManager.getAll();
            io.emit('products', products);
        }

        res.redirect('/');
    } catch (error) {
        const products = await productManager.getAll();
        res.render('home', { products, errorMessage: error.message });
    }
});
```

### ¿Por qué funciona?

- `app.set('io', socketServer)` almacena la referencia al servidor Socket.io dentro del objeto `app` de Express.
- `req.app.get('io')` la recupera desde cualquier middleware o router, sin necesidad de importar variables globales.
- Al llamar `io.emit('products', products)`, **todos** los clientes conectados (por ejemplo los que están en `/realtimeproducts`) reciben la lista actualizada, incluso si el producto fue creado desde un formulario HTTP clásico.

### ¿Cómo lo resuelvo actualmente?

En la implementación actual del proyecto, la vista `/realtimeproducts` **no usa HTTP para crear/eliminar productos**. En su lugar, el cliente envía eventos directamente por WebSocket y el servidor los procesa en `server.js`:

```js
// server.js — dentro de socketServer.on('connection', ...)
socket.on('newProduct', async (data) => {
    try {
        await productManager.addProduct(data);
        socketServer.emit('products', await productManager.getAll());
    } catch (error) {
        socket.emit('productError', error.message);
    }
});
```

Ambos enfoques son válidos. La diferencia es que con `req.app.get('io')` se puede **mezclar HTTP y WebSocket** en la misma operación, lo que es útil cuando se quiere que un formulario clásico también actualice a los clientes en tiempo real.

## ✅ Futuras mejoras
- Reemplazar JSON por una base de datos real.
- Añadir autenticación/autorización.
- Migrar el frontend a un framework.

---
Proyecto desarrollado como práctica de la asignatura *Backend I*.
