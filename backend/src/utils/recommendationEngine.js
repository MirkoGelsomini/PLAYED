// Motore di raccomandazione per suggerire domande

/**
 * Suggerisce domande non fatte di difficoltà simile o superiore.
 * @param {Array} allQuestions - tutte le domande della materia
 * @param {Set} answeredIds - set di id domanda già fatte
 * @param {number} maxDiff - difficoltà massima raggiunta
 * @returns {Array} domande suggerite
 */
function suggestQuestions(allQuestions, answeredIds, maxDiff) {
  // Filtra domande non fatte
  const unanswered = allQuestions.filter(q => !answeredIds.has(q.id.toString()));
  if (unanswered.length === 0) return [];
  // Suggerisci domande di difficoltà >= maxDiff
  let suggestions = unanswered.filter(q => (q.difficulty || 1) >= maxDiff);
  // Se non ce ne sono, suggerisci domande di difficoltà più alta disponibile
  if (suggestions.length === 0) {
    const maxUnansweredDiff = Math.max(...unanswered.map(q => q.difficulty || 1));
    suggestions = unanswered.filter(q => (q.difficulty || 1) === maxUnansweredDiff);
  }
  // Se non ha risposto a nulla, suggerisci le più facili
  if (answeredIds.size === 0) {
    const minDiff = Math.min(...unanswered.map(q => q.difficulty || 1));
    suggestions = unanswered.filter(q => (q.difficulty || 1) === minDiff);
  }
  // Ordina per difficoltà crescente
  suggestions.sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1));
  return suggestions;
}

module.exports = { suggestQuestions }; 