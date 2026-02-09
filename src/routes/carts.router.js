import { Router } from 'express';
import { cartManager } from "../../managers/CartManager.js";
import { productManager } from "../../managers/ProductManager.js";

const router = Router();

/* ============================================= */
/* --- VISTAS (Handlebars) ---                   */
/* ============================================= */

/* VISTA: Lista de carritos */
router.get('/carts', async (req, res) => {
    try {
        const carts = await cartManager.getAll();
        res.render('carts', { carts });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

/* ACCIÓN: Crear carrito y redirigir */
router.post('/carts', async (req, res) => {
    try {
        await cartManager.create();
        res.redirect('/carts');
    } catch (error) {
        res.redirect('/carts');
    }
});

/* VISTA: Detalle de un carrito */
router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getById(req.params.cid);
        // Enriquecer con datos del producto
        const enrichedProducts = [];
        for (const item of cart.products) {
            try {
                const product = await productManager.getById(item.product);
                enrichedProducts.push({
                    ...item,
                    title: product.title,
                    price: product.price,
                    subtotal: product.price * item.quantity
                });
            } catch {
                enrichedProducts.push({ ...item, title: 'Producto eliminado', price: 0, subtotal: 0 });
            }
        }
        const total = enrichedProducts.reduce((sum, p) => sum + p.subtotal, 0);
        res.render('cart', { cart, products: enrichedProducts, total });
    } catch (error) {
        res.status(404).render('error', { message: 'Carrito no encontrado' });
    }
});

/* ACCIÓN: Eliminar carrito */
router.post('/carts/:cid/delete', async (req, res) => {
    try {
        await cartManager.delete(req.params.cid);
        res.redirect('/carts');
    } catch (error) {
        res.redirect('/carts');
    }
});

/* ACCIÓN: Agregar producto a carrito */
router.post('/carts/:cid/product/:pid', async (req, res) => {
    try {
        await productManager.getById(req.params.pid);
        await cartManager.addProduct(req.params.cid, req.params.pid);
        res.redirect(`/carts/${req.params.cid}`);
    } catch (error) {
        res.redirect('/carts');
    }
});

/* ============================================= */
/* --- API JSON ---                              */
/* ============================================= */

/* CREAR CARRITO */
router.post('/api/carts', async (req, res) => {
    try {
        const cart = await cartManager.create(req.body);
        res.status(201).json(cart);
    } catch (error) {
        const status = error.message.includes("Faltan campos") ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

/* LISTAR TODOS LOS CARRITOS */
router.get('/api/carts', async (req, res) => {
    try {
        const carts = await cartManager.getAll();
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* LISTAR PRODUCTOS DE UN CARRITO */
router.get('/api/cart/:cid', async (req, res) => {
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

/* ELIMINAR CARRITO */
router.delete('/api/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.delete(cid);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* AGREGAR PRODUCTO A CARRITO */
router.post('/api/cart/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        await productManager.getById(pid);
        const updatedCart = await cartManager.addProduct(cid, pid);
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;
