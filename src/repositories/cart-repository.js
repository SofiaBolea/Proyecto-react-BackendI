import { CartModel } from "../models/cart-models.js";
import { productRepository } from "./product-repository.js";
class CartRepository {
  constructor(model) {
    this.model = model;
  }

  getAll = async () => {
    try {
      return await this.model.find();
    } catch (error) {
      throw new Error(error);
    }
  };

  getById = async (id) => {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw new Error(error);
    }
  };

  getByIdPopulated = async (id) => {
    try {
      return await this.model.findById(id).populate('products.product');
    } catch (error) {
      throw new Error(error);
    }
  };

  create = async () => {
    try {
      return await this.model.create({ products: [] });
    } catch (error) {
      throw new Error(error);
    }
  };

  delete = async (id) => {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(error);
    }
  };

  addProduct = async (cartId, productId) => {
    try {
      const cart = await this.model.findById(cartId);
      if (!cart) throw new Error("Carrito no encontrado");

      const existeProducto = await productRepository.getById(productId);
      if (!existeProducto) throw new Error("Producto no encontrado");

      const item = cart.products.find(
        (p) => p.product.toString() === productId,
      );

      if (item) {
        item.quantity += 1;
        return await cart.save();
      } else {
        return await this.model.findByIdAndUpdate(
          cartId,
          { $push: { products: { product: productId, quantity: 1 } } },
          { returnDocument: true },
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  };
}

export const cartRepository = new CartRepository(CartModel);
