import { ApiProperty } from '@nestjs/swagger';

export class QuizQuestion {
  @ApiProperty({
    description: 'Texte de la question',
    example: 'Quelle est la capitale de la France ?',
  })
  question: string;

  @ApiProperty({
    description: 'Liste des options de réponses',
    example: ['Paris', 'Londres', 'Berlin', 'Madrid'],
    type: [String],
  })
  options: string[];

  @ApiProperty({
    description: 'Index de la réponse correcte dans le tableau options (commence à 0)',
    example: 0,
  })
  correctAnswerIndex: number;

  @ApiProperty({
    description: 'Explication de la réponse correcte',
    example: 'Paris est la capitale de la France.',
  })
  explanation: string;
}

export class Quiz {
  @ApiProperty({
    description: 'ID du cours associé au quiz',
    example: 'clg12345',
  })
  courseId: string;

  @ApiProperty({
    description: 'Liste des questions du quiz',
    type: [QuizQuestion],
  })
  questions: QuizQuestion[];
}
