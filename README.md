# Played - Piattaforma di Giochi Didattici

Una piattaforma modulare e adattiva per giochi didattici, progettata per bambini e studenti.

## 🎮 Giochi Disponibili

### 1. Memory degli Animali
- **Tipo**: Memory Game
- **Categoria**: Animali
- **Descrizione**: Un gioco di memoria per imparare gli animali e i loro versi
- **Caratteristiche**: 
  - Coppie di carte da abbinare
  - Timer opzionale
  - Animazioni fluide
  - Feedback visivo per risposte corrette/errate

### 2. Quiz di Scienze
- **Tipo**: Quiz Game
- **Categoria**: Scienze
- **Descrizione**: Metti alla prova le tue conoscenze scientifiche
- **Caratteristiche**:
  - Domande a scelta multipla
  - Timer configurabile
  - Sistema di punteggio
  - Feedback immediato

### 3. Quiz di Geografia
- **Tipo**: Quiz Game
- **Categoria**: Geografia
- **Descrizione**: Scopri il mondo attraverso domande sulla geografia
- **Caratteristiche**:
  - Domande su capitali, paesi, continenti
  - Timer di 25 secondi
  - Opzioni randomizzate

### 4. Quiz di Storia
- **Tipo**: Quiz Game
- **Categoria**: Storia
- **Descrizione**: Viaggia nel tempo con domande sulla storia
- **Caratteristiche**:
  - Domande su eventi storici
  - Timer di 35 secondi
  - Contenuti educativi

### 5. Quiz di Matematica
- **Tipo**: Quiz Game
- **Categoria**: Matematica
- **Descrizione**: Metti alla prova le tue abilità matematiche
- **Caratteristiche**:
  - Operazioni matematiche
  - Timer di 20 secondi
  - Difficoltà progressiva

## 🚀 Funzionalità del Quiz

### Caratteristiche Principali
- **Timer Configurabile**: Ogni quiz ha un tempo limite personalizzabile
- **Sistema di Punteggio**: Tracciamento del punteggio in tempo reale
- **Progresso Visivo**: Indicatore della domanda corrente
- **Feedback Immediato**: Risposte corrette/errate con animazioni
- **Schermata di Completamento**: Risultati finali con percentuale di successo
- **Opzioni Randomizzate**: Le risposte vengono mescolate per evitare pattern

### Design e UX
- **Interfaccia Moderna**: Design pulito e accattivante
- **Responsive**: Ottimizzato per desktop e mobile
- **Animazioni Fluide**: Transizioni e feedback visivi
- **Accessibilità**: Controlli intuitivi e chiari

## 🛠️ Tecnologie Utilizzate

### Frontend
- **React 19**: Framework principale
- **CSS3**: Styling moderno con animazioni
- **Phaser.js**: Per il gioco Memory (wrapper personalizzato)

### Backend
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web
- **MongoDB**: Database (configurazione opzionale)
- **JSON**: Storage dati per domande e giochi

## 📁 Struttura del Progetto

```
played/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── Game.js          # Modelli dei giochi
│   │   ├── routes/
│   │   │   ├── gameRoutes.js    # API giochi
│   │   │   └── questionRoutes.js # API domande
│   │   └── data/
│   │       └── questions.json   # Database domande
├── frontend/
│   ├── src/
│   │   ├── games/
│   │   │   ├── Memory/          # Gioco Memory
│   │   │   └── Quiz/            # Gioco Quiz
│   │   ├── components/
│   │   │   └── GameBadge.jsx    # Card gioco
│   │   └── pages/
│   │       ├── Home.jsx         # Homepage
│   │       └── GamePage.jsx     # Pagina gioco
```

## 🚀 Avvio del Progetto

### Prerequisiti
- Node.js (versione 16 o superiore)
- npm o yarn

### Installazione

1. **Clona il repository**
```bash
git clone <repository-url>
cd played
```

2. **Installa le dipendenze**
```bash
# Dipendenze principali
npm install

# Dipendenze frontend
cd frontend
npm install
cd ..
```

3. **Configura le variabili d'ambiente**
```bash
# Crea un file .env nella root del progetto
cp .env.example .env
# Modifica le variabili secondo necessità
```

4. **Avvia il backend**
```bash
npm run start:backend
```

5. **Avvia il frontend** (in un nuovo terminale)
```bash
cd frontend
npm start
```

6. **Apri il browser**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 🎯 Come Aggiungere Nuovi Giochi

### 1. Aggiungi il Modello del Gioco
In `backend/src/models/Game.js`:
```javascript
const newGameExample = {
  id: 6,
  name: 'Nuovo Gioco',
  description: 'Descrizione del gioco',
  type: 'quiz', // o 'memory', 'matching'
  category: 'categoria',
  questionId: 9,
  config: {
    // configurazioni specifiche
  }
};
```

### 2. Aggiungi le Domande
In `backend/src/data/questions.json`:
```json
{
  "id": 9,
  "type": "quiz",
  "category": "categoria",
  "question": "La tua domanda?",
  "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
  "answer": "Opzione A"
}
```

### 3. Crea il Componente del Gioco
In `frontend/src/games/NuovoGioco/`:
- `index.jsx`: Componente principale
- `config.js`: Configurazione
- `NuovoGioco.css`: Stili

### 4. Aggiorna le Rotte
In `backend/src/routes/gameRoutes.js`:
```javascript
const { newGameExample } = require('../models/Game');
// Aggiungi alla lista dei giochi
```

### 5. Integra nel Frontend
In `frontend/src/pages/GamePage.jsx`:
```javascript
import NuovoGioco from '../games/NuovoGioco';
// Aggiungi la logica di rendering
```

## 📊 API Endpoints

### Giochi
- `GET /api/games` - Lista tutti i giochi

### Domande
- `GET /api/questions` - Lista tutte le domande

### Utenti
- `POST /api/users/register` - Registrazione
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Profilo utente

### Progressi
- `GET /api/progress` - Progressi utente
- `POST /api/progress` - Salva progresso

## 🎨 Personalizzazione

### Temi e Colori
I colori principali sono definiti in `frontend/src/styles/variables.css`:
- Primario: `#4A90E2` (blu)
- Secondario: `#F7C873` (giallo)
- Successo: `#4AE290` (verde)
- Errore: `#F55A5A` (rosso)

### Configurazione Giochi
Ogni gioco può essere configurato tramite il campo `config` nel modello:
- Timer personalizzabile
- Tema specifico
- Opzioni di randomizzazione
- Parametri di difficoltà

## 🤝 Contribuire

1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/nuova-feature`)
3. Commit delle modifiche (`git commit -am 'Aggiunge nuova feature'`)
4. Push del branch (`git push origin feature/nuova-feature`)
5. Crea una Pull Request

## 📝 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 🆘 Supporto

Per domande o problemi:
1. Controlla la documentazione
2. Cerca nelle issue esistenti
3. Crea una nuova issue con dettagli completi

---

**Played** - Imparare divertendosi! 🎓🎮 