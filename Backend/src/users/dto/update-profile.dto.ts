import { IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[+0-9 \-()]*$/, { message: 'Phone must be digits and +-() only' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;
}
