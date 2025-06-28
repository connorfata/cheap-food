// src/App.jsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, DollarSign, Star, Clock, Utensils, Filter, X } from 'lucide-react';

function App() {
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Searching with Perplexity API for:', location);
      
      const prompt = `Find 8-10 real cheap restaurants (under $15 per meal) near ${location}, NYC. 
      Return ONLY a valid JSON array with no extra text. Format:
      [
        {
          "name": "restaurant name",
          "cuisine": "cuisine type", 
          "rating": 4.2,
          "price": "$",
          "address": "full address",
          "phone": "phone number or null",
          "estimated_delivery": "15-25 min"
        }
      ]`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      console.log('📝 Raw API response:', content);

      let restaurants = [];
      try {
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          restaurants = JSON.parse(jsonMatch[0]);
          console.log('✅ Parsed restaurants:', restaurants);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        console.log('❌ Parse error, using fallback');
        restaurants = [
          { name: "Joe's Pizza", cuisine: "Pizza", rating: 4.5, price: "$", address: "Soho, NY", phone: null, estimated_delivery: "15-25 min" },
          { name: "Xi'an Famous Foods", cuisine: "Chinese", rating: 4.3, price: "$", address: "Chinatown, NY", phone: null, estimated_delivery: "20-30 min" },
          { name: "Halal Guys", cuisine: "Middle Eastern", rating: 4.2, price: "$", address: "Midtown, NY", phone: null, estimated_delivery: "25-35 min" }
        ];
      }

      const transformedResults = restaurants.map((restaurant, index) => ({
        id: Date.now() + index,
        name: restaurant.name || 'Restaurant',
        cuisine: restaurant.cuisine || 'Restaurant',
        rating: restaurant.rating || 4.0,
        price: restaurant.price || '$',
        address: restaurant.address || `${location}, NYC`,
        phone: restaurant.phone || 'Phone not available',
        estimated_delivery: restaurant.estimated_delivery || '15-25 min',
        image: `https://images.unsplash.com/photo-${1513104890138 + index}?w=400&h=240&fit=crop&auto=format`
      }));

      setResults(transformedResults);
      
    } catch (error) {
      console.error('❌ API Error:', error);
      setError(`Search failed: ${error.message}. Please try again.`);
      setResults([]);
    }
    
    setLoading(false);
  };

  const filteredResults = results.filter(restaurant => {
    if (priceFilter === 'all') return true;
    return restaurant.price === priceFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cheap Eats</h1>
                <p className="text-sm text-gray-500">NYC's best budget bites</p>
              </div>
            </motion.div>
            
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-5 w-5 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Search Section */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white border-b"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter neighborhood (e.g., SoHo, Williamsburg)"
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-0 transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-4 bg-red-500 text-white rounded-2xl font-semibold text-lg hover:bg-red-600 disabled:opacity-50 transition-colors shadow-lg"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                'Find Food'
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {(showFilters || results.length > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-gray-700">Filter by:</span>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-0"
                  >
                    <option value="all">All Prices</option>
                    <option value="$">$ (Under $10)</option>
                    <option value="$$">$$ ($10-20)</option>
                  </select>
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6"
            >
              <p className="text-red-800 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Utensils className="h-8 w-8 text-white" />
              </motion.div>
              <p className="text-xl font-semibold text-gray-700">Finding amazing cheap eats...</p>
              <p className="text-gray-500 mt-2">Searching the best budget-friendly spots</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {filteredResults.length > 0 && !loading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {filteredResults.length} cheap eats near {location}
                </h2>
                <p className="text-gray-600">Delicious meals under $15 • Fast delivery</p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((restaurant) => (
                  <motion.div
                    key={restaurant.id}
                    variants={cardVariants}
                    whileHover={{ 
                      y: -8, 
                      transition: { duration: 0.2 } 
                    }}
                    className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-gray-100"
                  >
                    <div className="aspect-video bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                      <Utensils className="h-12 w-12 text-red-400" />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                          <Star className="h-4 w-4 text-green-600 fill-current" />
                          <span className="text-sm font-semibold text-green-700">
                            {restaurant.rating}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 font-medium">
                        {restaurant.cuisine}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <span className={`text-lg font-bold ${
                            restaurant.price === '$' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {restaurant.price}
                          </span>
                          
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">
                              {restaurant.estimated_delivery}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{restaurant.address}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty States */}
        <AnimatePresence>
          {filteredResults.length === 0 && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No matches for that price range
              </h3>
              <p className="text-gray-600">
                Try selecting "All Prices" to see more options
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results.length === 0 && !loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-8"
              >
                <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Discover NYC's Best Cheap Eats
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Find amazing meals under $15 in your neighborhood. From pizza slices to authentic ethnic cuisine.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {['🍕 Pizza', '🥟 Dumplings', '🌮 Tacos', '🥙 Halal'].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100"
                  >
                    <span className="text-lg font-semibold text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;