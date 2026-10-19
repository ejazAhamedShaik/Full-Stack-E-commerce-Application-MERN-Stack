import { Schema, model } from 'mongoose';

const ordersSchema = new Schema({
    orderedAt: {
        type: Date,
        default: Date.now,
    },
    priceAtOrder: {
        type: Number,
        required: [true, "Price cannot be empty"],
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, "Product is required"],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required"],
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true,
    },
    razorpayPaymentId: {
        type: String,
        required: true,
        unique: true,
    },
})

export const Order = model('Order', ordersSchema);
