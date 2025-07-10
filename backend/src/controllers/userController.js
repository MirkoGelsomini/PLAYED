const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;

// Crea un nuovo utente
async function createUser(req, res) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    // Gestione errore email duplicata
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ error: 'Esiste già un account associato a questa email.' });
    }
    res.status(400).json({ error: err.message });
  }
}

// Ottieni utente per ID
async function getUserById(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Ottieni tutti gli utenti
async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Aggiorna utente
async function updateUser(req, res) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Elimina utente
async function deleteUser(req, res) {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    res.json({ message: 'Utente eliminato' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Login
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Email o password non validi' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Email o password non validi' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '4h' });
    // Imposta il token in un cookie httpOnly e secure
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 4 * 60 * 60 * 1000, // 4 ore
      path: '/',
    });
    res.json({ user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel login' });
  }
}

// Logout: cancella il cookie JWT
function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
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