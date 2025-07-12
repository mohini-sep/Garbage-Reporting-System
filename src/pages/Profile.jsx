import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaSave, FaCamera, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  // Initialize Supabase client
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      
      // Fetch user profile data
      async function fetchProfile() {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name, phone, avatar_url')
            .eq('id', user.id)
            .single();
            
          if (data && !error) {
            setName(data.name || '');
            setPhone(data.phone || '');
            if (data.avatar_url) {
              setAvatarUrl(data.avatar_url);
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
      
      fetchProfile();
    }
  }, [user]);
  
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    setAvatar(file);
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setAvatarUrl(objectUrl);
    
    // Upload the file
    await uploadAvatar(file);
  };
  
  const uploadAvatar = async (file) => {
    try {
      setLoading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      // Update the user profile with the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date()
        });
        
      if (updateError) throw updateError;
      
      setMessage('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage('Error uploading profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          name,
          phone,
          updated_at: new Date()
        });
        
      if (error) throw error;
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div 
      className="min-h-screen py-12 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ 
        backgroundImage: `url('/waste-management-truck.jpg')`,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-600/80 to-green-700/80 rounded-t-xl text-white p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-lg backdrop-blur-sm">
            <div className="relative">
              {avatarUrl ? (
                <div className="h-28 w-28 rounded-full bg-white/20 overflow-hidden border-4 border-white/70 shadow-md">
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-28 w-28 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold border-4 border-white/70 shadow-md">
                  {name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <button 
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-green-500/90 hover:bg-green-400 p-2 rounded-full text-white shadow-md transition-all duration-300 hover:scale-110"
              >
                <FaCamera />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-shadow">{name || 'User'}</h1>
              <p className="text-green-100 mt-1">{email}</p>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm shadow-sm backdrop-blur-sm">
                  <FaMapMarkerAlt className="inline mr-1" /> Member
                </span>
              </div>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="bg-white/60 shadow-xl rounded-b-xl p-8 backdrop-blur-md">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-md ${
                  message.includes('Error') 
                    ? 'bg-red-100/70 text-red-700 border-l-4 border-red-500' 
                    : 'bg-green-100/70 text-green-700 border-l-4 border-green-500'
                }`}
              >
                {message}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-100/30 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-gray-300/30">Personal Information</h2>
                
                <div className="mb-6 transition-all duration-300 hover:translate-x-1">
                  <label className="block text-gray-700 mb-2 font-medium" htmlFor="name">
                    <FaUser className="inline mr-2 text-green-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm hover:shadow bg-white/50 backdrop-blur-sm"
                    placeholder="Your name"
                  />
                </div>
                
                <div className="mb-6 transition-all duration-300 hover:translate-x-1">
                  <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                    <FaEnvelope className="inline mr-2 text-green-500" /> Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200/50 rounded-lg bg-gray-50/50 text-gray-500 shadow-sm backdrop-blur-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div className="mb-6 transition-all duration-300 hover:translate-x-1">
                  <label className="block text-gray-700 mb-2 font-medium" htmlFor="phone">
                    <FaPhone className="inline mr-2 text-green-500" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm hover:shadow bg-white/50 backdrop-blur-sm"
                    placeholder="Your phone number"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600/90 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 font-medium flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-1 backdrop-blur-sm"
                >
                  <FaSave className="mr-2" /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      
      <style jsx>{`
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

export default Profile;