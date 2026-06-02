import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DataSourceService } from './datasource.service';
import { CreateDataSourceDto } from './dto/create-datasource.dto';
import { CreateQueryTemplateDto } from './dto/create-query-template.dto';

@Controller('datasource')
export class DataSourceController {
  constructor(private readonly svc: DataSourceService) {}

  // ─── DataSource ───────────────────────────────────────────
  @Get() findAllDs() { return this.svc.findAllDataSources(); }
  @Get(':id') findOneDs(@Param('id') id: string) { return this.svc.findOneDataSource(id); }
  @Post() createDs(@Body() dto: CreateDataSourceDto) { return this.svc.createDataSource(dto); }
  @Patch(':id') updateDs(@Param('id') id: string, @Body() dto: Partial<CreateDataSourceDto>) { return this.svc.updateDataSource(id, dto); }
  @Delete(':id') deleteDs(@Param('id') id: string) { return this.svc.deleteDataSource(id); }
  @Post(':id/test') testConn(@Param('id') id: string) { return this.svc.testConnection(id); }

  // ─── QueryTemplate ────────────────────────────────────────
  @Get('query-templates/list') findAllQt(@Query('dataSourceId') dsId?: string) { return this.svc.findAllQueryTemplates(dsId); }
  @Get('query-templates/:id') findOneQt(@Param('id') id: string) { return this.svc.findOneQueryTemplate(id); }
  @Post('query-templates') createQt(@Body() dto: CreateQueryTemplateDto) { return this.svc.createQueryTemplate(dto); }
  @Patch('query-templates/:id') updateQt(@Param('id') id: string, @Body() dto: Partial<CreateQueryTemplateDto>) { return this.svc.updateQueryTemplate(id, dto); }
  @Delete('query-templates/:id') deleteQt(@Param('id') id: string) { return this.svc.deleteQueryTemplate(id); }
  @Post('query-templates/:id/preview') previewQt(@Param('id') id: string) { return this.svc.previewQuery(id, 50); }
}
