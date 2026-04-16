import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// We use "../App.css" because this file is inside the /assets folder
import "../App.css"; 

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function TrapMap({ isDark }) {
  // Sousse, Tunisia Coordinates
  const position = [35.8256, 10.6084]; 

  return (
    <div className="map-frame">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '200px', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          // High Contrast / Dark tiles for Mocha-Dark mode
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
          attribution='&copy; OpenStreetMap'
        />
        <Marker position={position}>
          <Popup>
            SENTINEL_NODE_01 <br /> Sousse, Tunisia.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}