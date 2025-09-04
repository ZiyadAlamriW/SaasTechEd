import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Quizzes from './pages/Quizzes';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const styles = {
    app: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    },
    nav: {
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      borderBottom: '1px solid #e5e7eb'
    },
    navContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '64px'
    },
    navTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937'
    },
    navRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    navText: {
      color: '#374151'
    },
    logoutButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    loading: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px'
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div style={styles.app}>
        {user && (
          <nav style={styles.nav}>
            <div style={styles.navContainer}>
              <h1 style={styles.navTitle}>
                نظام إدارة المدرسة
              </h1>
              <div style={styles.navRight}>
                <span style={styles.navText}>مرحباً، {user.name}</span>
                <button
                  onClick={handleLogout}
                  style={styles.logoutButton}
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </nav>
        )}

        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/" replace /> : 
              <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              user ? <Dashboard /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/students" 
            element={
              user ? <Students /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/attendance" 
            element={
              user ? <Attendance /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/grades" 
            element={
              user ? <Grades /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/quizzes" 
            element={
              user ? <Quizzes /> : 
              <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;