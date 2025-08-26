import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

// Create shared Redis connection for queues
const redisConnection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

// Email Queue Setup
export const emailQueue = new Queue('email-queue', { 
  connection: redisConnection 
});

// Image Processing Queue Setup
export const imageProcessingQueue = new Queue('image-processing', { 
  connection: redisConnection 
});

// Email Worker
const emailWorker = new Worker('email-queue', async (job) => {
  const { to, subject, text, html } = job.data;
  
  // Implement email sending logic here
  console.log(`Sending email to ${to}`);
  // ...actual email sending logic...
  
  return { success: true };
}, { connection: redisConnection });

// Image Processing Worker
const imageWorker = new Worker('image-processing', async (job) => {
  const { imageUrl } = job.data;
  
  // Implement image optimization logic here
  console.log(`Processing image: ${imageUrl}`);
  // ...image processing logic...
  
  return { success: true, optimizedUrl: imageUrl };
}, { connection: redisConnection });

// Error handling for workers
emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed with error:`, err);
});

imageWorker.on('failed', (job, err) => {
  console.error(`Image processing job ${job?.id} failed with error:`, err);
});

// Queue events for monitoring
const emailQueueEvents = new QueueEvents('email-queue', { connection: redisConnection });
const imageQueueEvents = new QueueEvents('image-processing', { connection: redisConnection });

emailQueueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`Email job ${jobId} completed successfully`);
});

imageQueueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`Image processing job ${jobId} completed successfully`);
});

// Helper functions to add jobs to queues
export const sendEmail = async (emailData: { to: string, subject: string, text: string, html: string }) => {
  return emailQueue.add('send-email', emailData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
};

export const processImage = async (imageData: { imageUrl: string }) => {
  return imageProcessingQueue.add('optimize-image', imageData, {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 2000
    }
  });
};
