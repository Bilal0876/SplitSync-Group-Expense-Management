import express from 'express';
import { register, login } from '../controllers/authController.ts';
import { validateFields } from '../middleware/validateMiddleware.ts';

const router = express.Router();

// 1. POST /register
// Logic: Validate name, email, password -> then run register controller
router.post(
    '/register', 
    validateFields(['name', 'email', 'password']), 
    register
);

// 2. POST /login
// Logic: Validate email, password -> then run login controller
router.post(
    '/login', 
    validateFields(['email', 'password']), 
    login
);

export default router;
