import { z } from 'zod';

export const AnswerSchema = z.object({
  label: z.string(),
  isCorrect: z.boolean(),
});

export const QuestionSchema = z.object({
  label: z.string(),
  answers: z.array(AnswerSchema),
});

export const QuizSchema = z.object({
  questions: z.array(QuestionSchema),
});
