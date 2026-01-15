import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class GenerateQuizDto {
    @ApiProperty({
        description: 'ID du cours pour lequel générer le quiz',
        example: 'clg12345',
    })
    @IsString()
    @IsNotEmpty({ message: 'courseId ne peut pas être vide' })
    courseId: string;
}
