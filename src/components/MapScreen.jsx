import React from 'react';
import TrapMap from '../assets/Map';

export default function MapScreen({ traps, isDark, t, onSelectTrap }) {
  // We compute the center if we want, or default to Sousse
  const center = [35.8256, 10.6084];

  return (
    <div className="page-view slide-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 className="section-title">{t.global_map}</h2>
      <p className="section-subtitle">{t.gps_nodes}</p>

      <div style={{ flex: 1, minHeight: '300px', display: 'flex' }}>
        <TrapMap 
          isDark={isDark} 
          traps={traps}
          center={center}
          zoom={14}
          height="350px"
        />
      </div>
    </div>
  );
}
