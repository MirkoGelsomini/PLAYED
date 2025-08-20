const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');

/**
 * Entry point dell'applicazione backend (Express)
 */

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Import delle rotte
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const progressRoutes = require('./routes/progressRoutes');
const questionRoutes = require('./routes/questionRoutes');
const trophyRoutes = require('./routes/trophyRoutes');

app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/trophy', trophyRoutes);

// Middleware per gestire route non trovate (deve essere prima del gestore errori)
app.use(notFoundHandler);

// Middleware per la gestione centralizzata degli errori (deve essere l'ultimo)
app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connessione a MongoDB riuscita');
})
.catch(err => {
  console.error('❌ Errore di connessione a MongoDB:', err);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server backend avviato su http://localhost:${PORT}`);
  console.log(`📡 CORS configurato per: http://localhost:3000`);
}); 