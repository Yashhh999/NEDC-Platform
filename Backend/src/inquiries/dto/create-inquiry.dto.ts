import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
