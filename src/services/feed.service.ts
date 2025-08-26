import prisma from '../utils/prisma.client';
import { PaginationParams, createPaginatedResponse, PaginatedResult } from '../utils/pagination.util';
import { invalidateCache } from '../middlewares/cache.middleware';
import { NotFoundError, ForbiddenError } from '../utils/custom.errors';
import { UpdatePostDto } from '../dtos/post.dto';
import { deleteImage, getPublicIdFromUrl } from '../utils/upload.util';

export const feedService = {
    createPost: async (userId: number, imageUrl: string, caption?: string) => {
        try {
            const post = await prisma.post.create({
                data: {
                    userId,
                    imageUrl,
                    caption,
                },
                include: {
                    user: {
                        select: { id: true, username: true }
                    }
                }
            });
            
            // Invalidate feed caches for the user and their followers
            const followers = await prisma.follow.findMany({
                where: { followingId: userId },
                select: { userId: true }
            });
            
            // Fix: Use correct pattern to match cache keys
            await invalidateCache(`${userId}:/*`); // Match all paths for this user
            
            // Invalidate followers' feed caches
            for (const follower of followers) {
                await invalidateCache(`${follower.userId}:/*`);
            }
            
            return post;
        } catch (error) {
            throw new Error('Error creating post');
        }
    },

    updatePost: async (userId: number, postId: number, updateData: UpdatePostDto) => {
        // Check if post exists and belongs to user
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            throw new NotFoundError('Post not found');
        }

        if (post.userId !== userId) {
            throw new ForbiddenError('You can only update your own posts');
        }

        // Update the post
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: updateData,
            include: {
                user: {
                    select: { id: true, username: true }
                }
            }
        });

        // Invalidate feed caches for the user and their followers
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            select: { userId: true }
        });
        
        // Fix: Use correct pattern to match cache keys
        await invalidateCache(`${userId}:/*`);
        
        // Invalidate followers' feed caches
        for (const follower of followers) {
            await invalidateCache(`${follower.userId}:/*`);
        }

        return updatedPost;
    },

    getPosts: async (userId: number, pagination: PaginationParams = {}) => {
        try {
            console.log(11)
            // Get IDs of users the current user is following
            const following = await prisma.follow.findMany({
                where: { userId: userId },
                select: { followingId: true },
            });
            /* SQL equivalent:
               SELECT "followingId" FROM "Follow"
               WHERE "userId" = ${userId};
            */
            
            const followingIds = following.map(f => f.followingId);
            // Include own userId
            const userIds = [userId, ...followingIds];
            
            // Calculate skip and take for pagination
            const page = pagination.page || 1;
            const limit = pagination.limit || 10;
            const skip = (page - 1) * limit;
            
            console.log(22)
            // Count total posts for pagination metadata
            const totalPosts = await prisma.post.count({
                where: {
                    userId: { in: userIds },
                }
            });
            /* SQL equivalent:
               SELECT COUNT(*) FROM "Post"
               WHERE "userId" IN (${userIds.join(',')});
            */
            
            console.log(33)
            // Fetch paginated posts with essential data
            const posts = await prisma.post.findMany({
                where: {
                    userId: { in: userIds },
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, username: true, email: true },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true
                        }
                    },
                    likes: {
                        where: {
                            userId: userId // Check if current user liked the post
                        },
                        select: {
                            id: true
                        }
                    },
                    // Only fetch top-level comments (no replies)
                    comments: {
                        where: {
                            parentId: null
                        },
                        orderBy: [
                            { 
                                likes: {
                                    _count: 'desc'
                                }
                            },
                            { createdAt: 'desc' }
                        ],
                        take: 2, // Only get top 2 comments for feed
                        include: {
                            user: {
                                select: { id: true, username: true }
                            },
                            _count: {
                                select: {
                                    likes: true,
                                    replies: {
                                        where: { parentId: { not: null } }
                                    }
                                }
                            },
                        }
                    }
                },
                skip,
                take: limit,
            });
            /* SQL equivalent (simplified):
               
               -- Main query for posts with user info
               SELECT 
                 p.*, 
                 u.id as "userId", 
                 u.username, 
                 u.email
               FROM "Post" p
               JOIN "User" u ON p."userId" = u.id
               WHERE p."userId" IN (${userIds.join(',')})
               ORDER BY p."createdAt" DESC
               LIMIT ${limit} OFFSET ${skip};
               
               -- Count comments per post
               SELECT 
                 "postId", 
                 COUNT(*) as comment_count 
               FROM "Comment"
               WHERE "postId" IN (${postIds.join(',')})
               GROUP BY "postId";
               
               -- Count likes per post
               SELECT 
                 "postId", 
                 COUNT(*) as like_count 
               FROM "Like"
               WHERE "postId" IN (${postIds.join(',')})
               GROUP BY "postId";
               
               -- Check if current user liked the posts
               SELECT "id", "postId"
               FROM "Like"
               WHERE "userId" = ${userId} AND "postId" IN (${postIds.join(',')});
               
               -- Get top 2 comments for each post ordered by like count
               WITH CommentLikeCounts AS (
                 SELECT 
                   c.id,
                   c."postId",
                   c.content,
                   c."userId",
                   c."createdAt",
                   COUNT(cl.id) as like_count,
                   RANK() OVER (PARTITION BY c."postId" ORDER BY COUNT(cl.id) DESC, c."createdAt" DESC) as rank
                 FROM "Comment" c
                 LEFT JOIN "CommentLike" cl ON c.id = cl."commentId"
                 WHERE c."postId" IN (${postIds.join(',')}) AND c."parentId" IS NULL
                 GROUP BY c.id, c."postId", c.content, c."userId", c."createdAt"
               )
               SELECT 
                 c.*,
                 u.id as "userId",
                 u.username,
                 (SELECT COUNT(*) FROM "CommentLike" WHERE "commentId" = c.id) as like_count,
                 (SELECT COUNT(*) FROM "Comment" WHERE "parentId" = c.id) as reply_count
               FROM CommentLikeCounts c
               JOIN "User" u ON c."userId" = u.id
               WHERE c.rank <= 2;
            */

            // console.log(JSON.stringify(posts, null, 2))
            
            // Transform posts to add computed fields
            const postsWithComputedFields = posts.map(post => ({
                ...post,
                commentCount: post._count.comments,
                likeCount: post._count.likes,
                isLiked: post.likes.length > 0,
                comments: post.comments.map(comment => ({
                    ...comment,
                    likeCount: comment._count.likes,
                        replyCount: comment._count.replies
                    })),
                // Remove unnecessary fields
                _count: undefined,
                likes: undefined
            }));
            
            // Return paginated response
            return createPaginatedResponse(
                postsWithComputedFields, 
                totalPosts, 
                page, 
                limit
            ) as PaginatedResult<typeof postsWithComputedFields[number]>;
        } catch (error) {
            throw new Error('Error fetching posts');
        }
    },

    deletePost: async (userId: number, postId: number) => {
        // Check if post exists and belongs to user
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            throw new NotFoundError('Post not found');
        }

        if (post.userId !== userId) {
            throw new ForbiddenError('You can only delete your own posts');
        }

        // Delete associated image from Cloudinary if it's hosted there
        if (post.imageUrl && post.imageUrl.includes('cloudinary.com')) {
            const publicId = getPublicIdFromUrl(post.imageUrl);
            if (publicId) {
                await deleteImage(publicId);
            }
        }

        // Delete the post
        await prisma.post.delete({
            where: { id: postId },
        });

        // Invalidate feed caches for the user and their followers
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            select: { userId: true }
        });
        
        // Fix: Use correct pattern to match cache keys
        await invalidateCache(`${userId}:/*`);
        
        // Invalidate followers' feed caches
        for (const follower of followers) {
            await invalidateCache(`${follower.userId}:/*`);
        }
    },
};
