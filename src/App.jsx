import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import React, { useState, useEffect } from 'react';

// Main App component
function App() {
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Add a timeout to detect if the app is taking too long to load
    const timer = setTimeout(() => {
      if (!loaded) {
        console.log("App is taking too long to load");
        setError("App is taking too long to load. There might be an issue with authentication or component rendering.");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loaded]);

  // Wrap the main app content in an error boundary
  try {
    return (
      <>
        {error && (
          <div style={{ padding: '20px', backgroundColor: '#ffebee', color: '#c62828', margin: '20px', borderRadius: '5px' }}>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{ padding: '8px 16px', backgroundColor: '#c62828', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
            >
              Reload Page
            </button>
          </div>
        )}
        
        <AuthProvider>
          <Router>
            <AppRoutes setLoaded={setLoaded} />
          </Router>
        </AuthProvider>
      </>
    );
  } catch (err) {
    console.error("Error rendering App:", err);
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffebee', color: '#c62828', margin: '20px', borderRadius: '5px' }}>
        <h2>Fatal Error</h2>
        <p>{err.message}</p>
      </div>
    );
  }
}

// Separate component for routes
function AppRoutes({ setLoaded }) {
  useEffect(() => {
    console.log("AppRoutes mounted");
    setLoaded(true);
  }, [setLoaded]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Navbar />
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;