// Modello dati per i giochi

// Esempio di struttura dati per un gioco Memory
const memoryGameExample = {
  id: 1,
  name: 'Memory degli Animali',
  type: 'memory',
  category: 'animali',
  questionId: 1, // Collegamento alla domanda didattica
  config: {
    pairs: 8,
    timer: false,
    theme: 'animali',
  },
  assets: [
    // Qui potresti avere riferimenti a immagini, suoni, ecc.
    { id: 1, image: 'lion.png', label: 'Leone' },
    { id: 2, image: 'elephant.png', label: 'Elefante' },
    // ...
  ],
};

// In futuro: esporta una classe o schema per DB
module.exports = { memoryGameExample }; 