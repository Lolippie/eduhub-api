import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { Admin } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
 
  @Admin()
  @Get('')
  @ApiResponse({ status: 200, description: 'List of users' }) // correspond a la doc de swagger
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Admin()
  @Get('ids')
  @ApiResponse({ status: 200, description: 'List of users' }) // correspond a la doc de swagger
  async getUsersByIds(@Body("ids") ids: string[]) {
    return this.usersService.getUsersByIds(ids);
  }

  @Admin()
  @HttpCode(HttpStatus.OK)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Admin()
  @HttpCode(HttpStatus.OK)
  @Patch('/:id')
  async updateUser(@Body() updatedUserDto: UpdateUserDto, @Param('id') id: string) {
    return this.usersService.updateUser(updatedUserDto, id);
  }

  @Admin()
  @HttpCode(HttpStatus.OK)
  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
  
  @Admin()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/:id/role')
  async updateRoleUser(@Body('role') role: Role, @Param('id') id: string) {
    return this.usersService.updateRoleUser(role, id);
  }


  
}