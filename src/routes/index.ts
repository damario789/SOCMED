//router
import { Router, RequestHandler } from 'express';
import { authRoutes } from './auth.route';
import { feedRoutes } from './feed.route';
import { commentRoutes } from './comment.route';
import { likeRoutes } from './like.route';
import { staticRoutes } from './static.route';
import { authenticateToken } from '../middlewares/auth.middleware';

const router: Router = Router();
// Static routes for serving uploaded files (no auth required)
router.use(staticRoutes);

// Auth routes
router.use('/auth', authRoutes);
//use authenticateToken middleware for feeds and comments routes
router.use('/feeds', authenticateToken as RequestHandler, feedRoutes);
router.use('/comments', authenticateToken as RequestHandler, commentRoutes);
router.use('/likes', authenticateToken as RequestHandler, likeRoutes);

export default router;