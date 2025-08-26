import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data with RESTART IDENTITY
    console.log('Cleaning up database and resetting identity sequences...');
    
    // Using Prisma's executeRaw to run direct SQL commands
    await prisma.$executeRaw`TRUNCATE TABLE "CommentLike" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Like" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Comment" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Follow" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Post" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
    
    // Alternatively, instead of the above direct SQL commands, you could use deleteMany
    // and then reset sequences separately:
    // await prisma.commentLike.deleteMany();
    // await prisma.like.deleteMany();
    // await prisma.comment.deleteMany();
    // await prisma.follow.deleteMany();
    // await prisma.post.deleteMany();
    // await prisma.user.deleteMany();
    // 
    // await prisma.$executeRaw`ALTER SEQUENCE "CommentLike_id_seq" RESTART WITH 1`;
    // await prisma.$executeRaw`ALTER SEQUENCE "Like_id_seq" RESTART WITH 1`;
    // await prisma.$executeRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1`;
    // await prisma.$executeRaw`ALTER SEQUENCE "Follow_id_seq" RESTART WITH 1`;
    // await prisma.$executeRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1`;
    // await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('pwgw123#', saltRounds);

    // Create Users
    console.log('Creating users...');
    const alice = await prisma.user.create({
        data: {
            email: 'test2@test.com',
            username: 'tester789',
            password: hashedPassword,
        },
    });

    const bob = await prisma.user.create({
        data: {
            email: 'tester123@test.com',
            username: 'tester123',
            password: hashedPassword,
        },
    });

    const charlie = await prisma.user.create({
        data: {
            email: 'dev.haznam@yopmail.com',
            username: 'dev.haznam',
            password: hashedPassword,
        },
    });

    // Create additional users
    const dave = await prisma.user.create({
        data: {
            email: 'dave@example.com',
            username: 'dave',
            password: hashedPassword,
        },
    });

    const eva = await prisma.user.create({
        data: {
            email: 'eva@example.com',
            username: 'eva',
            password: hashedPassword,
        },
    });

    // Create Follow relationships
    // Alice follows Bob and Charlie
    await prisma.follow.create({
        data: {
            userId: alice.id,
            followingId: bob.id,
        },
    });
    await prisma.follow.create({
        data: {
            userId: alice.id,
            followingId: charlie.id,
        },
    });

    // Bob follows Alice
    await prisma.follow.create({
        data: {
            userId: bob.id,
            followingId: alice.id,
        },
    });

    // Create additional follow relationships
    const additionalFollows = [
        { userId: alice.id, followingId: dave.id },
        { userId: bob.id, followingId: charlie.id },
        { userId: charlie.id, followingId: alice.id },
        { userId: charlie.id, followingId: dave.id },
        { userId: charlie.id, followingId: eva.id },
        { userId: dave.id, followingId: alice.id },
        { userId: dave.id, followingId: eva.id },
        { userId: eva.id, followingId: alice.id },
        { userId: eva.id, followingId: bob.id },
        { userId: eva.id, followingId: charlie.id },
        { userId: dave.id, followingId: bob.id },
        { userId: dave.id, followingId: charlie.id },
    ];

    for (const follow of additionalFollows) {
        await prisma.follow.create({ data: follow });
    }

    // Create Posts - keep original posts
    const bobPost = await prisma.post.create({
        data: {
            userId: bob.id,
            imageUrl: 'https://picsum.photos/seed/bob1/500/300',
            caption: 'Bob\'s first post!',
        },
    });

    const charliePost = await prisma.post.create({
        data: {
            userId: charlie.id,
            imageUrl: 'https://picsum.photos/seed/charlie1/500/300',
            caption: 'Charlie shares a cool photo.',
        },
    });

    const alicePost = await prisma.post.create({
        data: {
            userId: alice.id,
            imageUrl: 'https://picsum.photos/seed/alice1/500/300',
            caption: 'Hello world! Alice here.',
        },
    });

    // Create additional posts to reach 21 total
    const captions = [
        "Enjoying a beautiful day!",
        "Coffee time ☕",
        "Weekend vibes",
        "New adventure begins",
        "Just finished reading this amazing book",
        "Sunset at the beach",
        "Hiking with friends",
        "Home office setup",
        "Trying out a new recipe",
        "Movie night 🍿",
        "Just got this awesome gadget",
        "Meeting with old friends",
        "My workout routine",
        "Today's outfit",
        "Family dinner",
        "Morning routine",
        "Travel memories",
        "My new plant collection"
    ];
    
    const users = [alice, bob, charlie, dave, eva];
    for (let i = 0; i < 18; i++) {
        const user = users[i % users.length];
        await prisma.post.create({
            data: {
                userId: user.id,
                imageUrl: `https://picsum.photos/seed/post${i + 4}/800/600`,
                caption: captions[i % captions.length],
            },
        });
    }

    // Create Comments
    const comment1 = await prisma.comment.create({
        data: {
            content: "This looks amazing!",
            userId: alice.id,
            postId: bobPost.id,
        },
    });

    const comment2 = await prisma.comment.create({
        data: {
            content: "Great shot Charlie!",
            userId: bob.id,
            postId: charliePost.id,
        },
    });

    const comment3 = await prisma.comment.create({
        data: {
            content: "Welcome Alice!",
            userId: charlie.id,
            postId: alicePost.id,
        },
    });

    // Create additional comments (12 more to get 15 total)
    const commentTexts = [
        "Love it! 😍",
        "Where was this taken?",
        "Awesome!",
        "Wow, incredible!",
        "I need to try this!",
        "Thanks for sharing",
        "This made my day",
        "So beautiful!",
        "Love your content",
        "Goals!",
        "This is everything",
        "Can't wait to see more"
    ];
    
    const comments = [comment1, comment2, comment3];
    const allPosts = await prisma.post.findMany({ take: 5 });
    
    for (let i = 0; i < 12; i++) {
        const post = allPosts[i % allPosts.length];
        const user = users[(i + 1) % users.length];  // Different user than post owner
        
        const newComment = await prisma.comment.create({
            data: {
                content: commentTexts[i],
                userId: user.id,
                postId: post.id,
            },
        });
        comments.push(newComment);
    }

    // Create Reply Comments
    const reply1 = await prisma.comment.create({
        data: {
            content: "Thank you Alice!",
            userId: bob.id,
            postId: bobPost.id,
            parentId: comment1.id,
        },
    });

    const reply2 = await prisma.comment.create({
        data: {
            content: "I appreciate your comment!",
            userId: charlie.id,
            postId: charliePost.id,
            parentId: comment2.id,
        },
    });

    // Create nested reply (reply to a reply)
    const nestedReply = await prisma.comment.create({
        data: {
            content: "This is a reply to a reply!",
            userId: alice.id,
            postId: bobPost.id,
            parentId: reply1.id,
        },
    });
    
    // Create more reply comments (7 more to get 10 total)
    const replyTexts = [
        "Thanks so much!",
        "Glad you like it!",
        "It was in Paris!",
        "Thank you! 😊",
        "I'll post more soon",
        "It took me forever to get this shot",
        "That means a lot!"
    ];
    
    for (let i = 0; i < 7; i++) {
        const parentComment = comments[i % comments.length];
        const user = users[(i + 2) % users.length];  // Different user than comment author
        
        await prisma.comment.create({
            data: {
                content: replyTexts[i],
                userId: user.id,
                postId: parentComment.postId,
                parentId: parentComment.id,
            },
        });
    }

    // Create Post Likes
    await prisma.like.create({
        data: {
            userId: alice.id,
            postId: bobPost.id,
        },
    });

    await prisma.like.create({
        data: {
            userId: bob.id,
            postId: charliePost.id,
        },
    });

    await prisma.like.create({
        data: {
            userId: charlie.id,
            postId: alicePost.id,
        },
    });

    await prisma.like.create({
        data: {
            userId: bob.id,
            postId: alicePost.id,
        },
    });
    
    // Create more post likes (11 more to get 15 total)
    const allPostIds = await prisma.post.findMany({ select: { id: true } });
    for (let i = 0; i < 11; i++) {
        const postId = allPostIds[i % allPostIds.length].id;
        const user = users[(i + 3) % users.length];
        
        try {
            await prisma.like.create({
                data: {
                    userId: user.id,
                    postId: postId,
                },
            });
        } catch (error) {
            console.log(`Skipping duplicate like: User ${user.id} for Post ${postId}`);
        }
    }

    // Create Comment Likes
    await prisma.commentLike.create({
        data: {
            userId: bob.id,
            commentId: comment1.id,
        },
    });

    await prisma.commentLike.create({
        data: {
            userId: charlie.id,
            commentId: comment2.id,
        },
    });

    await prisma.commentLike.create({
        data: {
            userId: alice.id,
            commentId: comment3.id,
        },
    });

    await prisma.commentLike.create({
        data: {
            userId: charlie.id,
            commentId: reply1.id,
        },
    });
    
    // Create more comment likes (8 more to get 12 total)
    const allComments = await prisma.comment.findMany({ 
        take: 10,
        select: { id: true } 
    });
    
    for (let i = 0; i < 8; i++) {
        const commentId = allComments[i % allComments.length].id;
        const user = users[(i + 1) % users.length];
        
        try {
            await prisma.commentLike.create({
                data: {
                    userId: user.id,
                    commentId: commentId,
                },
            });
        } catch (error) {
            console.log(`Skipping duplicate comment like: User ${user.id} for Comment ${commentId}`);
        }
    }

    console.log('Database has been seeded with expanded data and reset sequences!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });