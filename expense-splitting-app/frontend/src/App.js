<<<<<<< HEAD
import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import UserLogin from './components/UserLogin';
import UserRegistration from './components/UserRegistration';
import UserSystemApp from './components/UserSystemApp';
import './styles/App.css';
import './App.css';
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
>>>>>>> 21f1e9a619a797ede48bdfa7933f99d70f7491f4

function App() {
  return (
    <Router>
<<<<<<< HEAD
      <Suspense fallback={<div>Loading...</div>}>
        <div className="app-container">
          <h1 className="app-title">SplitItApp</h1>
          <Routes>
            <Route 
              path="/" 
              element={
                !isAuthenticated ? (
                  <div className="form-container">
                    <UserLogin onLoginSuccess={handleLoginSuccess} />
                    <p className="redirect-text">
                      Don't have an account? <Link to="/register" className="link">Register</Link>
                    </p>
                  </div>
                ) : (
                  <Navigate to="/app" />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? (
                  <div className="form-container">
                    <UserRegistration onRegisterSuccess={handleLoginSuccess} />
                    <p className="redirect-text">
                      Already have an account? <Link to="/" className="link">Login</Link>
                    </p>
                  </div>
                ) : (
                  <Navigate to="/app" />
                )
              } 
            />
            <Route 
              path="/app/*" 
              element={isAuthenticated ? <UserSystemApp onLogout={handleLogout} /> : <Navigate to="/" />} 
            />
          </Routes>

          </div>
      </Suspense>
=======
      <div>
        <Navbar />
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/group/:id" element={<GroupDetail />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
>>>>>>> 21f1e9a619a797ede48bdfa7933f99d70f7491f4
    </Router>
  );
}

export default App;