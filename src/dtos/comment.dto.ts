import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty({ message: 'Comment content is required' })
    @MaxLength(1000, { message: 'Comment content cannot exceed 1000 characters' })
    content!: string;
}
