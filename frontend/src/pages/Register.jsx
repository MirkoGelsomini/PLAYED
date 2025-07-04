import React, { useState } from 'react';
import axios from 'axios';
import logo from '../logo.png';
import '../styles/Auth.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const initialState = {
  name: '',
  email: '',
  password: '',
  role: 'allievo',
  age: '',
  schoolLevel: '',
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
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();
  const steps = [
    'Dati base',
    'Dati personali',
    'Conferma',
  ];
  const [step, setStep] = useState(0);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleRoleChange = role => {
    setForm(f => ({ ...initialState, role, email: f.email }));
  };

  const handlePasswordChange = e => {
    const value = e.target.value;
    setForm(f => ({ ...f, password: value }));
    setPasswordStrength(getPasswordStrength(value));
  };

  function getPasswordStrength(pw) {
    if (!pw) return '';
    if (pw.length < 6) return 'Debole';
    let score = 0;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 10) score++;
    if (score <= 2) return 'Debole';
    if (score === 3) return 'Media';
    if (score >= 4) return 'Forte';
    return '';
  }

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
        delete data.class;
      } else {
        delete data.subjects;
        delete data.school;
        delete data.teachingLevel;
      }
      await axios.post('/api/users', data);
      const res = await axios.post('/api/users/auth/login', { email: data.email, password: form.password, role: form.role }, { withCredentials: true });
      loginContext(res.data.user);
      setSuccess('Registrazione e login avvenuti con successo!');
      setForm(initialState);
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Errore nella registrazione');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 0) {
      if (!form.password || form.password.length < 6) {
        setError('La password deve essere di almeno 6 caratteri.');
        return;
      }
      setError('');
    }
    setStep(s => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  return (
    <div className="auth-container">
      <img src={logo} alt="Logo PLAYED" className="auth-logo" />
      <h2>Registrati a PLAYED</h2>
      <div className="role-switch">
        <button type="button" className={form.role === 'allievo' ? 'active' : ''} onClick={() => handleRoleChange('allievo')}>Allievo</button>
        <button type="button" className={form.role === 'docente' ? 'active' : ''} onClick={() => handleRoleChange('docente')}>Docente</button>
      </div>
      <div className="wizard-steps">
        {steps.map((label, i) => (
          <div key={i} className={`wizard-step${i === step ? ' active' : ''}`}>{label}</div>
        ))}
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        {step === 0 && <>
          <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required className="form-input" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="form-input" />
          <div className="input-container">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handlePasswordChange}
              required
              minLength={6}
              className="password-input form-input"
              aria-label="Password"
            />
            <span
              onClick={() => setShowPassword(v => !v)}
              className="eye-icon"
              tabIndex={0}
              aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
              role="button"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {form.password && (
              <div
                className={`password-strength-overlay ${passwordStrength.toLowerCase()}`}
              >
                {passwordStrength}
              </div>
            )}
          </div>
        </>}
        {step === 1 && <>
          {form.role === 'allievo' && <>
            <input name="age" type="number" placeholder="Età" value={form.age} onChange={handleChange} min={3} max={100} className="form-input" />
            <input name="schoolLevel" placeholder="Livello scolastico" value={form.schoolLevel} onChange={handleChange} className="form-input" />
            <input name="class" placeholder="Classe" value={form.class} onChange={handleChange} className="form-input" />
          </>}
          {form.role === 'docente' && <>
            <input name="subjects" placeholder="Materie insegnate (separate da virgola)" value={form.subjects} onChange={handleChange} className="form-input" />
            <input name="school" placeholder="Scuola" value={form.school} onChange={handleChange} className="form-input" />
            <input name="teachingLevel" placeholder="Livello scolastico insegnato" value={form.teachingLevel} onChange={handleChange} className="form-input" />
          </>}
        </>}
        {step === 2 && <>
          <div className="wizard-confirm">
            <strong>Controlla i dati inseriti prima di confermare la registrazione.</strong>
            <ul style={{textAlign:'left',marginTop:'1rem'}}>
              <li><b>Nome:</b> {form.name}</li>
              <li><b>Email:</b> {form.email}</li>
              <li><b>Ruolo:</b> {form.role}</li>
              {form.role === 'allievo' && <>
                <li><b>Età:</b> {form.age}</li>
                <li><b>Livello scolastico:</b> {form.schoolLevel}</li>
                <li><b>Classe:</b> {form.class}</li>
              </>}
              {form.role === 'docente' && <>
                <li><b>Materie:</b> {form.subjects}</li>
                <li><b>Scuola:</b> {form.school}</li>
                <li><b>Livello insegnato:</b> {form.teachingLevel}</li>
              </>}
            </ul>
          </div>
        </>}
        <div className="wizard-nav">
          {step > 0 && <button type="button" onClick={prevStep} className="neutral-button small">Indietro</button>}
          {step < steps.length - 1 && <button type="button" onClick={nextStep} className="danger-button small">Avanti</button>}
          {step === steps.length - 1 && <button type="submit" disabled={loading} className="danger-button small">{loading ? 'Registrazione...' : 'Registrati'}</button>}
        </div>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
      </form>
      <div className="auth-link">
        Hai già un account? <a href="/login">Accedi</a>
      </div>
    </div>
  );
} 