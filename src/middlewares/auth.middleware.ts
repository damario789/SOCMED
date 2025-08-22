import { Request, Response, NextFunction, RequestHandler } from 'express';
// import { jwtVerify } from 'jose';
import { TextEncoder } from "util";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
// import { ForbiddenError, UnauthorizedError } from '../utils/customErrors';

export interface AuthRequest extends Request {
  user: { userId: number; role: string };
  id?: string; // For request tracing
}

declare module 'express-serve-static-core' {
  interface Request {
    id?: string;
  }
}

export const addRequestId = (req: Request, _: Response, next: NextFunction) => {
  req.id = uuidv4();
  next();
};

export const authenticateToken = async (req: AuthRequest, _: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) throw new Error('No token provided');
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };
  req.user = decoded
  next();
};