import React from "react";
import { Link } from "react-router-dom";

function Navbar({ isAuthenticated, onLogout }) {
  return (
    <nav
      style={{
        backgroundColor: "#5A4FCF", // Indigo purple theme
        color: "white",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <Link
          to="/"
          style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}
        >
          SplitItApp
        </Link>
      </div>
      <div>
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              style={{
                color: "white",
                marginRight: "1rem",
                textDecoration: "none",
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/create-group"
              style={{
                color: "white",
                marginRight: "1rem",
                textDecoration: "none",
              }}
            >
              Create Group
            </Link>
            <button
              onClick={onLogout}
              style={{
                backgroundColor: "#4B3B9D", // Darker indigo for button
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/"
              style={{
                color: "white",
                marginRight: "1rem",
                textDecoration: "none",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{
                color: "white",
                textDecoration: "none",
                border: "1px solid white",
                borderRadius: "5px",
                padding: "0.5rem 1rem",
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
