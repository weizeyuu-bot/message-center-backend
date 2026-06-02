import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { MENU_CATALOG } from './menu-catalog';

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  async getMenuCatalog() {
    return MENU_CATALOG;
  }

  async findRoles() {
    await this.ensureDefaultRoles();

    const roles = await this.prisma.appRole.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const users = await this.prisma.user.findMany({
      select: { role: true },
    });

    const countMap = users.reduce<Record<string, number>>((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description || '',
      permissions: this.normalizePermissions(role.permissionJson),
      userCount: countMap[role.id] || 0,
    }));
  }

  async createRole(dto: CreateRoleDto) {
    await this.ensureRoleNotExists(dto.id);
    const created = await this.prisma.appRole.create({
      data: {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        permissionJson: JSON.stringify(this.createDefaultPermissions()),
      },
    });

    return {
      id: created.id,
      name: created.name,
      description: created.description || '',
      permissions: this.normalizePermissions(created.permissionJson),
      userCount: 0,
    };
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const exists = await this.prisma.appRole.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('角色不存在');

    const role = await this.prisma.appRole.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    const userCount = await this.prisma.user.count({ where: { role: id } });

    return {
      id: role.id,
      name: role.name,
      description: role.description || '',
      permissions: this.normalizePermissions(role.permissionJson),
      userCount,
    };
  }

  async deleteRole(id: string) {
    if (id === 'ROLE_ADMIN') {
      throw new BadRequestException('系统管理员角色不允许删除');
    }

    const exists = await this.prisma.appRole.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('角色不存在');

    const userCount = await this.prisma.user.count({ where: { role: id } });
    if (userCount > 0) {
      throw new ConflictException(`当前角色仍绑定 ${userCount} 位用户，无法删除`);
    }

    await this.prisma.appRole.delete({ where: { id } });
    return { success: true };
  }

  async updateRolePermissions(id: string, dto: UpdateRolePermissionsDto) {
    const exists = await this.prisma.appRole.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('角色不存在');

    const normalized = this.normalizePermissionsObject(dto.permissions || {});

    const updated = await this.prisma.appRole.update({
      where: { id },
      data: { permissionJson: JSON.stringify(normalized) },
    });

    const userCount = await this.prisma.user.count({ where: { role: id } });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description || '',
      permissions: normalized,
      userCount,
    };
  }

  private async ensureDefaultRoles() {
    const defaults = [
      {
        id: 'ROLE_ADMIN',
        name: '系统管理员',
        description: '拥有全部治理与消息中心权限',
        allEnabled: true,
      },
      {
        id: 'ROLE_USER_ADMIN',
        name: '用户治理管理员',
        description: '负责用户、角色、权限与系统配置管理',
        allEnabled: false,
      },
      {
        id: 'ROLE_MC_OPERATOR',
        name: '消息运营专员',
        description: '负责消息中心配置与任务运维',
        allEnabled: false,
      },
      {
        id: 'ROLE_MC_VIEWER',
        name: '消息运营访客',
        description: '仅查看消息中心运行信息',
        allEnabled: false,
      },
      {
        id: 'ROLE_BUYER',
        name: '业务用户',
        description: '仅保留个人信息访问权限',
        allEnabled: false,
      },
    ];

    for (const role of defaults) {
      const exists = await this.prisma.appRole.findUnique({ where: { id: role.id } });
      if (exists) continue;

      const permissions = role.allEnabled
        ? this.enableAllPermissions(this.createDefaultPermissions())
        : this.createDefaultPermissions();

      await this.prisma.appRole.create({
        data: {
          id: role.id,
          name: role.name,
          description: role.description,
          permissionJson: JSON.stringify(permissions),
        },
      });
    }
  }

  private async ensureRoleNotExists(id: string) {
    const exists = await this.prisma.appRole.findUnique({ where: { id } });
    if (exists) throw new ConflictException('角色编码已存在');
  }

  private createDefaultPermissions() {
    const obj: Record<string, { query: boolean; operate: boolean }> = {};
    MENU_CATALOG.forEach((m) => {
      obj[m.module] = { query: false, operate: false };
    });
    return obj;
  }

  private enableAllPermissions(
    source: Record<string, { query: boolean; operate: boolean }>,
  ) {
    const result: Record<string, { query: boolean; operate: boolean }> = {};
    Object.keys(source).forEach((k) => {
      result[k] = { query: true, operate: true };
    });
    return result;
  }

  private normalizePermissions(permissionJson: string | null) {
    try {
      const parsed = permissionJson ? JSON.parse(permissionJson) : {};
      return this.normalizePermissionsObject(parsed);
    } catch {
      return this.createDefaultPermissions();
    }
  }

  private normalizePermissionsObject(raw: Record<string, any>) {
    const base = this.createDefaultPermissions();
    MENU_CATALOG.forEach((m) => {
      const item = raw && raw[m.module] ? raw[m.module] : {};
      const query = !!item.query;
      const operate = !!item.operate;
      base[m.module] = {
        query: query || operate,
        operate,
      };
    });
    return base;
  }
}
