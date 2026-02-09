// Punto de entrada del servidor Express + Socket.io: configura middlewares,
// motor de vistas, rutas API y la instancia WebSocket compartida.
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import apiProductsRouter from './routes/products.router.js';
import apiCartsRouter from './routes/carts.router.js';
import path from 'path';
import viewsRouter from './routes/views.routes.js';
import realtimeRouter from './routes/realtime.routes.js';

const app = express();
const httpServer = createServer(app);
const socketServer = new Server(httpServer);

// Hacemos disponible io dentro de las rutas vía req.app.get('io')
app.set('io', socketServer);

/* --- MIDDLEWARES --- */
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(process.cwd(), "src", "public")));

/* --- HANDLEBARS --- */
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(process.cwd(), "src", "views")); 

/* --- RUTAS --- */
app.use('/api/products', apiProductsRouter);
app.use('/api/carts', apiCartsRouter);
app.use(viewsRouter);
app.use(realtimeRouter);


/* Archivos estáticos */
app.use(express.static('public')); /* esto hace que los archivos en la carpeta public sean accesibles públicamente */

socketServer.on('connection', (socket) => {
	console.log('Cliente conectado a WebSocket:', socket.id);
});

httpServer.listen(8080, () => {
	console.log('Servidor Express + Socket.io escuchando en http://localhost:8080');
});