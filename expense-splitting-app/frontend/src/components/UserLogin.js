import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/UserLogin.css";

const UserLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in (has auth_token)
  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    if (token) {
      navigate("/app"); // Redirect to app if already logged in
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage("Both username and password are required.");
      return;
    }

    const userData = {
      username,
      password,
      remember_me: rememberMe,
    };

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token based on rememberMe
        if (rememberMe) {
          localStorage.setItem("auth_token", data.token);
        } else {
          sessionStorage.setItem("auth_token", data.token);
        }

        onLoginSuccess();

        alert("Login successful");
        navigate("/app"); // Redirect to the app (Profile page)
      } else {
        setErrorMessage(data.error || "Invalid credentials");
      }
    } catch (error) {
      setErrorMessage(`An error occurred. Please try again. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
    if (!rememberMe === false) {
      localStorage.removeItem("auth_token");
    }
  };

  return (
    <div className="container">
      <h2 className="header">User Login</h2>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="form-field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </div>

      <div className="remember-me">
        <input
          type="checkbox"
          id="remember-me"
          checked={rememberMe}
          onChange={handleRememberMeChange}
        />
        <label htmlFor="remember-me">Remember Me</label>
      </div>

      <button onClick={handleLogin} disabled={loading} className="login-button">
        {loading ? (
          <span className="spinner-border animate-spin border-2 border-t-2 border-white rounded-full w-5 h-5 mx-auto"></span>
        ) : (
          "Login"
        )}
      </button>
    </div>
  );
};

export default UserLogin;
