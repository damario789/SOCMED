import { Request, RequestHandler, Response } from 'express';
import { commentService } from '../services/comment.service';
import { UnauthorizedError } from '../utils/custom.errors';
import { getPaginationParams } from '../utils/pagination.util';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCommentDto } from '../dtos/comment.dto';
import { ValidationError } from '../utils/custom.errors';
import { extractValidationMessages } from '../utils/validation.util';

export const getPostComments: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
        throw new UnauthorizedError("User not authorized");
    }
    
    const postId = parseInt(req.params.postId);
    const paginationParams = getPaginationParams(req.query);
    
    const paginatedComments = await commentService.getPostComments(postId, userId, paginationParams);
    
    res.status(200).json({
        message: 'Comments fetched successfully',
        ...paginatedComments
    });
};

export const getCommentReplies: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
        throw new UnauthorizedError("User not authorized");
    }
    
    const commentId = parseInt(req.params.commentId);
    const paginationParams = getPaginationParams(req.query);
    
    const paginatedReplies = await commentService.getCommentReplies(commentId, userId, paginationParams);
    
    res.status(200).json({
        message: 'Replies fetched successfully',
        ...paginatedReplies
    });
};

export const createComment: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
        throw new UnauthorizedError("User not authorized");
    }
    
    const dto = plainToInstance(CreateCommentDto, req.body);
    const errors = await validate(dto);
    
    if (errors.length > 0) {
        const messages = extractValidationMessages(errors);
        throw new ValidationError(messages);
    }
    
    const postId = parseInt(req.params.postId);
    const comment = await commentService.createComment(userId, postId, dto.content);
    
    res.status(201).json({
        message: 'Comment created successfully',
        comment
    });
};

export const createReply: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
        throw new UnauthorizedError("User not authorized");
    }
    
    const dto = plainToInstance(CreateCommentDto, req.body);
    const errors = await validate(dto);
    
    if (errors.length > 0) {
        const messages = extractValidationMessages(errors);
        throw new ValidationError(messages);
    }
    
    const commentId = parseInt(req.params.commentId);
    const reply = await commentService.createReply(userId, commentId, dto.content);
    
    res.status(201).json({
        message: 'Reply created successfully',
        reply
    });
};

export const deleteComment: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
        throw new UnauthorizedError("User not authorized");
    }
    
    const commentId = parseInt(req.params.commentId);
    await commentService.deleteComment(userId, commentId);
    
    res.status(200).json({
        message: 'Comment deleted successfully'
    });
};
