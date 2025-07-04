// Entry point dell'applicazione backend (Express)
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // Cambia con l'URL del frontend in produzione
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Import delle rotte
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const progressRoutes = require('./routes/progressRoutes');
const questionRoutes = require('./routes/questionRoutes');

app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/questions', questionRoutes);

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connesso a MongoDB'))
  .catch(err => {
    console.error('Errore di connessione a MongoDB:', err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server backend avviato sulla porta ${PORT}`);
}); 