import { Schema, model } from "mongoose";

const CartSchema = new Schema({
    products: [{
        product:  { type: Schema.Types.ObjectId, ref: 'products', required: true },
        quantity: { type: Number, default: 1 },
        _id: false,
    }],
});

export const CartModel = model('carts', CartSchema);