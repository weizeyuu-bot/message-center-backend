import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { CreateNotifyChannelDto } from './dto/create-notify-channel.dto';

@Controller('notify')
export class NotifyController {
  constructor(private readonly svc: NotifyService) {}

  @Get('channels') findAll() { return this.svc.findAllChannels(); }
  @Get('channels/:id') findOne(@Param('id') id: string) { return this.svc.findOneChannel(id); }
  @Post('channels') create(@Body() dto: CreateNotifyChannelDto) { return this.svc.createChannel(dto); }
  @Patch('channels/:id') update(@Param('id') id: string, @Body() dto: Partial<CreateNotifyChannelDto>) { return this.svc.updateChannel(id, dto); }
  @Delete('channels/:id') remove(@Param('id') id: string) { return this.svc.deleteChannel(id); }
  @Post('channels/:id/test') test(@Param('id') id: string) { return this.svc.testChannel(id); }
}
