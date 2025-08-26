import prisma from '../utils/prisma.client';
import { NotFoundError, ConflictError } from '../utils/custom.errors';

export const likeService = {
  // Like a post
  likePost: async (userId: number, postId: number) => {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (existingLike) {
      throw new ConflictError('Post already liked');
    }

    // Create like
    return prisma.like.create({
      data: {
        userId,
        postId,
      },
    });
  },

  // Unlike a post
  unlikePost: async (userId: number, postId: number) => {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (!existingLike) {
      throw new NotFoundError('Like not found');
    }

    // Delete like
    return prisma.like.delete({
      where: {
        userId_postId: { userId, postId },
      },
    });
  },

  // Like a comment
  likeComment: async (userId: number, commentId: number) => {
    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });

    if (existingLike) {
      throw new ConflictError('Comment already liked');
    }

    // Create like
    return prisma.commentLike.create({
      data: {
        userId,
        commentId,
      },
    });
  },

  // Unlike a comment
  unlikeComment: async (userId: number, commentId: number) => {
    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check if like exists
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });

    if (!existingLike) {
      throw new NotFoundError('Like not found');
    }

    // Delete like
    return prisma.commentLike.delete({
      where: {
        userId_commentId: { userId, commentId },
      },
    });
  },
};
