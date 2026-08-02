import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface RequestWithRefreshToken extends Request {
  rawRefreshToken?: string;
}

const extractRefreshToken = (req: RequestWithRefreshToken): string | null => {
  if (req.rawRefreshToken) return req.rawRefreshToken;

  const token =
    req.cookies?.refresh_token ||
    ExtractJwt.fromAuthHeaderAsBearerToken()(req) ||
    req.body?.refreshToken ||
    null;

  if (token) {
    req.rawRefreshToken = token; 
  }

  return token;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly userService: UsersService) {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractRefreshToken]),
      secretOrKey: secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: RequestWithRefreshToken, payload: JwtPayload) {
    const refreshToken = extractRefreshToken(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const user = await this.userService.findById(payload.sub);
    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Access denied');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      id: payload.sub,      
      email: payload.email,
      role: payload.role,
      refreshToken
    };
  }
}