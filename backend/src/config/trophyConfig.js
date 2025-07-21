// Configurazione centralizzata dei trofei e obiettivi statici

const levelBasedTrophies = [
  {
    name: "Principiante",
    description: "Raggiungi il livello 5",
    category: "level",
    icon: "🌱",
    rarity: "common",
    points: 50,
    requirements: { level: 5 }
  },
  {
    name: "Apprendista",
    description: "Raggiungi il livello 10",
    category: "level",
    icon: "📚",
    rarity: "common",
    points: 100,
    requirements: { level: 10 }
  },
  {
    name: "Esperto",
    description: "Raggiungi il livello 20",
    category: "level",
    icon: "🎓",
    rarity: "rare",
    points: 250,
    requirements: { level: 20 }
  },
  {
    name: "Maestro",
    description: "Raggiungi il livello 35",
    category: "level",
    icon: "👑",
    rarity: "epic",
    points: 500,
    requirements: { level: 35 }
  },
  {
    name: "Gran Maestro",
    description: "Raggiungi il livello 50",
    category: "level",
    icon: "💎",
    rarity: "legendary",
    points: 1000,
    requirements: { level: 50 }
  },
  {
    name: "Leggenda",
    description: "Raggiungi il livello 75",
    category: "level",
    icon: "🌟",
    rarity: "legendary",
    points: 2000,
    requirements: { level: 75 }
  },
  {
    name: "Immortale",
    description: "Raggiungi il livello 100",
    category: "level",
    icon: "👻",
    rarity: "mythic",
    points: 5000,
    requirements: { level: 100 }
  }
];

const dailyObjectives = [
  {
    title: "Giocatore del Giorno",
    description: "Completa 3 partite oggi",
    type: "daily",
    category: "games",
    target: 3,
    reward: { type: "points", value: 25 },
    difficulty: "easy"
  },
  {
    title: "Punteggio Alto",
    description: "Ottieni almeno 80 punti in una singola partita",
    type: "daily",
    category: "score",
    target: 5,
    reward: { type: "points", value: 100 },
    difficulty: "medium"
  },
  {
    title: "Varietà di Giochi",
    description: "Gioca 2 tipi diversi di giochi",
    type: "daily",
    category: "variety",
    target: 2,
    reward: { type: "points", value: 30 },
    difficulty: "easy"
  }
];

module.exports = {
  levelBasedTrophies,
  dailyObjectives
}; 