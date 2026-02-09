// Endpoints REST para manejar carritos vía JSON. Se apoyan en los managers
// para persistir los cambios y exponen operaciones CRUD básicas.
import { Router } from 'express';
import { cartManager } from "../../managers/CartManager.js";
import { productManager } from "../../managers/ProductManager.js";

const router = Router();

/* ============================================= */
/* --- API JSON ---                              */
/* ============================================= */

/* CREAR CARRITO */
router.post('/', async (req, res) => {
    try {
        const cart = await cartManager.create(req.body);
        res.status(201).json(cart);
    } catch (error) {
        const status = error.message.includes("Faltan campos") ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

/* LISTAR TODOS LOS CARRITOS */
router.get('/', async (req, res) => {
    try {
        const carts = await cartManager.getAll();
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* LISTAR PRODUCTOS DE UN CARRITO */
router.get('/:cid', async (req, res) => {
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
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.delete(cid);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* AGREGAR PRODUCTO A CARRITO */
router.post('/:cid/product/:pid', async (req, res) => {
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
