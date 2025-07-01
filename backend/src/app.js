// Entry point dell'applicazione backend (Express)
const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Import delle rotte
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const progressRoutes = require('./routes/progressRoutes');
const questionRoutes = require('./routes/questionRoutes');

app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/questions', questionRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server backend avviato sulla porta ${PORT}`);
}); 