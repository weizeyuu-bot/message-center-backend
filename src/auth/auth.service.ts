import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SystemService } from '../system/system.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly systemService: SystemService,
  ) {}

  async login(dto: LoginDto, clientIp?: string) {
    const user = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const normalizedUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status,
    };

    this.systemService.recordLogin({ id: user.id, username: user.username }, clientIp);

    return {
      success: true,
      token: accessToken,
      user: normalizedUser,
      data: {
        accessToken,
        user: normalizedUser,
      },
    };
  }

  async refresh(token: string, dto?: RefreshTokenDto, clientIp?: string) {
    let payload: { sub: string; username?: string; role?: string };

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('令牌无效或已过期');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (dto?.username && dto.username !== user.username) {
      throw new UnauthorizedException('令牌与用户不匹配');
    }

    const nextPayload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = await this.jwtService.signAsync(nextPayload);
    const normalizedUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status,
    };

    this.systemService.touchSession({ id: user.id, username: user.username }, clientIp);

    return {
      success: true,
      token: accessToken,
      user: normalizedUser,
      data: {
        accessToken,
        user: normalizedUser,
      },
    };
  }
}
