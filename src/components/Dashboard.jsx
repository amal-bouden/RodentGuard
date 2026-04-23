import React from 'react';
import { Activity, Battery, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Dashboard({ traps, onSelectTrap, t }) {
  const totalTraps = traps.length;
  const activeAlerts = traps.filter(tr => tr.isAlert).length;
  const lowBatteryCount = traps.filter(tr => tr.battery < 20).length;

  return (
    <div className="dashboard-view slide-in">
      <h2 className="section-title">{t.sys_status}</h2>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--mocha)' }}>
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalTraps}</span>
            <span className="stat-label">{t.active_nodes}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ color: activeAlerts > 0 ? 'var(--alert-red)' : 'var(--mocha)' }}>
            {activeAlerts > 0 ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: activeAlerts > 0 ? 'var(--alert-red)' : 'inherit' }}>
              {activeAlerts}
            </span>
            <span className="stat-label">{t.captures}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: lowBatteryCount > 0 ? 'orange' : 'var(--mocha)' }}>
            <Battery size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{lowBatteryCount}</span>
            <span className="stat-label">{t.low_batt}</span>
          </div>
        </div>
      </div>

      <h3 className="section-subtitle" style={{ marginTop: '25px' }}>{t.connected_units}</h3>
      
      {/* Traps List */}
      <div className="trap-list">
        {traps.map(trap => (
          <div 
            key={trap.id} 
            className={`trap-item ${trap.isAlert ? 'trap-alert' : ''}`}
            onClick={() => onSelectTrap(trap)}
          >
            <div className="trap-item-header">
              <span className="trap-name">{t.unit} {trap.nameIndex}</span>
              <div className="trap-status-indicator" style={{ background: trap.isAlert ? 'var(--alert-red)' : '#4CAF50' }} />
            </div>
            
            <div className="trap-item-details">
              <span>{t.sectors[trap.sectorKey]}</span>
              <span className="trap-battery">
                <Battery size={14} /> {trap.battery}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
