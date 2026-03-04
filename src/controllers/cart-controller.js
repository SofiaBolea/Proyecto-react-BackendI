import { cartRepository } from "../repositories/cart-repository.js";
import { productRepository } from "../repositories/product-repository.js";
import { CustomError } from "../utils/custom-error.js";

class CartController {
  constructor(repository) {
    this.repository = repository;
  }

  getAll = async (req, res, next) => {
    try {
      const carts = await this.repository.getAll();
      res.json(carts);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const cart = await this.repository.getById(cid);
      if (!cart) throw new CustomError("Carrito no encontrado", 404);
      res.json(cart.products);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const cart = await this.repository.create();
      res.status(201).json(cart);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const cart = await this.repository.delete(cid);
      if (!cart) throw new CustomError("Carrito no encontrado", 404);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  addProduct = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      // Validar que el producto exista
      const product = await productRepository.getById(pid);
      if (!product) throw new CustomError("Producto no encontrado", 404);

      const updatedCart = await this.repository.addProduct(cid, pid);
      res.json(updatedCart);
    } catch (error) {
      next(error);
    }
  };
}

export const cartController = new CartController(cartRepository);
