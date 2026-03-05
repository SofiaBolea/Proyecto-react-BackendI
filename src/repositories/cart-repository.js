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

  clearProducts = async (cartId) => {
    try {
      const cart = await this.model.findById(cartId);
      if (!cart) throw new Error("Carrito no encontrado");

      cart.products = [];
      return await cart.save();
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

  removeProduct = async (cartId, productId) => {
    try {
      const cart = await this.model.findById(cartId);
      if (!cart) throw new Error("Carrito no encontrado");

      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId
      );

      if (productIndex === -1) throw new Error("Producto no encontrado en el carrito");

      cart.products.splice(productIndex, 1);
      return await cart.save();
    } catch (error) {
      throw new Error(error);
    }
  };

  updateProductQuantity = async (cartId, productId, quantity) => {
    try {
      const cart = await this.model.findById(cartId);
      if (!cart) throw new Error("Carrito no encontrado");

      const item = cart.products.find(
        (p) => p.product.toString() === productId
      );

      if (!item) throw new Error("Producto no encontrado en el carrito");

      item.quantity = quantity;
      return await cart.save();
    } catch (error) {
      throw new Error(error);
    }
  };

  updateProducts = async (cartId, products) => {
    try {
      const cart = await this.model.findById(cartId);
      if (!cart) throw new Error("Carrito no encontrado");

      // Validar que cada producto exista
      for (const item of products) {
        const exists = await productRepository.getById(item.product);
        if (!exists) throw new Error(`Producto ${item.product} no encontrado`);
      }

      // Agrupar productos duplicados sumando cantidades
      const grouped = {};
      for (const p of products) {
        const id = p.product.toString();
        if (grouped[id]) {
          grouped[id].quantity += (p.quantity || 1);
        } else {
          grouped[id] = { product: id, quantity: p.quantity || 1 };
        }
      }

      cart.products = Object.values(grouped);

      return await cart.save();
    } catch (error) {
      throw new Error(error);
    }
  };
}

export const cartRepository = new CartRepository(CartModel);
