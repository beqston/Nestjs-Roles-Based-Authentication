import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersService } from 'src/users/users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports:[
    PassportModule,
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: (configService:ConfigService)=>({
        secret:configService.getOrThrow<string>('JWT_SECRET_KEY'),
        signOptions:{
          expiresIn:configService.getOrThrow<string>('JWT_EXPIRES_IN') as any
        }
      }),
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, LocalStrategy, JwtRefreshStrategy, UsersService],
})
export class AuthModule {}
