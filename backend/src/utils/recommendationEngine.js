// Motore di raccomandazione per suggerire domande

/**
 * Suggerisce domande non fatte del livello corrente per aiutare l'utente a completarlo.
 * @param {Array} allQuestions - tutte le domande della materia
 * @param {Set} answeredIds - set di id domanda già fatte
 * @param {number} maxDiff - difficoltà massima raggiunta (livello corrente)
 * @returns {Array} domande suggerite
 */
function suggestQuestions(allQuestions, answeredIds, maxDiff) {
  // Filtra domande non fatte
  const unanswered = allQuestions.filter(q => !answeredIds.has(q.id.toString()));
  if (unanswered.length === 0) return [];
  
  // Suggerisci PRIMA le domande del livello corrente (maxDiff)
  let suggestions = unanswered.filter(q => (q.difficulty || 1) === maxDiff);
  
  // Se non ci sono domande del livello corrente, suggerisci quelle del livello precedente
  if (suggestions.length === 0) {
    suggestions = unanswered.filter(q => (q.difficulty || 1) === maxDiff - 1);
  }
  
  // Se ancora non ci sono, suggerisci quelle del livello successivo
  if (suggestions.length === 0) {
    suggestions = unanswered.filter(q => (q.difficulty || 1) === maxDiff + 1);
  }
  
  // Se non ha risposto a nulla, suggerisci le più facili
  if (answeredIds.size === 0) {
    const minDiff = Math.min(...unanswered.map(q => q.difficulty || 1));
    suggestions = unanswered.filter(q => (q.difficulty || 1) === minDiff);
  }
  
  // Se ancora non ci sono suggerimenti, prendi tutte le domande non fatte
  if (suggestions.length === 0) {
    suggestions = unanswered;
  }
  
  // Ordina per difficoltà crescente
  suggestions.sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1));
  
  // Limita a massimo 5 suggerimenti
  return suggestions.slice(0, 5);
}

module.exports = { suggestQuestions }; 