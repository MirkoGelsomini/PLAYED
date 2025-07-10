// Configurazioni centralizzate per i giochi

const memoryCategoryNames = {
  'animali': 'Animali',
  'colori': 'Colori',
  'numeri': 'Numeri',
  'frutta': 'Frutta',
  'forme': 'Forme Geometriche',
  'professioni': 'Professioni',
  'mezzi': 'Mezzi di Trasporto',
  'emozioni': 'Emozioni'
};

const quizCategoryNames = {
  'scienze': 'Scienze',
  'geografia': 'Geografia', 
  'storia': 'Storia',
  'matematica': 'Matematica',
  'lingua': 'Lingua Italiana',
  'arte': 'Arte',
  'musica': 'Musica',
  'sport': 'Sport'
};

const quizTimeLimits = {
  'scienze': 30,
  'geografia': 25,
  'storia': 35,
  'matematica': 20,
  'lingua': 30,
  'arte': 25,
  'musica': 30,
  'sport': 20
};

const matchingCategoryNames = {
  'lingua': 'Lingua Italiana',
  'animali': 'Animali',
  'strumenti': 'Strumenti e Mestieri',
  'colori': 'Colori',
};

module.exports = {
  memoryCategoryNames,
  quizCategoryNames,
  quizTimeLimits,
  matchingCategoryNames
}; 