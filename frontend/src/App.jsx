import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import ProfilePage from "./pages/ProfilePage";
import API from "./api/api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Read token when the route is rendered, not when App first mounted.
// Fixes: after login, navigate("/") was using stale token and redirecting back to login.
function HomeRoute({ activeSection, setActiveSection }) {
  const token = localStorage.getItem("token");
  return token ? (
    <HomePage activeSection={activeSection} setActiveSection={setActiveSection} />
  ) : (
    <Navigate to="/login" replace />
  );
}

function LoginRoute({ activeSection, setActiveSection }) {
  const token = localStorage.getItem("token");
  return token ? (
    <Navigate to="/" replace />
  ) : (
    <LoginRegisterPage activeSection={activeSection} setActiveSection={setActiveSection} />
  );
}

function App() {
  const [activeSection, setActiveSection] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [connectingMessage, setConnectingMessage] = useState("Waking up server...");

  useEffect(() => {
    let active = true;
    let retries = 0;
    const checkConnection = async () => {
      try {
        await API.get("/health");
        if (active) {
          setBackendConnected(true);
        }
      } catch (err) {
        console.warn("Backend connection failed, retrying...", err);
        if (active) {
          retries++;
          if (retries > 3) {
            setConnectingMessage("Server is taking a moment to spin up, please stand by...");
          }
          setTimeout(checkConnection, 3000); // Retry every 3 seconds
        }
      }
    };
    checkConnection();
    return () => {
      active = false;
    };
  }, []);

  if (!backendConnected) {
    return (
      <div className="backend-loading-screen">
        <div className="stars"></div>
        <div className="backend-loading-container">
          <div className="backend-loading-logo">MyService</div>
          <div className="spinner"></div>
          <div className="backend-loading-title">Connecting to Backend</div>
          <p className="backend-loading-text">{connectingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<HomeRoute activeSection={activeSection} setActiveSection={setActiveSection} />}
        />
        <Route
          path="/login"
          element={<LoginRoute activeSection={activeSection} setActiveSection={setActiveSection} />}
        />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </Router>
  );
}

export default App;
