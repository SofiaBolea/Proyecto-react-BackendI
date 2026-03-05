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
router.delete('/:cid', cartController.clearCart);
router.delete('/:cid/full', cartController.deleteCart);
router.delete('/:cid/products/:pid', cartController.removeProductFromCart);
router.put('/:cid', cartController.updateCart);
router.put('/:cid/products/:pid', cartController.updateProductQuantity);

export default router;
