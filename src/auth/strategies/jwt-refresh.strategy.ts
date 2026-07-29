import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {type Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private userService:UsersService) {
    const secret = process.env.JWT_REFRESH_SECRET

    if(!secret) throw new Error('JWT_REFRESH_SECRET environment variable is not defined');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromBodyField('refreshToken')
      ]),
      secretOrKey: secret, 
      passReqToCallback: true,
      ignoreExpiration:false
    });
  }

  
  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.get('Authorization')?.replace(/^Bearer\s+/i, '').trim()  || req.body?.refreshToken;
    if(!refreshToken)  throw new UnauthorizedException('Refresh token not provided');

     const user = await this.userService.findById(+payload.sub);
     if(!user || !user.refresh_token) throw new UnauthorizedException('Access denied');
     const isMatch = await bcrypt.compare(refreshToken, user.refresh_token)
     if(!isMatch) throw new UnauthorizedException('Invalid refresh token')
    return {
      ...payload,
      refreshToken,
    };
  }
}
