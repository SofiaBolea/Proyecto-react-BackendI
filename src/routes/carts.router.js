// Rutas de carritos: vistas + API
import { Router } from 'express';
import { cartController } from '../controllers/cart-controller.js';

const router = Router();

/* ============================================= */
/* --- VISTAS - Carritos                       */
/* ============================================= */
router.get('/view', cartController.renderAll);
router.post('/', cartController.createAndRedirect);
router.get('/:cid', cartController.renderById);
router.post('/:cid/product/:pid', cartController.addProductAndRedirect);

/* ============================================= */
/* --- API REST - Carritos                     */
/* ============================================= */
router.delete('/:cid', cartController.delete);

export default router;
