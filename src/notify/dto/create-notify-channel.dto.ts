import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotifyChannelDto {
  @IsString() @IsNotEmpty() name: string;
  @IsIn(['EMAIL', 'DINGTALK', 'WECOM']) type: string;
  @IsString() @IsNotEmpty() configJson: string;
  @IsOptional() @IsString() description?: string;
}
