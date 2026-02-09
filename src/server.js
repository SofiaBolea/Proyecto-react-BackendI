import express from 'express';
import { engine } from 'express-handlebars';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();

/* --- MIDDLEWARES --- */
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

/* --- HANDLEBARS --- */
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

/* --- RUTAS --- */
app.use(productsRouter);
app.use(cartsRouter);

/* Archivos estáticos */
app.use(express.static('public'));

app.listen(8080, () => console.log('Servidor Express escuchando en http://localhost:8080'));