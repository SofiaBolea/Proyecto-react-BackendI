import mongoose from 'mongoose';
import { ProductModel } from '../models/product-model.js';

// El script asume que las variables de entorno ya están cargadas
// (por ejemplo: `node --env-file=.env src/scripts/seed-products.js`).
const MONGO = process.env.MONGO_URL_ATLAS || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/coder-house';

const categories = ['Electrónica', 'Computadoras', 'Hogar', 'Juguetes', 'Ropa', 'Oficina'];

const randomPrice = () => Number((Math.random() * 1000 + 10).toFixed(2));
const randomStock = () => Math.floor(Math.random() * 100) + 1;

const makeProduct = (i) => ({
  title: `Producto ${i}`,
  description: `Descripción del producto número ${i}`,
  code: `PROD-${String(i).padStart(3, '0')}`,
  price: randomPrice(),
  stock: randomStock(),
  category: categories[i % categories.length],
  thumbnails: [`https://via.placeholder.com/400x400?text=Prod+${i}`]
});

const run = async () => {
  try {
    console.log('Conectando a MongoDB en', MONGO);
    // Si en .env se define DB_NAME, mongoose la usará; si no, se usa la que venga en la URL
    await mongoose.connect(MONGO, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

    const products = [];
    for (let i = 1; i <= 50; i++) products.push(makeProduct(i));

    const result = await ProductModel.insertMany(products, { ordered: false });
    console.log(`Insertados ${result.length} productos.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error al insertar productos:', err.message || err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
