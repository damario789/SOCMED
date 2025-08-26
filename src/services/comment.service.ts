import prisma from '../utils/prisma.client';
import { PaginationParams, createPaginatedResponse } from '../utils/pagination.util';
import { NotFoundError, ForbiddenError } from '../utils/custom.errors';

export const commentService = {
    // Get paginated comments for a specific post
    getPostComments: async (postId: number, userId: number, pagination: PaginationParams = {}) => {
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            throw new NotFoundError('Post not found');
        }

        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const skip = (page - 1) * limit;

        // Count total top-level comments
        const totalComments = await prisma.comment.count({
            where: {
                postId,
                parentId: null // Only count top-level comments
            }
        });

        // Fetch paginated comments
        const comments = await prisma.comment.findMany({
            where: {
                postId,
                parentId: null // Only fetch top-level comments
            },
            orderBy: [
                { createdAt: 'desc' } // Newest first, can be changed to sort by likes
            ],
            include: {
                user: {
                    select: { id: true, username: true }
                },
                _count: {
                    select: {
                        likes: true,
                        replies: true
                    }
                },
                likes: {
                    where: { userId },
                    select: { id: true }
                }
            },
            skip,
            take: limit
        });

        // Transform comments to add computed fields
        const commentsWithComputed = comments.map(comment => ({
            ...comment,
            likeCount: comment._count.likes,
            replyCount: comment._count.replies,
            isLiked: comment.likes.length > 0,
            _count: undefined,
            likes: undefined
        }));

        return createPaginatedResponse(commentsWithComputed, totalComments, page, limit);
    },

    // Get replies for a specific comment
    getCommentReplies: async (commentId: number, userId: number, pagination: PaginationParams = {}) => {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            throw new NotFoundError('Comment not found');
        }

        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const skip = (page - 1) * limit;

        // Count total replies
        const totalReplies = await prisma.comment.count({
            where: {
                parentId: commentId
            }
        });

        // Fetch paginated replies
        const replies = await prisma.comment.findMany({
            where: {
                parentId: commentId
            },
            orderBy: { createdAt: 'asc' }, // Oldest first for replies
            include: {
                user: {
                    select: { id: true, username: true }
                },
                _count: {
                    select: {
                        likes: true
                    }
                },
                likes: {
                    where: { userId },
                    select: { id: true }
                }
            },
            skip,
            take: limit
        });

        // Transform replies
        const repliesWithComputed = replies.map(reply => ({
            ...reply,
            likeCount: reply._count.likes,
            isLiked: reply.likes.length > 0,
            _count: undefined,
            likes: undefined
        }));

        return createPaginatedResponse(repliesWithComputed, totalReplies, page, limit);
    },

    // Create a new comment on a post
    createComment: async (userId: number, postId: number, content: string) => {
        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            throw new NotFoundError('Post not found');
        }

        // Create the comment
        const comment = await prisma.comment.create({
            data: {
                content,
                userId,
                postId,
            },
            include: {
                user: {
                    select: { id: true, username: true }
                },
                _count: {
                    select: {
                        likes: true,
                        replies: true
                    }
                }
            }
        });

        // Transform to add computed fields
        return {
            ...comment,
            likeCount: comment._count.likes,
            replyCount: comment._count.replies,
            isLiked: false, // New comment is not liked by user yet
            _count: undefined
        };
    },

    // Create a reply to a comment
    createReply: async (userId: number, parentCommentId: number, content: string) => {
        // Check if parent comment exists
        const parentComment = await prisma.comment.findUnique({
            where: { id: parentCommentId }
        });

        if (!parentComment) {
            throw new NotFoundError('Parent comment not found');
        }

        // Create the reply
        const reply = await prisma.comment.create({
            data: {
                content,
                userId,
                postId: parentComment.postId,
                parentId: parentCommentId
            },
            include: {
                user: {
                    select: { id: true, username: true }
                },
                _count: {
                    select: {
                        likes: true
                    }
                }
            }
        });

        // Transform to add computed fields
        return {
            ...reply,
            likeCount: reply._count.likes,
            isLiked: false, // New reply is not liked by user yet
            _count: undefined
        };
    },

    // Delete a comment (including any replies)
    deleteComment: async (userId: number, commentId: number) => {
        // Check if comment exists and belongs to the user
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            throw new NotFoundError('Comment not found');
        }

        // Check if the user owns the comment
        if (comment.userId !== userId) {
            throw new ForbiddenError('You can only delete your own comments');
        }

        // Delete the comment (cascades to replies due to onDelete: Cascade in the schema)
        await prisma.comment.delete({
            where: { id: commentId }
        });
    }
};
