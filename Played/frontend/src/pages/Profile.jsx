import React, { useState, useEffect } from 'react';
import { useAuth } from '../core/AuthContext';
import axios from 'axios';
import logo from '../logo.png';
import '../styles/Auth.css';
import { deleteUser as deleteUserApi } from '../core/api';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import { defaultAvatars } from '../utils/avatarUtils';
import { USER_CONSTRAINTS, validatePasswordStrength, validateEmail, getSchoolLevelDisplayName } from '../shared/constraints';

export default function Profile() {
  const { user, login, logout } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      
      // Verifica che l'ID sia valido
      const userId = user.id || user._id;
      if (!userId || userId === 'undefined') {
        setError('ID utente non valido');
        setFetching(false);
        return;
      }
      
      setFetching(true);
      try {
        const res = await axios.get(`/api/users/${userId}`);
        setForm(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          window.location.href = '/login';
        } else {
          // Assicurati che l'errore sia sempre una stringa
          let errorMessage = 'Errore nel recupero dati profilo';
          if (err.response?.data?.error) {
            errorMessage = typeof err.response.data.error === 'string' 
              ? err.response.data.error 
              : JSON.stringify(err.response.data.error);
          }
          setError(errorMessage);
        }
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
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

        delete data.schoolLevel;
        delete data.class;
      } else {
        delete data.subjects;
        delete data.school;
        delete data.teachingLevel;
      }
      const res = await axios.put(`/api/users/${form.id || form._id}`, data);
      setSuccess('Profilo aggiornato!');
      login(res.data); // aggiorna context
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/login';
      } else {
        // Assicurati che l'errore sia sempre una stringa
        let errorMessage = 'Errore durante il salvataggio';
        if (err.response?.data?.error) {
          errorMessage = typeof err.response.data.error === 'string' 
            ? err.response.data.error 
            : JSON.stringify(err.response.data.error);
        }
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteUserApi(form.id || form._id);
      logout();
      window.location.href = '/login';
    } catch (err) {
      // Assicurati che l'errore sia sempre una stringa
      let errorMessage = 'Errore durante l\'eliminazione dell\'account';
      if (err.response?.data?.error) {
        errorMessage = typeof err.response.data.error === 'string' 
          ? err.response.data.error 
          : JSON.stringify(err.response.data.error);
      }
      setDeleteError(errorMessage);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAvatarSelect = (url) => {
    // url è tipo "/avatar/dog.png", estrai solo il nome file
    const fileName = url.split('/').pop();
    setForm(f => ({ ...f, avatar: fileName }));
  };

  const handleAvatarUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setForm(f => ({ ...f, avatar: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="auth-container">
      <img src={logo} alt="Logo PLAYED" className="auth-logo" />
      <h2>Modifica il tuo profilo</h2>
      
      {/* Sezione informazioni attuali */}
      <div className="current-info" style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Informazioni attuali</h3>
        <p><strong>Nome:</strong> {form.name}</p>
        <p><strong>Email:</strong> {form.email}</p>
        <p><strong>Ruolo:</strong> {form.role === 'allievo' ? 'Allievo' : 'Docente'}</p>
        {form.role === 'allievo' && (
          <>
            <p><strong>Livello scolastico:</strong> {getSchoolLevelDisplayName(form.schoolLevel)}</p>
            <p><strong>Classe:</strong> {form.class}</p>
          </>
        )}
        {form.role === 'docente' && (
          <>
            <p><strong>Materie:</strong> {Array.isArray(form.subjects) ? form.subjects.join(', ') : (form.subjects || 'Nessuna')}</p>
            <p><strong>Scuola:</strong> {form.school || 'Non specificata'}</p>
            <p><strong>Livello insegnato:</strong> {form.teachingLevel || 'Non specificato'}</p>
          </>
        )}
      </div>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <input name="name" placeholder="Nome" value={form.name || ''} onChange={handleChange} required className="form-input" />
        {form.role === 'allievo' && <>
          <select name="schoolLevel" value={form.schoolLevel || ''} onChange={handleChange} className="form-input" required>
            <option value="">Seleziona il livello scolastico</option>
            <option value="prim">Scuola primaria</option>
            <option value="sec1">Scuola secondaria di primo grado</option>
            <option value="sec2">Scuola secondaria di secondo grado</option>
          </select>
          <select name="class" value={form.class || ''} onChange={handleChange} className="form-input" required>
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
          <input name="subjects" placeholder="Materie insegnate (separate da virgola)" value={Array.isArray(form.subjects) ? form.subjects.join(', ') : (form.subjects || '')} onChange={handleChange} className="form-input" />
          <input name="school" placeholder="Scuola" value={form.school || ''} onChange={handleChange} className="form-input" />
          <input name="teachingLevel" placeholder="Livello scolastico insegnato" value={form.teachingLevel || ''} onChange={handleChange} className="form-input" />
        </>}
        <div className="avatar-section">
          <div className="avatar-preview">
            <Avatar 
              avatar={form.avatar} 
              alt="Avatar" 
              size="xlarge"
              className="avatar-img"
            />
          </div>
          <div className="avatar-gallery">
            {defaultAvatars.map(url => (
              <img
                key={url}
                src={url}
                alt="Avatar cartoon"
                className={`avatar-thumb${form.avatar === url ? ' selected' : ''}`}
                onClick={() => handleAvatarSelect(url)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
          <div className="avatar-upload">
            <label htmlFor="avatar-upload-input" className="avatar-upload-label">Carica il tuo avatar</label>
            <input id="avatar-upload-input" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </div>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Salvataggio...' : 'Salva modifiche'}</button>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
      </form>
      <Button
        variant="danger"
        className="danger-button small"
        onClick={() => setShowDeleteModal(true)}
      >
        <span role="img" aria-label="cestino">🗑️</span> Elimina account
      </Button>
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Sei sicuro di voler eliminare il tuo account?</h3>
            <p>Questa azione è irreversibile.</p>
            {deleteError && <div className="auth-error">{deleteError}</div>}
            <div className="modal-actions">
              <Button variant="danger" onClick={handleDelete} className="danger-button small" disabled={deleting}>
                <span role="img" aria-label="cestino">🗑️</span> {deleting ? 'Eliminazione...' : 'Conferma'}
              </Button>
              <Button onClick={() => setShowDeleteModal(false)} className="neutral-button small" disabled={deleting}>
                Annulla
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 