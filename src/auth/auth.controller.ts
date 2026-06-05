import { Body, Controller, Headers, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/auth/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip);
  }

  @Public()
  @Post('refresh')
  refresh(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ) {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : undefined;

    if (!token) {
      throw new UnauthorizedException('缺少访问令牌');
    }

    return this.authService.refresh(token, dto, req.ip);
  }
}
