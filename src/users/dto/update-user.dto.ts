import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const ALLOWED_USER_ROLES = [
  'ADMIN',
  'USER',
  'ROLE_ADMIN',
  'ROLE_BUYER',
  'ROLE_PROCUREMENT_MANAGER',
  'ROLE_FINANCE',
  'ROLE_FINANCE_MANAGER',
] as const;

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsIn(ALLOWED_USER_ROLES)
  role?: (typeof ALLOWED_USER_ROLES)[number];

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
