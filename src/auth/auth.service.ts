import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import crypto from 'crypto'
import bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private prisma:PrismaService,
    private jwtService:JwtService,
  ){}
  async login(user:Omit<User, 'password'>) {
    const payload = {sub:user.id, email:user.email, role:user.role}
    
    const token = await this.jwtService.signAsync(payload, {expiresIn:'20m'})
  
    const refreshToken = crypto.randomBytes(32).toString('hex')
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

  async refreshToken(userId:number, refreshToken:string){
    const user = await this.prisma.user.findUnique({
      where:{id:userId}
    })
    if(!user || !user.refresh_token) throw new UnauthorizedException('Access Denied')
    
    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refresh_token)

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }
    const payload = { sub: user.id, email: user.email, role:user.role };
    const newAccessToken = this.jwtService.sign(payload, {
    expiresIn: '20m',
  });
  
  return {
    access_token: newAccessToken,
  };
  
  }
  async logout(id:number){
    await this.prisma.user.update({where:{id}, data:{refresh_token:null}})
  }
}

