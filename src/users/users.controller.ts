import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller({path:'users', version:'1'})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  asynccreate(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number){
    return 'this is: '+id
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id:number, @Body() data:UpdateUserDto){
    return this.usersService.update(id, data)
  }
}
