import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { fetchQuestions } from '../core/api';
import Sorting from '../games/Sorting';
import '../styles/main.css';

const SortingCategoryPage = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions().then(allQuestions => {
      const filtered = allQuestions.filter(q => q.type === 'sorting' && q.category === category);
      const qid = searchParams.get('questionId');
      let startIdx = 0;
      if (qid) {
        const idx = filtered.findIndex(q => String(q.id || q._id) === String(qid));
        if (idx >= 0) startIdx = idx;
      }
      setQuestions(filtered);
      setCurrentIdx(startIdx);
      setLoading(false);
    });
  }, [category, searchParams]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Caricamento domande...</div>;
  }

  if (questions.length === 0) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Nessuna domanda disponibile per questa categoria.</div>;
  }

  const handleNext = () => setCurrentIdx(idx => Math.min(idx + 1, questions.length - 1));
  const handlePrev = () => setCurrentIdx(idx => Math.max(idx - 1, 0));

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <Link to="/sorting" className="back-home-btn">← Torna alle categorie</Link>
      <h2 style={{ textAlign: 'center', margin: '2rem 0 1rem 0', fontWeight: 700 }}>
        Categoria: {category.charAt(0).toUpperCase() + category.slice(1)}
      </h2>
      <Sorting question={questions[currentIdx]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button onClick={handlePrev} disabled={currentIdx === 0} style={{ padding: '0.5em 1.2em', borderRadius: 8, fontWeight: 700, background: '#e0e7ef', color: '#2563eb', border: 'none', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer' }}>Precedente</button>
        <span style={{ alignSelf: 'center' }}>{currentIdx + 1} / {questions.length}</span>
        <button onClick={handleNext} disabled={currentIdx === questions.length - 1} style={{ padding: '0.5em 1.2em', borderRadius: 8, fontWeight: 700, background: '#e0e7ef', color: '#2563eb', border: 'none', cursor: currentIdx === questions.length - 1 ? 'not-allowed' : 'pointer' }}>Successiva</button>
      </div>
    </div>
  );
};

export default SortingCategoryPage; 