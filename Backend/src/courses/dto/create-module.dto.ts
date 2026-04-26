import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsString()
  @IsNotEmpty()
  courseId: string;
}
