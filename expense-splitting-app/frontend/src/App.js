import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import UserLogin from './components/UserLogin';
import UserRegistration from './components/UserRegistration';
import UserSystemApp from './components/UserSystemApp';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      <div>
        <h1>Welcome to the App</h1>
        <Routes>
          <Route 
            path="/" 
            element={
              !isAuthenticated ? (
                <div>
                  <UserLogin onLoginSuccess={handleLoginSuccess} />
                  <p>
                    Don't have an account? <Link to="/register">Register</Link>
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
                <div>
                  <UserRegistration onRegisterSuccess={handleLoginSuccess} />
                  <p>
                    Already have an account? <Link to="/">Login</Link>
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
    </Router>
  );
}

export default App;
