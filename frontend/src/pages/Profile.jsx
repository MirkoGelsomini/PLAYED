import React, { useState, useEffect } from 'react';
import { useAuth } from '../core/AuthContext';
import axios from 'axios';
import logo from '../logo.png';
import '../styles/Auth.css';
import { deleteUser as deleteUserApi } from '../core/api';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import { defaultAvatars } from '../utils/avatarUtils';

export default function Profile() {
  const { user, token, login, logout } = useAuth();
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
      setFetching(true);
      try {
        const res = await axios.get(`/api/users/${user.id || user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          window.location.href = '/login';
        } else {
          setError('Errore nel recupero dati profilo');
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
      console.log('Dati da inviare:', data);
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
        delete data.class;
      } else {
        delete data.subjects;
        delete data.school;
        delete data.teachingLevel;
      }
      const res = await axios.put(`/api/users/${form.id || form._id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Risposta dal server:', res.data);
      setSuccess('Profilo aggiornato!');
      login(res.data); // aggiorna context
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/login';
      } else {
        setError(err.response?.data?.error || 'Errore durante il salvataggio');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteUserApi(form.id || form._id, token);
      logout();
      window.location.href = '/login';
    } catch (err) {
      setDeleteError('Errore durante l\'eliminazione dell\'account');
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
      <form className="auth-form" onSubmit={handleSubmit}>
        <input name="name" placeholder="Nome" value={form.name || ''} onChange={handleChange} required className="form-input" />
        {form.role === 'allievo' && <>
          <input name="age" type="number" placeholder="Età" value={form.age || ''} onChange={handleChange} min={3} max={100} className="form-input" />
          <input name="schoolLevel" placeholder="Livello scolastico" value={form.schoolLevel || ''} onChange={handleChange} className="form-input" />
          <input name="class" placeholder="Classe" value={form.class || ''} onChange={handleChange} className="form-input" />
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
              <Button onClick={handleDelete} className="danger-button small" disabled={deleting}>
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