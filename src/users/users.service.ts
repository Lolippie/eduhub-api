import { Injectable, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) { }
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
    const user = await this.prismaService.user.update({
      where: { id },
      data: {
        role,
      },
    });
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.prismaService.user.delete({
      where: { id },
    })
    return user;
  }
}