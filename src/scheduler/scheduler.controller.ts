import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CreateScheduledTaskDto } from './dto/create-scheduled-task.dto';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly svc: SchedulerService) {}

  @Get('tasks') findAll() { return this.svc.findAll(); }
  @Get('tasks/:id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post('tasks') create(@Body() dto: CreateScheduledTaskDto) { return this.svc.create(dto); }
  @Patch('tasks/:id') update(@Param('id') id: string, @Body() dto: Partial<CreateScheduledTaskDto>) { return this.svc.update(id, dto); }
  @Delete('tasks/:id') remove(@Param('id') id: string) { return this.svc.remove(id); }
  @Post('tasks/:id/toggle') toggle(@Param('id') id: string) { return this.svc.toggleStatus(id); }
  @Post('tasks/:id/run') manualRun(@Param('id') id: string) { return this.svc.manualRun(id); }
  @Get('tasks/:id/logs') getLogs(@Param('id') id: string) { return this.svc.getRunLogs(id); }
}
