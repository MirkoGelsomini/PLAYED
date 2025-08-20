import './App.css';
import './styles/design-system.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
import SortingSelectionPage from './pages/SortingSelectionPage';
import SortingCategoryPage from './pages/SortingCategoryPage';
import TeacherPanel from './pages/TeacherPanel';
import { AuthProvider, useAuth } from './core/AuthContext';
import { SidebarRefreshProvider } from './core/SidebarRefreshContext';

function ProtectedRoute({ element }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Caricamento...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return element;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarRefreshProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="/quiz-selection" element={<QuizSelectionPage />} />
            <Route path="/memory-selection" element={<MemorySelectionPage />} />
            <Route path="/matching-selection" element={<MatchingSelectionPage />} />
            <Route path="/sorting" element={<SortingSelectionPage />} />
            <Route path="/sorting/category/:category" element={<SortingCategoryPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/results" element={<ProtectedRoute element={<Results />} />} />
            <Route path="/teacher-panel" element={<ProtectedRoute element={<TeacherPanel />} />} />
          </Routes>
          <Footer />
        </SidebarRefreshProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
