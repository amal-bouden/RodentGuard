import React, { useState } from 'react';
import TrapMap from '../assets/Map';
import { Route, Flame } from 'lucide-react';

export default function MapScreen({ traps, isDark, t, onSelectTrap }) {
  const [showRoute, setShowRoute] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  // We compute the center if we want, or default to Sousse
  const center = [35.8256, 10.6084];

  return (
    <div className="page-view slide-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 className="section-title">{t.global_map}</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button className="pro-btn" onClick={() => setShowRoute(!showRoute)} style={{ marginTop: 0, padding: '10px', background: showRoute ? '#4CAF50' : 'var(--mocha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Route size={16} style={{ marginRight: '5px' }} /> Dispatch Route
        </button>
        <button className="pro-btn" onClick={() => setShowHeatmap(!showHeatmap)} style={{ marginTop: 0, padding: '10px', background: showHeatmap ? 'var(--alert-red)' : 'var(--mocha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={16} style={{ marginRight: '5px' }} /> Risk Heatmap
        </button>
      </div>

      <div style={{ flex: 1, minHeight: '300px', display: 'flex' }}>
        <TrapMap 
          isDark={isDark} 
          traps={traps}
          center={center}
          zoom={14}
          height="350px"
          showRoute={showRoute}
          showHeatmap={showHeatmap}
        />
      </div>
    </div>
  );
}
