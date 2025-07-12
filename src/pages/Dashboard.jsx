import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaTrash, FaCamera, FaClipboardList, FaCheckCircle, FaClock, FaSearch, FaLocationArrow } from 'react-icons/fa';
import { supabase } from '../supabaseClient';

function Dashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('report');
  // Add this state for offline detection
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Add states for location search functionality
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  // Initialize state for user reports
  const [userReports, setUserReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Remove duplicate state declarations (lines 28-31)
  
  // Initialize Supabase client
  // Remove the duplicate Supabase client initialization
  // const supabase = createClient(...) - DELETE THIS
  
  // Add this useEffect for online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch user's name from profiles table
  useEffect(() => {
    async function fetchUserName() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
            
          if (data && !error) {
            setUserName(data.name);
          } else if (error) {
            console.error('Error fetching user profile:', error);
          }
        } catch (err) {
          console.error('Network error fetching profile:', err);
        }
      }
    }
    
    fetchUserName();
  }, [user]);

  // Fetch user's reports from Supabase
  useEffect(() => {
    async function fetchUserReports() {
      if (user) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (data && !error) {
            setUserReports(data);
          } else if (error) {
            console.error('Error fetching reports:', error);
          }
        } catch (err) {
          console.error('Error in fetch operation:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    fetchUserReports();
  }, [user, supabase]);

  // Search location function
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setLocationError('');
    
    try {
      // Using OpenStreetMap Nominatim API for geocoding (free and doesn't require API key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
      setLocationError('Failed to search locations. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle location selection
  const handleLocationSelect = (result) => {
    setLocation(result.display_name);
    setLocationSearch(result.display_name);
    setSearchResults([]);
  };

  // Get current location
  const getCurrentLocation = () => {
    setLocationError('');
    setSearchLoading(true);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setSearchLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocoding to get address from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch location data');
          }
          
          const data = await response.json();
          setLocation(data.display_name);
          setLocationSearch(data.display_name);
        } catch (error) {
          console.error('Error getting current location:', error);
          setLocationError('Failed to get your current location. Please try again.');
        } finally {
          setSearchLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError(
          error.code === 1
            ? 'Location access denied. Please enable location services.'
            : 'Failed to get your current location. Please try again.'
        );
        setSearchLoading(false);
      }
    );
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (locationSearch) {
        searchLocation(locationSearch);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [locationSearch]);

  // Update the handleSubmit function to use the separate isSubmitting state
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location || !description) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Starting submission...');
    
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Submission timeout')), 10000);
    });
    
    try {
      console.log('Preparing report data...');
      const reportData = { 
        location, 
        description, 
        user_id: user.id,
        status: 'pending',  // Changed to lowercase
        created_at: new Date().toISOString()
      };

      console.log('Sending to Supabase...');
      // Race between the submission and timeout
      const { data, error } = await Promise.race([
        supabase
          .from('reports')
          .insert([reportData])
          .select(),
        timeoutPromise
      ]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Submission successful:', data);
      
      // Clear form
      setLocation('');
      setLocationSearch('');
      setDescription('');
      setImages([]);
      
      alert('Report submitted successfully!');
      setUserReports(prevReports => [data[0], ...prevReports]);

    } catch (error) {
      console.error('Submission error:', error);
      if (error.message === 'Submission timeout') {
        alert('Submission is taking too long. Please check your internet connection and try again.');
      } else {
        alert('Failed to submit report: ' + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
};

  // Add this condition before the main return
  if (!isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">You're offline</h2>
          <p className="text-gray-600 mb-4">Please check your internet connection and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header with user welcome */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center"
          >
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {userName || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="mt-2 text-green-100">
                Report garbage issues in your area and help keep our community clean.
              </p>
            </div>
            {/* Avatar section completely removed */}
          </motion.div>
        </div>
      </div>
      
      {/* Dashboard Tabs */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-white rounded-t-lg shadow-md flex overflow-x-auto">
          <button 
            className={`px-6 py-4 font-medium text-sm flex items-center ${activeTab === 'report' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'}`}
            onClick={() => setActiveTab('report')}
          >
            <FaTrash className="mr-2" /> Report Issue
          </button>
          <button 
            className={`px-6 py-4 font-medium text-sm flex items-center ${activeTab === 'history' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-green-600'}`}
            onClick={() => setActiveTab('history')}
          >
            <FaClipboardList className="mr-2" /> My Reports
          </button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'report' ? (
          <motion.div 
            className="bg-white p-8 rounded-b-lg rounded-tr-lg shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-green-700 flex items-center">
              <FaTrash className="mr-3 text-green-500" /> Report Garbage Issue
            </h2>
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="location">
                  <FaMapMarkerAlt className="inline mr-2 text-green-500" /> Location
                </label>
                {/* Replace the simple input with a search input and current location button */}
                <div className="relative">
                  <div className="flex">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-green-500" />
                      </div>
                      <input
                        type="text"
                        id="locationSearch"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Search for a location..."
                        onKeyDown={(e) => {
                          // Prevent form submission on Enter key
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (locationSearch) {
                              searchLocation(locationSearch);
                            }
                          }
                        }}
                      />
                      <input
                        type="hidden"
                        id="location"
                        value={location}
                        required
                      />
                    </div>
                    <button
                      type="button" // Explicitly set type to button
                      onClick={(e) => {
                        e.preventDefault(); // Prevent any form submission
                        getCurrentLocation();
                      }}
                      className="bg-green-100 text-green-700 px-4 py-3 rounded-r-lg border border-l-0 border-gray-200 hover:bg-green-200 flex items-center"
                    >
                      <FaLocationArrow className="mr-2" />
                      <span className="hidden sm:inline">Current Location</span>
                    </button>
                  </div>
                  
                  {searchLoading && (
                    <div className="mt-2 text-sm text-green-600">
                      <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-green-500 rounded-full"></div>
                        Searching...
                      </div>
                    </div>
                  )}
                  
                  {locationError && (
                    <div className="mt-2 text-sm text-red-600">
                      {locationError}
                    </div>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.place_id}
                          className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent any form submission
                            handleLocationSelect(result);
                          }}
                        >
                          {result.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {location && (
                  <div className="mt-2 text-sm text-green-600 flex items-center justify-between">
                    <div>
                      <strong>Selected location:</strong> {location}
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setLocation('');
                        setLocationSearch('');
                      }}
                      className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                      aria-label="Clear location"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  rows="4"
                  required
                  placeholder="Describe the garbage issue in detail"
                />
              </div>
              <div className="mb-8">
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="images">
                  <FaCamera className="inline mr-2 text-green-500" /> Upload Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    id="images"
                    onChange={(e) => setImages(Array.from(e.target.files))}
                    className="hidden"
                    multiple
                    accept="image/*"
                  />
                  <label htmlFor="images" className="cursor-pointer">
                    <FaCamera className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="text-gray-500">Click to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF (max. 5MB)</p>
                  </label>
                </div>
                {images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">{images.length} file(s) selected</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(images).map((file, index) => (
                        <div key={index} className="bg-gray-100 rounded px-3 py-1 text-sm">
                          {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" /> Submit Report
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-white p-8 rounded-b-lg rounded-tr-lg shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-green-700 flex items-center">
              <FaClipboardList className="mr-3 text-green-500" /> Your Reports
            </h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading your reports...</p>
              </div>
            ) : userReports.length > 0 ? (
              <div className="space-y-6">
                {userReports.map(report => (
                  <motion.div 
                    key={report.id} 
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    whileHover={{ y: -2 }}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{report.location}</h3>
                          <p className="text-gray-600 mt-1">{report.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          report.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status === 'Completed' ? <FaCheckCircle className="inline mr-1" /> : 
                           report.status === 'In Progress' ? <FaClock className="inline mr-1" /> :
                           <FaClock className="inline mr-1" />}
                          {report.status}
                        </span>
                      </div>
                      <div className="flex items-center mt-4 text-sm text-gray-500">
                        <FaMapMarkerAlt className="mr-1" />
                        <span className="mr-4">{report.location}</span>
                        <span>Reported on: {new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FaClipboardList className="mx-auto text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500 mb-4">You haven't submitted any reports yet.</p>
                <button 
                  onClick={() => setActiveTab('report')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Your First Report
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;