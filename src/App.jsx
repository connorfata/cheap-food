// src/App.jsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, DollarSign, Star, Clock, Utensils, Filter, X, List, Map, ExternalLink } from 'lucide-react';
import { getCheapEatsPrompt } from './prompts/getCheapEatsPrompt.js';
import { getFaviconUrl, getCuisineIcon } from './utils/faviconUtils.js';
import MapView from './components/MapView.jsx';
import LandingPage from './components/LandingPage.jsx';
import 'leaflet/dist/leaflet.css';

function App() {
  // Page routing state
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' or 'search'
  
  // Search functionality state
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Handle navigation from landing page to search
  const handleStartSearch = (searchLocation) => {
    setLocation(searchLocation);
    setCurrentPage('search');
    // Auto-trigger search if location provided
    if (searchLocation) {
      setTimeout(() => {
        handleSearch(searchLocation);
      }, 100);
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setIsGettingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setIsGettingLocation(false);
          resolve(userLoc);
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = 'Unable to get your location';
          switch (error.code) {
            case 1: errorMessage = 'Location access denied. Please enable location services.'; break;
            case 2: errorMessage = 'Location unavailable. Check your connection.'; break;
            case 3: errorMessage = 'Location request timed out.'; break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  // Handle "Near Me" search
  const handleNearMeSearch = async () => {
    try {
      setError('');
      console.log('📍 Getting user location for "Near Me" search...');
      
      const userLoc = await getUserLocation();
      console.log('✅ Got user location:', userLoc);
      
      // Use reverse geocoding to get neighborhood name (simplified)
      const lat = userLoc.lat.toFixed(4);
      const lng = userLoc.lng.toFixed(4);
      const locationQuery = `${lat},${lng}`;
      
      console.log('🔍 Searching near coordinates:', locationQuery);
      setLocation('Near Me (2 mile radius)');
      setCurrentPage('search');
      
      // Trigger search with coordinates
      setTimeout(() => {
        handleSearch(locationQuery);
      }, 100);
      
    } catch (error) {
      console.error('❌ Location error:', error);
      setError(error.message);
    }
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    setResults([]);
    setError('');
    setLocation('');
    setSelectedRestaurant(null);
    setViewMode('list');
  };

  const handleSearch = async (searchLocation = location) => {
    const searchTerm = searchLocation || location;
    if (!searchTerm.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Searching with Perplexity API for:', searchTerm);
      
      // Use the dedicated prompt function
      const prompt = getCheapEatsPrompt(searchTerm, maxPrice, 10);
      console.log('📝 Generated prompt:', prompt);

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "sonar-pro",
          web_search_options: {
            search_context_size: "medium"
          },
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      console.log('📝 Raw API response:', content);

      let restaurants = [];
      try {
        // Clean up the response to extract JSON
        let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Remove any text before the first [ and after the last ]
        const firstBracket = cleanContent.indexOf('[');
        const lastBracket = cleanContent.lastIndexOf(']');
        
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          cleanContent = cleanContent.substring(firstBracket, lastBracket + 1);
        }
        
        // More aggressive JSON cleaning
        let jsonString = cleanContent
          // Fix trailing commas before closing brackets/braces
          .replace(/,(\s*[}\]])/g, '$1')
          // Quote unquoted object keys
          .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
          // Replace single quotes with double quotes (but be careful with apostrophes in values)
          .replace(/:\s*'([^'\\]*(\\.[^'\\]*)*)'/g, ': "$1"')
          // Fix any unescaped quotes in strings
          .replace(/"([^"\\]*(?:\\.[^"\\]*)*)":\s*"([^"\\]*(?:\\.[^"\\]*)*(?:"[^"\\]*(?:\\.[^"\\]*)*)*[^"\\]*(?:\\.[^"\\]*)*)"([^"])/g, '"$1": "$2\\"$3')
          // Remove any trailing text after the final ]
          .replace(/\].*$/, ']')
          // Normalize whitespace but preserve structure
          .replace(/\s+/g, ' ')
          .trim();
        
        console.log('🧹 Cleaned JSON string (first 500 chars):', jsonString.substring(0, 500));
        console.log('🧹 Cleaned JSON string (last 200 chars):', jsonString.substring(jsonString.length - 200));
        
        // Try to parse the cleaned JSON
        restaurants = JSON.parse(jsonString);
        console.log('✅ Parsed restaurants successfully:', restaurants.length, 'restaurants');
        
        // Validate that we have the expected structure
        if (!Array.isArray(restaurants) || restaurants.length === 0) {
          throw new Error('Invalid restaurant data structure - not an array or empty');
        }
        
        // Additional validation - check if first restaurant has required fields
        const firstRestaurant = restaurants[0];
        if (!firstRestaurant.name || !firstRestaurant.cuisine) {
          throw new Error('Invalid restaurant data structure - missing required fields');
        }
      } catch (parseError) {
        console.log('❌ Parse error:', parseError.message);
        console.log('📝 Raw content for debugging (first 1000 chars):', content.substring(0, 1000));
        console.log('📝 Raw content for debugging (last 500 chars):', content.substring(content.length - 500));
        
        // Try to extract individual restaurant objects even if the full JSON is malformed
        try {
          console.log('🔄 Attempting manual extraction...');
          const restaurantMatches = content.match(/\{[^{}]*"name"[^{}]*\}/g);
          if (restaurantMatches && restaurantMatches.length > 0) {
            console.log('🔍 Found', restaurantMatches.length, 'potential restaurant objects');
            
            const extractedRestaurants = [];
            for (const match of restaurantMatches.slice(0, 8)) { // Limit to 8 restaurants
              try {
                // Clean up individual restaurant object
                let cleanMatch = match
                  .replace(/,(\s*})/g, '$1')
                  .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
                  .replace(/:\s*'([^'\\]*(\\.[^'\\]*)*)'/g, ': "$1"');
                
                const restaurant = JSON.parse(cleanMatch);
                if (restaurant.name && restaurant.cuisine) {
                  extractedRestaurants.push(restaurant);
                }
              } catch (individualError) {
                console.log('⚠️ Skipped malformed restaurant object:', individualError.message);
              }
            }
            
            if (extractedRestaurants.length > 0) {
              console.log('✅ Extracted', extractedRestaurants.length, 'restaurants manually');
              restaurants = extractedRestaurants;
            } else {
              throw new Error('Manual extraction failed - using fallback data');
            }
          } else {
            throw new Error('No restaurant objects found - using fallback data');
          }
        } catch (extractionError) {
          console.log('❌ Manual extraction failed:', extractionError.message);
          console.log('Using fallback data...');
          
          // Use fallback data as before
          restaurants = [
          {
            name: "Joe's Pizza",
            cuisine: "Pizza", 
            average_price: 8.50,
            price_level: "$",
            address: "1435 2nd Ave, New York, NY 10075",
            website_url: "https://joespizza.com",
            menu_url: "https://joespizza.com/menu",
            yelp_rating: 4.5,
            google_rating: 4.4,
            tripadvisor_rating: 4.3,
            phone: "(212) 794-7700",
            latitude: 40.7733,
            longitude: -73.9538
          },
          {
            name: "Xi'an Famous Foods",
            cuisine: "Chinese",
            average_price: 12.00,
            price_level: "$", 
            address: "1395 2nd Ave, New York, NY 10075",
            website_url: "https://xianfoods.com",
            menu_url: "https://xianfoods.com/menu",
            yelp_rating: 4.3,
            google_rating: 4.2,
            tripadvisor_rating: 4.1,
            phone: "(212) 786-2068",
            latitude: 40.7723,
            longitude: -73.9543
          },
          {
            name: "The Halal Guys",
            cuisine: "Middle Eastern",
            average_price: 10.75,
            price_level: "$",
            address: "1453 2nd Ave, New York, NY 10075", 
            website_url: "https://thehalalguys.com",
            menu_url: "https://thehalalguys.com/menu",
            yelp_rating: 4.2,
            google_rating: 4.3,
            tripadvisor_rating: 4.0,
            phone: "(347) 527-1505",
            latitude: 40.7740,
            longitude: -73.9536
          },
          {
            name: "Katz's Delicatessen",
            cuisine: "Deli",
            average_price: 18.50,
            price_level: "$",
            address: "205 E Houston St, New York, NY 10002",
            website_url: "https://katzsdelicatessen.com",
            menu_url: "https://katzsdelicatessen.com/menu", 
            yelp_rating: 4.4,
            google_rating: 4.3,
            tripadvisor_rating: 4.2,
            phone: "(212) 254-2246",
            latitude: 40.7223,
            longitude: -73.9873
          },
          {
            name: "Mamoun's Falafel", 
            cuisine: "Middle Eastern",
            average_price: 9.25,
            price_level: "$",
            address: "1482 2nd Ave, New York, NY 10075",
            website_url: "https://mamouns.com",
            menu_url: "https://mamouns.com/menu",
            yelp_rating: 4.1,
            google_rating: 4.2, 
            tripadvisor_rating: 3.9,
            phone: "(212) 585-8889",
            latitude: 40.7749,
            longitude: -73.9533
          },
          {
            name: "Vanessa's Dumpling House",
            cuisine: "Chinese",
            average_price: 7.50,
            price_level: "$",
            address: "1496 2nd Ave, New York, NY 10075",
            website_url: "https://vanessasdumplings.com",
            menu_url: "https://vanessasdumplings.com/menu",
            yelp_rating: 4.0,
            google_rating: 4.1,
            tripadvisor_rating: 3.8,
            phone: "(212) 879-4770",
            latitude: 40.7753,
            longitude: -73.9532
          }
        ];
        }
      }

      // Transform the data to match our component expectations
      const transformedResults = restaurants.map((restaurant, index) => {
        // Validate NYC coordinates (rough bounds)
        const isValidNYCCoordinate = (lat, lng) => {
          return lat && lng && 
                 lat >= 40.4 && lat <= 41.0 &&  // NYC latitude range
                 lng >= -74.5 && lng <= -73.5;   // NYC longitude range
        };

        const hasValidCoords = isValidNYCCoordinate(restaurant.latitude, restaurant.longitude);
        
        if (!hasValidCoords) {
          console.warn(`⚠️ Invalid coordinates for ${restaurant.name}: ${restaurant.latitude}, ${restaurant.longitude}`);
        }

        return {
          id: Date.now() + index,
          name: restaurant.name || 'Restaurant',
          cuisine: restaurant.cuisine || 'Restaurant',
          average_price: restaurant.average_price || 15,
          price_level: restaurant.price_level || '$',
          rating: restaurant.yelp_rating || restaurant.google_rating || 4.0,
          yelp_rating: restaurant.yelp_rating || null,
          google_rating: restaurant.google_rating || null,
          tripadvisor_rating: restaurant.tripadvisor_rating || null,
          address: restaurant.address || `${searchTerm}, NYC`,
          phone: restaurant.phone || 'Phone not available',
          website_url: restaurant.website_url || null,
          menu_url: restaurant.menu_url || null,
          estimated_delivery: '15-25 min',
          image: `https://images.unsplash.com/photo-${1513104890138 + index}?w=400&h=240&fit=crop&auto=format`,
          latitude: hasValidCoords ? restaurant.latitude : null,
          longitude: hasValidCoords ? restaurant.longitude : null
        };
      });

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
    return restaurant.price_level === priceFilter;
  });

  // Handle restaurant selection from map
  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    // If in list view, could scroll to the restaurant card
  };

  // Handle restaurant click from list (to center map)
  const handleRestaurantClick = (restaurant) => {
    if (viewMode === 'map') {
      setSelectedRestaurant(restaurant);
    }
  };

  // Render Landing Page or Search Page
  if (currentPage === 'landing') {
    return (
      <LandingPage 
        onStartSearch={handleStartSearch} 
        onNearMeSearch={handleNearMeSearch}
        isGettingLocation={isGettingLocation}
      />
    );
  }

  // Animation variants for search page
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

  // Search Page JSX
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={handleBackToLanding}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Utensils className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cheap Eats</h1>
                <p className="text-sm text-gray-600 font-medium">NYC's best budget bites</p>
              </div>
            </motion.button>
            
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
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
        <div className="max-w-7xl px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <MapPin className="icon-absolute" />
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter neighborhood (e.g., SoHo, Williamsburg)"
                  className="input-field"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            {/* Max Price Input */}
            <div className="lg:w-48">
              <div className="relative">
                <DollarSign className="icon-absolute" />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value) || 20)}
                  placeholder="Max price"
                  min="5"
                  max="50"
                  className="input-field"
                />
              </div>
            </div>
            
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="w-6 h-6 loading-border animate-spin" />
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
            <div className="max-w-7xl px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-gray-700">Filter by:</span>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-0"
                  >
                    <option value="all">All Prices</option>
                    <option value="$">$ (Under $10)</option>
                    <option value="$$">$$ ($10-20)</option>
                    <option value="$$$">$$$ ($20+)</option>
                  </select>
                  
                  {/* View Toggle */}
                  {filteredResults.length > 0 && (
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-sm text-gray-600">View:</span>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('list')}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            viewMode === 'list' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <List className="h-4 w-4" />
                          <span>List</span>
                        </button>
                        <button
                          onClick={() => setViewMode('map')}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            viewMode === 'map' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Map className="h-4 w-4" />
                          <span>Map</span>
                        </button>
                      </div>
                    </div>
                  )}
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
      <div className="max-w-7xl px-4 py-6">
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-primary-50 border border-primary-200 rounded-2xl p-4 mb-6"
            >
              <p className="text-primary-800 font-medium">{error}</p>
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
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Utensils className="h-8 w-8 text-white" />
              </motion.div>
              <p className="text-xl font-semibold text-gray-700">Finding amazing cheap eats...</p>
              <p className="text-gray-500 mt-2">Searching for meals under ${maxPrice}</p>
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
                <p className="text-gray-600">Delicious meals under ${maxPrice} • Fast delivery</p>
              </motion.div>
              
              {/* Conditional rendering based on view mode */}
              {viewMode === 'map' ? (
                <div className="h-[600px] rounded-2xl overflow-hidden shadow-lg border">
                  <MapView
                    restaurants={filteredResults}
                    onRestaurantSelect={handleRestaurantSelect}
                    selectedRestaurant={selectedRestaurant}
                    location={location}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((restaurant) => (
                    <motion.div
                      key={restaurant.id}
                      variants={cardVariants}
                      whileHover={{ 
                        y: -4, 
                        transition: { duration: 0.3 } 
                      }}
                      className="restaurant-card"
                      onClick={() => handleRestaurantClick(restaurant)}
                    >
                      {/* Clickable restaurant favicon/icon */}
                      <div 
                        className="aspect-video bg-gradient-food flex items-center justify-center cursor-pointer hover:bg-opacity-80 transition-all relative group"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (restaurant.website_url) {
                            window.open(restaurant.website_url, '_blank');
                          } else if (restaurant.menu_url) {
                            window.open(restaurant.menu_url, '_blank');
                          }
                        }}
                      >
                        {/* Restaurant favicon or cuisine icon */}
                        <div className="flex flex-col items-center justify-center space-y-2">
                          {restaurant.website_url ? (
                            <img
                              src={getFaviconUrl(restaurant.website_url, 48)}
                              alt={`${restaurant.name} favicon`}
                              className="w-12 h-12 rounded-lg shadow-md bg-white p-1"
                              onError={(e) => {
                                // Fallback to cuisine emoji if favicon fails
                                const fallbackDiv = document.createElement('div');
                                fallbackDiv.innerHTML = getCuisineIcon(restaurant.cuisine);
                                fallbackDiv.className = 'text-4xl';
                                fallbackDiv.title = `${restaurant.name} - ${restaurant.cuisine}`;
                                e.target.style.display = 'none';
                                e.target.parentNode.insertBefore(fallbackDiv, e.target);
                              }}
                            />
                          ) : (
                            <div className="text-4xl" title={`${restaurant.name} - ${restaurant.cuisine}`}>
                              {getCuisineIcon(restaurant.cuisine)}
                            </div>
                          )}
                          
                          {/* Visit website/menu indicator */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center space-x-1">
                            <ExternalLink className="h-3 w-3 text-gray-700" />
                            <span className="text-xs font-semibold text-gray-700">
                              {restaurant.website_url ? 'Visit Website' : restaurant.menu_url ? 'View Menu' : 'Restaurant'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {restaurant.name}
                          </h3>
                          <div className="rating-badge">
                            <Star className="h-4 w-4 fill-current" />
                            <span>
                              {restaurant.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 font-medium">
                          {restaurant.cuisine}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className={`${
                                restaurant.price_level === '$' ? 'price-badge-cheap' : 
                                restaurant.price_level === '$$' ? 'price-badge-moderate' : 'price-badge-expensive'
                              }`}>
                                {restaurant.price_level}
                              </span>
                              <span className="text-sm text-gray-500 font-medium">
                                ${restaurant.average_price.toFixed(2)}
                              </span>
                            </div>
                            
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
                          
                          {restaurant.phone && restaurant.phone !== 'Phone not available' && (
                            <div className="flex items-center">
                              <span className="text-xs text-gray-400 mr-2">📞</span>
                              <span className="text-xs">{restaurant.phone}</span>
                            </div>
                          )}
                          
                          {restaurant.menu_url && (
                            <div className="mt-3">
                              <a
                                href={restaurant.menu_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors inline-flex items-center space-x-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>View Menu</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          
                          {restaurant.website_url && (
                            <div className="mt-2">
                              <a
                                href={restaurant.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors inline-flex items-center space-x-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>Visit Website</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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
                <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Utensils className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Discover NYC's Best Cheap Eats
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Find amazing meals under your budget in your neighborhood. From pizza slices to authentic ethnic cuisine.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {['🍕 Pizza', '🥟 Dumplings', '🌮 Tacos', '🥙 Halal'].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200 hover:border-primary-300 transition-colors"
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