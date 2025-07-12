import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  // Initialize Supabase client for the test connection
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.includes('Network error')) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else if (error.includes('Invalid login')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(error || 'Failed to sign in. Please try again.');
        }
      } else {
        // Successful login - redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Removed the testConnection function

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-100 via-green-200 to-green-300">
      {/* Mountain landscape background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute bottom-0 w-full h-1/3 bg-green-900"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-2/5 bg-green-800 rounded-tr-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-1/4 h-3/5 bg-green-700 rounded-tr-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-3/5 bg-green-800 rounded-tl-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-1/5 h-2/5 bg-green-700 rounded-tl-3xl"></div>
        <div className="absolute top-10 right-20 text-green-900 text-xl">
          <span className="mr-4">✦</span>
          <span className="mr-4">✦</span>
          <span>✦</span>
        </div>
      </div>
      
      {/* Login card */}
      <motion.div 
        className="z-10 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 w-full max-w-md shadow-xl border border-white border-opacity-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center text-green-950 mb-8">Login</h2>

        {/* Display a more user-friendly error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            {error.includes('connection') && (
              <div className="mt-2">
                <p className="text-sm">
                  This could be due to:
                </p>
                <ul className="text-sm list-disc pl-5 mt-1">
                  <li>Supabase service being temporarily unavailable</li>
                  <li>Network restrictions or firewall settings</li>
                  <li>CORS issues if testing locally</li>
                </ul>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >
                  Refresh Page
                </button>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-green-600" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 w-full py-3 px-4 bg-white bg-opacity-70 rounded-full border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-950 placeholder-green-700"
              placeholder="Email ID"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-green-600" />
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 w-full py-3 px-4 bg-white bg-opacity-70 rounded-full border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-950 placeholder-green-700"
              placeholder="Password"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-green-950 font-medium">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-green-800 hover:text-green-600">
                Forgot Password?
              </a>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </div>
          
          {/* Removed the test connection button */}
          
          <div className="text-center text-sm text-green-950 font-medium">
            Don't have an account? <Link to="/register" className="font-bold text-green-800 hover:text-green-600">Register</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;