import { ProductModel } from "../models/product-model.js";

class ProductRepository {
  constructor(model) {
    this.model = model;
  }

  getAll = async ({ page = 1, limit = 10, query = null, sort = null, status = null } = {}) => {
    try {
      // Construir filtro de búsqueda
      const filter = {};
      
      // Filtro por estado de stock
      if (status === 'available') {
        filter.stock = { $gt: 0 };
      } else if (status === 'unavailable') {
        filter.stock = 0;
      }
      
      // Filtro por categoría (texto)
      if (query) {
        filter.category = { $regex: query, $options: 'i' };
      }

      // Construir sort
      const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

      return await this.model.paginate(filter, { page, limit, sort: sortOption });
    } catch (error) {
      throw new Error(error);
    }
  };

  getAllNoPagination = async () => {
    try {
      return await this.model.find().lean();
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

  create = async (body) => {
    try {
      return await this.model.create(body);
    } catch (error) {
      throw new Error(error);
    }
  };

  update = async (id, body) => {
    try {
      return await this.model.findByIdAndUpdate(id, body, { new: true });
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
}

export const productRepository = new ProductRepository(ProductModel);
