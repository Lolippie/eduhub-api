import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { Admin } from 'src/auth/decorators/roles.decorator';
import { PrismaClient, Role } from 'generated/prisma';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get()
  @ApiResponse({ status: 200, description: 'List of users' }) // correspond a la doc de swagger
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of users' }) // correspond a la doc de swagger
  async getUsersByIds(@Body() ids: string[]) {
    return this.usersService.getUsersByIds(ids);
  }
  // Permet de recuperer tous les users version recuperation d'une promesse
  // async getUsers(): Promise<any> {
  //   const prisma = new PrismaClient(); // prisma permet d'interagir avec la base de données, il convertit
  //   // les appels en requetes SQL
  //   await prisma.$connect(); //declanche la connexion a la base de données
  //   const users = await this.usersService.getUsers();    
  //   await prisma.$disconnect(); // ferme la connexion a la base de données
  //   return users;
  // }

  @Admin()
  @HttpCode(HttpStatus.OK)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Admin()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/:id')
  async updateUser(@Body() updatedUserDto: UpdateUserDto, @Param('id') id: string) {
    return this.usersService.updateUser(updatedUserDto, id);
  }

  @Admin()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/:id')
  async updateRoleUser(@Body() role: Role, @Param('id') id: string) {
    return this.usersService.updateRoleUser(role, id);
  }

  @Admin()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  
}