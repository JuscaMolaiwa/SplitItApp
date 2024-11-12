import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; // Import necessary Router components
import UserLogin from './components/UserLogin';
import UserRegistration from './components/UserRegistration';
import UserSystemApp from './components/UserSystemApp';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state

  // Handle login success and redirect
  const handleLoginSuccess = () => {
    setIsAuthenticated(true); // User has logged in
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
                <UserSystemApp />  // Show UserSystemApp after login
              )
            } 
          />
          <Route path="/app/*" element={<UserSystemApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
