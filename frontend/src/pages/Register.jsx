import React, { useState } from 'react';
import axios from 'axios';
import logo from '../logo.png';
import '../styles/Auth.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Stepper, { Step } from '../components/Stepper';
import { defaultAvatars, getAvatarUrl } from '../utils/avatarUtils';
import { USER_CONSTRAINTS, validatePasswordStrength, validateEmail, getSchoolLevelDisplayName } from '../shared/constraints';

const initialState = {
  name: '',
  email: '',
  password: '',
  role: 'allievo',
  schoolLevel: '',
  class: '',
  subjects: '',
  school: '',
  teachingLevel: '',
  avatar: '',
};

export default function Register() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [avatarPreview, setAvatarPreview] = useState('');
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleRoleChange = role => {
    setForm(f => ({ ...initialState, role, email: f.email, avatar: f.avatar }));
  };

  const handlePasswordChange = e => {
    const value = e.target.value;
    setForm(f => ({ ...f, password: value }));
    setPasswordStrength(getPasswordStrength(value));
  };

  const handleAvatarSelect = avatar => {
    setForm(f => ({ ...f, avatar }));
    setAvatarPreview(getAvatarUrl(avatar));
  };

  function getPasswordStrength(pw) {
    return validatePasswordStrength(pw);
  }

  const validateStep = (step) => {
    // Step 1: Dati base
    if (step === 1) {
      if (!form.name || !form.email || !form.password) {
        setError('Compila tutti i campi richiesti.');
        return false;
      }
      if (!validateEmail(form.email)) {
        setError('Inserisci una email valida.');
        return false;
      }
      if (form.password.length < USER_CONSTRAINTS.PASSWORD.MIN_LENGTH) {
        setError(`La password deve essere di almeno ${USER_CONSTRAINTS.PASSWORD.MIN_LENGTH} caratteri.`);
        return false;
      }
    }
    // Step 2: Avatar (nessun campo obbligatorio, ma resetto errori)
    if (step === 2) {
      setError('');
      return true;
    }
    // Step 3: Dati personali
    if (step === 3) {
      if (form.role === USER_CONSTRAINTS.SCHOOL_LEVEL.REQUIRED_FOR_ROLE) {
        if (!form.schoolLevel || !form.class) {
          setError('Compila tutti i campi richiesti.');
          return false;
        }
        // Validazione classe per school level
        const validClasses = USER_CONSTRAINTS.CLASS.VALID_VALUES[form.schoolLevel];
        if (!validClasses || !validClasses.includes(form.class)) {
          setError('Classe non valida per il livello scolastico selezionato.');
          return false;
        }
      } else {
        if (!form.subjects || !form.school || !form.teachingLevel) {
          setError('Compila tutti i campi richiesti.');
          return false;
        }
      }
      // Ricontrollo email anche qui per sicurezza
      if (!form.name || !form.email || !form.password) {
        setError('Compila tutti i campi richiesti.');
        return false;
      }
      if (!validateEmail(form.email)) {
        setError('Inserisci una email valida.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
    setError('');
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    setCurrentStep(s => Math.max(1, s - 1));
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let data = { ...form };
      if (form.role === 'docente') {
        data.subjects = form.subjects.split(',').map(s => s.trim()).filter(Boolean);
        delete data.schoolLevel;
        delete data.class;
      } else {
        delete data.subjects;
        delete data.school;
        delete data.teachingLevel;
      }
      if (!data.avatar) delete data.avatar;
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

  return (
    <div className="auth-outer-center" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none' }}>
      <div>
        <img src={logo} alt="Logo PLAYED" className="auth-logo" style={{ display: 'block', margin: '0 auto' }} />
        <h2 style={{ textAlign: 'center' }}>Registrati a PLAYED</h2>
        <div className="role-switch" style={{ justifyContent: 'center', marginLeft: '50px' }}>
          <button type="button" className={form.role === 'allievo' ? 'active' : ''} onClick={() => handleRoleChange('allievo')}>Allievo</button>
          <button type="button" className={form.role === 'docente' ? 'active' : ''} onClick={() => handleRoleChange('docente')}>Docente</button>
        </div>
        <Stepper
          initialStep={1}
          onStepChange={handleStepChange}
          onFinalStepCompleted={handleSubmit}
          backButtonText="Indietro"
          nextButtonText="Avanti"
          disableStepIndicators={false}
          stepCircleContainerClassName="bg-natural-primary"
          nextButtonProps={{ disabled: loading }}
          backButtonProps={{ disabled: loading }}
          onStepNext={validateStep}
        >
          <Step>
            {/* Step 1: Dati base */}
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
                minLength={USER_CONSTRAINTS.PASSWORD.MIN_LENGTH}
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
          </Step>
          <Step>
            {/* Step 2: Avatar opzionale */}
            <div className="avatar-section">
              <div className="avatar-header">
                <span>Seleziona un avatar (opzionale):</span>
                {form.avatar && (
                  <img src={avatarPreview || getAvatarUrl(form.avatar)} alt="Avatar selezionato" className="avatar-img" />
                )}
              </div>
              <div className="avatar-gallery">
                {defaultAvatars.map((av, i) => (
                  <img
                    key={av}
                    src={getAvatarUrl(av)}
                    alt={`Avatar ${i+1}`}
                    className={`avatar-thumb${form.avatar === av ? ' selected' : ''}`}
                    onClick={() => handleAvatarSelect(av)}
                    tabIndex={0}
                    style={{ outline: form.avatar === av ? '2px solid var(--primary-color)' : 'none' }}
                  />
                ))}
              </div>
              <button
                type="button"
                className="neutral-button small"
                style={{ marginTop: 16 }}
                onClick={() => { setForm(f => ({ ...f, avatar: '' })); setAvatarPreview(''); }}
                disabled={loading || !form.avatar}
              >
                Rimuovi avatar
              </button>
            </div>
          </Step>
          <Step>
            {/* Step 3: Dati personali */}
            {form.role === 'allievo' && <>
              <select name="schoolLevel" value={form.schoolLevel} onChange={handleChange} className="form-input" required>
                <option value="">Seleziona il livello scolastico</option>
                <option value="prim">Scuola primaria</option>
                <option value="sec1">Scuola secondaria di primo grado</option>
                <option value="sec2">Scuola secondaria di secondo grado</option>
              </select>
              <select name="class" value={form.class} onChange={handleChange} className="form-input" required>
                <option value="">Seleziona la classe</option>
                {form.schoolLevel === 'prim' && (
                  <>
                    <option value="1">Prima</option>
                    <option value="2">Seconda</option>
                    <option value="3">Terza</option>
                    <option value="4">Quarta</option>
                    <option value="5">Quinta</option>
                  </>
                )}
                {form.schoolLevel === 'sec1' && (
                  <>
                    <option value="1">Prima</option>
                    <option value="2">Seconda</option>
                    <option value="3">Terza</option>
                  </>
                )}
                {form.schoolLevel === 'sec2' && (
                  <>
                    <option value="1">Prima</option>
                    <option value="2">Seconda</option>
                    <option value="3">Terza</option>
                    <option value="4">Quarta</option>
                    <option value="5">Quinta</option>
                  </>
                )}
              </select>
            </>}
            {form.role === 'docente' && <>
              <input name="subjects" placeholder="Materie insegnate (separate da virgola)" value={form.subjects} onChange={handleChange} className="form-input" />
              <input name="school" placeholder="Scuola" value={form.school} onChange={handleChange} className="form-input" />
              <input name="teachingLevel" placeholder="Livello scolastico insegnato" value={form.teachingLevel} onChange={handleChange} className="form-input" />
            </>}
          </Step>
          <Step>
            {/* Step 4: Conferma */}
            <div className="wizard-confirm">
              <strong>Controlla i dati inseriti prima di confermare la registrazione.</strong>
              <ul style={{textAlign:'left',marginTop:'1rem'}}>
                <li><b>Nome:</b> {form.name}</li>
                <li><b>Email:</b> {form.email}</li>
                <li><b>Ruolo:</b> {form.role}</li>
                {form.avatar && <li><b>Avatar:</b> <img src={getAvatarUrl(form.avatar)} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--green-leaf)' }} /></li>}
                {form.role === 'allievo' && <>
                  <li><b>Livello scolastico:</b> {getSchoolLevelDisplayName(form.schoolLevel)}</li>
                  <li><b>Classe:</b> {form.class}</li>
                </>}
                {form.role === 'docente' && <>
                  <li><b>Materie:</b> {form.subjects}</li>
                  <li><b>Scuola:</b> {form.school}</li>
                  <li><b>Livello insegnato:</b> {form.teachingLevel}</li>
                </>}
              </ul>
            </div>
          </Step>
        </Stepper>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <div className="auth-link" style={{ textAlign: 'center' }}>
          Hai già un account? <a href="/login">Accedi</a>
        </div>
      </div>
    </div>
  );
} 