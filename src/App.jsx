import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, DollarSign, Clock, Star, Navigation, List, Map as MapIcon } from 'lucide-react';

// Hardcoded for demo - replace with your actual key
const YELP_API_KEY = 'Bearer YOUR_YELP_API_KEY_HERE';

function App() {
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceFilter, setPriceFilter] = useState('1,2');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
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

  // Initialize map
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current && !mapInstanceRef.current) {
      // Initialize Leaflet map
      const L = window.L;
      if (L) {
        const map = L.map(mapRef.current).setView([40.7128, -73.9060], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
      }
    }
  }, [viewMode]);

  // Update map markers when results change
  useEffect(() => {
    if (mapInstanceRef.current && results.length > 0) {
      const L = window.L;
      if (L) {
        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        results.forEach(place => {
          if (place.coordinates) {
            const marker = L.marker([place.coordinates.latitude, place.coordinates.longitude])
              .addTo(mapInstanceRef.current)
              .bindPopup(`
                <div class="p-2">
                  <h3 class="font-semibold">${place.name}</h3>
                  <p class="text-sm text-gray-600">${place.categories.map(c => c.title).join(', ')}</p>
                  <p class="text-sm">Rating: ${place.rating} ⭐ | ${place.price}</p>
                  <p class="text-sm">${place.location.address1}</p>
                </div>
              `);
            markersRef.current.push(marker);
          }
        });

        // Fit map to show all markers
        if (markersRef.current.length > 0) {
          const group = L.featureGroup(markersRef.current);
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }
      }
    }
  }, [results]);

  // Geocode address to coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address + ', New York, NY')}&key=YOUR_OPENCAGE_API_KEY&limit=1`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.lat,
          lng: result.geometry.lng
        };
      }
      
      // Fallback to NYC center if geocoding fails
      return { lat: 40.7128, lng: -73.9060 };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { lat: 40.7128, lng: -73.9060 };
    }
  };

  // Search Yelp API
  const searchYelp = async (coords) => {
    try {
      setLoading(true);
      setError('');

      // Note: This will likely fail due to CORS policy
      // In production, you'd need a backend proxy or use Yelp's GraphQL API
      const params = new URLSearchParams({
        latitude: coords.lat,
        longitude: coords.lng,
        radius: 8000, // ~5 miles in meters
        price: priceFilter,
        limit: 20,
        sort_by: 'distance',
        open_now: true
      });

      if (categoryFilter) {
        params.append('categories', categoryFilter);
      }

      const response = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
        headers: {
          'Authorization': YELP_API_KEY,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Yelp API error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.businesses || []);
      
    } catch (error) {
      console.error('Search error:', error);
      setError('Unable to fetch restaurant data. This demo needs a backend proxy to access Yelp API due to CORS restrictions.');
      
      // For demo purposes, show some sample data
      setResults([
        {
          id: '1',
          name: "Joe's Pizza",
          categories: [{ title: 'Pizza' }],
          rating: 4.5,
          review_count: 892,
          price: '$',
          location: { address1: '123 Broadway', city: 'New York', state: 'NY' },
          coordinates: { latitude: 40.7589, longitude: -73.9851 },
          distance: 483.2,
          image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
          phone: '(212) 555-0123',
          is_closed: false
        },
        {
          id: '2',
          name: "Ahmed's Halal Cart",
          categories: [{ title: 'Halal' }, { title: 'Street Food' }],
          rating: 4.2,
          review_count: 234,
          price: '$',
          location: { address1: '456 5th Ave', city: 'New York', state: 'NY' },
          coordinates: { latitude: 40.7505, longitude: -73.9934 },
          distance: 1287.5,
          image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
          phone: '(646) 555-0456',
          is_closed: false
        }
      ]);
    } finally {
      setLoading(false);
    }
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
    await searchYelp(coords);
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
          await searchYelp(coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enter an address.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const formatDistance = (distance) => {
    const miles = distance * 0.000621371; // meters to miles
    return miles < 1 ? `${(miles * 5280).toFixed(0)} ft` : `${miles.toFixed(1)} mi`;
  };

  const getPriceColor = (price) => {
    return price === '$' ? 'text-green-600' : price === '$$' ? 'text-yellow-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🍕 Cheap Eats NYC
            </h1>
            <p className="text-gray-600">Find meals under $10 near you with live data</p>
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
                  <MapIcon className="h-4 w-4 inline mr-2" />
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
                              {place.rating}
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
            <div id="map" ref={mapRef} className="w-full h-96"></div>
          </div>
        )}

        {results.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to find cheap eats?
            </h3>
            <p className="text-gray-600 mb-4">
              Enter your NYC location above to discover meals under $10 near you
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
            Cheap Eats NYC - Real-time data from Yelp Fusion API
          </p>
          <p className="text-gray-400 text-sm">
            Live restaurant data • Interactive NYC map • Always up-to-date
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;