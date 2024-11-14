import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserLogin from './components/UserLogin';
import UserRegistration from './components/UserRegistration';
import UserSystemApp from './components/UserSystemApp';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state

  // Check if user is authenticated based on token in localStorage or sessionStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true); // Set the state if a token is present
    } else {
      setIsAuthenticated(false); // Set the state to false if no token is found
    }
  }, []); // Only run once on initial render

  // Handle login success
  const handleLoginSuccess = () => {
    setIsAuthenticated(true); // User has logged in
  };

  const handleLogout = () => {
    setIsAuthenticated(false); // Update the authentication state
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
                <>
                  <UserLogin onLoginSuccess={handleLoginSuccess} />
                  <UserRegistration onRegisterSuccess={handleLoginSuccess} />
                </>
              ) : (
                <Navigate to="/app" /> // Redirect to app page if authenticated
              )
            } 
          />
          <Route 
            path="/app/*" 
            element={isAuthenticated ? <UserSystemApp onLogout={handleLogout} /> : <Navigate to="/" />} // Redirect to login if not authenticated
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
