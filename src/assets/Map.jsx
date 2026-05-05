import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import "../App.css"; 

// Create standard red icon for alerts
const redIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
const blueIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';

export default function TrapMap({ isDark, traps = [], center = [35.8256, 10.6084], zoom = 13, height = '200px', showRoute = false, showHeatmap = false, t }) {
  
  // Extract coordinates of all active alerts for the "Dispatch Route"
  const alertedTraps = traps.filter(trap => trap.lat && trap.lng && trap.isAlert);
  const routePositions = alertedTraps.map(trap => [trap.lat, trap.lng]);

  // Generate predictive hotspots slightly offset from existing traps
  const hotspots = traps.filter(trap => trap.lat && trap.lng).map((trap, idx) => ({
    center: [trap.lat + (idx % 2 === 0 ? 0.0015 : -0.001), trap.lng + (idx % 3 === 0 ? 0.002 : -0.0015)],
    radius: 350,
    intensity: Math.random() > 0.5 ? 0.6 : 0.3
  }));
  
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
        
        {traps.filter(trap => trap.lat && trap.lng).map(trap => (
          <Marker 
            key={trap.id || trap._id} 
            position={[trap.lat, trap.lng]} 
            icon={getIcon(trap.isAlert)}
          >
            <Popup>
              <strong>{t ? t.unit : "Unit"} {trap.nameIndex || trap.name}</strong> <br />
              {t ? (trap.isAlert ? t.map_status.detected : t.map_status.standby) : ""} <br />
              Bat: {trap.battery}%
            </Popup>
          </Marker>
        ))}

        {/* Dispatch Technician Route Layer */}
        {showRoute && routePositions.length > 0 && (
          <Polyline 
            positions={routePositions} 
            color="#4CAF50" 
            dashArray="10, 10" 
            weight={4} 
          />
        )}

        {/* Predictive Heatmap Layer */}
        {showHeatmap && hotspots.map((spot, i) => (
          <Circle 
            key={`heat-${i}`}
            center={spot.center} 
            radius={spot.radius}
            pathOptions={{ color: 'var(--alert-red)', fillColor: 'var(--alert-red)', fillOpacity: spot.intensity, stroke: false }} 
          />
        ))}

      </MapContainer>
    </div>
  );
}