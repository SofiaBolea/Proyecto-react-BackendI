import express from 'express';
// Asegúrate de que la ruta sea correcta y el archivo tenga extensión .js si usas import
import { productManager } from "../managers/ProductManager.js"; 
import { cartManager } from "../managers/CartManager.js";

const app = express();

/* --- MIDDLEWARES --- */
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// ¡ESTO ES LO QUE TE FALTABA PARA VER EL FRONTEND!
// Le dice al servidor: "Busca archivos HTML, JS o CSS en la carpeta 'public'"
app.use(express.static('public'));


/* --- RUTAS PRODUCTOS --- */

/* 1. LISTAR TODOS LOS PRODUCTOS */
app.get('/api/products', async (req, resp) => {
    try {
        const products = await productManager.getAll();
        resp.json(products);
    } catch (error) {
        resp.status(500).json({ error: error.message });
    }
});

/* 2. BUSCAR PRODUCTO POR ID */

app.get('/api/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getById(pid);
        
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* 3. CREAR PRODUCTO */
app.post('/api/products', async (req, res) => {
    /* BODY ESPERADO:
       {
        "title": "...",
        "description": "...",
        "code": "...",
        "price": 100,
        "stock": 10,
        "category": "...",
        "thumbnails": ["..."]
       }
    */
    try {
        const product = await productManager.addProduct(req.body);
        
        // 201 Created es el código correcto para creación
        res.status(201).json(product);
    } catch (error) {
        // Si el error es por validación (falta campo), devolvemos 400 (Bad Request)
        // Si es otro error, 500
        const status = error.message.includes("Faltan campos") ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

/* ACTUALIZAR PRODUCTO */

app.put('/api/products/:pid', async (req, res)=> {
    try {
        const {pid} = req.params;
        const product = await productManager.updateProduct(pid, req.body);
        res.json(product)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

/* ELIMINAR PRODUCTO */

app.delete('/api/products/:pid', async (req, res)=> {
    try {
        const {pid} = req.params;
        const product = await productManager.delete(pid);
        res.json(product)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

/* --- RUTAS CARRITO ---  */
/* CREAR CARRITO */

app.post('/api/carts', async (req, res) => {

    try {
        const cart = await cartManager.create(req.body);
        // 201 Created es el código correcto para creación
        res.status(201).json(cart);
    } catch (error) {
        // Si el error es por validación (falta campo), devolvemos 400 (Bad Request)
        // Si es otro error, 500
        const status = error.message.includes("Faltan campos") ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

/* LISTAR TODOS LOS CARRITOS */

app.get('/api/carts', async (req, res) => {
    try {
        const carts = await cartManager.getAll();
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/* LISTAR LOS PRODUCTOS QUE PERTENECEN AL CARRITO CON EL CID PROPORCIONADO */

app.get('/api/cart/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getById(cid);
        
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }
        
        res.json(cart.products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cart/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        // 1. Validar que el producto exista
        await productManager.getById(pid);

        // 2. Agregar producto al carrito
        const updatedCart = await cartManager.addProduct(cid, pid);

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.listen(8080, () => console.log('Servidor Express escuchando en http://localhost:8080'));