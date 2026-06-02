import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateDataSourceDto {
  @IsString() @IsNotEmpty() name: string;
  @IsIn(['POSTGRESQL', 'MYSQL', 'MSSQL']) type: string;
  @IsString() @IsNotEmpty() host: string;
  @IsInt() @Min(1) @Max(65535) port: number;
  @IsString() @IsNotEmpty() database: string;
  @IsString() @IsNotEmpty() username: string;
  @IsString() @IsNotEmpty() password: string;
  @IsOptional() @IsString() schema?: string;
  @IsOptional() @IsString() description?: string;
}
