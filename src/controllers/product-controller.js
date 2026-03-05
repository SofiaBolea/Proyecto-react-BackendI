import { productRepository } from "../repositories/product-repository.js";

class ProductController {
  constructor(repository) {
    this.repository = repository;
  }

  /* ============================================= */
  /* --- VISTAS (Handlebars)                      */
  /* ============================================= */

  renderAll = async (req, res, next) => {
    try {
      const products = (await this.repository.getAll()).map(p => p.toObject());
      res.render("home", { products });
    } catch (error) {
      res.status(500).render("error", { message: error.message });
    }
  };

  renderById = async (req, res, next) => {
    try {
      const { pid } = req.params;
      const product = await this.repository.getById(pid);
      if (!product) return res.status(404).render("error", { message: "Producto no encontrado" });
      res.render("product", { product: product.toObject() });
    } catch (error) {
      res.status(404).render("error", { message: "Producto no encontrado" });
    }
  };

  createAndRedirect = async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (typeof body.thumbnails === "string" && body.thumbnails.trim()) {
        body.thumbnails = body.thumbnails.split(",").map(t => t.trim());
      } else {
        body.thumbnails = [];
      }
      await this.repository.create(body);
      res.redirect("/products/api/view");
    } catch (error) {
      const products = (await this.repository.getAll()).map(p => p.toObject());
      res.render("home", { products, errorMessage: error.message });
    }
  };


  /* ============================================= */
  /* --- API REST                                 */
  /* ============================================= */

  getAll = async (req, res, next) => {
    try {
      const response = await this.repository.getAll();
      res.json(response);
    } catch (error) { 
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.repository.delete(req.params.pid);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const updated = await this.repository.update(req.params.pid, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export const productController = new ProductController(productRepository);
