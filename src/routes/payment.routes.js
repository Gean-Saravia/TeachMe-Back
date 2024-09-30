import { Router } from 'express';
import { createPreference } from '../controllers/paymentController.js';

const router = Router();

router.post('/create_preference', createPreference);

export default router;