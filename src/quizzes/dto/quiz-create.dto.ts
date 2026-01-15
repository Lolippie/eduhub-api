import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({
    description: 'ID du cours pour lequel le quiz doit être créé',
    example: 'clg12345',
  })
  @IsString()
  courseId: string;

  @ApiPropertyOptional({
    description: 'Nombre de questions dans le quiz (1 à 20)',
    example: 5,
    minimum: 1,
    maximum: 20,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  numberOfQuestions?: number = 5;
}
