// src/components/LandingPage.jsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Utensils, Star, Clock, DollarSign, Navigation } from 'lucide-react';

const LandingPage = ({ onStartSearch, onNearMeSearch, isGettingLocation }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = () => {
    if (searchInput.trim()) {
      onStartSearch(searchInput.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const quickSearchLocations = [
    'SoHo', 'Williamsburg', 'East Village', 'Chelsea',
    'Lower East Side', 'Midtown', 'Brooklyn Heights', 'Chinatown'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-8"
            >
              <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-xl">
                <Utensils className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Cheap Eats
              <span className="text-primary-600"> NYC</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto"
            >
              Discover amazing budget-friendly restaurants in your neighborhood. 
              From $3 pizza slices to $10 authentic ethnic cuisine.
            </motion.p>

            {/* Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter neighborhood (e.g., SoHo, East Village)"
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-0 bg-white shadow-lg"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  className="px-8 py-4 bg-gradient-primary text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Search className="h-6 w-6" />
                  <span>Find Food</span>
                </motion.button>
              </div>

              {/* Near Me Button - Enhanced */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
                className="flex justify-center"
              >
                <div className="flex flex-col items-center space-y-3">
                  {/* Divider */}
                  <div className="flex items-center space-x-4 w-full max-w-xs">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
                    <span className="text-sm text-gray-500 font-medium">or</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
                  </div>
                  
                  {/* Near Me Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNearMeSearch}
                    disabled={isGettingLocation}
                    className="group relative px-8 py-4 bg-white border-2 border-emerald-500 text-emerald-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:bg-emerald-50 transition-all flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Subtle background pulse when loading */}
                    {isGettingLocation && (
                      <div className="absolute inset-0 bg-emerald-500 opacity-10 rounded-2xl animate-pulse"></div>
                    )}
                    
                    {isGettingLocation ? (
                      <>
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span>Finding your location...</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <Navigation className="h-6 w-6 group-hover:scale-110 transition-transform" />
                          {/* Subtle pulse ring */}
                          <div className="absolute inset-0 rounded-full border-2 border-emerald-500 opacity-0 group-hover:opacity-30 animate-ping"></div>
                        </div>
                        <span className="group-hover:text-emerald-700 transition-colors">Find Food Near Me</span>
                        <span className="text-emerald-400 text-lg group-hover:scale-110 transition-transform">📍</span>
                      </>
                    )}
                  </motion.button>
                  
                  {/* Helpful text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-sm text-gray-500 text-center max-w-xs"
                  >
                    We'll find cheap eats within 2 miles of your location
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Quick Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="max-w-7xl mx-auto px-4 py-12"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular Neighborhoods</h2>
          <p className="text-gray-600">Quick search in NYC's foodie hotspots</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickSearchLocations.map((location, index) => (
            <motion.button
              key={location}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStartSearch(location)}
              className="p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-primary-300"
            >
              <span className="font-semibold text-gray-800">{location}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="max-w-7xl mx-auto px-4 py-16"
      >
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="text-center p-8 bg-white rounded-3xl shadow-lg"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Budget Friendly</h3>
            <p className="text-gray-600">
              Find delicious meals under $20. From $3 pizza slices to $15 full dinners.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="text-center p-8 bg-white rounded-3xl shadow-lg"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Location Based</h3>
            <p className="text-gray-600">
              Discover hidden gems in your neighborhood or anywhere in NYC.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="text-center p-8 bg-white rounded-3xl shadow-lg"
          >
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Top Rated</h3>
            <p className="text-gray-600">
              Only restaurants with great reviews and popular dishes included.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Sample Results Preview */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        className="max-w-7xl mx-auto px-4 py-16 bg-gray-50"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What You'll Find</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real restaurants with actual menu prices, ratings, and locations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Card 1 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="aspect-video bg-gradient-food flex items-center justify-center">
              <span className="text-4xl">🍕</span>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Joe's Pizza</h3>
                <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 text-green-600 fill-current" />
                  <span className="text-sm font-semibold text-green-700">4.5</span>
                </div>
              </div>
              <p className="text-gray-600 mb-3">Pizza • $</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Plain Cheese Slice</span>
                  <span className="font-semibold text-primary-600">$3.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Pepperoni Slice</span>
                  <span className="font-semibold text-primary-600">$3.50</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sample Card 2 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="aspect-video bg-gradient-food flex items-center justify-center">
              <span className="text-4xl">🥟</span>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Xi'an Famous Foods</h3>
                <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 text-green-600 fill-current" />
                  <span className="text-sm font-semibold text-green-700">4.3</span>
                </div>
              </div>
              <p className="text-gray-600 mb-3">Chinese • $</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Hand-Pulled Noodles</span>
                  <span className="font-semibold text-primary-600">$10.95</span>
                </div>
                <div className="flex justify-between">
                  <span>Pork Dumplings</span>
                  <span className="font-semibold text-primary-600">$8.25</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sample Card 3 */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden md:col-span-2 lg:col-span-1"
          >
            <div className="aspect-video bg-gradient-food flex items-center justify-center">
              <span className="text-4xl">🥙</span>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">The Halal Guys</h3>
                <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 text-green-600 fill-current" />
                  <span className="text-sm font-semibold text-green-700">4.2</span>
                </div>
              </div>
              <p className="text-gray-600 mb-3">Middle Eastern • $</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Chicken Over Rice</span>
                  <span className="font-semibold text-primary-600">$9.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Mixed Platter</span>
                  <span className="font-semibold text-primary-600">$11.00</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Utensils className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Cheap Eats NYC</h3>
          <p className="text-gray-400">
            Discover budget-friendly restaurants across New York City
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;