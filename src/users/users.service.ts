import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    private prisma:PrismaService
  ){}

  async create(createUserDto: CreateUserDto) {
    
    const {password, ...restData} = createUserDto
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await this.prisma.user.create({
      data:{
        ...restData,
        password:hashedPassword,
      }

    })

    return user;
  }

  findAll() {
    return this.prisma.user.findMany()
  }

  remove(id:number){
    return this.prisma.user.delete({
      where:{
        id
      }
    })
  }

  update(id:number, updateUserDto:UpdateUserDto){
    return this.prisma.user.update({
      where:{id},
      data:updateUserDto
    })
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async logout(id:number){
    await this.update(id, { refresh_token:null });
  }
}

