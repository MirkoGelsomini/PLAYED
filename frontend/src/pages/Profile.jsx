import React, { useState, useEffect } from 'react';
import { useAuth } from '../core/AuthContext';
import axios from 'axios';
import logo from '../logo.svg';
import '../styles/Auth.css';

export default function Profile() {
  const { user, token, login } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const res = await axios.get(`/api/users/${user.id || user._id}`);
        setForm(res.data);
      } catch (err) {
        setError('Errore nel recupero dati profilo');
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
    // eslint-disable-next-line
  }, [user]);

  if (fetching || !form) return <div className="auth-container"><h2>Caricamento profilo...</h2></div>;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let data = { ...form };
      delete data._id;
      delete data.id;
      delete data.createdAt;
      delete data.updatedAt;
      delete data.__v;
      if (form.role === 'docente') {
        if (typeof data.subjects === 'string') {
          data.subjects = data.subjects.split(',').map(s => s.trim()).filter(Boolean);
        }
        delete data.age;
        delete data.schoolLevel;
        delete data.learningProfile;
        delete data.class;
      } else {
        delete data.subjects;
        delete data.school;
        delete data.teachingLevel;
      }
      const res = await axios.put(`/api/users/${form.id || form._id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Profilo aggiornato!');
      login(res.data, token); // aggiorna context
    } catch (err) {
      setError(err.response?.data?.error || 'Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <img src={logo} alt="Logo PLAYED" className="auth-logo" />
      <h2>Modifica il tuo profilo</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input name="name" placeholder="Nome" value={form.name || ''} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email || ''} onChange={handleChange} required />
        {form.role === 'allievo' && <>
          <input name="age" type="number" placeholder="Età" value={form.age || ''} onChange={handleChange} min={3} max={100} />
          <input name="schoolLevel" placeholder="Livello scolastico" value={form.schoolLevel || ''} onChange={handleChange} />
          <input name="learningProfile" placeholder="Profilo di apprendimento" value={form.learningProfile || ''} onChange={handleChange} />
          <input name="class" placeholder="Classe" value={form.class || ''} onChange={handleChange} />
        </>}
        {form.role === 'docente' && <>
          <input name="subjects" placeholder="Materie insegnate (separate da virgola)" value={Array.isArray(form.subjects) ? form.subjects.join(', ') : (form.subjects || '')} onChange={handleChange} />
          <input name="school" placeholder="Scuola" value={form.school || ''} onChange={handleChange} />
          <input name="teachingLevel" placeholder="Livello scolastico insegnato" value={form.teachingLevel || ''} onChange={handleChange} />
        </>}
        <button type="submit" disabled={loading}>{loading ? 'Salvataggio...' : 'Salva modifiche'}</button>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
      </form>
    </div>
  );
} 