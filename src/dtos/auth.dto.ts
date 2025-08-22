import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;

    @IsNotEmpty({ message: 'Username is required' })
    username!: string;

    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, { message: 'Password must contain at least one letter, one number, and one special character' })
    password!: string;
}

export class LoginDto {
    @IsNotEmpty({ message: 'Email or username is required' })
    email!: string;

    @IsNotEmpty({ message: 'Password is required' })
    password!: string;
}

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;
}

export class ResetPasswordDto {
    @IsNotEmpty({ message: 'Token is required' })
    token!: string;

    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, { message: 'Password must contain at least one letter, one number, and one special character' })
    password!: string;
}
