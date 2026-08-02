import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersService } from 'src/users/users.service';

@Module({
  imports:[
    PassportModule,
    JwtModule.register({
      secret:process.env.JWT_SECRET_KEY,
      signOptions:{
        expiresIn:'12h'
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, LocalStrategy, JwtRefreshStrategy, UsersService],
})
export class AuthModule {}
