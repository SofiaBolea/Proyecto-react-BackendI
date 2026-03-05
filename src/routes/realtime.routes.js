import { Router } from 'express';
import { productRepository } from "../repositories/product-repository.js";

const router = Router();

/* ============================================ */
/* --- VISTA TIEMPO REAL (WebSockets)          */
/* ============================================ */
router.get('/', async (req, res) => {
    try {
        const result = await productRepository.getAll();
        const products = result.docs.map(p => p.toObject());
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

export default router;
