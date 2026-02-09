import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

class ProductManager {
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
            throw new Error('Error reading products file');
        }
    }

    async getById(id) {
        try {
            const products = await this.getAll();
            const product = products.find(p => p.id === id);
            if (!product) throw new Error('Product not found');
            return product;
        } catch (error) {
            throw error;
        }
    }

    async addProduct(productData) {
        try {
            const products = await this.getAll();

            // 1. Validar que vengan todos los campos obligatorios

            if (!productData.title || !productData.description || !productData.code || !productData.price || !productData.stock || !productData.category) {
                throw new Error("Faltan campos obligatorios");
            }

            // 2. Validar que el 'code' no se repita
            if (products.some(p => p.code === productData.code)) {
                throw new Error(`El código "${productData.code}" ya existe`);
            }

            // 3. Crear el nuevo producto con la estructura solicitada
            const newProduct = {
                id: uuidv4(),
                ...productData,
                createdBy: productData.createdBy?.trim() || 'Formulario clásico',
                price: Number(productData.price), // Aseguramos que sea número
                status: true, 
                stock: Number(productData.stock), // Aseguramos que sea número
                thumbnails: productData.thumbnails || []
            };

            // 4. Guardar
            products.push(newProduct);
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));

            return newProduct;

        } catch (error) {
            throw error;
        }
    }

    async updateProduct(id, updateData) {
        try {
            const product= await this.getById(id);
            const products = await this.getAll();
            const index = products.findIndex((u)=>u.id ===id);
            const oldImages = product.thumbnails || [];
            const newImages = updateData.thumbnails || [];

            products[index] = { ...product, ...updateData, thumbnails: [...oldImages, ...newImages], id:product.id};
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return products[index];
        } catch (error) {
            throw error;
        }
    }

    async delete(pid) {
        try{
            const product = await this.getById(pid);
            const products = await this.getAll();
            const index = products.findIndex(p => p.id === pid);
            products.splice(index,1);
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return product;
        }
        catch (error){
            throw new Error(error.message);
        }
    }
}

export const productManager = new ProductManager('./data/products.json');