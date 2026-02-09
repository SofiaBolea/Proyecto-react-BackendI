import { Router } from 'express';
import { productManager } from "../../managers/ProductManager.js";

const router = Router();


/* ============================================= */
/* --- VISTAS ---                              */
/* ============================================= */
/*Lista de productos */
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getAll();
        res.render('home', { products }); // Renderiza la vista 'home' con los productos
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

/* Detalle de producto */
router.get('/products/:pid', async (req, res) => {
    try {
        const product = await productManager.getById(req.params.pid);
        res.render('product', { product });// Renderiza la vista 'product' con el producto encontrado
    } catch (error) {
        res.status(404).render('error', { message: 'Producto no encontrado' });
    }
});

/*Crear producto  */
router.post('/products', async (req, res) => {
    try {
        await productManager.addProduct(req.body);
        res.redirect('/');
    } catch (error) {
        const products = await productManager.getAll();
        res.render('home', { products, errorMessage: error.message });
    }
});

/*Eliminar producto  */
router.post('/products/:pid/delete', async (req, res) => {
    try {
        await productManager.delete(req.params.pid);
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
    }
});

/* ============================================= */
/* --- API JSON ---                              */
/* ============================================= */

/* LISTAR TODOS LOS PRODUCTOS */
router.get('/api/products', async (req, resp) => {
    try {
        const products = await productManager.getAll();
        resp.json(products);
    } catch (error) {
        resp.status(500).json({ error: error.message });
    }
});

/* BUSCAR PRODUCTO POR ID */
router.get('/api/products/:pid', async (req, res) => {
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

/* CREAR PRODUCTO */
router.post('/api/products', async (req, res) => {
    try {
        const product = await productManager.addProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        const status = error.message.includes("Faltan campos") ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

/* ACTUALIZAR PRODUCTO */
router.put('/api/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.updateProduct(pid, req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ELIMINAR PRODUCTO */
router.delete('/api/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.delete(pid);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
