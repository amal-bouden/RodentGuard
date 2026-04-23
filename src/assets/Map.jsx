import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import "../App.css"; 

// Create standard red icon for alerts
const redIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
const blueIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';

export default function TrapMap({ isDark, traps = [], center = [35.8256, 10.6084], zoom = 13, height = '200px', t }) {
  
  const getIcon = (isAlert) => {
    return L.icon({
      iconUrl: isAlert ? redIconUrl : blueIconUrl,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  return (
    <div className="map-frame" style={{ height, width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
          attribution='&copy; OpenStreetMap'
        />
        
        {traps.map(trap => (
          <Marker 
            key={trap.id} 
            position={[trap.lat, trap.lng]} 
            icon={getIcon(trap.isAlert)}
          >
            <Popup>
              <strong>{t ? t.unit : "Unit"} {trap.nameIndex}</strong> <br />
              {t ? (trap.isAlert ? t.map_status.detected : t.map_status.standby) : ""} <br />
              Bat: {trap.battery}%
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}