import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsString()
  @IsNotEmpty()
  moduleId: string;
}
