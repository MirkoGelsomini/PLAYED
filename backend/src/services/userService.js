// Servizio per la logica di business degli utenti 
const User = require('../models/user');
const Joi = require('joi');

// Schema di validazione per la creazione e aggiornamento utente
const userValidationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('allievo', 'docente').required(),
  age: Joi.number().integer().min(3).max(100),
  schoolLevel: Joi.string(),
  learningProfile: Joi.string(),
  class: Joi.string(),
  subjects: Joi.array().items(Joi.string()),
  school: Joi.string(),
  teachingLevel: Joi.string(),
});

async function createUser(data) {
  const { error } = userValidationSchema.validate(data);
  if (error) throw new Error(error.details[0].message);
  const user = new User(data);
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