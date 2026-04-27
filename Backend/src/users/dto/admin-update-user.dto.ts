import { IsEmail, IsIn, IsOptional, MaxLength } from 'class-validator';
import { Role } from '@prisma/client';

const ROLES: Role[] = ['USER', 'ADMIN'];

export class AdminUpdateUserDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsIn(ROLES)
  role?: Role;
}
