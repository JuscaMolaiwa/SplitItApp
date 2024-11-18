import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserLogin.css';

const UserLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // State for remember me checkbox
  const navigate = useNavigate(); // useNavigate hook to handle navigation

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage('Both username and password are required.');
      return;
    }

    const userData = {
      username,
      password,
      remember_me: rememberMe,
    };

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token based on rememberMe
        if (rememberMe) {
          localStorage.setItem('auth_token', data.token); // Save token in localStorage for persistent session
        } else {
          sessionStorage.setItem('auth_token', data.token); // Save token in sessionStorage for session-only session
        }

        onLoginSuccess();

        alert('Login successful');
        
        // Redirect after successful login
        navigate('/app'); // Redirecting to the Profile page
      } else {
        setErrorMessage(data.error || 'Login failed');
      }
    } catch (error) {
      setErrorMessage(`An error occurred. Please try again. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container space-y-4">
      <h2 className="header text-2xl font-bold">User Login</h2>

      {errorMessage && <div className="error-message text-red-500 text-sm">{errorMessage}</div>}

      <div className="form-field">
        <label htmlFor="username" className="block font-medium">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="form-field">
        <label htmlFor="password" className="block font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="remember-me">
        <label htmlFor="remember-me" className="inline-flex items-center">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)} // Toggle remember me state
            className="mr-2"
          />
          Remember Me
        </label>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className={`login-button bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
};

export default UserLogin;
