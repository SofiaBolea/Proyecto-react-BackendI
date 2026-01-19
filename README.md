# Entrega N° 1 - Servidor de Productos y Carritos

Este proyecto implementa un servidor backend basado en Node.js y Express para gestionar productos y carritos de compra, cumpliendo con los requisitos de la Entrega N° 1. El enfoque principal es el desarrollo del backend, por lo que el frontend incluido es básico y funcional, pero no representa las mejores prácticas de desarrollo frontend.

## Descripción

El servidor proporciona una API RESTful para operaciones CRUD en productos y gestión de carritos. Incluye persistencia básica en archivos JSON y una interfaz web simple para demostración.

## Funcionalidades

### Backend
- Gestión completa de productos (crear, leer, actualizar, eliminar)
- Gestión de carritos (crear, listar, agregar productos)
- Validación básica de datos
- Persistencia en archivos JSON

### Frontend
- Interfaz web para gestionar productos y carritos
- Creación, edición y eliminación de productos
- Creación de carritos
- Visualización de todos los carritos
- Agregado de productos a carritos
- Búsqueda de productos y carritos por ID

## Tecnologías

- **Node.js**: Entorno de ejecución
- **Express.js**: Framework web
- **UUID**: Generación de IDs únicos
- **Bootstrap**: Framework CSS para la interfaz
- **Font Awesome**: Iconos
- **File System**: Persistencia básica en JSON

## Instalación y Ejecución

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar el servidor:
   ```bash
   node src/server.js
   ```
4. Acceder a la aplicación en `http://localhost:8080`

## API Endpoints

### Productos
- `GET /api/products` - Lista todos los productos
- `GET /api/products/:pid` - Obtiene un producto por ID
- `POST /api/products` - Crea un nuevo producto
- `PUT /api/products/:pid` - Actualiza un producto por ID
- `DELETE /api/products/:pid` - Elimina un producto por ID

### Carritos
- `POST /api/carts` - Crea un nuevo carrito vacío
- `GET /api/carts` - Lista todos los carritos
- `GET /api/cart/:cid` - Lista los productos en un carrito específico
- `POST /api/cart/:cid/product/:pid` - Agrega un producto al carrito (incrementa cantidad si ya existe)

## Interfaz Frontend

La aplicación incluye una interfaz web básica accesible en la raíz del servidor. Permite:
- Gestionar productos (CRUD)
- Crear y visualizar carritos
- Agregar productos a carritos existentes
- Buscar productos y carritos por ID

## Notas sobre Implementación

Este proyecto se centra en el backend, por lo que el frontend es una demostración simple. Algunas malas prácticas identificadas:

### Arquitectura Frontend
- **Actual**: Código JavaScript inline en HTML, funciones globales
- **En producción**: Separar en componentes modulares, usar frameworks como React/Vue, y herramientas de build como Webpack.

### Manejo de Errores
- **Actual**: Manejo básico de errores
- **En producción**: Logging centralizado, códigos de error consistentes, y manejo de excepciones robusto.

### Seguridad
- **Actual**: Sin autenticación ni autorización

Estas decisiones se tomaron para mantener el foco en los conceptos del backend mientras se proporciona una interfaz funcional para testing.