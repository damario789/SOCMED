import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ConflictError } from '../utils/custom.errors';
import { Request } from 'express';
import { getTransporter } from '../utils/nodemailer.util';
import { TextEncoder } from "util";

const prisma = new PrismaClient();

export const registerService = async (email: string, password: string, username: string) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
        });

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (err: any) {
        // Prisma unique constraint error code
        if (err.code === 'P2002' && Array.isArray(err.meta?.target)) {
            if (err.meta.target.includes('username')) {
                throw new ConflictError('Username has been taken');
            }
            if (err.meta.target.includes('email')) {
                throw new ConflictError('Email already exist');
            }
        }
        throw err;
    }
}

export const loginService = async (email: string, password: string) => {
    try {

    // user might fill the email also as username
    // const user = await prisma.user.findUnique({
    //     where: { email },
    // });
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username: email }
            ]
        }
    });

    if (!user) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    const jwtSecret = process.env.JWT_SECRET;
    // const jwtSecret = null;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }
    // console.log('JWT_SECRET:', jwtSecret); // Debugging line to check the secret.
    const token = jwt.sign(
        userWithoutPassword,
        jwtSecret,
        { expiresIn: '1h' }
    );

    return token;
            
    } catch (error) {
        console.error('Login error:', error);
    }
}

export const forgotPasswordService = async (email: string, req: Request) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Don't reveal user existence

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not defined');

    const token = jwt.sign(
        { userId: user.id },
        jwtSecret,
        { expiresIn: '15m' }
    );

    const resetUrl = `${process.env.FE_URL}/reset-password?token=${token}`;
    // console.log('Reset URL:', resetUrl)
    // Use nodemailer utility
    const transporter = getTransporter();

    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"No Reply"',
        to: user.email,
        subject: 'Reset your password',
        text: `Reset your password using this link: ${resetUrl}`,
        html: `<p>Reset your password using this link: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });
};

export const resetPasswordService = async (token: string, newPassword: string) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not defined');

    let payload: any;
    try {
        payload = jwt.verify(token, jwtSecret);
    } catch {
        throw new UnauthorizedError('Invalid or expired reset token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new UnauthorizedError('Invalid reset token');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });
};