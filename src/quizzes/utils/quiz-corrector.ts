import { ResponseQuizDto } from "../dto/response-quiz.dto";

export const correctQuiz= (quiz, userAnswers:ResponseQuizDto) => {
  let score = 0;

  const feedback = quiz.questions.map((q) => {
    const userAnswer = userAnswers.answers.find((ua) => ua.questionId === q.id);
    const correctAnswerIds = q.answers.filter(a => a.isCorrect).map(a => a.id);

    const correct = (userAnswer?.answerIds ?? []).sort().join(',') === correctAnswerIds.sort().join(',');


    if (correct) score++;

    return {
      question: q.label,
      correct,
      correctAnswer: q.answers.filter(a => a.isCorrect).map(a => a.label),
    };
  });

  return { score, total: quiz.questions.length, feedback };
}
