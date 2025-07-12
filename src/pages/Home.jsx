import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaTruck, FaBroom, FaLeaf, FaRecycle } from 'react-icons/fa';
import { useEffect } from 'react';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Updated handler to always redirect to login page
  const handleStartHere = () => {
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12">
        <div className="text-center">
          <motion.div
            className="inline-block mb-6 p-2 bg-green-100 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-green-500 rounded-full p-3">
              <FaRecycle className="text-white text-3xl" />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-4 text-green-800 tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Trash Tracker
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-green-700 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Creating cleaner communities through citizen-powered waste reporting.
            <span className="block mt-2 text-lg text-green-600">
              Report, track, and help clean up your neighborhood.
            </span>
          </motion.p>
          
          {/* Animated Garbage Truck */}
          <motion.div
            className="mb-10 relative h-24"
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.div
              animate={{ 
                x: [-200, 200, -200], 
                scaleX: [1, 1, -1, -1, 1]
              }}
              transition={{ 
                x: { duration: 10, repeat: Infinity, repeatType: "loop" },
                scaleX: { duration: 10, times: [0, 0.5, 0.5, 1, 1], repeat: Infinity }
              }}
              className="absolute left-1/2 transform -translate-x-1/2"
            >
              <div className="relative">
                <span className="text-6xl">🚛</span>
                <motion.span 
                  className="absolute -top-4 -right-2 text-2xl"
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ♻️
                </motion.span>
              </div>
            </motion.div>
          </motion.div>

          <motion.button 
            onClick={handleStartHere}
            className="px-8 py-4 bg-green-600 text-white rounded-full text-lg font-semibold shadow-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2 transform hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Start Reporting</span>
            <FaMapMarkerAlt />
          </motion.button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative z-10 bg-white bg-opacity-80 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-green-800">How It Works</h2>
          <p className="text-center text-green-600 mb-12 max-w-2xl mx-auto">
            Join thousands of citizens making a difference in their communities through our simple three-step process.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              className="bg-white rounded-xl shadow-md p-6 text-center relative overflow-hidden border-t-4 border-blue-500"
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-4 text-blue-500 flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  <FaMapMarkerAlt />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Report the Location</h3>
              <p className="text-gray-600">Spot garbage? Mark the location and submit details with our easy-to-use reporting tool.</p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-md p-6 text-center relative overflow-hidden border-t-4 border-green-500"
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-4 text-green-500 flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <FaTruck />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Track the Progress</h3>
              <p className="text-gray-600">Follow the status of your reports and see when cleanup crews are dispatched to the area.</p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-md p-6 text-center relative overflow-hidden border-t-4 border-purple-500"
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-4 text-purple-500 flex justify-center">
                <div className="bg-purple-100 p-4 rounded-full">
                  <FaLeaf />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Enjoy Clean Spaces</h3>
              <p className="text-gray-600">Experience the satisfaction of contributing to cleaner, healthier public spaces in your community.</p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Impact Stats Section */}
      <div className="relative z-10 py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">2,500+</div>
              <div className="text-green-200">Reports Submitted</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,800+</div>
              <div className="text-green-200">Cleanups Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">120+</div>
              <div className="text-green-200">Neighborhoods Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15 tons</div>
              <div className="text-green-200">Waste Removed</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 bg-green-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2023 Trash Tracker. All rights reserved.</p>
          <p className="text-green-300 text-sm">Making communities cleaner, one report at a time.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;