const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { createError, assert } = require('../utils/errorHandler');
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Controller per gestire gli utenti
 */

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
    // Recupera l'utente attuale per confrontare i dati scolastici
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const oldSchoolLevel = currentUser.schoolLevel;
    const oldClass = currentUser.class;
    const user = await userService.updateUser(req.params.id, req.body);
    assert.found(user, 'Utente non trovato');
    
    // Se i dati scolastici sono cambiati, pulisci i progressi per forzare il ricaricamento delle domande
    if (oldSchoolLevel !== user.schoolLevel || oldClass !== user.class) {
      
      // Aggiorna il token JWT con i nuovi dati scolastici
      const newToken = jwt.sign({ 
        id: user._id.toString(), 
        role: user.role, 
        schoolLevel: user.schoolLevel, 
        class: user.class,
        name: user.name 
      }, JWT_SECRET, { 
        expiresIn: '24h' 
      });
      
      // Imposta il nuovo token nel cookie
      res.cookie('token', newToken, {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 ore
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
  
  // Includi anche schoolLevel, class e name nel payload del token
  const token = jwt.sign({ 
    id: userId, 
    role: user.role, 
    schoolLevel: user.schoolLevel, 
    class: user.class,
    name: user.name 
  }, JWT_SECRET, { 
    expiresIn: '24h' 
  });
  
  // Imposta il token in un cookie httpOnly e secure
  res.cookie('token', token, {
    httpOnly: true, // Sempre true per sicurezza
    secure: process.env.NODE_ENV === 'production', // Solo in produzione
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 ore
    path: '/',
  });
  
  res.json({ user: { id: userId, name: user.name, role: user.role, schoolLevel: user.schoolLevel, class: user.class } });
}

// Logout: cancella il cookie JWT
function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true, // Sempre true per sicurezza
    secure: process.env.NODE_ENV === 'production', // Solo in produzione
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
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