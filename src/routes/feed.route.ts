//route auth
import { Router } from 'express';
import { feeds, createPost, updatePost, deletePost, uploadImage } from '../controllers/feed.controller';
import { cacheMiddleware } from '../middlewares/cache.middleware';

export const feedRoutes: Router = Router();

// Cache feed responses for 5 minutes (300 seconds)
feedRoutes.get('/', cacheMiddleware(300), feeds);

// POST - create new post with file upload
feedRoutes.post('/', uploadImage, createPost);

// PATCH - partial update of post (e.g., just the caption)
feedRoutes.patch('/:postId', updatePost);

// DELETE - delete post
feedRoutes.delete('/:postId', deletePost);
