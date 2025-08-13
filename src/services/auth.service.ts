import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const registerService = async (email: string, password: string) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

export const loginService = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    const { password: _, ...userWithoutPassword } = user;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }
    console.log('JWT_SECRET:', jwtSecret); // Debugging line to check the secret
    const token = jwt.sign(
        userWithoutPassword,
        jwtSecret,
        { expiresIn: '1h' }
    );
    return token;
}