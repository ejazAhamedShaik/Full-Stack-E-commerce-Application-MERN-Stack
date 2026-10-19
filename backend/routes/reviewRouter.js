import express from 'express';
import { protectRoute } from '../controllers/authController.js';
import { addReview, getReviews } from '../controllers/reviewController.js';

const reviewRouter = express.Router();

/** Route to add reviews */
reviewRouter.post('/', protectRoute, addReview);

/** Route to get reviews */
reviewRouter.get('/', getReviews);

export { reviewRouter };
