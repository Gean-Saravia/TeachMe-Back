// src/routes/classes.routes.js
import { Router } from 'express';
import { createReview, getOneReview, getReviews } from '../controllers/reviews.controllers.js';

const router = Router();

// Routes
router.get('/', getReviews)
router.get('/:id', getOneReview)
router.post('/', createReview);
//router.put('/:id', );

export default router;
