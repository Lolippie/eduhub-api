import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { Public } from './decorators/public.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SetUpDto } from './dto/set-up.dto';

@ApiTags('auth') // Groupe Swagger pour tous les endpoints auth
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @ApiOperation({ summary: 'Se connecter avec email et mot de passe' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'Connexion réussie, retourne le token JWT' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe invalide' })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Récupérer le profil de l’utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil de l’utilisateur' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('setup/users')
  @ApiOperation({ summary: 'Créer les utilisateurs initiaux (admin, teachers, students)' })
  @ApiResponse({ status: 201, description: 'Utilisateurs créés avec succès' })
  setup() {
    const setUp: SetUpDto[] = [
      {
        email: 'admin@admin.com',
        password: 'Admin1234',
        firstName: 'Admin',
        lastName: 'Admin',
        role: 'ADMIN',
      },
      {
        email: 'teacher1@teacher.com',
        password: 'Teacher1234',
        firstName: 'Teacher1',
        lastName: 'Teacher1',
        role: 'TEACHER',
      },
      {
        email: 'teacher2@teacher.com',
        password: 'Teacher1234',
        firstName: 'Teacher2',
        lastName: 'Teacher2',
        role: 'TEACHER',
      },
      {
        email: 'student1@student.com',
        password: 'Student1234',
        firstName: 'Student1',
        lastName: 'Student1',
        role: 'STUDENT',
      },
      {
        email: 'student2@student.com',
        password: 'Student1234',
        firstName: 'Student2',
        lastName: 'Student2',
        role: 'STUDENT',
      },
      {
        email: 'movingUser@user.com',
        password: 'User1234',
        firstName: 'Moving',
        lastName: 'User',
        role: 'STUDENT',
      },
    ];
    return this.authService.setUp(setUp);
  }
}
