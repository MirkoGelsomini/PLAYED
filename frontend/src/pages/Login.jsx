import React, { useState } from 'react';
import axios from 'axios';
import logo from '../logo.svg';
import '../styles/Auth.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('allievo');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axios.post('/api/users/auth/login', { email, password, role });
      setSuccess('Login effettuato!');
      loginContext(res.data.user, res.data.token);
      setEmail('');
      setPassword('');
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Credenziali non valide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <img src={logo} alt="Logo PLAYED" className="auth-logo" />
      <h2>Accedi a PLAYED</h2>
      <div className="role-switch">
        <button type="button" className={role === 'allievo' ? 'active' : ''} onClick={() => setRole('allievo')}>Allievo</button>
        <button type="button" className={role === 'docente' ? 'active' : ''} onClick={() => setRole('docente')}>Docente</button>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Accesso...' : 'Accedi'}</button>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
      </form>
      <div className="auth-link">
        Non hai un account? <a href="/register">Registrati</a>
      </div>
    </div>
  );
} 