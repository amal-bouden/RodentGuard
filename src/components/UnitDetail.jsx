import React from 'react';
import TrapMap from '../assets/Map'; 
import { ArrowLeft, RefreshCw, AlertOctagon } from 'lucide-react';

const RatIcon = ({ isAlert }) => (
  <svg viewBox="0 0 100 100" className={`svg-icon ${isAlert ? 'alert-pulse' : ''}`}>
    <path d="M50 25C35 25 22 38 22 55C22 72 35 85 50 85C65 85 78 72 78 55C78 38 65 25 50 25Z" fill="none" stroke="currentColor" strokeWidth="3"/>
    <circle cx="28" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="72" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="40" cy="52" r="3" fill="currentColor" />
    <circle cx="60" cy="52" r="3" fill="currentColor" />
    <path d="M15 60L5 62M15 65L4 70M85 60L95 62M85 65L96 70" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default function UnitDetail({ trap, onBack, isDark, t, toggleAlert, toggleBuzzer }) {
  if (!trap) return null;

  return (
    <div className="unit-detail-view slide-in" style={{ paddingBottom: '20px' }}>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <header className="hero-status" style={{ marginTop: '15px' }}>
        <div className="logo-group" style={{ justifyContent: 'center' }}>
          <div className="logo-box" style={{ background: trap.isAlert ? 'var(--alert-red)' : 'var(--mocha)' }}>RG</div>
          <span>{t.unit} {trap.nameIndex}</span>
        </div>
        <div className="icon-vault">
          <RatIcon isAlert={trap.isAlert} />
        </div>
        <h1 className="status-heading">{trap.isAlert ? t.active : t.ready}</h1>
        <span className="sub-text">NODE: {trap.macAddress || trap.id}</span>
      </header>

      {/* Info Deck */}
      <div className="info-deck">
        <TrapMap 
          isDark={isDark} 
          traps={trap.lat && trap.lng ? [{...trap}] : []} 
          center={trap.lat && trap.lng ? [trap.lat, trap.lng] : [35.8256, 10.6084]} 
          zoom={16} 
          t={t} 
        />
        <div className="stats-row">
          <div className="data-tile">
            <label>{t.sector}</label>
            <strong>{t.sectors[trap.sectorKey] || trap.sectorKey || "UNASSIGNED"}</strong>
          </div>
          <div className="data-tile">
            <label>BATTERY</label>
            <strong style={{ color: (trap.battery || 100) < 20 ? 'var(--alert-red)' : 'inherit' }}>
              {trap.battery !== undefined ? trap.battery : 100}%
            </strong>
          </div>
        </div>

        <div className="stats-row">
          <div className="data-tile" style={{ width: '100%' }}>
            <label>GPS COORDINATES</label>
            <strong>
              {trap.lat ? `${trap.lat.toFixed(6)}, ${trap.lng.toFixed(6)}` : "WAITING FOR GPS LOCK..."}
            </strong>
          </div>
        </div>

        <div className="stats-row">
          <div className="data-tile">
            <label>{t.sensors.weight}</label>
            <strong>{trap.weight !== undefined ? trap.weight : 0} g</strong>
          </div>
          <div className="data-tile">
            <label>{t.sensors.ir}</label>
            <strong style={{ color: trap.irActive ? 'var(--alert-red)' : 'inherit' }}>
              {trap.irActive ? t.sensors.blocked : t.sensors.clear}
            </strong>
          </div>
        </div>
        
        <div className="data-tile">
          <label>{t.signal}</label>
          <strong style={{ color: trap.isAlert ? 'var(--alert-red)' : 'inherit' }}>
              {trap.isAlert ? "0x01 (DETECTED) - " + trap.signalStrength + "dBm" : "0x00 (STANDBY) - " + trap.signalStrength + "dBm"}
          </strong>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <button 
          className="pro-btn" 
          onClick={() => toggleBuzzer(trap.id)}
          style={{ 
            marginTop: 0, 
            background: trap.buzzerOn ? 'var(--vanilla)' : 'var(--mocha)',
            color: trap.buzzerOn ? 'var(--alert-red)' : 'white',
            border: trap.buzzerOn ? '2px solid var(--alert-red)' : '2px solid transparent'
          }}
        >
          {trap.buzzerOn ? t.sensors.buzzer_stop : t.sensors.buzzer}
        </button>

        {/* Action Button */}
        <button 
          className="pro-btn" 
          onClick={() => toggleAlert(trap.id)}
          style={{ marginTop: 0, background: trap.isAlert ? 'var(--alert-red)' : '#4CAF50' }}
        >
          {trap.isAlert ? t.reset : t.test}
        </button>
      </div>
    </div>
  );
}
