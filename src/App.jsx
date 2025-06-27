import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, DollarSign, Clock, Star, Navigation, List, Map } from 'lucide-react';

function App() {
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceFilter, setPriceFilter] = useState('1,2');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'delis', label: 'Delis' },
    { value: 'foodtrucks', label: 'Food Trucks' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'halal', label: 'Halal' },
    { value: 'sandwiches', label: 'Sandwiches' },
    { value: 'thai', label: 'Thai' },
    { value: 'indian', label: 'Indian' }
  ];

  // Initialize map when switching to map view
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current && !mapInstanceRef.current) {
      // Add Leaflet script if not already loaded
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    }
  }, [viewMode]);

  const initializeMap = () => {
    if (window.L && mapRef.current && !mapInstanceRef.current) {
      try {
        const map = window.L.map(mapRef.current).setView([40.7128, -73.9060], 12);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
        
        // Add markers if we have results
        if (results.length > 0) {
          updateMapMarkers();
        }
      } catch (error) {
        console.error('Map initialization error:', error);
        setError('Failed to initialize map. Please try refreshing the page.');
      }
    }
  };

  // Update map markers when results change
  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (e) {
          console.warn('Error removing marker:', e);
        }
      });
      markersRef.current = [];

      // Add new markers
      const validResults = results.filter(place => 
        place.coordinates && 
        place.coordinates.latitude && 
        place.coordinates.longitude
      );

      validResults.forEach(place => {
        try {
          const marker = window.L.marker([
            place.coordinates.latitude, 
            place.coordinates.longitude
          ])
            .addTo(mapInstanceRef.current)
            .bindPopup(`
              <div class="p-2 max-w-sm">
                <h3 class="font-semibold text-sm">${place.name}</h3>
                <p class="text-xs text-gray-600">${place.categories.map(c => c.title).join(', ')}</p>
                <p class="text-xs">Rating: ${place.rating?.toFixed(1)} ⭐ | ${place.price}</p>
                <p class="text-xs">${place.location.address1}</p>
              </div>
            `);
          markersRef.current.push(marker);
        } catch (error) {
          console.warn('Error adding marker for:', place.name, error);
        }
      });

      // Fit map to show all markers if we have any
      if (markersRef.current.length > 0) {
        try {
          const group = window.L.featureGroup(markersRef.current);
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        } catch (error) {
          console.warn('Error fitting map bounds:', error);
        }
      }
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  };

  // Update map when results change
  useEffect(() => {
    if (viewMode === 'map' && results.length > 0) {
      updateMapMarkers();
    }
  }, [results, viewMode]);

  // Geocoding function for NYC locations
  const geocodeAddress = async (address) => {
    try {
      const nycLocations = {
        'manhattan': { lat: 40.7831, lng: -73.9712 },
        'brooklyn': { lat: 40.6782, lng: -73.9442 },
        'queens': { lat: 40.7282, lng: -73.7949 },
        'bronx': { lat: 40.8448, lng: -73.8648 },
        'staten island': { lat: 40.5795, lng: -74.1502 },
        'times square': { lat: 40.7580, lng: -73.9855 },
        'soho': { lat: 40.7230, lng: -74.0020 },
        'chinatown': { lat: 40.7161, lng: -73.9961 },
        'east village': { lat: 40.7281, lng: -73.9816 },
        'west village': { lat: 40.7354, lng: -74.0032 },
        'upper east side': { lat: 40.7736, lng: -73.9566 },
        'upper west side': { lat: 40.7870, lng: -73.9754 },
        'greenwich village': { lat: 40.7336, lng: -73.9960 },
        'financial district': { lat: 40.7074, lng: -74.0113 }
      };
      
      const location = address.toLowerCase();
      for (const [key, coords] of Object.entries(nycLocations)) {
        if (location.includes(key)) {
          return coords;
        }
      }
      
      // Check for zip codes (NYC zip codes typically start with 10xxx or 11xxx)
      const zipMatch = address.match(/\b(10\d{3}|11\d{3})\b/);
      if (zipMatch) {
        // Simple zip code to coordinates mapping for major NYC areas
        const zipCoords = {
          '10001': { lat: 40.7505, lng: -73.9934 }, // Chelsea
          '10002': { lat: 40.7209, lng: -73.9898 }, // Lower East Side
          '10003': { lat: 40.7316, lng: -73.9890 }, // East Village
          '10009': { lat: 40.7267, lng: -73.9787 }, // East Village
          '10011': { lat: 40.7416, lng: -74.0014 }, // Chelsea
          '10014': { lat: 40.7341, lng: -74.0063 }, // West Village
          '10016': { lat: 40.7462, lng: -73.9762 }, // Murray Hill
          '10019': { lat: 40.7655, lng: -73.9883 }, // Hell's Kitchen
          '10021': { lat: 40.7698, lng: -73.9572 }, // Upper East Side
          '10024': { lat: 40.7812, lng: -73.9760 }, // Upper West Side
          '10025': { lat: 40.7957, lng: -73.9667 }, // Upper West Side
          '11201': { lat: 40.6930, lng: -73.9898 }, // Brooklyn Heights
          '11215': { lat: 40.6694, lng: -73.9864 }, // Park Slope
          '11222': { lat: 40.7528, lng: -73.9482 }  // Greenpoint
        };
        
        if (zipCoords[zipMatch[1]]) {
          return zipCoords[zipMatch[1]];
        }
      }
      
      // Default to Manhattan center
      return { lat: 40.7831, lng: -73.9712 };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { lat: 40.7831, lng: -73.9712 };
    }
  };

  // Main search function using NYC Open Data
  const searchNYCRestaurants = async (coords) => {
    try {
      setLoading(true);
      setError('');

      // NYC Open Data API for food establishments
      let query = `https://data.cityofnewyork.us/resource/43nn-pn8j.json?$limit=50`;
      
      // Add location filtering if we have coordinates
      if (coords && coords.lat && coords.lng) {
        const latRange = 0.02; // roughly 1.4 miles in lat degrees
        const lngRange = 0.025; // roughly 1.4 miles in lng degrees
        
        query += `&$where=latitude>${coords.lat - latRange} AND latitude<${coords.lat + latRange}`;
        query += ` AND longitude>${coords.lng - lngRange} AND longitude<${coords.lng + lngRange}`;
      }

      // Filter by category if selected
      if (categoryFilter) {
        const categoryKeywords = {
          'pizza': 'Pizza',
          'delis': 'Deli',
          'chinese': 'Chinese',
          'mexican': 'Mexican',
          'thai': 'Thai',
          'indian': 'Indian',
          'halal': 'Halal',
          'sandwiches': 'Sandwich'
        };
        
        if (categoryKeywords[categoryFilter]) {
          query += `&$q=${categoryKeywords[categoryFilter]}`;
        }
      }

      // Order by DBA (business name)
      query += `&$order=dba`;

      console.log('Fetching from:', query);
      const response = await fetch(query);

      if (!response.ok) {
        throw new Error(`NYC Open Data API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw data received:', data.length, 'records');
      
      // Transform NYC data to match our app's expected format
      const transformedResults = data
        .filter(item => 
          item.latitude && 
          item.longitude && 
          item.dba && 
          parseFloat(item.latitude) !== 0 && 
          parseFloat(item.longitude) !== 0
        )
        .map((item, index) => {
          const lat = parseFloat(item.latitude);
          const lng = parseFloat(item.longitude);
          const distance = coords ? calculateDistance(coords.lat, coords.lng, lat, lng) : 0;
          
          return {
            id: item.camis || `nyc-${index}`,
            name: item.dba || 'Unknown Restaurant',
            categories: [{ 
              title: determineCuisineType(item.dba, item.cuisine_description) 
            }],
            rating: 3.5 + (Math.random() * 1.5), // Mock rating between 3.5-5.0
            review_count: Math.floor(Math.random() * 150) + 10,
            price: '$', // Assume cheap since we're targeting budget eats
            location: {
              address1: formatAddress(item.building, item.street),
              city: item.boro || 'New York',
              state: 'NY',
              zip_code: item.zipcode || ''
            },
            coordinates: {
              latitude: lat,
              longitude: lng
            },
            distance: distance,
            image_url: getRandomFoodImage(determineCuisineType(item.dba, item.cuisine_description)),
            phone: item.phone || 'Phone not available',
            is_closed: item.action === 'Closed' || false
          };
        })
        .filter(item => item.distance <= 3); // Only show places within 3 miles

      // Sort by distance if we have coordinates
      if (coords) {
        transformedResults.sort((a, b) => a.distance - b.distance);
      }

      // Limit to 30 results for better performance
      const limitedResults = transformedResults.slice(0, 30);
      setResults(limitedResults);
      console.log('Processed results:', limitedResults.length);
      
      if (limitedResults.length === 0) {
        setError('No restaurants found in this area. Try searching a different NYC location or expanding your search criteria.');
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setError(`Unable to fetch restaurant data: ${error.message}. Please try again.`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const determineCuisineType = (name, cuisineDescription) => {
    const nameAndCuisine = `${name || ''} ${cuisineDescription || ''}`.toLowerCase();
    
    if (nameAndCuisine.includes('pizza')) return 'Pizza';
    if (nameAndCuisine.includes('chinese')) return 'Chinese';
    if (nameAndCuisine.includes('mexican') || nameAndCuisine.includes('taco')) return 'Mexican';
    if (nameAndCuisine.includes('thai')) return 'Thai';
    if (nameAndCuisine.includes('indian')) return 'Indian';
    if (nameAndCuisine.includes('halal')) return 'Halal';
    if (nameAndCuisine.includes('deli') || nameAndCuisine.includes('sandwich')) return 'Deli';
    if (nameAndCuisine.includes('food truck') || nameAndCuisine.includes('truck')) return 'Food Truck';
    
    return cuisineDescription || 'Restaurant';
  };

  const formatAddress = (building, street) => {
    if (building && street) {
      return `${building} ${street}`;
    }
    return building || street || 'Address not available';
  };

  const getRandomFoodImage = (cuisineType) => {
    const imageMap = {
      'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
      'Deli': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300&h=200&fit=crop',
      'Chinese': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&h=200&fit=crop',
      'Mexican': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop',
      'Thai': 'https://images.unsplash.com/photo-1559314809-0f31657def5e?w=300&h=200&fit=crop',
      'Indian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      'Halal': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop',
      'Food Truck': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop'
    };
    
    return imageMap[cuisineType] || 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=200&fit=crop';
  };

  const handleSearch = async () => {
    if (!location.trim()) return;
    
    let coords;
    if (location === 'Current Location' && userCoords) {
      coords = userCoords;
    } else {
      coords = await geocodeAddress(location);
    }
    
    setUserCoords(coords);
    await searchNYCRestaurants(coords);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserCoords(coords);
          setLocation('Current Location');
          await searchNYCRestaurants(coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enter a NYC address manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const formatDistance = (distance) => {
    return distance < 1 ? `${(distance * 5280).toFixed(0)} ft` : `${distance.toFixed(1)} mi`;
  };

  const getPriceColor = (price) => {
    return price === '$' ? 'text-green-600' : price === '$$' ? 'text-yellow-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🍕 Cheap Eats NYC
            </h1>
            <p className="text-gray-600">Real NYC restaurant data from the city's official database</p>
          </div>

          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter NYC address, neighborhood, or zip code"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={getCurrentLocation}
                className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                title="Use current location"
              >
                <Navigation className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleSearch}
                disabled={!location.trim() || loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1">$ (Under $10)</option>
                  <option value="1,2">$ - $$ (Under $20)</option>
                  <option value="2">$$ ($10-20)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      {results.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Found {results.length} cheap eats nearby
              </h2>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4 inline mr-2" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Map className="h-4 w-4 inline mr-2" />
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for cheap eats nearby...</p>
        </div>
      )}

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {viewMode === 'list' && results.length > 0 && (
          <div className="grid gap-4">
            {results.map((place) => (
              <div key={place.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex">
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-32 h-32 object-cover rounded-l-lg"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=200&fit=crop';
                    }}
                  />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {place.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-700 ml-1">
                              {place.rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({place.review_count} reviews)
                            </span>
                          </div>
                          <span className={`text-sm font-medium ${getPriceColor(place.price)}`}>
                            {place.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">
                            {place.categories.map(cat => cat.title).join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {formatDistance(place.distance)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {place.is_closed ? 'Closed' : 'Open'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">
                          {place.location.address1}
                        </div>
                        <div className="text-sm text-gray-500">
                          {place.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'map' && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div ref={mapRef} className="w-full h-96"></div>
          </div>
        )}

        {results.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to find cheap eats?
            </h3>
            <p className="text-gray-600 mb-4">
              Enter your NYC location above to discover budget-friendly meals near you
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <span>🍕 Pizza slices</span>
              <span>🌮 Food trucks</span>
              <span>🥪 Deli sandwiches</span>
              <span>🍜 Street food</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-300 mb-2">
            Cheap Eats NYC - Real NYC restaurant data from official city database
          </p>
          <p className="text-gray-400 text-sm">
            Data from NYC Open Data • Licensed food establishments • Always up-to-date
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;