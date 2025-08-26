import { Request, RequestHandler, Response } from 'express';
import { likeService } from '../services/like.service';
import { UnauthorizedError } from '../utils/custom.errors';

export const likePost: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new UnauthorizedError('User not authorized');
    }

    const postId = parseInt(req.params.postId);
    await likeService.likePost(userId, postId);

    res.status(200).json({
        message: 'Post liked successfully'
    });
};

export const unlikePost: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new UnauthorizedError('User not authorized');
    }

    const postId = parseInt(req.params.postId);
    await likeService.unlikePost(userId, postId);

    res.status(200).json({
        message: 'Post unliked successfully'
    });
};

export const likeComment: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new UnauthorizedError('User not authorized');
    }

    const commentId = parseInt(req.params.commentId);
    await likeService.likeComment(userId, commentId);

    res.status(200).json({
        message: 'Comment liked successfully'
    });
};

export const unlikeComment: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new UnauthorizedError('User not authorized');
    }

    const commentId = parseInt(req.params.commentId);
    await likeService.unlikeComment(userId, commentId);

    res.status(200).json({
        message: 'Comment unliked successfully'
    });
};
