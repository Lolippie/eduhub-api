import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'generated/prisma';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { }
  // recuperer tous les users version rendre une promesse 
  async getUsers() {
    return this.prismaService.user.findMany();
  }

  async getUsersByIds(ids: string[]) {
    const users = await this.prismaService.user.findMany({
      where: {
        id: { 
          in: ids 
        }
      },
    });
    if (users.length !== ids.length) {
      throw new NotFoundException('One or more users not found');
    }

    return users;
  }

    async getStudentsByIds(ids: string[]) {
    const users = await this.prismaService.user.findMany({
      where: {
        id: { 
          in: ids 
        },
        role: Role.STUDENT
      },
    });
    if (users.length !== ids.length) {
      throw new NotFoundException('One or more users not found');
    }

    return users;
  }

  async getTeacherById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
        role: Role.TEACHER
      },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        managedCourses: true
       }
    });
    if (!user) throw new NotFoundException('One or more users not found');
    
    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    const isUserExist = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if(isUserExist){
      throw new UnauthorizedException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
    return user;
  }

  async updateUser(updatedUserDto: UpdateUserDto, id: string) {
    const user = await this.prismaService.user.update({
      where: { id },
      data: updatedUserDto,
    });
    return { "message": "User updated successfully", "user": user };
  }

  async updateRoleUser(role: Role, id: string) {
    const isUserExist = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!isUserExist){
      throw new NotFoundException('User does not exist');
    }
    const user = await this.prismaService.user.update({
      where: { id },
      data: {
        role,
      },
    });
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if(!user) throw new NotFoundException('User does not exist'); 

    if (user.email === "admin@admin.com") throw new UnauthorizedException('Cannot delete this admin user');

    await this.prismaService.user.delete({
      where: { id },
    })

    return { "message": "User deleted successfully"};
  }
}