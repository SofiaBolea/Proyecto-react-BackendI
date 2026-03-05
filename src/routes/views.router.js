// Rutas de vistas especiales
import { Router } from 'express';
import { productRepository } from "../repositories/product-repository.js";

const router = Router();

/* Redirigir raíz a productos */
router.get('/', (req, res) => {
    res.redirect('/api/products/view');
});

/* ============================================ */
/* --- VISTA TIEMPO REAL (WebSockets)          */
/* ============================================ */
router.get('/realtimeproducts', async (req, res) => {
    try {
        const result = await productRepository.getAll();
        const products = result.docs.map(p => p.toObject());
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

export default router;
