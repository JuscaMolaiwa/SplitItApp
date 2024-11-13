import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserLogout = ({ onLogout }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // useNavigate hook to handle navigation

  const handleLogout = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('auth_token');  // Get the token to send in the request (if needed for API-based logout)
      if (!token) {
        setErrorMessage('You are not logged in!');
        return;
      }

      // Make a request to the logout API
      const response = await fetch('http://127.0.0.1:5000/api/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      // Handle the response status
      if (!response.ok) {

        // Handle specific non-OK responses
        if (response.status === 401) {
            setErrorMessage('Unauthorized. Please log in again.');
        } else if (response.status === 500) {
            setErrorMessage('Server error. Please try again later.');
        } else {
            setErrorMessage('Logout failed. Please try again.');
        }
        return;
        }
        localStorage.removeItem('auth_token');  // Remove the token from localStorage
        alert('Logout successful');
        onLogout();
        navigate('app/login'); // Redirect to the login page after logout
    } catch (error) {
      setErrorMessage(`An error occurred. Please try again. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleLogout}
        className="w-full py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700"
        disabled={loading}
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>
      {errorMessage && <div className="text-red-600">{errorMessage}</div>}
    </div>
  );
};

export default UserLogout;
