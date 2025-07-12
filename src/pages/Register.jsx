import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

function Register() {
  // All hooks must be at the top level of the component
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Add a timeout to detect if the request is taking too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('Registration is taking longer than expected. This might be due to server issues. Please try again later.');
      }
    }, 10000); // 10 seconds timeout
    
    try {
      // First check if passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }
      
      // Show a more specific loading message
      setRegistrationStep('Creating your account...');
      
      const { data, error: signUpError } = await signUp(email, password);
      
      if (signUpError) throw new Error(signUpError);
      
      // Update loading message
      setRegistrationStep('Setting up your profile...');
      
      // Create a profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user.id,
            name: name,
            email: email
          }
        ]);
        
      if (profileError) throw new Error(profileError.message);
      
      // Success - redirect or show success message
      setRegistrationStep('Success!');
      navigate('/login');
      
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message.includes('network') || err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-100 via-green-200 to-green-300">
      {/* Mountain landscape background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute bottom-0 w-full h-1/3 bg-green-900"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-2/5 bg-green-800 rounded-tr-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-1/4 h-3/5 bg-green-700 rounded-tr-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-3/5 bg-green-800 rounded-tl-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-1/5 h-2/5 bg-green-700 rounded-tl-3xl"></div>
      </div>
      
      {/* Registration card */}
      <motion.div 
        className="z-10 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 w-full max-w-md shadow-xl border border-white border-opacity-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center text-green-950 mb-8">Create Account</h2>
        
        {/* Display error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {/* Display loading indicator with current step */}
        {loading && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>{registrationStep || 'Processing your registration...'}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-green-600" />
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="pl-10 w-full py-3 px-4 bg-white bg-opacity-70 rounded-full border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-950 placeholder-green-700"
              placeholder="Full Name"
            />
          </div>
          
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
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-green-600" />
            </div>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-10 w-full py-3 px-4 bg-white bg-opacity-70 rounded-full border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-950 placeholder-green-700"
              placeholder="Confirm Password"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
          
          <div className="text-center text-sm text-green-950 font-medium">
            Already have an account? <Link to="/login" className="font-bold text-green-800 hover:text-green-600">Login</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Register;