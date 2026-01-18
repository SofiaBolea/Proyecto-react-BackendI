import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

class CartManager {
    constructor(path) {
        this.path = path;
    }

    async getAll() {
        try {
            if (!fs.existsSync(this.path)) {
                return [];
            }
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Error reading carts file');
        }
    }

    async getById(id) {
        try {
            const carts = await this.getAll();
            const cart = carts.find(c => c.id === id);
            if (!cart) throw new Error('Cart not found');
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async create() {
        try {
            const carts = await this.getAll();
            const newCart = {
                id: uuidv4(),
                products: []
            };
            carts.push(newCart);
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            return newCart;
        } catch (error) {
            throw new Error('Error creating cart');
        }
    }

    async addProduct(cid, pid) {
        try {
            const carts = await this.getAll();
            const cartIndex = carts.findIndex(c => c.id === cid);
            if (cartIndex === -1) throw new Error('Cart not found');
            const cart = carts[cartIndex];
            const productIndex = cart.products.findIndex(p => p.product === pid);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({ product: pid, quantity: 1 });
            }
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            return cart;
        } catch (error) {
            throw error;
        }
    }
}

export const cartManager = new CartManager('./carts.json');