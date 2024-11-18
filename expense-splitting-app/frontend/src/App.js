import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import UserLogin from './components/UserLogin';
import UserRegistration from './components/UserRegistration';
import UserSystemApp from './components/UserSystemApp';
import './styles/App.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for token in both localStorage and sessionStorage
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    setIsAuthenticated(!!token); // Set isAuthenticated based on token presence
  }, []);
  

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="app-container">
          <h1 className="app-title">SplitItApp</h1>
          <Routes>
            <Route 
              path="/" 
              element={
                !isAuthenticated ? (
                  <div className="form-container">
                    <UserLogin onLoginSuccess={handleLoginSuccess} />
                    <p className="redirect-text">
                      Don't have an account? <Link to="/register" className="link">Register</Link>
                    </p>
                  </div>
                ) : (
                  <Navigate to="/app" />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? (
                  <div className="form-container">
                    <UserRegistration onRegisterSuccess={handleLoginSuccess} />
                    <p className="redirect-text">
                      Already have an account? <Link to="/" className="link">Login</Link>
                    </p>
                  </div>
                ) : (
                  <Navigate to="/app" />
                )
              } 
            />
            <Route 
              path="/app/*" 
              element={isAuthenticated ? <UserSystemApp onLogout={handleLogout} /> : <Navigate to="/" />} 
            />
          </Routes>

          </div>
      </Suspense>
    </Router>
  );
}

export default App;
