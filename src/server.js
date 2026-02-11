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
import { productManager } from '../managers/ProductManager.js';

const app = express();
const httpServer = createServer(app);
const socketServer = new Server(httpServer);


/* --- MIDDLEWARES --- */
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

/* --- HANDLEBARS --- */
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(process.cwd(), "src", "views")); 

/* --- RUTAS --- */
app.use('/api/products', apiProductsRouter);
app.use('/api/carts', apiCartsRouter);
app.use(viewsRouter);

/* --- ARCHIVOS ESTÁTICOS (después de las rutas para que no pisen las vistas) --- */
app.use(express.static(path.join(process.cwd(), 'src', 'public')));
app.use(express.static(path.join(process.cwd(), 'public')));

socketServer.on('connection', async(socket) => {
	console.log('Cliente conectado a WebSocket:', socket.id);

    socket.on('newUserFront', (user) => {
        socket.broadcast.emit('newUser', user);
    }) /* socket.on sirve para escuchar eventos enviados por el cliente */

	socketServer.emit('products', await productManager.getAll()) /* socket.emit sirve para enviar eventos al cliente */
	
	socket.on('newProduct', async (data) => {
		try {
			await productManager.addProduct(data);
			socketServer.emit('products', await productManager.getAll())
		} catch (error) {
			socket.emit('productError', error.message);
		}
	})

	socket.on('deleteProduct', async (pid) => {
		try {
			await productManager.delete(pid);
			socketServer.emit('products', await productManager.getAll())
		} catch (error) {
			socket.emit('productError', error.message);
		}
	})
});

httpServer.listen(8080, () => {
	console.log('Servidor Express + Socket.io escuchando en http://localhost:8080');
});