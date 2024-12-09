import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'Cozierickie' && password === 'password123') {
      onLogin(); // User successfully logged in
      window.location.href = '/dashboard'; // Redirect to dashboard
    } else {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h2>User Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>
            <input type="checkbox" /> Remember Me
          </label>
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
};

export default Login;
