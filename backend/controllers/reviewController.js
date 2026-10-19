import { Review } from "../models/reviewModal.js";
import {
  createFactory,
  getByQueryParamsFactory,
} from "../utils/crudFactory.js";

/**
 * These are steps to write a review
 * 1. Ger user from protectRoute middleware
 * 2. Get product from req.body
 * 3. Create a review document with user and product
 * 4. Save the review document
 * 5. Send response with status code 201 and review document
 */
const addReview = async (req, res) => {
    try {
        const { review, rating, product } = req.body;
        const user = req.user._id;

        const newReview = await Review.create({
            review,
            rating,
            product,
            user,
        });

        res.status(201).send({
            message: "Review added successfully",
            data: newReview,
        });
    } catch (error) {
        res.status(500).send({
            message: error.message,
        });
    }
};
/**
 * Return all reviews for a product
 * 1. Get product from req.query
 * 2. Find all reviews for the product
 * 3. Send response with status code 200 and reviews
 * 4. If no reviews found, send response with status code 200 and empty array response
 * 5. If error occurs, send response with status code 500 and error message
 */
const getReviews = async (req, res) => {
    try {
        const { product } = req.query;
        const reviews = await Review.find({ product }).populate("user", "name email");

        res.status(200).send({
            message: "Reviews fetched successfully",
            data: reviews,
        });
    } catch (error) {
        res.status(500).send({
            message: error.message,
        });
    }
};

export { addReview, getReviews };
