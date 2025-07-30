// Servizio per la logica di business degli utenti 
const User = require('../models/user');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { USER_CONSTRAINTS, LEVEL_CONSTRAINTS } = require('../../../shared/constraints');

// Schema di validazione per la creazione e aggiornamento utente
const userValidationSchema = Joi.object({
  name: Joi.string().min(USER_CONSTRAINTS.NAME.MIN_LENGTH).max(USER_CONSTRAINTS.NAME.MAX_LENGTH).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(USER_CONSTRAINTS.PASSWORD.MIN_LENGTH).max(USER_CONSTRAINTS.PASSWORD.MAX_LENGTH).required(),
  role: Joi.string().valid(...USER_CONSTRAINTS.ROLE.VALID_VALUES).required(),
  avatar: Joi.string().allow('').optional(),
  age: Joi.when('role', {
    is: USER_CONSTRAINTS.AGE.REQUIRED_FOR_ROLE,
    then: Joi.number().integer().min(USER_CONSTRAINTS.AGE.MIN).max(USER_CONSTRAINTS.AGE.MAX).required(),
    otherwise: Joi.forbidden()
  }),
  schoolLevel: Joi.when('role', {
    is: USER_CONSTRAINTS.SCHOOL_LEVEL.REQUIRED_FOR_ROLE,
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  class: Joi.when('role', {
    is: USER_CONSTRAINTS.CLASS.REQUIRED_FOR_ROLE,
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  subjects: Joi.when('role', {
    is: USER_CONSTRAINTS.SUBJECTS.REQUIRED_FOR_ROLE,
    then: Joi.array().items(Joi.string()).min(USER_CONSTRAINTS.SUBJECTS.MIN_ITEMS).required(),
    otherwise: Joi.forbidden()
  }),
  school: Joi.when('role', {
    is: USER_CONSTRAINTS.SCHOOL.REQUIRED_FOR_ROLE,
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  teachingLevel: Joi.when('role', {
    is: USER_CONSTRAINTS.TEACHING_LEVEL.REQUIRED_FOR_ROLE,
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
});

// Schema di validazione per l'update utente (password opzionale)
const userUpdateValidationSchema = Joi.object({
  name: Joi.string().min(USER_CONSTRAINTS.NAME.MIN_LENGTH).max(USER_CONSTRAINTS.NAME.MAX_LENGTH).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(USER_CONSTRAINTS.PASSWORD.MIN_LENGTH).max(USER_CONSTRAINTS.PASSWORD.MAX_LENGTH).optional(),
  role: Joi.string().valid(...USER_CONSTRAINTS.ROLE.VALID_VALUES).required(),
  avatar: Joi.string().allow('').optional(),
  // Campi specifici per Allievo
  age: Joi.when('role', {
    is: USER_CONSTRAINTS.AGE.REQUIRED_FOR_ROLE,
    then: Joi.number().integer().min(USER_CONSTRAINTS.AGE.MIN).max(USER_CONSTRAINTS.AGE.MAX).required(),
    otherwise: Joi.forbidden()
  }),
  schoolLevel: Joi.when('role', {
    is: USER_CONSTRAINTS.SCHOOL_LEVEL.REQUIRED_FOR_ROLE,
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  class: Joi.when('role', {
    is: USER_CONSTRAINTS.CLASS.REQUIRED_FOR_ROLE,
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  // Campi specifici per Docente
  subjects: Joi.when('role', {
    is: USER_CONSTRAINTS.SUBJECTS.REQUIRED_FOR_ROLE,
    then: Joi.array().items(Joi.string()).min(USER_CONSTRAINTS.SUBJECTS.MIN_ITEMS).required(),
    otherwise: Joi.forbidden()
  }),
  school: Joi.when('role', {
    is: USER_CONSTRAINTS.SCHOOL.REQUIRED_FOR_ROLE,
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  teachingLevel: Joi.when('role', {
    is: USER_CONSTRAINTS.TEACHING_LEVEL.REQUIRED_FOR_ROLE,
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  // Campi del sistema di trofei e statistiche (opzionali per l'update)
  totalPoints: Joi.number().default(0).optional(),
  gamesCompleted: Joi.number().default(0).optional(),
  dailyStreak: Joi.number().default(0).optional(),
  lastPlayedDate: Joi.date().optional(),
  trophyCount: Joi.number().default(0).optional(),
  level: Joi.number().default(LEVEL_CONSTRAINTS.LEVEL_CALCULATION.MIN_LEVEL).optional(),
  experience: Joi.number().default(0).optional(),
  experienceToNextLevel: Joi.number().default(LEVEL_CONSTRAINTS.EXPERIENCE.DEFAULT_TO_NEXT_LEVEL).optional(),
});

async function createUser(data) {
  const { error } = userValidationSchema.validate(data);
  if (error) throw new Error(error.details[0].message);
  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = new User({ ...data, password: hashedPassword });
  return await user.save();
}

async function getUserById(id) {
  // Validazione dell'ID
  if (!id || id === 'undefined' || id === 'me') {
    throw new Error('ID utente non valido');
  }
  
  // Verifica che sia un ObjectId valido
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Formato ID non valido');
  }
  
  return await User.findById(id);
}

async function getAllUsers() {
  return await User.find();
}

async function updateUser(id, data) {
  const { error } = userUpdateValidationSchema.validate(data);
  if (error) throw new Error(error.details[0].message);
  // Se la password è presente e non vuota, hashala; altrimenti non modificarla
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  } else {
    delete data.password;
  }
  return await User.findByIdAndUpdate(id, data, { new: true });
}

async function deleteUser(id) {
  return await User.findByIdAndDelete(id);
}

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  userValidationSchema,
  userUpdateValidationSchema,
}; 