// src/routes/classes.routes.js
import { Router } from 'express';
import { createClass, getClass, updateClass } from '../controllers/classes.controllers.js';

const router = Router();

// Routes
router.get('/', getClass)
router.post('/', createClass);
router.put('/:id', updateClass);

export default router;
