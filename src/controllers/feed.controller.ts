import { Request, RequestHandler, Response, NextFunction } from 'express';
import { getPaginationParams } from '../utils/pagination.util';
import { feedService } from '../services/feed.service';
import { UnauthorizedError, ValidationError, NotFoundError, ForbiddenError } from '../utils/custom.errors';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePostDto, UpdatePostDto } from '../dtos/post.dto';
import { extractValidationMessages } from '../utils/validation.util';
import { upload } from '../utils/upload.util';

//req.user
// {
//   id: 2,
//   email: 'tester123@test.com',
//   username: 'tester123',
//   createdAt: '2025-08-25T11:03:52.848Z',
//   updatedAt: '2025-08-25T11:03:52.848Z',
//   iat: 1756120485,
//   exp: 1756124085
// }
// Extend Express Request interface to include 'user'
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                username: string;
                createdAt: string;
                updatedAt: string;
                iat: number;
                exp: number;
            }
        }
    }
}

export const feeds: RequestHandler = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    // console.log(req.user, "req.user")
    // console.log(userId, "userId")
    if (!userId) {
        throw new UnauthorizedError("User not authorized");
    }
    
    // Extract pagination parameters from query
    const paginationParams = getPaginationParams(req.query);
    
    // Get paginated posts
    const paginatedPosts = await feedService.getPosts(userId, paginationParams);
    
    res.status(200).json({
        message: 'Posts fetched successfully',
        ...paginatedPosts
    });
};

// Middleware for file upload
export const uploadImage = upload.single('image');

export const createPost: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
        throw new UnauthorizedError("User not authorized");
    }
    
    // Cloudinary adds the file path to req.file.path
    let imageUrl = req.body.imageUrl;
    
    // If file was uploaded to Cloudinary, use its URL
    if (req.file && req.file.path) {
        imageUrl = req.file.path;
    }
    
    if (!imageUrl) {
        throw new ValidationError(['Image is required']);
    }
    
    // Validate request body
    const dto = plainToInstance(CreatePostDto, { ...req.body, imageUrl });
    const errors = await validate(dto);
    
    if (errors.length > 0) {
        const messages = extractValidationMessages(errors);
        throw new ValidationError(messages);
    }
    
    // Create the post
    const post = await feedService.createPost(userId, imageUrl, dto.caption);
    
    res.status(201).json({
        message: 'Post created successfully',
        post
    });
};

export const updatePost: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
        throw new UnauthorizedError("User not authorized");
    }
    
    const postId = parseInt(req.params.postId);
    
    // Validate request body
    const dto = plainToInstance(UpdatePostDto, req.body);
    const errors = await validate(dto);
    
    if (errors.length > 0) {
        const messages = extractValidationMessages(errors);
        throw new ValidationError(messages);
    }
    
    // Update the post
    const post = await feedService.updatePost(userId, postId, dto);
    
    res.status(200).json({
        message: 'Post updated successfully',
        post
    });
};

export const deletePost: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
        throw new UnauthorizedError("User not authorized");
    }
    
    const postId = parseInt(req.params.postId);
    
    // Delete the post
    await feedService.deletePost(userId, postId);
    
    res.status(200).json({
        message: 'Post deleted successfully'
    });
};