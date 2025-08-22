import { Request, RequestHandler, Response, NextFunction } from 'express';
import { loginService, registerService, forgotPasswordService, resetPasswordService } from '../services/auth.service';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dtos/auth.dto';
import { ValidationError } from '../utils/custom.errors';
import { extractValidationMessages } from '../utils/validation.util';

export const register: RequestHandler = async (req: Request, res: Response) => {
    const dto = plainToInstance(RegisterDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
        const messages = extractValidationMessages(errors);
        throw new ValidationError(messages);
    }
    const user = await registerService(dto.email, dto.password, dto.username);
    res.status(201).json({
        message: 'Successfully registered',
        ...user
    });
}

export const login: RequestHandler = async (req: Request, res: Response) => {
    const dto = plainToInstance(LoginDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
        const messages = extractValidationMessages(errors);
        throw new ValidationError(messages);
    }
    const token = await loginService(dto.email, dto.password);
    res.status(200).json({
        message: 'Successfully logged in',
        token
    });
}

export const forgotPassword: RequestHandler = async (req: Request, res: Response) => {
    const dto = plainToInstance(ForgotPasswordDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
        const messages = extractValidationMessages(errors);
        throw new ValidationError(messages);
    }
    await forgotPasswordService(dto.email, req);
    res.status(200).json({ message: 'Password reset link sent if email exists' });
};

export const resetPassword: RequestHandler = async (req: Request, res: Response) => {
    const dto = plainToInstance(ResetPasswordDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
        const messages = extractValidationMessages(errors);
        throw new ValidationError(messages);
    }
    await resetPasswordService(dto.token, dto.password);
    res.status(200).json({ message: 'Password has been reset successfully' });
};