import { cartRepository } from "../repositories/cart-repository.js";
import { productRepository } from "../repositories/product-repository.js";

class CartController {
  constructor(repository) {
    this.repository = repository;
  }

  /* ============================================= */
  /* --- VISTAS (Handlebars)                      */
  /* ============================================= */

  renderAll = async (req, res, next) => {
    try {
      const carts = (await this.repository.getAll()).map((c) => c.toObject());
      res.render("carts", { carts });
    } catch (error) {
      res.status(500).render("error", { message: error.message });
    }
  };

  renderById = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const cart = await this.repository.getByIdPopulated(cid);
      if (!cart)
        return res
          .status(404)
          .render("error", { message: "Carrito no encontrado" });

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
        return { ...item, title: "Producto eliminado", price: 0, subtotal: 0 };
      });
      const total = enrichedProducts.reduce((sum, p) => sum + p.subtotal, 0);
      res.render("cart", { cart: cartObj, products: enrichedProducts, total });
    } catch (error) {
      res.status(404).render("error", { message: "CARRITO no encontrado" });
    }
  };

  createAndRedirect = async (req, res, next) => {
    try {
      await this.repository.create();
      res.redirect("/api/carts/view");
    } catch (error) {
      res.redirect("/api/carts/view");
    }
  };

  addProductAndRedirect = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const response = await this.repository.addProduct(cid, pid);
      if (!response)
        res.status(404).render("error", { message: "Carrito no encontrado" });
      res.redirect(`/api/carts/${cid}`);
    } catch (error) {
      res.status(404).render("error", { message: "Carrito no encontrado" });
    }
  };

  deleteCart = async (req, res, next) => {
    try {
      const { cid } = req.params;
      await this.repository.delete(cid);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  clearCart = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const updated = await this.repository.clearProducts(cid);
      res.json({ status: 'success', message: 'Carrito vacío', payload: updated });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  removeProductFromCart = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      await this.repository.removeProduct(cid, pid);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateProductQuantity = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined || quantity === null || isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'Se requiere una cantidad válida (mayor o igual a 1)' });
      }

      const updated = await this.repository.updateProductQuantity(cid, pid, parseInt(quantity));
      res.json({ status: 'success', payload: updated });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateCart = async (req, res, next) => {
    try {
      const { cid } = req.params;
      let { products } = req.body;
      if (Array.isArray(req.body)) {
        products = req.body;
      }

      // Aceptar productos enviados como JSON string (por ejemplo desde formularios)
      if (typeof products === "string") {
        try {
          products = JSON.parse(products);
        } catch (err) {
          return res
            .status(400)
            .json({ error: "Body.products no es JSON válido" });
        }
      }

      if (!Array.isArray(products)) {
        return res
          .status(400)
          .json({ error: "Se requiere un arreglo de productos" });
      }

      const updated = await this.repository.updateProducts(cid, products);
      res.json({ status: "success", payload: updated });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export const cartController = new CartController(cartRepository);
