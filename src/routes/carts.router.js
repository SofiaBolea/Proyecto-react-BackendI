// Endpoints REST para manejar carritos. Usa controller + repository + MongoDB.
import { Router } from 'express';
import { cartController } from '../controllers/cart-controller.js';

const router = Router();


router.post('/', cartController.create);
router.get('/', cartController.getAll);
router.get('/:cid', cartController.getById);
router.delete('/:cid', cartController.delete);
router.post('/:cid/product/:pid', cartController.addProduct);

export default router;
