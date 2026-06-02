import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_]+$/, { message: '角色编码仅支持大写字母、数字和下划线' })
  @MaxLength(64)
  id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  description?: string;
}
