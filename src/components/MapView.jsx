// src/components/MapView.jsx

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Star, DollarSign, Navigation, Phone, ExternalLink, Clock, Globe } from 'lucide-react';
import { getFaviconUrl, getCuisineIcon } from '../utils/faviconUtils.js';
import L from 'leaflet';

console.log('🗺️ MapView component loading...');

// Check if Leaflet is available
console.log('📍 Leaflet object:', L);
console.log('📍 Leaflet version:', L.version);

// Fix for default markers in React Leaflet
try {
  console.log('🔧 Fixing Leaflet default markers...');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
  console.log('✅ Leaflet markers fixed successfully');
} catch (error) {
  console.error('❌ Error fixing Leaflet markers:', error);
}

// Custom marker icons based on price level
const createCustomIcon = (priceLevel, isUserLocation = false) => {
  console.log('🎯 Creating custom icon for:', priceLevel, 'isUser:', isUserLocation);
  
  try {
    if (isUserLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              position: absolute;
              top: -2px;
              left: -2px;
              width: 24px;
              height: 24px;
              background: rgba(59, 130, 246, 0.3);
              border-radius: 50%;
              animation: pulse 2s infinite;
            "></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      console.log('✅ User icon created:', userIcon);
      return userIcon;
    }

    const colorMap = {
      '$': '#22c55e',    // Green for cheap
      '$$': '#f59e0b',   // Yellow for moderate
      '$$$': '#ef4444',  // Red for expensive
    };

    const color = colorMap[priceLevel] || '#6b7280';
    console.log('🎨 Using color:', color, 'for price level:', priceLevel);

    const restaurantIcon = L.divIcon({
      className: 'custom-restaurant-marker',
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          font-size: 14px;
          font-weight: bold;
          color: white;
        ">
          ${priceLevel}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    console.log('✅ Restaurant icon created:', restaurantIcon);
    return restaurantIcon;
  } catch (error) {
    console.error('❌ Error creating custom icon:', error);
    return L.Icon.Default();
  }
};

// Component to handle map centering and user location
const MapController = ({ userLocation, restaurants, selectedRestaurant }) => {
  console.log('🎮 MapController rendered with:', {
    userLocation,
    restaurantCount: restaurants?.length,
    selectedRestaurant: selectedRestaurant?.name
  });

  const map = useMap();
  console.log('🗺️ Map instance from useMap:', map);

  useEffect(() => {
    console.log('🎮 MapController useEffect triggered');
    
    try {
      if (selectedRestaurant && selectedRestaurant.latitude && selectedRestaurant.longitude) {
        console.log('🎯 Centering map on selected restaurant:', selectedRestaurant.name);
        map.setView([selectedRestaurant.latitude, selectedRestaurant.longitude], 16);
      } else if (restaurants.length > 0) {
        console.log('📍 Fitting map to show all restaurants');
        // Fit map to show all restaurants
        const validRestaurants = restaurants.filter(r => r.latitude && r.longitude);
        console.log('✅ Valid restaurants with coordinates:', validRestaurants.length);
        
        if (validRestaurants.length > 0) {
          const group = new L.featureGroup(
            validRestaurants.map(r => {
              console.log('📍 Adding restaurant to group:', r.name, r.latitude, r.longitude);
              return L.marker([r.latitude, r.longitude]);
            })
          );
          
          if (userLocation) {
            console.log('👤 Adding user location to group');
            group.addLayer(L.marker([userLocation.lat, userLocation.lng]));
          }
          
          const bounds = group.getBounds();
          console.log('📐 Map bounds:', bounds);
          map.fitBounds(bounds.pad(0.1));
          console.log('✅ Map fitted to bounds');
        }
      } else if (userLocation) {
        console.log('👤 Centering map on user location');
        map.setView([userLocation.lat, userLocation.lng], 13);
      }
    } catch (error) {
      console.error('❌ Error in MapController:', error);
    }
  }, [map, userLocation, restaurants, selectedRestaurant]);

  return null;
};

const MapView = ({ 
  restaurants = [], 
  onRestaurantSelect, 
  selectedRestaurant = null,
  location = "New York City" 
}) => {
  console.log('🗺️ MapView rendering with props:', {
    restaurantCount: restaurants.length,
    selectedRestaurant: selectedRestaurant?.name,
    location,
    onRestaurantSelect: !!onRestaurantSelect
  });

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const mapRef = useRef();

  console.log('🎯 MapView state:', {
    userLocation,
    locationError,
    isLoadingLocation,
    mapRef: !!mapRef.current
  });

  // Get user's current location
  useEffect(() => {
    console.log('🌍 MapView useEffect: Getting user location');
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    console.log('📍 getUserLocation called');
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      setLocationError('Geolocation is not supported by this browser');
      setIsLoadingLocation(false);
      return;
    }

    console.log('📍 Requesting geolocation...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Geolocation success:', position);
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        console.log('👤 Setting user location:', userLoc);
        setUserLocation(userLoc);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        const errorMsg = getLocationErrorMessage(error.code);
        console.log('📝 Error message:', errorMsg);
        setLocationError(errorMsg);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const getLocationErrorMessage = (code) => {
    console.log('🚨 Processing geolocation error code:', code);
    switch (code) {
      case 1: return 'Location access denied. Enable location services to see your position.';
      case 2: return 'Location unavailable. Check your connection.';
      case 3: return 'Location request timed out.';
      default: return 'Unable to get your location.';
    }
  };

  // Default center (NYC)
  const defaultCenter = [40.7831, -73.9712];
  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;
  console.log('🎯 Map center will be:', mapCenter);

  // Add coordinates to restaurants (using real coordinates from fallback data if available)
  const restaurantsWithCoords = restaurants.map((restaurant, index) => {
    const coords = {
      ...restaurant,
      latitude: restaurant.latitude || (40.7831 + (Math.random() - 0.5) * 0.02),
      longitude: restaurant.longitude || (-73.9712 + (Math.random() - 0.5) * 0.02)
    };
    console.log(`📍 Restaurant ${index + 1} coordinates:`, restaurant.name, coords.latitude, coords.longitude);
    return coords;
  });

  const handleDirections = (restaurant) => {
    console.log('🧭 Getting directions to:', restaurant.name);
    try {
      if (userLocation && restaurant.latitude && restaurant.longitude) {
        const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${restaurant.latitude},${restaurant.longitude}`;
        console.log('🔗 Opening directions URL:', url);
        window.open(url, '_blank');
      } else {
        const address = encodeURIComponent(restaurant.address);
        const url = `https://www.google.com/maps/search/${address}`;
        console.log('🔗 Opening search URL:', url);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('❌ Error opening directions:', error);
    }
  };

  console.log('🏗️ About to render MapView DOM');

  try {
    return (
      <div className="w-full h-full relative">
        {console.log('📦 Rendering MapView container')}
        
        {/* Add the pulse animation via a style tag */}
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.3; }
            100% { transform: scale(1); opacity: 1; }
          }
          .custom-user-marker div:first-child div {
            animation: pulse 2s infinite;
          }
        `}</style>

        {/* Location status bar */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-center">
          {console.log('📱 Rendering status bar')}
          <div className="bg-white rounded-lg shadow-lg px-3 py-2 flex items-center space-x-2">
            {isLoadingLocation ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-gray-700">Finding your location...</span>
              </>
            ) : userLocation ? (
              <>
                <Navigation className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Location found</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Showing {location}</span>
              </>
            )}
          </div>

          {!userLocation && !isLoadingLocation && (
            <button
              onClick={() => {
                console.log('🔘 Find Me button clicked');
                getUserLocation();
              }}
              className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Navigation className="h-4 w-4" />
              <span>Find Me</span>
            </button>
          )}
        </div>

        {/* Location error */}
        {locationError && (
          <div className="absolute top-16 left-4 right-4 z-[1000] bg-red-50 border border-red-200 rounded-lg p-3">
            {console.log('🚨 Rendering location error:', locationError)}
            <p className="text-red-800 text-sm">{locationError}</p>
            <button
              onClick={() => {
                console.log('🔄 Retry location button clicked');
                getUserLocation();
              }}
              className="text-red-600 hover:text-red-800 text-sm font-medium mt-1"
            >
              Try again
            </button>
          </div>
        )}

        {/* Map */}
        {console.log('🗺️ About to render MapContainer with center:', mapCenter)}
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={(mapInstance) => {
            console.log('🗺️ MapContainer ref callback:', mapInstance);
            mapRef.current = mapInstance;
          }}
          zoomControl={false}
          whenCreated={(mapInstance) => {
            console.log('🗺️ MapContainer whenCreated:', mapInstance);
          }}
        >
          {console.log('🌍 Rendering TileLayer')}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            onLoad={() => console.log('✅ TileLayer loaded')}
            onError={(error) => console.error('❌ TileLayer error:', error)}
          />

          {console.log('🎮 Rendering MapController')}
          <MapController
            userLocation={userLocation}
            restaurants={restaurantsWithCoords}
            selectedRestaurant={selectedRestaurant}
          />

          {/* User location marker */}
          {userLocation && (
            <>
              {console.log('👤 Rendering user location marker at:', userLocation)}
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={createCustomIcon('$', true)}
              >
                <Popup>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <Navigation className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-gray-900">Your Location</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Accuracy: ±{Math.round(userLocation.accuracy)}m
                    </p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Restaurant markers */}
          {console.log('🍽️ Rendering restaurant markers, count:', restaurantsWithCoords.length)}
          {restaurantsWithCoords.map((restaurant, index) => {
            console.log(`🍽️ Rendering marker ${index + 1}:`, restaurant.name, restaurant.latitude, restaurant.longitude);
            return (
              <Marker
                key={restaurant.id}
                position={[restaurant.latitude, restaurant.longitude]}
                icon={createCustomIcon(restaurant.price_level)}
                eventHandlers={{
                  click: () => {
                    console.log('🖱️ Restaurant marker clicked:', restaurant.name);
                    onRestaurantSelect && onRestaurantSelect(restaurant);
                  }
                }}
              >
                <Popup>
                  {console.log('💬 Rendering popup for:', restaurant.name)}
                  <div style={{ minWidth: '250px', maxWidth: '300px' }}>
                    {/* Header with favicon */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 pr-2">
                        {/* Restaurant favicon */}
                        {restaurant.website_url ? (
                          <img
                            src={getFaviconUrl(restaurant.website_url, 24)}
                            alt={`${restaurant.name} favicon`}
                            className="w-6 h-6 rounded flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = document.createElement('span');
                              fallback.innerHTML = getCuisineIcon(restaurant.cuisine);
                              fallback.className = 'text-lg flex-shrink-0';
                              e.target.parentNode.insertBefore(fallback, e.target);
                            }}
                          />
                        ) : (
                          <span className="text-lg flex-shrink-0">
                            {getCuisineIcon(restaurant.cuisine)}
                          </span>
                        )}
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                          {restaurant.name}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full flex-shrink-0">
                        <Star className="h-3 w-3 text-green-600 fill-current" />
                        <span className="text-sm font-semibold text-green-700">
                          {restaurant.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Cuisine and price */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600 font-medium">{restaurant.cuisine}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${
                          restaurant.price_level === '$' ? 'text-green-600' : 
                          restaurant.price_level === '$$' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {restaurant.price_level}
                        </span>
                        <span className="text-sm text-gray-500">
                          ${restaurant.average_price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start space-x-2 mb-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        {restaurant.address}
                      </span>
                    </div>

                    {/* Delivery time */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{restaurant.estimated_delivery}</span>
                    </div>

                    {/* Top Dishes */}
                    {restaurant.top_dishes && restaurant.top_dishes.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-800 mb-1">Popular:</h5>
                        <div className="space-y-0.5">
                          {restaurant.top_dishes.slice(0, 2).map((dish, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="font-medium text-gray-700 truncate pr-1">{dish.name}</span>
                              <span className="text-primary-600 font-semibold">${dish.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 mb-3">
                      <button
                        onClick={() => {
                          console.log('🧭 Directions button clicked for:', restaurant.name);
                          handleDirections(restaurant);
                        }}
                        className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>Directions</span>
                      </button>
                      
                      {restaurant.website_url && (
                        <button
                          onClick={() => {
                            console.log('🌐 Website button clicked for:', restaurant.name);
                            window.open(restaurant.website_url, '_blank');
                          }}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                        >
                          <Globe className="h-4 w-4" />
                          <span>Website</span>
                        </button>
                      )}
                    </div>

                    {/* Secondary actions */}
                    {restaurant.menu_url && (
                      <div className="mb-2">
                        <button
                          onClick={() => {
                            console.log('📖 Menu button clicked for:', restaurant.name);
                            window.open(restaurant.menu_url, '_blank');
                          }}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View Menu</span>
                        </button>
                      </div>
                    )}

                    {/* Phone */}
                    {restaurant.phone && restaurant.phone !== 'Phone not available' && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <a
                          href={`tel:${restaurant.phone}`}
                          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                          onClick={() => console.log('📞 Phone link clicked for:', restaurant.name)}
                        >
                          <Phone className="h-4 w-4" />
                          <span>{restaurant.phone}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map controls */}
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col space-y-2">
          {console.log('🎛️ Rendering map controls')}
          {/* Zoom controls */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => {
                console.log('➕ Zoom in button clicked');
                try {
                  if (mapRef.current) {
                    const map = mapRef.current;
                    const currentZoom = map.getZoom();
                    console.log('📊 Current zoom:', currentZoom);
                    map.setZoom(currentZoom + 1);
                    console.log('✅ Zoomed in to:', currentZoom + 1);
                  } else {
                    console.log('❌ No map reference available for zoom in');
                  }
                } catch (error) {
                  console.error('❌ Error zooming in:', error);
                }
              }}
              className="block w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200"
            >
              +
            </button>
            <button
              onClick={() => {
                console.log('➖ Zoom out button clicked');
                try {
                  if (mapRef.current) {
                    const map = mapRef.current;
                    const currentZoom = map.getZoom();
                    console.log('📊 Current zoom:', currentZoom);
                    map.setZoom(currentZoom - 1);
                    console.log('✅ Zoomed out to:', currentZoom - 1);
                  } else {
                    console.log('❌ No map reference available for zoom out');
                  }
                } catch (error) {
                  console.error('❌ Error zooming out:', error);
                }
              }}
              className="block w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
            >
              −
            </button>
          </div>

          {/* Center on user location */}
          {userLocation && (
            <button
              onClick={() => {
                console.log('🎯 Center on user button clicked');
                try {
                  if (mapRef.current) {
                    console.log('📍 Centering map on user location:', userLocation);
                    mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
                    console.log('✅ Map centered on user');
                  } else {
                    console.log('❌ No map reference available for centering');
                  }
                } catch (error) {
                  console.error('❌ Error centering on user:', error);
                }
              }}
              className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Navigation className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ FATAL ERROR rendering MapView:', error);
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Map Error</h3>
          <p className="text-red-600 mb-4">Failed to load map component</p>
          <pre className="text-xs text-red-500 bg-red-100 p-2 rounded">
            {error.toString()}
          </pre>
        </div>
      </div>
    );
  }
};

console.log('✅ MapView component loaded successfully');
export default MapView;