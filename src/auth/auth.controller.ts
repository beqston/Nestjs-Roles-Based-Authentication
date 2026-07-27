import { Controller, Headers, Post, Request, Response, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import {type Request as ExpressRequest, type Response as ExpressResponse} from 'express'
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller({path:'auth', version:'1'})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  async login(@Request() req: ExpressRequest, @Response({passthrough:true}) res:ExpressResponse) {
    const user = await this.authService.login(req.user as Omit<User, 'password'>);
    res.cookie('access_token', user.access_token, {
      maxAge:60 * 60 * 1000,
      secure:true,
      sameSite:'lax',
      httpOnly:true
    })

    return user;
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Request() req:ExpressRequest){

    const userId = (req as any).user.id
    const refreshToken = (req as any).user.refresh_token
    return this.authService.refreshToken(userId, refreshToken)
  }
}


