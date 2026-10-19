import { Schema, model } from 'mongoose';

const reviewSchema = new Schema({
    review: {
        type: String,
        require: [true, "Review cannot be empty"],
    },
    rating: {
        type: Number,
        require: [true, "Rating cannot be empty"],
        min: [1, "Rating should be greater than or equal to 1"],
        max: [5, "Rating should be less than or equal to 5"],
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
})

export const Review = model("Review", reviewSchema);