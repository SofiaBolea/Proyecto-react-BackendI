# Entrega N° 1 - Servidor de Productos y Carritos

Este proyecto implementa un servidor basado en Node.js y Express para gestionar productos y carritos de compra, cumpliendo con los requisitos de la Entrega N° 1.

## Instalación y Ejecución

1. Instalar dependencias:
   ```
   npm install
   ```

2. Ejecutar el servidor:
   ```
   npm run dev
   ```

El servidor escuchará en el puerto 8080.

## Funcionalidades Actuales

- **Gestión de Productos:** Permite agregar, eliminar y modificar productos en los archivos JSON que funcionan como base de datos para este caso.
- **Gestión de Carritos:** Permite crear, eliminar y actualizar carritos de compra.
- **Persistencia de Datos:** Los datos se almacenan en archivos JSON para su fácil acceso y manipulación.
- **Interfaz de Usuario:** Se incluye una interfaz básica en HTML para interactuar con el servidor.

## Endpoints

### Productos (/products)

- **GET /**: Lista todos los productos.
- **GET /:pid**: Obtiene un producto por ID.
- **POST /**: Crea un nuevo producto. Campos requeridos: title, description, code, price, stock, category. Opcionales: status (default true), thumbnails (array).
- **PUT /:pid**: Actualiza un producto por ID (sin cambiar el ID).
- **DELETE /:pid**: Elimina un producto por ID.

### Carritos (/carts)

- **POST /**: Crea un nuevo carrito.
- **GET /:cid**: Lista los productos en el carrito con el ID especificado.
- **POST /:cid/product/:pid**: Agrega un producto al carrito (incrementa quantity si ya existe).

## Persistencia

Los datos se almacenan en archivos JSON:
- `products.json`: Lista de productos.
- `carts.json`: Lista de carritos.

## Interfaz Gráfica

Accede a `http://localhost:8080` para usar la interfaz web que permite gestionar productos y carritos de forma visual.

## Tecnologías

- Node.js
- Express
- UUID para IDs únicos
- Bootstrap para la interfaz