import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserRegistration = ({onRegisterSuccess}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Initialize navigate for redirection

  const handleRegistration = async () => {
    if (!username || !password || !email || !fullName) {
      setErrorMessage('Username, password, email, and full name are required.');
      return;
    }

    // Prepare the user data
    const userData = {
      username,
      email,
      password,
      full_name: fullName,
    };

    // Only add profile_image if provided
    if (profileImage) {
      userData.profile_image = profileImage;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Sending data to the backend using fetch
      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('auth_token', data.token);
        onRegisterSuccess();
        
        alert('User registered successfully');

        //redirect the user to the main app
        navigate('/app');  // '/' is the route for UserSystemApp

      } else {
        setErrorMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      setErrorMessage(`An error occurred. Please try again. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User Registration</h2>

      {errorMessage && (
        <div className="text-red-500 text-sm">{errorMessage}</div>
      )}

      <div>
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

      <div>
        <label htmlFor="email" className="block font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
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

      <div>
        <label htmlFor="full_name" className="block font-medium">
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="profile_image" className="block font-medium">
          Profile Image URL (Optional)
        </label>
        <input
          id="profile_image"
          type="text"
          value={profileImage}
          onChange={(e) => setProfileImage(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <button
        onClick={handleRegistration}
        disabled={loading}
        className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </div>
  );
};

export default UserRegistration;
