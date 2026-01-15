import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class AnswerDto {
    @ApiProperty({ description: 'ID de la question' })
    @IsString()
    questionId: string;

    @ApiProperty({ type: [String], description: 'IDs des réponses choisies' })
    @IsArray()
    @IsString({ each: true })
    answerIds: string[];
}

export class ResponseQuizDto {
    @ApiProperty({ description: 'ID du quiz' })
    @IsString()
    quizId: string;

    @ApiProperty({ type: [AnswerDto], description: 'Liste des réponses' })
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}

