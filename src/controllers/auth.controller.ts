import { Request, RequestHandler, Response } from 'express';
import { loginService, registerService } from '../services/auth.service';

export const register: RequestHandler = async (req: Request, res: Response) => {
    const user = await registerService(req.body.email, req.body.password)
    // Handle registration logic
    res.status(201).json({
        message: 'Successfully registered',
        ...user
    });
}

export const login: RequestHandler = async (req: Request, res: Response) => {
    const user = await loginService(req.body.email, req.body.password);
    if (!user) {
        return res.status(401).json({
            message: 'Invalid email or password'
        });
    }
    const token = user; // Assuming user contains the token after loginService
    // Handle login logic
    res.status(200).json({
        message: 'Successfully logged in',
        token
    })
}