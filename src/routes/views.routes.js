// Rutas server-side render (Handlebars). Atienden formularios clásicos y
// renderizan vistas para productos y carritos usando los managers.
import { Router } from 'express';
import { productManager } from "../../managers/ProductManager.js";
import { cartManager } from "../../managers/CartManager.js";

const router = Router();

/* ============================================= */
/* --- VISTAS (Handlebars) - Carritos           */
/* ============================================= */

/* VISTA: Lista de carritos */
router.get('/carts', async (req, res) => {
    try {
        const carts = await cartManager.getAll();
        res.render('carts', { carts });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

/* ACCIÓN: Crear carrito y redirigir */
router.post('/carts', async (req, res) => {
    try {
        await cartManager.create();
        res.redirect('/carts');
    } catch (error) {
        res.redirect('/carts');
    }
});

/* VISTA: Detalle de un carrito */
router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getById(req.params.cid);
        // Enriquecer con datos del producto
        const enrichedProducts = [];
        for (const item of cart.products) {
            try {
                const product = await productManager.getById(item.product);
                enrichedProducts.push({
                    ...item,
                    title: product.title,
                    price: product.price,
                    subtotal: product.price * item.quantity
                });
            } catch {
                enrichedProducts.push({ ...item, title: 'Producto eliminado', price: 0, subtotal: 0 });
            }
        }
        const total = enrichedProducts.reduce((sum, p) => sum + p.subtotal, 0);
        res.render('cart', { cart, products: enrichedProducts, total });
    } catch (error) {
        res.status(404).render('error', { message: 'Carrito no encontrado' });
    }
});

/* ACCIÓN: Eliminar carrito */
router.post('/carts/:cid/delete', async (req, res) => {
    try {
        await cartManager.delete(req.params.cid);
        res.redirect('/carts');
    } catch (error) {
        res.redirect('/carts');
    }
});

/* ACCIÓN: Agregar producto a carrito */
router.post('/carts/:cid/product/:pid', async (req, res) => {
    try {
        await productManager.getById(req.params.pid);
        await cartManager.addProduct(req.params.cid, req.params.pid);
        res.redirect(`/carts/${req.params.cid}`);
    } catch (error) {
        res.redirect('/carts');
    }
});


/* ============================================ */
/* --- VISTAS (Handlebars) - Productos          */
/* ============================================ */
/*Lista de productos */
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getAll();
        res.render('home', { products }); // Renderiza la vista 'home' con los productos
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

/* Detalle de producto */
router.get ('/products/:pid'/* esta es la ruta que muestra el detalle del producto */, async (req, res) => { 
    /* que hace? : Muestra el detalle de un producto específico. como? : Busca el producto por su ID en la base de datos y luego renderiza la vista con los detalles del producto */
    try {
        const { pid } = req.params;
        const product = await productManager.getById(pid);
        res.render('product', { product });// Renderiza la vista 'product' con el producto encontrado
    } catch (error) {
        res.status(404).render('error', { message: 'Producto no encontrado' });
    }
});

/*Crear producto  */
router.post('/products', async (req, res) => {
    try {
        await productManager.addProduct(req.body);
        res.redirect('/');
    } catch (error) {
        const products = await productManager.getAll();
        res.render('home', { products, errorMessage: error.message });
    }
});

/*Eliminar producto  */
router.post('/products/:pid/delete', async (req, res) => {
    try {
        const { pid } = req.params;
        await productManager.delete(pid);
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
    }
});

/* MODIFICAR producto (desde formulario Handlebars) */
router.post('/products/:pid/update', async (req, res) => {
    const { pid } = req.params;
    try {
        await productManager.updateProduct(pid, req.body);
        res.redirect(`/products/${pid}`);
    } catch (error) {
        try {
            const product = await productManager.getById(pid);
            res.status(400).render('product', { product, errorMessage: error.message });
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
        const products = await productManager.getAll();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});



export default router;