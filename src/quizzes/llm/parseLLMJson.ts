export function parseLLMJson(raw: string): any {
  // Cherche le premier '{' et le dernier '}'
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Aucun JSON détecté dans la réponse du LLM');
  }

  let jsonString = raw.slice(firstBrace, lastBrace + 1);

  // Nettoyage supplémentaire
  jsonString = jsonString.replace(/```/g, ''); // supprime backticks Markdown
  jsonString = jsonString.replace(/[^\x20-\x7E\n\r\t]+/g, ''); // supprime caractères non lisibles

  return JSON.parse(jsonString);
}