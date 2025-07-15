import './App.css';
import './styles/design-system.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Home from './pages/Home';
import GamePage from './pages/GamePage';
import QuizSelectionPage from './pages/QuizSelectionPage';
import MemorySelectionPage from './pages/MemorySelectionPage';
import MatchingSelectionPage from './pages/MatchingSelectionPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Results from './pages/Results';
import { AuthProvider, useAuth } from './core/AuthContext';

function ProtectedRoute({ element }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  return element;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/quiz-selection" element={<QuizSelectionPage />} />
          <Route path="/memory-selection" element={<MemorySelectionPage />} />
          <Route path="/matching-selection" element={<MatchingSelectionPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/results" element={<ProtectedRoute element={<Results />} />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
