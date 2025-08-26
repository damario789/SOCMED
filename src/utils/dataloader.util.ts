import DataLoader from 'dataloader';
import prisma from './prisma.client';

// Create a loader for user data to avoid N+1 queries
export const createUserLoader = () => new DataLoader(async (userIds: readonly number[]) => {
  const users = await prisma.user.findMany({
    where: {
      id: { in: [...userIds] as number[] },
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });
  
  // Map users to the order of userIds
  const userMap = users.reduce((map, user) => {
    map[user.id] = user;
    return map;
  }, {} as Record<number, any>);
  
  return userIds.map(id => userMap[id] || null);
});

// Create a loader for post likes count
export const createPostLikesLoader = () => new DataLoader(async (postIds: readonly number[]) => {
  const counts = await prisma.like.groupBy({
    by: ['postId'],
    where: {
      postId: { in: [...postIds] as number[] },
    },
    _count: true,
  });
  
  const countMap = counts.reduce((map, item) => {
    map[item.postId] = item._count;
    return map;
  }, {} as Record<number, number>);
  
  return postIds.map(id => countMap[id] || 0);
});
