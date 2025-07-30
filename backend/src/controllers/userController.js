const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { createError, assert } = require('../utils/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET;

// Crea un nuovo utente
async function createUser(req, res) {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
}

// Ottieni utente per ID
async function getUserById(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    assert.found(user, 'Utente non trovato');
    
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    if (error.message === 'ID utente non valido' || error.message === 'Formato ID non valido') {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
}

// Ottieni tutti gli utenti
async function getAllUsers(req, res) {
  const users = await userService.getAllUsers();
  res.json(users);
}

// Aggiorna utente
async function updateUser(req, res) {
  try {
    // Recupera l'utente attuale per confrontare l'età
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const oldAge = currentUser.age;
    const user = await userService.updateUser(req.params.id, req.body);
    assert.found(user, 'Utente non trovato');
    
    // Se l'età è cambiata, pulisci i progressi per forzare il ricaricamento delle domande
    if (oldAge !== user.age) {
      console.log(`Età utente cambiata da ${oldAge} a ${user.age}, pulendo progressi...`);
      
      // Opzionale: puoi decidere se cancellare tutti i progressi o solo quelli dei quiz
      // Per ora, lasciamo i progressi ma forziamo il ricaricamento delle domande
      // Se vuoi cancellare i progressi, decommenta la riga seguente:
      // await Progress.deleteMany({ user: req.params.id });
      
      // Aggiorna il token JWT con la nuova età
      const { SESSION_CONSTRAINTS } = require('../../../shared/constraints');
      const newToken = jwt.sign({ 
        id: user._id.toString(), 
        role: user.role, 
        age: user.age, 
        name: user.name 
      }, JWT_SECRET, { 
        expiresIn: `${SESSION_CONSTRAINTS.JWT_EXPIRY.HOURS}h` 
      });
      
      // Imposta il nuovo token nel cookie
      res.cookie('token', newToken, {
        httpOnly: SESSION_CONSTRAINTS.COOKIE.HTTP_ONLY,
        secure: SESSION_CONSTRAINTS.COOKIE.SECURE,
        sameSite: SESSION_CONSTRAINTS.COOKIE.SAME_SITE,
        maxAge: SESSION_CONSTRAINTS.JWT_EXPIRY.MILLISECONDS,
        path: '/',
      });
    }
    
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    if (error.message === 'ID utente non valido' || error.message === 'Formato ID non valido') {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
}

// Elimina utente
async function deleteUser(req, res) {
  const user = await userService.deleteUser(req.params.id);
  assert.found(user, 'Utente non trovato');
  res.json({ message: 'Utente eliminato' });
}

// Login
async function login(req, res) {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) throw createError.auth('Email o password non validi');
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw createError.auth('Email o password non validi');
  
  // Assicurati che l'ID sia una stringa valida
  const userId = user._id.toString();
  
  // Includi anche age e name nel payload del token
  const { SESSION_CONSTRAINTS } = require('../../../shared/constraints');
  const token = jwt.sign({ id: userId, role: user.role, age: user.age, name: user.name }, JWT_SECRET, { expiresIn: `${SESSION_CONSTRAINTS.JWT_EXPIRY.HOURS}h` });
  
  // Imposta il token in un cookie httpOnly e secure
  res.cookie('token', token, {
    httpOnly: SESSION_CONSTRAINTS.COOKIE.HTTP_ONLY,
    secure: SESSION_CONSTRAINTS.COOKIE.SECURE,
    sameSite: SESSION_CONSTRAINTS.COOKIE.SAME_SITE,
    maxAge: SESSION_CONSTRAINTS.JWT_EXPIRY.MILLISECONDS,
    path: '/',
  });
  
  res.json({ user: { id: userId, name: user.name, role: user.role, age: user.age } });
}

// Logout: cancella il cookie JWT
function logout(req, res) {
  const { SESSION_CONSTRAINTS } = require('../../../shared/constraints');
  res.clearCookie('token', {
    httpOnly: SESSION_CONSTRAINTS.COOKIE.HTTP_ONLY,
    secure: SESSION_CONSTRAINTS.COOKIE.SECURE,
    sameSite: SESSION_CONSTRAINTS.COOKIE.SAME_SITE,
    path: '/',
  });
  res.json({ message: 'Logout effettuato' });
}

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  login,
  logout,
}; 