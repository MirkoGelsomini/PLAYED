// Servizio per la logica di business degli utenti 
const User = require('../models/user');
const Joi = require('joi');
const bcrypt = require('bcrypt');

// Schema di validazione per la creazione e aggiornamento utente
const userValidationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('allievo', 'docente').required(),
  avatar: Joi.string().allow('').optional(),
  age: Joi.when('role', {
    is: 'allievo',
    then: Joi.number().integer().min(3).max(100).required(),
    otherwise: Joi.forbidden()
  }),
  schoolLevel: Joi.when('role', {
    is: 'allievo',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  learningProfile: Joi.when('role', {
    is: 'allievo',
    then: Joi.string().allow('').required(),
    otherwise: Joi.forbidden()
  }),
  class: Joi.when('role', {
    is: 'allievo',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  subjects: Joi.when('role', {
    is: 'docente',
    then: Joi.array().items(Joi.string()).required(),
    otherwise: Joi.forbidden()
  }),
  school: Joi.when('role', {
    is: 'docente',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  teachingLevel: Joi.when('role', {
    is: 'docente',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
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
  return await User.findById(id);
}

async function getAllUsers() {
  return await User.find();
}

async function updateUser(id, data) {
  const { error } = userValidationSchema.validate(data);
  if (error) throw new Error(error.details[0].message);
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
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
}; 