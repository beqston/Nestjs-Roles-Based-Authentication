import { Controller, Headers, Post, Request, Res, Response, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import {type Request as ExpressRequest, type Response as ExpressResponse} from 'express'
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GetUser } from './decorators/get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller({path:'auth', version:'1'})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: ExpressRequest, @Response({passthrough:true}) res:ExpressResponse) {
    const {user, access_token, refresh_token} = await this.authService.login(req.user as Omit<User, 'password'>);

    res.cookie('access_token', access_token, {
      secure:true,
      sameSite:'lax',
      httpOnly:true,
      maxAge:20 * 60 * 1000
    })

    res.cookie('refresh_token', refresh_token, {
      secure:true,
      sameSite:'lax',
      httpOnly:true,
      maxAge:7 * 24 * 60 * 60 * 1000
    })

    return {
      user,
      access_token,
      refresh_token
    };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@GetUser() user:{id:number, refreshToken:string}, @Res({passthrough:true}) res:ExpressResponse){
    return this.authService.refreshToken(user.id, user.refreshToken, res)
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser('id') id:number, @Res({passthrough:true}) res:ExpressResponse){
    await this.authService.logout(id,res)
    res.clearCookie('access_token', {
      httpOnly:true,
      sameSite:'lax',
      secure:true
    })
    res.clearCookie('refresh_token', {
      httpOnly:true,
      sameSite:'lax',
      secure:true
    });

  return { message: 'Successfully logged out' };
  }
}


