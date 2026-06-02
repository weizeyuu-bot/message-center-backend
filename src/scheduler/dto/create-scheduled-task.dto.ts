import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScheduledTaskDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() cronExpr: string;
  @IsString() @IsNotEmpty() queryTemplateId: string;
  @IsString() @IsNotEmpty() channelId: string;
  @IsString() recipients: string; // comma-separated emails
  @IsOptional() @IsString() messageTitle?: string;
}
