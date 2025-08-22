# 🎮 PLAYED - Piattaforma Educativa Interattiva

Una piattaforma web completa per giochi didattici modulari e adattivi, progettata per studenti e docenti. Sviluppata con tecnologie moderne e architettura scalabile.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.0-blue.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)

## 📋 Indice

- [🎯 Caratteristiche Principali](#-caratteristiche-principali)
- [🎮 Tipi di Giochi](#-tipi-di-giochi)
- [🏗️ Architettura](#️-architettura)
- [🚀 Installazione e Setup](#-installazione-e-setup)
- [📊 API Endpoints](#-api-endpoints)
- [🎨 Sistema di Design](#-sistema-di-design)
- [🏆 Sistema di Progressi e Trofei](#-sistema-di-progressi-e-trofei)
- [👥 Gestione Utenti](#-gestione-utenti)
- [🧪 Testing](#-testing)
- [🔧 Configurazione](#-configurazione)
- [📈 Funzionalità Avanzate](#-funzionalità-avanzate)
- [🤝 Contribuire](#-contribuire)

## 🎯 Caratteristiche Principali

### ✨ Funzionalità Core
- **Sistema di Autenticazione Completo**: Registrazione, login, gestione profili per studenti e docenti
- **Giochi Interattivi**: Quiz, Memory, Matching, Sorting con difficoltà progressive
- **Sistema di Livelli**: Progressione automatica basata su performance
- **Tracciamento Progressi**: Statistiche dettagliate e analytics
- **Sistema Trofei**: Achievement system con ricompense
- **Panel Docenti**: Strumenti per creare e gestire contenuti educativi
- **Design Responsivo**: Ottimizzato per desktop, tablet e mobile
- **Raccomandazioni Intelligenti**: Suggerimenti personalizzati basati su AI

### 🎯 Target Utenti
- **Studenti**: Scuola primaria, secondaria di primo e secondo grado
- **Docenti**: Creazione contenuti, monitoraggio progressi, gestione classi
- **Amministratori**: Gestione piattaforma e analytics

## 🎮 Tipi di Giochi

### 🧠 Quiz Interattivi
- **Categorie**: Matematica, Scienze, Geografia, Storia, Italiano
- **Caratteristiche**:
  - Timer configurabile per categoria
  - Domande a scelta multipla
  - Feedback immediato con animazioni
  - Sistema di punteggio dinamico
  - Opzioni randomizzate per evitare memorizzazione

### 🃏 Memory Games
- **Categorie**: Animali, Colori, Forme, Numeri
- **Caratteristiche**:
  - Coppie di carte da abbinare
  - Animazioni fluide con CSS3
  - Timer opzionale
  - Difficoltà progressiva (6-16 coppie)

### 🔗 Matching Games
- **Categorie**: Associazioni logiche, Sinonimi, Definizioni
- **Caratteristiche**:
  - Drag & drop intuitivo
  - Feedback visivo immediato
  - Sistema di colori per le coppie
  - Tracciamento tentativi

### 📊 Sorting Games
- **Categorie**: Ordinamento numerico, alfabetico, cronologico
- **Caratteristiche**:
  - Interfaccia drag & drop con @dnd-kit
  - Validazione automatica
  - Feedback educativo
  - Difficoltà crescente

## 🏗️ Architettura

### 🖥️ Frontend (React 19)
```
frontend/
├── src/
│   ├── components/          # Componenti riutilizzabili
│   │   ├── Avatar.jsx      # Sistema avatar utenti
│   │   ├── GameBadge.jsx   # Card giochi
│   │   ├── Stepper.jsx     # Wizard multi-step
│   │   └── LevelUnlockModal.jsx
│   ├── games/              # Giochi implementati
│   │   ├── Quiz/           # Sistema quiz
│   │   ├── Memory/         # Gioco memoria
│   │   ├── Matching/       # Gioco abbinamento
│   │   └── Sorting/        # Gioco ordinamento
│   ├── pages/              # Pagine principali
│   │   ├── Home.jsx        # Dashboard principale
│   │   ├── Profile.jsx     # Profilo utente
│   │   ├── TeacherPanel.jsx # Panel docenti
│   │   └── Results.jsx     # Risultati e statistiche
│   ├── core/               # Logica core
│   │   ├── AuthContext.js  # Gestione autenticazione
│   │   └── api.js          # Client API
│   └── styles/             # Sistema CSS
│       ├── design-system.css
│       └── variables.css
```

### ⚙️ Backend (Node.js + Express)
```
backend/
├── src/
│   ├── controllers/        # Logica business
│   │   ├── userController.js
│   │   ├── progressController.js
│   │   ├── questionController.js
│   │   └── trophyController.js
│   ├── models/             # Modelli MongoDB
│   │   ├── User.js         # Schema utenti
│   │   ├── Progress.js     # Schema progressi
│   │   ├── Trophy.js       # Schema trofei
│   │   └── Question.js     # Schema domande
│   ├── services/           # Servizi business
│   │   ├── progressService.js
│   │   ├── trophyService.js
│   │   └── questionService.js
│   ├── routes/             # Definizione API
│   └── utils/              # Utilità
│       ├── authMiddleware.js
│       ├── errorHandler.js
│       └── recommendationEngine.js
└── tests/                  # Suite test completa
```

### 🔄 Shared
```
shared/
└── constraints.js          # Configurazioni condivise
```

## 🚀 Installazione e Setup

### 📋 Prerequisiti
- **Node.js**: >= 16.0.0
- **MongoDB**: >= 4.4
- **npm**: >= 8.0.0

### ⚡ Quick Start

1. **Clona il repository**
```bash
git clone https://github.com/LorussoMarco/played
cd played
```

2. **Installa le dipendenze**
```bash
# Dipendenze root
npm install

# Dipendenze frontend
cd frontend
npm install
cd ..

# Dipendenze backend
cd backend
npm install
cd ..
```

3. **Configura le variabili d'ambiente**

Crea un file `.env` nella root del progetto:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/played

# Server
PORT=4000
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRE=7d

# Node Environment
NODE_ENV=development
```

4. **Avvia i servizi**

**Terminale 1 - Backend:**
```bash
npm run start:backend
```

**Terminale 2 - Frontend:**
```bash
cd frontend
npm start
```

5. **Accedi all'applicazione**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

## 📊 API Endpoints

### 🔐 Autenticazione
- `POST /api/users` - Registrazione utente
- `POST /api/users/auth/login` - Login
- `POST /api/users/auth/logout` - Logout
- `GET /api/users/profile` - Profilo utente

### 🎮 Giochi
- `GET /api/games` - Lista giochi disponibili
- `GET /api/games/:id` - Dettagli gioco specifico

### ❓ Domande
- `GET /api/questions` - Lista domande
- `GET /api/questions/:category` - Domande per categoria
- `POST /api/questions` - Crea domanda (docenti)
- `PUT /api/questions/:id` - Modifica domanda (docenti)
- `DELETE /api/questions/:id` - Elimina domanda (docenti)

### 📈 Progressi
- `GET /api/progress` - Progressi utente
- `POST /api/progress` - Salva progresso partita
- `GET /api/progress/questions` - Domande filtrate per livello
- `GET /api/progress/stats` - Statistiche dettagliate

### 🏆 Trofei
- `GET /api/trophy` - Trofei disponibili
- `GET /api/trophy/user` - Trofei utente
- `POST /api/trophy/check` - Verifica nuovi trofei

## 🎨 Sistema di Design

### 🎨 Palette Colori
```css
:root {
  /* Colori Primari */
  --primary: #4A90E2;
  --secondary: #F7C873;
  --accent: #4AE290;
  
  /* Gradienti */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-success: linear-gradient(135deg, #4AE290 0%, #2DD4BF 100%);
  --gradient-warning: linear-gradient(135deg, #F7C873 0%, #F59E0B 100%);
  
  /* Stati */
  --success: #4AE290;
  --error: #F55A5A;
  --warning: #F7C873;
  --info: #4A90E2;
}
```

### 🎯 Componenti UI
- **Design System**: Sistema di design coerente con variabili CSS
- **Animazioni**: Transizioni fluide con CSS3 e Framer Motion
- **Responsive**: Grid system e breakpoints ottimizzati
- **Accessibilità**: ARIA labels, contrasti WCAG 2.1 AA

## 🏆 Sistema di Progressi e Trofei

### 📊 Sistema di Livelli
- **Calcolo Automatico**: Basato su punti esperienza accumulati
- **Soglie Progressive**: Difficoltà crescente per livelli superiori
- **Sblocco Contenuti**: Nuove domande e giochi per livello

### 🏅 Tipi di Trofei
- **Livello**: Raggiungi livello X
- **Completamento**: Completa Y giochi
- **Streak**: Gioca per X giorni consecutivi
- **Performance**: Ottieni punteggio perfetto
- **Categoria**: Maestria in una materia specifica

### 📈 Analytics
- Tempo di gioco per sessione
- Tasso di completamento per categoria
- Progression tracking dettagliato
- Identificazione aree di miglioramento

## 👥 Gestione Utenti

### 👨‍🎓 Studenti
- **Profili Personalizzabili**: Avatar, informazioni scolastiche
- **Tracciamento Progressi**: Dashboard personalizzata
- **Raccomandazioni**: Contenuti suggeriti basati su performance

### 👨‍🏫 Docenti
- **Panel Dedicato**: Interfaccia per gestione contenuti
- **Creazione Domande**: Editor integrato per quiz personalizzati
- **Gestione Contenuti**: CRUD completo per materiali didattici

### 🔒 Sicurezza
- **Autenticazione JWT**: Token sicuri con scadenza
- **Hash Password**: bcrypt con salt rounds
- **Validazione Input**: Joi schema validation
- **Middleware Sicurezza**: Rate limiting, CORS configurato

## 🧪 Testing

### 🔬 Backend Testing
```bash
cd backend
npm test                # Esegui tutti i test
npm run test:watch      # Watch mode
npm run test:coverage   # Report coverage
```

### ⚡ Frontend Testing
```bash
cd frontend
npm test                # Test React components
npm run test:coverage   # Coverage report
```

### 📋 Test Coverage
- **Modelli**: Unit test per tutti i modelli MongoDB
- **Servizi**: Test logica business
- **API**: Integration test per endpoints
- **Componenti**: React Testing Library

## 🔧 Configurazione

### ⚙️ Configurazioni Condivise
Il file `shared/constraints.js` centralizza:
- Validazione form e input
- Configurazioni giochi
- Soglie livelli e punteggi
- Categorie e tassonomie

### 🎮 Configurazione Giochi
```javascript
const GAME_CONFIGS = {
  QUIZ_TIME_LIMITS: {
    matematica: 20,
    scienze: 25,
    geografia: 25,
    storia: 35,
    italiano: 30
  },
  MEMORY_CATEGORIES: {
    animali: 'Animali',
    colori: 'Colori',
    forme: 'Forme'
  }
};
```





## 🚀 Deployment

### 🌐 Production Build
```bash
# Build frontend
cd frontend
npm run build

# Il backend è pronto per produzione
cd ../backend
npm start
```

### 📦 Variabili Produzione
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-super-secure-production-secret
FRONTEND_URL=https://your-domain.com
```


---

<div align="center">

**🎓 PLAYED - Imparare Divertendosi! 🎮**

*Sviluppato con ❤️ per l'educazione digitale*

[⭐ Star su GitHub](https://github.com/LorussoMarco/played) | [🐛 Report Bug](https://github.com/LorussoMarco/played/issues) | [💡 Feature Request](https://github.com/LorussoMarco/played/issues)

</div>