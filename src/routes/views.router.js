// Rutas de vistas especiales
import { Router } from 'express';
import { productRepository } from "../repositories/product-repository.js";

const router = Router();

/* Redirigir raíz a productos */
router.get('/', (req, res) => {
    res.redirect('/products/api/view');
});

/* ============================================ */
/* --- VISTA TIEMPO REAL (WebSockets)          */
/* ============================================ */
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = (await productRepository.getAll()).map(p => p.toObject());
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

export default router;
