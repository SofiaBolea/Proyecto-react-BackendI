
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import apiProductsRouter from './routes/products.router.js';
import apiCartsRouter from './routes/carts.router.js';
import realtimeRouter from './routes/realtime.routes.js';
import path from 'path';
import viewsRouter from './routes/views.router.js';
import { productRepository } from './repositories/product-repository.js';
import errorHandler from './middlewares/error-handler.js';
import { initMongoDB } from './config/db-connection.js';

const app = express();
const httpServer = createServer(app);
const socketServer = new Server(httpServer);


/* --- MIDDLEWARES --- */
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

/* --- HANDLEBARS --- */
app.engine('handlebars', engine({
    helpers: {
        eq: (a, b) => a === b,
        ne: (a, b) => a !== b
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(process.cwd(), "src", "views")); 

/* --- RUTAS --- */
app.use('/api/products', apiProductsRouter);
app.use('/api/carts', apiCartsRouter);
app.use('/realtimeproducts', realtimeRouter);
app.use(viewsRouter);

/* --- ARCHIVOS ESTÁTICOS (después de las rutas para que no pisen las vistas) --- */
app.use(express.static(path.join(process.cwd(), 'src', 'public')));
app.use(express.static(path.join(process.cwd(), 'public')));

/* --- MANEJO DE ERRORES --- */
app.use(errorHandler)

socketServer.on('connection', async(socket) => {
	console.log('Cliente conectado a WebSocket:', socket.id);

    socket.on('newUserFront', (user) => {
        socket.broadcast.emit('newUser', user);
    })

	// Enviar primera página al conectarse
	const initialResult = await productRepository.getAll({ page: 1, limit: 10 });
	socket.emit('products', {
		docs: initialResult.docs,
		page: initialResult.page,
		totalPages: initialResult.totalPages,
		hasPrevPage: initialResult.hasPrevPage,
		hasNextPage: initialResult.hasNextPage,
		prevPage: initialResult.prevPage,
		nextPage: initialResult.nextPage
	})

	// Cliente pide una página específica
	socket.on('requestPage', async (pageData) => {
		try {
			const page = pageData.page || 1;
			const limit = pageData.limit || 10;
			const result = await productRepository.getAll({ page, limit });
			socket.emit('products', {
				docs: result.docs,
				page: result.page,
				totalPages: result.totalPages,
				hasPrevPage: result.hasPrevPage,
				hasNextPage: result.hasNextPage,
				prevPage: result.prevPage,
				nextPage: result.nextPage
			});
		} catch (error) {
			socket.emit('productError', error.message);
		}
	})
	
	socket.on('newProduct', async (data) => {
		try {
			await productRepository.create(data);
			// Reenviar página 1 a todos los clientes
			const result = await productRepository.getAll({ page: 1, limit: 10 });
			socketServer.emit('products', {
				docs: result.docs,
				page: result.page,
				totalPages: result.totalPages,
				hasPrevPage: result.hasPrevPage,
				hasNextPage: result.hasNextPage,
				prevPage: result.prevPage,
				nextPage: result.nextPage
			})
		} catch (error) {
			socket.emit('productError', error.message);
		}
	})

	socket.on('deleteProduct', async (pid) => {
		try {
			await productRepository.delete(pid);
			const result = await productRepository.getAll({ page: 1, limit: 10 });
			socketServer.emit('products', {
				docs: result.docs,
				page: result.page,
				totalPages: result.totalPages,
				hasPrevPage: result.hasPrevPage,
				hasNextPage: result.hasNextPage,
				prevPage: result.prevPage,
				nextPage: result.nextPage
			})
		} catch (error) {
			socket.emit('productError', error.message);
		}
	})
});

initMongoDB()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));


httpServer.listen(8080, () => console.log("Server running on port 8080"));