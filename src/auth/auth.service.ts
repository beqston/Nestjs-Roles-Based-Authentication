import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import {type Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma:PrismaService,
    private jwtService:JwtService,
  ){}
  async login(user:Omit<User, 'password'>) {
    const payload = {sub:user.id, email:user.email, role:user.role}
    
    const token = await this.jwtService.signAsync(payload, {expiresIn:'20m'})
    
    const refreshToken = await this.jwtService.signAsync(payload, {expiresIn:'7d', secret:process.env.JWT_REFRESH_SECRET!})
    const hashedrefreshToken = await bcrypt.hash(refreshToken, 10)

    await this.prisma.user.update({
      where:{
        id:user.id
      },
      data:{
        refresh_token:hashedrefreshToken
      }
    })

    return{
      user:{
        id:user.id,
        email:user.email,
        username:user.username,
        role: user.role,
      },
      access_token:token,
      refresh_token: refreshToken
    }
  }

  async validateUser(email:string, password:string){
    const user = await this.prisma.user.findUnique({
      where:{email}
    })

    if(!user) return null
    const comparePassword = await  bcrypt.compare(password, user.password)
    if(!comparePassword) return null

    const {password:_, ...result} =  user

    return result
  }

  async refreshToken(userId:number, refreshToken:string, res:Response){
    const user = await this.prisma.user.findUnique({
      where:{id:userId}
    })
    if(!user || !user.refresh_token) throw new UnauthorizedException('Access Denied')
    
    const isMatch = await bcrypt.compare(refreshToken, user.refresh_token)

    if (!isMatch) {
      await this.prisma.user.update({
        where:{id:userId},
        data:{refresh_token:null}
      })
      throw new UnauthorizedException('Access Denied');
    }

    const payload = { sub: user.id, email: user.email, role:user.role };
    const newAccessToken = await this.jwtService.signAsync(payload); //20 minute
    const newRefreshToken = await this.jwtService.signAsync(payload, {expiresIn:'7d'}); //7 day
    const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 10)

    await this.prisma.user.update({
      where:{id:userId},
      data:{refresh_token:newHashedRefreshToken}
    })

    res.cookie('access_token', newAccessToken, {
      httpOnly:true,
      sameSite:'lax',
      secure:true,
      maxAge:20 * 60 * 1000
    })

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly:true,
      sameSite:'lax',
      secure:true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
  
    return {
      access_token: newAccessToken,
    };
  }

  async logout(id:number, res:Response){
    await this.prisma.user.update({where:{id}, data:{refresh_token:null}})
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
  }
}

