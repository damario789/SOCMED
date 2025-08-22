import express, { Express, Request, Response, Router} from 'express';
import router from './routes/index';
import cors from 'cors';
import { addRequestId } from './middlewares/auth.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(addRequestId);

// Routes
//health check route
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
app.use(errorHandler)

export default module.exports = app;