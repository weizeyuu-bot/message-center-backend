import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { CreateFormConfigDto } from './dto/create-form-config.dto';
import { CreateProcessCategoryDto } from './dto/create-process-category.dto';
import { CreateProcessModelDto } from './dto/create-process-model.dto';
import { UpdateDeploymentDto } from './dto/update-deployment.dto';
import { UpdateFormConfigDto } from './dto/update-form-config.dto';
import { UpdateProcessCategoryDto } from './dto/update-process-category.dto';
import { UpdateProcessModelDto } from './dto/update-process-model.dto';
import { ProcessService } from './process.service';

@Controller('process')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Get('categories')
  listCategories() {
    return this.processService.listCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateProcessCategoryDto) {
    return this.processService.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateProcessCategoryDto) {
    return this.processService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.processService.deleteCategory(id);
  }

  @Get('forms')
  listForms() {
    return this.processService.listForms();
  }

  @Post('forms')
  createForm(@Body() dto: CreateFormConfigDto) {
    return this.processService.createForm(dto);
  }

  @Patch('forms/:id')
  updateForm(@Param('id') id: string, @Body() dto: UpdateFormConfigDto) {
    return this.processService.updateForm(id, dto);
  }

  @Delete('forms/:id')
  deleteForm(@Param('id') id: string) {
    return this.processService.deleteForm(id);
  }

  @Get('models')
  listModels() {
    return this.processService.listModels();
  }

  @Post('models')
  createModel(@Body() dto: CreateProcessModelDto) {
    return this.processService.createModel(dto);
  }

  @Patch('models/:id')
  updateModel(@Param('id') id: string, @Body() dto: UpdateProcessModelDto) {
    return this.processService.updateModel(id, dto);
  }

  @Delete('models/:id')
  deleteModel(@Param('id') id: string) {
    return this.processService.deleteModel(id);
  }

  @Get('deployments')
  listDeployments() {
    return this.processService.listDeployments();
  }

  @Get('workflow-binding/:businessObject')
  getWorkflowBindingByBusinessObject(@Param('businessObject') businessObject: string) {
    return this.processService.getWorkflowBindingByBusinessObject(businessObject);
  }

  @Post('deployments')
  createDeployment(@Body() dto: CreateDeploymentDto) {
    return this.processService.createDeployment(dto);
  }

  @Patch('deployments/:id')
  updateDeployment(@Param('id') id: string, @Body() dto: UpdateDeploymentDto) {
    return this.processService.updateDeployment(id, dto);
  }

  @Delete('deployments/:id')
  deleteDeployment(@Param('id') id: string) {
    return this.processService.deleteDeployment(id);
  }
}
