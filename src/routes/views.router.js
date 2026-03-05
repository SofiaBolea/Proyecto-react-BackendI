// Rutas de vistas especiales
import { Router } from 'express';

const router = Router();

/* Redirigir raíz a productos */
router.get('/', (req, res) => {
    res.redirect('/api/products/view');
});

export default router;
