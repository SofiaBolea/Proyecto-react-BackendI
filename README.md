# Proyecto React Backend I

Servidor completo de gestión de productos y carritos construido con **Node.js**, **Express**, **Handlebars** y **Socket.io**. El objetivo del proyecto es practicar la arquitectura de servidores REST + vistas renderizadas en el backend, incorporando también una vista en tiempo real y validaciones amigables con SweetAlert2.

## ✨ Características principales

### Backend
- CRUD de productos y carritos con persistencia en archivos JSON (sin base de datos externa).
- Endpoints REST para integraciones (`/api/products`, `/api/carts`).
- Rutas orientadas a vistas (`/`, `/products/:pid`, `/carts`, `/carts/:cid`).
- Vista especial `/realtimeproducts` que emite actualizaciones instantáneas vía WebSocket.

### Frontend (server-side rendered)
- Formularios clásicos para crear, editar y eliminar productos/carritos.
- Confirmaciones y mensajes de error con **SweetAlert2**.
- Campo opcional de thumbnails (URLs separadas por coma) en los formularios de producto.
- Búsqueda rápida por ID desde la vista principal.
- Interfaz responsiva basada en **Bootstrap 5** y **Font Awesome**.

### Tiempo real
- Socket.io transmite el listado de productos a todos los clientes conectados cada vez que se crea o elimina un producto en la vista `/realtimeproducts`.
- El cliente bloquea la UI hasta que el usuario ingresa un "nombre" (registro simple) mediante SweetAlert.

## 🏗 Estructura relevante

```
├── data/                  # Archivos JSON persistentes
├── managers/              # ProductManager y CartManager
├── public/                # JS y CSS compartidos por las vistas
│   ├── index.js           # Búsqueda, confirmaciones y lógica realtime
│   └── styles.css         # Tema general
└── src/
    ├── server.js          # Configuración Express + Socket.io
    ├── routes/
    │   ├── products.router.js   # API REST Productos
    │   ├── carts.router.js      # API REST Carritos
    │   ├── views.routes.js      # Vistas Handlebars tradicionales
    │   └── realtime.routes.js   # Vista + API en tiempo real
    └── views/
        ├── layouts/main.handlebars
        ├── home.handlebars
        ├── product.handlebars
        ├── carts.handlebars
        ├── cart.handlebars
        └── realTimeProducts.handlebars
```

## 🚀 Puesta en marcha

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor:
   ```bash
   npm run dev   # o node src/server.js
   ```
4. Abrir [http://localhost:8080](http://localhost:8080).
   - `/` → listado + formulario de productos.
   - `/realtimeproducts` → vista en tiempo real.
   - `/carts` → gestión de carritos.

## 📡 Endpoints REST

### Productos
- `GET /api/products` – Listar productos.
- `GET /api/products/:pid` – Producto por ID.
- `POST /api/products` – Crear (requiere title, description, code, price, stock, category; thumbnails opcional).
- `PUT /api/products/:pid` – Actualizar campos enviados.
- `DELETE /api/products/:pid` – Eliminar producto.

### Carritos
- `POST /api/carts` – Crear carrito vacío.
- `GET /api/carts` – Listar todos.
- `GET /api/carts/:cid` – Obtener contenido del carrito.
- `POST /api/carts/:cid/product/:pid` – Agregar producto (incrementa cantidad si ya existe).

## 🧩 Vistas disponibles

| Ruta | Descripción |
| --- | --- |
| `/` | Formulario para crear productos y tabla con acciones ver/eliminar. |
| `/products/:pid` | Detalle completo del producto + formulario de actualización. |
| `/realtimeproducts` | Formulario + tabla que se sincronizan vía WebSocket. |
| `/carts` | Listado de carritos con botones para ver/eliminar. |
| `/carts/:cid` | Detalle del carrito, productos enriquecidos y formulario para agregar ítems. |

## 📘 Recursos adicionales

- `public/index.js` contiene ejemplos de uso de SweetAlert2, fetch y Socket.io que pueden reutilizarse en otras vistas.

## ❓ Pregunta frecuente: ¿Cómo emitir eventos de Socket.io dentro de un POST HTTP?

1. En `src/server.js` creamos una única instancia de Socket.io y la guardamos en Express:
    ```js
    const socketServer = new Server(httpServer);
    app.set('io', socketServer);
    ```
2. Dentro de cualquier handler HTTP (por ejemplo el `POST /api/realtime/products` de `realtime.routes.js`) recuperamos esa instancia con `req.app.get('io')`:
    ```js
    router.post('/api/realtime/products', async (req, res) => {
       const newProduct = await productManager.addProduct(req.body);
       const products = await productManager.getAll();
       const io = req.app.get('io');
       if (io) {
          io.emit('updateProducts', products);
       }
       res.status(201).json(newProduct);
    });
    ```
3. Gracias a ese patrón, cualquier petición HTTP puede “avisar” a los clientes WebSocket emitiendo un evento justo después de completar la operación.

## ✅ Futuras mejoras 
- Reemplazar JSON por una base de datos real.
- Añadir autenticación/autorización.
- Migrar el frontend a un framework.

---
Proyecto desarrollado como práctica de la asignatura *Backend I*. 
