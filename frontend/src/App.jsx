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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && (
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    نظام إدارة المدرسة
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">مرحباً، {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    تسجيل الخروج
                  </button>
                </div>
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