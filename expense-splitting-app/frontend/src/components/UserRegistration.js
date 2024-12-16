import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/UserRegistration.css";

const UserRegistration = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe] = useState(false);

  const navigate = useNavigate(); // Initialize navigate for redirection

  const handleRegistration = async () => {
    // Trim input values
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedFullName = fullName.trim();
    const trimmedPassword = password.trim();
    const trimmedProfileImage = profileImage.trim();
    
    // Validate required fields
    const missingFields = []; // Array to hold names of missing fields

    if (!trimmedUsername) {
        missingFields.push("Username");
    }
    if (!trimmedPassword) {
        missingFields.push("Password");
    }
    if (!trimmedEmail) {
        missingFields.push("Email");
    }
    if (!trimmedFullName) {
        missingFields.push("Full name");
    }

    // Set error message based on missing fields
    if (missingFields.length === 4) {
        setErrorMessage("Username, password, email, and full name are required.");
    } else if (missingFields.length > 0) {
        setErrorMessage(`${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required.`);
    } else {
        // Proceed with further validations if all required fields are filled
        // Username validation
        if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
            setErrorMessage("Username must be between 3 and 50 characters.");
            return;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
            setErrorMessage("Username can only contain letters, numbers, hyphens, and underscores.");
            return;
        }
        // Check if username is already taken
    try {
      const response = await fetch("http://127.0.0.1:5000/api/check-username", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: trimmedUsername }),
      });

      if (!response.ok) {
          const data = await response.json();
          setErrorMessage(data.message); // Set the error message from the response
          return;
      }
      } catch (error) {
          setErrorMessage("An error occurred while checking username availability.");
          return;
      }


      // Validate email format
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(trimmedEmail)) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }

      // Check if email is already in use
      try {
        const response = await fetch("http://127.0.0.1:5000/api/check-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: trimmedEmail }),
        });

        const result = await response.json();

        if (!response.ok) {
          setErrorMessage(result.error);
          return;
        }

        if (result.isRegistered) {
          setErrorMessage("This email address is already registered.");
          return;
        }
      } catch (error) {
        setErrorMessage("Unable to validate email. Please try again later.");
        return;
      }

      // Password validation
      const passwordErrors = []; // Array to hold password error messages
      if (trimmedPassword.length < 5) {
          passwordErrors.push("Password must be at least 5 characters long.");
      }
      if (!/[A-Z]/.test(trimmedPassword)) {
          passwordErrors.push("Password must contain at least one uppercase letter.");
      }
      if (!/[a-z]/.test(trimmedPassword)) {
          passwordErrors.push("Password must contain at least one lowercase letter.");
      }
      if (!/[0-9]/.test(trimmedPassword)) {
          passwordErrors.push("Password must contain at least one number.");
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmedPassword)) {
          passwordErrors.push("Password must contain at least one special character.");
      }

      // If there are any password errors, set the error message
      if (passwordErrors.length > 0) {
          setErrorMessage(passwordErrors); // Join errors with newline
          return;
      }
      
      // Prepare the user data
      const userData = {
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword,
        full_name: trimmedFullName,
      };

      // Only add profile_image if provided
      if (trimmedProfileImage) {
        userData.profile_image = trimmedProfileImage;
      }
    
      setLoading(true);
      setErrorMessage("");

      try {
        // Sending data to the backend using fetch
        const response = await fetch("http://127.0.0.1:5000/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (response.ok) {
          // Store token in either localStorage or sessionStorage
          if (rememberMe) {
            localStorage.setItem("auth_token", data.token);
          } else {
            sessionStorage.setItem("auth_token", data.token);
          }
          onRegisterSuccess();

          alert("User registered successfully");
          navigate("/app");
        } else {
          setErrorMessage(data.error || "Registration failed");
        }
      } catch (error) {
        setErrorMessage(`An error occurred. Please try again. ${error.message}`);
      } finally {
        setLoading(false);
      }
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
          placeholder="Enter your email address"
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
          placeholder="Enter your password"
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
          Profile Image (Optional)
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
        className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
};

export default UserRegistration;
