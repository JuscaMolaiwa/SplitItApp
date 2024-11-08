import React, { useState } from 'react';
import UserLogin from './components/UserLogin';
import UserRegistration from './components/UserRegistration';
import ProfileManagement from './components/ProfileManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state

  // Handle login success
  const handleLoginSuccess = () => {
    setIsAuthenticated(true); // User has logged in
  };

  return (
    <div>
      <h1>Welcome to the App</h1>
      {!isAuthenticated ? (
        <>
          <UserLogin onLoginSuccess={handleLoginSuccess} />
          <UserRegistration />
        </>
      ) : (
        <ProfileManagement />
      )}
    </div>
  );
}

export default App;
