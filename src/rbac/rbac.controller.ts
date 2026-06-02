import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RbacService } from './rbac.service';

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('menu-catalog')
  getMenuCatalog() {
    return this.rbacService.getMenuCatalog();
  }

  @Get('roles')
  findRoles() {
    return this.rbacService.findRoles();
  }

  @Post('roles')
  createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rbacService.updateRole(id, dto);
  }

  @Patch('roles/:id/permissions')
  updateRolePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.rbacService.updateRolePermissions(id, dto);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }
}
