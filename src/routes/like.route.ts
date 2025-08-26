import { Router } from 'express';
import { likePost, unlikePost, likeComment, unlikeComment } from '../controllers/like.controller';

export const likeRoutes: Router = Router();

// Post likes
likeRoutes.post('/posts/:postId', likePost);
likeRoutes.delete('/posts/:postId', unlikePost);

// Comment likes
likeRoutes.post('/comments/:commentId', likeComment);
likeRoutes.delete('/comments/:commentId', unlikeComment);
