import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: "L'adresse email de l'utilisateur",
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Mot de passe d’au moins 6 caractères',
    example: 'Password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
