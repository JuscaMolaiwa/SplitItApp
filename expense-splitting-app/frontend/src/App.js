import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Lazy load pages and components for better performance
const UserLogin = lazy(() => import("./components/UserLogin"));
const UserRegistration = lazy(() => import("./components/UserRegistration"));
const UserSystemApp = lazy(() => import("./components/UserSystemApp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateGroup = lazy(() => import("./pages/CreateGroup"));
const GroupDetail = lazy(() => import("./pages/GroupDetail"));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  // PublicRoute for guests
  const PublicRoute = ({ children }) => {
    return !isAuthenticated ? children : <Navigate to="/app" />;
  };

  // PrivateRoute for authenticated users
  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
        <div className="app-container bg-gray-100 min-h-screen flex flex-col">
          <header>
            <h1 className="text-3xl font-bold text-center py-4">SplitItApp</h1>
            <Navbar />
          </header>

          <main className="flex-1 container mx-auto p-4">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <div className="form-container max-w-md mx-auto">
                      <UserLogin onLoginSuccess={handleLoginSuccess} />
                      <p className="text-center mt-4 text-sm">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-blue-600 hover:underline">
                          Register
                        </Link>
                      </p>
                    </div>
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <div className="form-container max-w-md mx-auto">
                      <UserRegistration onRegisterSuccess={handleLoginSuccess} />
                      <p className="text-center mt-4 text-sm">
                        Already have an account?{" "}
                        <Link to="/" className="text-blue-600 hover:underline">
                          Login
                        </Link>
                      </p>
                    </div>
                  </PublicRoute>
                }
              />

              {/* Private Routes */}
              <Route
                path="/app/*"
                element={
                  <PrivateRoute>
                    <UserSystemApp onLogout={handleLogout} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-group"
                element={
                  <PrivateRoute>
                    <CreateGroup />
                  </PrivateRoute>
                }
              />
              <Route
                path="/group/:id"
                element={
                  <PrivateRoute>
                    <GroupDetail />
                  </PrivateRoute>
                }
              />

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Suspense>
    </Router>
  );
}

export default App;
