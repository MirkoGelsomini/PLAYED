import React, { useState } from 'react';
import axios from 'axios';
import logo from '../logo.svg';
import '../styles/Auth.css';

const initialState = {
  name: '',
  email: '',
  password: '',
  role: 'allievo',
  age: '',
  schoolLevel: '',
  learningProfile: '',
  class: '',
  subjects: '',
  school: '',
  teachingLevel: '',
};

export default function Register() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleRoleChange = role => {
    setForm(f => ({ ...initialState, role, email: f.email }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let data = { ...form };
      if (form.role === 'docente') {
        data.subjects = form.subjects.split(',').map(s => s.trim()).filter(Boolean);
        delete data.age;
        delete data.schoolLevel;
        delete data.learningProfile;
        delete data.class;
      } else {
        delete data.subjects;
        delete data.school;
        delete data.teachingLevel;
      }
      await axios.post('/api/users', data);
      setSuccess('Registrazione avvenuta con successo!');
      alert('Registrazione avvenuta con successo! Ora puoi effettuare il login.');
      setForm(initialState);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nella registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <img src={logo} alt="Logo PLAYED" className="auth-logo" />
      <h2>Registrati a PLAYED</h2>
      <div className="role-switch">
        <button type="button" className={form.role === 'allievo' ? 'active' : ''} onClick={() => handleRoleChange('allievo')}>Allievo</button>
        <button type="button" className={form.role === 'docente' ? 'active' : ''} onClick={() => handleRoleChange('docente')}>Docente</button>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength={6} />
        {form.role === 'allievo' && <>
          <input name="age" type="number" placeholder="Età" value={form.age} onChange={handleChange} min={3} max={100} />
          <input name="schoolLevel" placeholder="Livello scolastico" value={form.schoolLevel} onChange={handleChange} />
          <input name="learningProfile" placeholder="Profilo di apprendimento" value={form.learningProfile} onChange={handleChange} />
          <input name="class" placeholder="Classe" value={form.class} onChange={handleChange} />
        </>}
        {form.role === 'docente' && <>
          <input name="subjects" placeholder="Materie insegnate (separate da virgola)" value={form.subjects} onChange={handleChange} />
          <input name="school" placeholder="Scuola" value={form.school} onChange={handleChange} />
          <input name="teachingLevel" placeholder="Livello scolastico insegnato" value={form.teachingLevel} onChange={handleChange} />
        </>}
        <button type="submit" disabled={loading}>{loading ? 'Registrazione...' : 'Registrati'}</button>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
      </form>
      <div className="auth-link">
        Hai già un account? <a href="/login">Accedi</a>
      </div>
    </div>
  );
} 