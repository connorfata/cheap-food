import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix default icon path for Leaflet when using bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FitBounds({ places }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !places || places.length === 0) return;
    const coords = places
      .filter(p => p.coordinates && p.coordinates.latitude && p.coordinates.longitude)
      .map(p => [p.coordinates.latitude, p.coordinates.longitude]);
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, places]);
  return null;
}

export default function MapView({ places }) {
  const defaultCenter = [40.7128, -74.006];
  return (
    <MapContainer center={defaultCenter} zoom={12} style={{ height: '24rem', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places && places.map(place => (
        place.coordinates && place.coordinates.latitude && place.coordinates.longitude && (
          <Marker
            key={place.id}
            position={[place.coordinates.latitude, place.coordinates.longitude]}
          >
            <Popup>
              <div className="p-1 text-sm">
                <strong>{place.name}</strong><br />
                {place.location.address1}
              </div>
            </Popup>
          </Marker>
        )
      ))}
      <FitBounds places={places} />
    </MapContainer>
  );
}
