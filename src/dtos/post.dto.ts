import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class CreatePostDto {
    @ValidateIf((o) => !o.file)
    @IsNotEmpty({ message: 'Image URL is required when no file is uploaded' })
    @IsString({ message: 'Image URL must be a string' })
    imageUrl?: string;

    @IsOptional()
    @IsString({ message: 'Caption must be a string' })
    @MaxLength(2000, { message: 'Caption cannot exceed 2000 characters' })
    caption?: string;
    
    // This will be populated by multer middleware
    file?: Express.Multer.File;
}

export class UpdatePostDto {
    @IsOptional()
    @IsString({ message: 'Caption must be a string' })
    @MaxLength(2000, { message: 'Caption cannot exceed 2000 characters' })
    caption?: string;
}
