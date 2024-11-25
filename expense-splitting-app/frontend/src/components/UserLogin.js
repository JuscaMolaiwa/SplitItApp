import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const navigate = useNavigate();

  // Check if user is already logged in (has auth_token)
  useEffect(() => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      navigate('/app'); // Redirect to app if already logged in
    }
  }, [navigate]);

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
          localStorage.setItem('auth_token', data.token);
        } else {
          sessionStorage.setItem('auth_token', data.token);
        }

        onLoginSuccess();

        alert('Login successful');
        navigate('/app'); // Redirect to the app (Profile page)
      } else {
        setErrorMessage(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setErrorMessage(`An error occurred. Please try again. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center">User Login</h2>

      {errorMessage && <div className="text-red-500 text-sm text-center">{errorMessage}</div>}

      <div>
        <label htmlFor="username" className="block font-medium text-gray-700">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-2 block w-full p-2 border rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter your username"
        />
      </div>

      <div>
        <label htmlFor="password" className="block font-medium text-gray-700">Password</label>
        <div className="relative">
          <input
            id="password"
            type={passwordVisible ? 'text' : 'password'} // Toggle between password and text
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 block w-full p-2 border rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute inset-y-0 right-2 top-1/2 transform -translate-y-1/2 text-gray-600 focus:outline-none"
          >
            {passwordVisible ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="remember-me"
          checked={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
          className="mr-2"
        />
        <label htmlFor="remember-me" className="text-sm">Remember Me</label>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className={`w-full mt-4 py-2 px-4 rounded-md font-medium text-white ${loading ? 'bg-indigo-500 opacity-50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        {loading ? (
          <span className="spinner-border animate-spin border-2 border-t-2 border-white rounded-full w-5 h-5 mx-auto"></span>
        ) : (
          'Login'
        )}
      </button>
    </div>
  );
};

export default UserLogin;
