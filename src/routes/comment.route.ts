import { Router } from 'express';
import { 
    getPostComments, 
    getCommentReplies, 
    createComment, 
    createReply, 
    deleteComment 
} from '../controllers/comment.controller';

export const commentRoutes: Router = Router();

// Get comments for a post
commentRoutes.get('/post/:postId', getPostComments);

// Create a comment on a post
commentRoutes.post('/post/:postId', createComment);

// Get replies for a comment
commentRoutes.get('/:commentId/replies', getCommentReplies);

// Create a reply to a comment
commentRoutes.post('/:commentId/replies', createReply);

// Delete a comment (and its replies)
commentRoutes.delete('/:commentId', deleteComment);
