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
      const { page = 1, limit = 10, query, sort, status } = req.query;
      
      const result = await this.repository.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        query: query || null,
        sort: sort || null,
        status: status || null
      });

      const products = result.docs.map(p => p.toObject());
      
      res.render("home", { 
        products,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          hasPrevPage: result.hasPrevPage,
          hasNextPage: result.hasNextPage,
          prevPage: result.prevPage,
          nextPage: result.nextPage,
          limit: parseInt(limit),
          query: query || '',
          sort: sort || '',
          status: status || ''
        }
      });
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
      const created = await this.repository.create(body);
      
      // Si viene como JSON (desde Postman), devuelve JSON
      if (req.is('application/json') || req.headers.accept?.includes('application/json')) {
        return res.status(201).json({ status: 'success', payload: created });
      }
      
      // Si viene como formulario, redirige
      res.redirect("/api/products/view");
    } catch (error) {
      // Si viene como JSON, devuelve JSON error
      if (req.is('application/json') || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ error: error.message, details: error.errors || {} });
      }
      
      // Si es formulario, renderiza con mensaje de error
      const result = await this.repository.getAll();
      const products = result.docs.map(p => p.toObject());
      res.render("home", { 
        products, 
        errorMessage: error.message,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          hasPrevPage: result.hasPrevPage,
          hasNextPage: result.hasNextPage,
          prevPage: result.prevPage,
          nextPage: result.nextPage,
          limit: 10,
          query: '',
          sort: '',
          status: ''
        }
      });
    }
  };


  /* ============================================= */
  /* --- API REST                                 */
  /* ============================================= */

  getAll = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, query, sort, status } = req.query;
      
      const response = await this.repository.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        query: query || null,
        sort: sort || null,
        status: status || null
      });

      // Construir query string para links
      const buildLink = (pageNum) => {
        let link = `/api/products?page=${pageNum}&limit=${limit}`;
        if (query) link += `&query=${query}`;
        if (sort) link += `&sort=${sort}`;
        if (status) link += `&status=${status}`;
        return link;
      };

      res.json({
        status: "success",
        payload: response.docs,
        totalPages: response.totalPages,
        prevPage: response.prevPage,
        nextPage: response.nextPage,
        page: response.page,
        hasPrevPage: response.hasPrevPage,
        hasNextPage: response.hasNextPage,
        prevLink: response.hasPrevPage ? buildLink(response.prevPage) : null,
        nextLink: response.hasNextPage ? buildLink(response.nextPage) : null,
      });
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

  getAllSimple = async (req, res, next) => {
    try {
      const products = await this.repository.getAllNoPagination();
      res.json({ status: 'success', payload: products });
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
