//route auth
import { Router } from 'express';
import { login, register, forgotPassword, resetPassword } from '../controllers/auth.controller';
// import { authenticateToken } from '../middleware/authMiddleware';

const authRoutes: Router = Router();
// Define your authentication routes here
authRoutes.post('/login', login);
authRoutes.post('/register', register)
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/reset-password', resetPassword);

export { authRoutes };