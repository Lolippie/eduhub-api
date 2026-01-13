import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { }
  // recuperer tous les users version rendre une promesse 
  async getUsers() {
    return this.prismaService.user.findMany();
  }

  async getUsersByIds(ids: string[]) {
    const users = await Promise.all(
      ids.map((id) =>
        this.prismaService.user.findUnique({
          where: { id },
        }),
      ),
    );
    return users;
  }

  async createUser(createUserDto: CreateUserDto) {
    const isUserExist = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if(isUserExist){
      throw new UnauthorizedException('User already exists');
    }
    const user = await this.prismaService.user.create({
      data: createUserDto,
    });
    return user;
  }

  async updateUser(updatedUserDto: UpdateUserDto, id: string) {
    const user = await this.prismaService.user.update({
      where: { id },
      data: updatedUserDto,
    });
    return user;
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
    if(!user){
      throw new NotFoundException('User does not exist');
    }
    if (user.email === "admin@admin.com"){
      throw new UnauthorizedException('Cannot delete this admin user');
    }
    const deleteUser = await this.prismaService.user.delete({
      where: { id },
    })
    return deleteUser;
  }
}