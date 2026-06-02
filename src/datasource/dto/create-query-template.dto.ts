import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ColumnDefDto {
  @IsString() @IsNotEmpty() field: string;
  @IsString() @IsNotEmpty() label: string;
  @IsOptional() @IsString() width?: string;
}

export class CreateQueryTemplateDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() dataSourceId: string;
  @IsString() @IsNotEmpty() sql: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ColumnDefDto) columns?: ColumnDefDto[];
  @IsOptional() @IsString() messageTemplate?: string;
  @IsOptional() @IsString() description?: string;
}
