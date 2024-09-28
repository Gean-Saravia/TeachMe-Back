// src/routes/classes.routes.js
import { Router } from 'express';
import { createHiring, getOneHiring, getHirings } from '../controllers/hirings.controllers.js';

const router = Router();

// Routes
router.get('/', getHirings)
router.get('/:id', getOneHiring)
router.post('/', createHiring );
//router.put('/:id', );

export default router;
