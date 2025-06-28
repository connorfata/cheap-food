// src/components/RestaurantMap.jsx
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, Clock, DollarSign } from 'lucide-react';

// Fix default marker icons for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon for restaurants
const createCustomIcon = (priceLevel) => {
  const color = priceLevel === '$' ? '#047857' : priceLevel === '$$' ? '#d97706' : '#dc2626';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
      ">
        ${priceLevel}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Component to fit map bounds to show all markers
function MapBounds({ restaurants }) {
  const map = useRef();
  
  useEffect(() => {
    if (!map.current || !restaurants?.length) return;
    
    const validRestaurants = restaurants.filter(r => r.latitude && r.longitude);
    if (validRestaurants.length === 0) return;
    
    const bounds = L.latLngBounds(
      validRestaurants.map(r => [r.latitude, r.longitude])
    );
    
    map.current.fitBounds(bounds, { padding: [20, 20] });
  }, [restaurants]);
  
  return null;
}

export default function RestaurantMap({ restaurants, onRestaurantClick }) {
  const validRestaurants = restaurants.filter(r => r.latitude && r.longitude);
  
  // Default center (NYC)
  const defaultCenter = [40.7589, -73.9851];
  const mapCenter = validRestaurants.length > 0 
    ? [validRestaurants[0].latitude, validRestaurants[0].longitude]
    : defaultCenter;

  if (validRestaurants.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No location data available</h3>
          <p className="text-gray-500">Restaurant locations will appear here when available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={map => {
          if (map && validRestaurants.length > 1) {
            const bounds = L.latLngBounds(
              validRestaurants.map(r => [r.latitude, r.longitude])
            );
            map.fitBounds(bounds, { padding: [20, 20] });
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validRestaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.latitude, restaurant.longitude]}
            icon={createCustomIcon(restaurant.price_level)}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-64">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight pr-2">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center space-x-1 bg-emerald-100 px-2 py-1 rounded-full flex-shrink-0">
                    <Star className="h-3 w-3 text-emerald-600 fill-current" />
                    <span className="text-xs font-semibold text-emerald-700">
                      {restaurant.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-2 font-medium">
                  {restaurant.cuisine}
                </p>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold text-sm ${
                      restaurant.price_level === '$' ? 'text-emerald-600' : 
                      restaurant.price_level === '$$' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {restaurant.price_level}
                    </span>
                    <span className="text-xs text-gray-500">
                      ${restaurant.average_price.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="text-xs">
                      {restaurant.estimated_delivery}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{restaurant.address}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {restaurant.menu_url && (
                    <a
                      href={restaurant.menu_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-primary-600 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:bg-primary-700 transition-colors text-center"
                    >
                      View Menu
                    </a>
                  )}
                  
                  {onRestaurantClick && (
                    <button
                      onClick={() => onRestaurantClick(restaurant)}
                      className="flex-1 bg-gray-100 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Details
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <style jsx>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
}