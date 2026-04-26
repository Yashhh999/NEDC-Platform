import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  couponCode?: string;
}
