import express, { Express, Request, Response } from 'express';
import router from './routes/index';
import cors from 'cors';
import { addRequestId } from './middlewares/auth.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { rateLimitMiddleware } from './middlewares/rate-limit.middleware';
// Import the placeholder Sentry integration
// import { initializeSentry } from './utils/sentry.util';

const app: Express = express();

// Sentry setup is commented out until credentials are available
// const sentryErrorHandler = initializeSentry(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(addRequestId);

// Apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimitMiddleware);
}

// Health check route
app.get("/", (_, res: Response): Response => {
    return res.status(200).json({
        message: "Welcome to the SOCMED API",
        status: "success",
        data: {
            version: "1.0.0",
        },
    });
});

// Use main router
app.use(router);

// Sentry error handler is commented out until credentials are available
// app.use(sentryErrorHandler);

// Use custom error handler as the final middleware
app.use(errorHandler);

export default app;