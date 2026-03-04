// Rutas server-side render (Handlebars). Usan los repositories de MongoDB
// para persistir/consultar datos y renderizan vistas para productos y carritos.
import { Router } from 'express';
import { productRepository } from "../repositories/product-repository.js";
import { cartRepository } from "../repositories/cart-repository.js";

const router = Router();

/* ============================================= */
/* --- VISTAS (Handlebars) - Carritos           */
/* ============================================= */

/* VISTA: Lista de carritos */
router.get('/carts', async (req, res) => {
    try {
        const carts = (await cartRepository.getAll()).map(c => c.toObject());
        res.render('carts', { carts });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

/* ACCIÓN: Crear carrito y redirigir */
router.post('/carts', async (req, res) => {
    try {
        await cartRepository.create();
        res.redirect('/carts');
    } catch (error) {
        res.redirect('/carts');
    }
});

/* VISTA: Detalle de un carrito */
router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await cartRepository.getByIdPopulated(req.params.cid);
        if (!cart) return res.status(404).render('error', { message: 'Carrito no encontrado' });

        const cartObj = cart.toObject();
        const enrichedProducts = cartObj.products.map((item) => {
            if (item.product) {
                return {
                    ...item,
                    title: item.product.title,
                    price: item.product.price,
                    quantity: item.quantity,
                    subtotal: item.product.price * item.quantity,
                };
            }
            return { ...item, title: 'Producto eliminado', price: 0, subtotal: 0 };
        });
        const total = enrichedProducts.reduce((sum, p) => sum + p.subtotal, 0);
        res.render('cart', { cart: cartObj, products: enrichedProducts, total });
    } catch (error) {
        res.status(404).render('error', { message: 'Carrito no encontrado' });
    }
});

/* ACCIÓN: Eliminar carrito */
router.post('/carts/:cid/delete', async (req, res) => {
    try {
        await cartRepository.delete(req.params.cid);
        res.redirect('/carts');
    } catch (error) {
        res.redirect('/carts');
    }
});

/* ACCIÓN: Agregar producto a carrito */
router.post('/carts/:cid/product/:pid', async (req, res) => {
    try {
        const product = await productRepository.getById(req.params.pid);
        if (!product) throw new Error('Producto no encontrado');
        await cartRepository.addProduct(req.params.cid, req.params.pid);
        res.redirect(`/carts/${req.params.cid}`);
    } catch (error) {
        res.redirect('/carts');
    }
});


/* ============================================ */
/* --- VISTAS (Handlebars) - Productos          */
/* ============================================ */

/* Lista de productos */
router.get('/', async (req, res) => {
    try {
        const products = (await productRepository.getAll()).map(p => p.toObject());
        res.render('home', { products });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

/* Detalle de producto */
router.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productRepository.getById(pid);
        if (!product) return res.status(404).render('error', { message: 'Producto no encontrado' });
        res.render('product', { product: product.toObject() });
    } catch (error) {
        res.status(404).render('error', { message: 'Producto no encontrado' });
    }
});

/* Crear producto */
router.post('/products', async (req, res) => {
    try {
        const body = { ...req.body };
        // Convertir thumbnails de string separado por comas a array
        if (typeof body.thumbnails === 'string' && body.thumbnails.trim()) {
            body.thumbnails = body.thumbnails.split(',').map(t => t.trim());
        } else {
            body.thumbnails = [];
        }
        await productRepository.create(body);
        res.redirect('/');
    } catch (error) {
        const products = (await productRepository.getAll()).map(p => p.toObject());
        res.render('home', { products, errorMessage: error.message });
    }
});

/* Eliminar producto */
router.post('/products/:pid/delete', async (req, res) => {
    try {
        const { pid } = req.params;
        await productRepository.delete(pid);
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
    }
});

/* Modificar producto (desde formulario Handlebars) */
router.post('/products/:pid/update', async (req, res) => {
    const { pid } = req.params;
    try {
        await productRepository.update(pid, req.body);
        res.redirect(`/products/${pid}`);
    } catch (error) {
        try {
            const product = await productRepository.getById(pid);
            res.status(400).render('product', { product: product.toObject(), errorMessage: error.message });
        } catch {
            res.status(404).render('error', { message: 'Producto no encontrado' });
        }
    }
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