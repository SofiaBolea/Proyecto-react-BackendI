import { Router } from 'express';
import { productManager } from "../../managers/ProductManager.js";

const router = Router();

/* ============================================= */
/* --- VISTA TIEMPO REAL (Handlebars + WS) ----- */
/* ============================================= */

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getAll();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

/* ============================================= */
/* --- API HTTP + WebSocket EMITS -------------- */
/* ============================================= */

// Crear producto y notificar por WebSocket
router.post('/api/realtime/products', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        const products = await productManager.getAll();

        const io = req.app.get('io');
        if (io) {
            io.emit('updateProducts', products);
        }

        res.status(201).json(newProduct);
    } catch (error) {
        const status = error.message?.includes('Faltan campos') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

// Eliminar producto y notificar por WebSocket
router.delete('/api/realtime/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const deleted = await productManager.delete(pid);
        const products = await productManager.getAll();

        const io = req.app.get('io');
        if (io) {
            io.emit('updateProducts', products);
        }

        res.json(deleted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
