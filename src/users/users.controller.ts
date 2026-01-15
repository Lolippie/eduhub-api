import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { Admin, Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';

@ApiBearerAuth()
@ApiTags("user")
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
 
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  @Get()
  async getUsers(@Req() req) {
    return this.usersService.getUsers();
  }

  @Admin()
  @Post('ids')
  @ApiOperation({ summary: 'Récupérer des utilisateurs par IDs' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          example: ['uuid-1', 'uuid-2'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Utilisateurs trouvés' })
  async getUsersByIds(@Body("ids") ids: string[]) {
    return this.usersService.getUsersByIds(ids);
  }

  @Admin()
  @HttpCode(HttpStatus.OK)
  @Post()@Admin()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Admin()
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiParam({ name: 'id', example: 'uuid-user-id' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  async updateUser(@Body() updatedUserDto: UpdateUserDto, @Param('id') id: string) {
    return this.usersService.updateUser(updatedUserDto, id);
  }

  @Admin()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiParam({ name: 'id', example: 'uuid-user-id' })
  @ApiResponse({ status: 204, description: 'Utilisateur supprimé' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
  
  @Admin()
  @Patch(':id/role')
  @ApiOperation({ summary: 'Modifier le rôle d’un utilisateur' })
  @ApiParam({ name: 'id', example: 'uuid-user-id' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: Object.values(Role),
          example: Role.ADMIN,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Rôle mis à jour' })
  async updateRoleUser(@Body('role') role: Role, @Param('id') id: string) {
    return this.usersService.updateRoleUser(role, id);
  }


  
}