//router
import { Router } from 'express';
import { authRoutes } from './auth';

const router: Router = Router();
// Define your routes here
router.use('/auth', authRoutes);

export default router;