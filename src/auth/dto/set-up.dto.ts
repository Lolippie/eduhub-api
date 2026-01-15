import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, IsEnum } from 'class-validator';
import { Role } from 'generated/prisma';

export class SetUpDto {
  @ApiProperty({
    description: "L'email de l'utilisateur",
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description:
      'Mot de passe d’au moins 6 caractères, contenant au moins une lettre et un chiffre',
    example: 'Password123',
  })
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    message:
      'Password must be at least 6 characters long and contain at least one letter and one number',
  })
  password: string;

  @ApiProperty({
    description: "Prénom de l'utilisateur",
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: "Nom de famille de l'utilisateur",
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Rôle de l’utilisateur',
    example: Role.STUDENT,
    enum: Role,
  })
  @IsEnum(Role)
  role: Role;
}
