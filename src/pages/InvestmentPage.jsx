import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const InvestmentPage = () => {
  const [backgroundImage, setBackgroundImage] = useState('');
  const [loading, setLoading] = useState(true);

  // This will be updated when you provide the API endpoint
  const fetchBackgroundImage = async () => {
    try {
      // Placeholder - will be replaced with actual API call
      // const response = await fetch('YOUR_API_ENDPOINT_HERE');
      // const data = await response.json();
      // setBackgroundImage(data.imageUrl);
      
      // For now, using a placeholder
      setBackgroundImage('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching background image:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackgroundImage();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              We invest in the world's potential
            </motion.h1>
            
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-200 mb-8 max-w-3xl leading-relaxed"
            >
              The need for energy is universal. That's why Flowbite scientists and engineers are pioneering new 
              research and pursuing new technologies to reduce emissions while creating more efficient fuels. We're 
              committed to responsibly meeting the world's energy needs.
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 group">
                Learn more about the plan
                <svg 
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPage;
