export const generateQuizPrompt = (content: string) => `
Tu es un expert pédagogique.

À partir du contenu ci-dessous, génère un quiz :
- Types : QCM, TRUE_FALSE, SHORT
- Chaque question doit avoir plusieurs réponses avec indication de la bonne
- Fournis une explication pour chaque réponse

Réponds STRICTEMENT en JSON compatible avec :
{
  "questions": [
    {
      "label": "...",
      "answers": [
        { "label": "...", "isCorrect": true/false }
      ]
    }
  ]
}

Contenu du cours :
${(content)}
`;
