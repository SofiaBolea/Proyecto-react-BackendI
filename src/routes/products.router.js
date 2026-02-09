import { Router } from 'express';
import { productManager } from "../../managers/ProductManager.js";

const router = Router();

/* ============================================= */
/* --- API JSON ---                              */
/* ============================================= */

/* LISTAR TODOS LOS PRODUCTOS */
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* BUSCAR PRODUCTO POR ID */
router.get('/:pid', async (req, res) => {
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
router.post('/', async (req, res) => {
    try {
        const product = await productManager.addProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        const status = error.message.includes("Faltan campos") ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

/* ACTUALIZAR PRODUCTO */
router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.updateProduct(pid, req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ELIMINAR PRODUCTO */
router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.delete(pid);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;


