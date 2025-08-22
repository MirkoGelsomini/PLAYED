import React, { useState } from 'react';
import axios from 'axios';
import logo from '../logo.png';
import '../styles/Auth.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { useErrorHandler } from '../utils/errorHandler';

export default function Login() {
  const { handleComponentError } = useErrorHandler();
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
      const res = await axios.post('/api/users/auth/login', { email, password, role }, { withCredentials: true });
      setSuccess('Login effettuato!');
      loginContext(res.data.user);
      setEmail('');
      setPassword('');
      // Naviga immediatamente dopo il login
      navigate('/');
    } catch (err) {
      handleComponentError(err, setError, setLoading);
    }
  };

  return (
    <div className="auth-container">
      <img src={logo} alt="Logo PLAYED" className="auth-logo" />
      <h2>Accedi a PLAYED</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" />
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