import { Request } from 'express';

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
