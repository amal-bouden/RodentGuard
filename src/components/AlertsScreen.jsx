import React from 'react';
import { ShieldAlert, BatteryWarning, Info } from 'lucide-react';
import { mockAlertLogs } from '../mockData';

export default function AlertsScreen({ t, logs }) {
  const displayLogs = (logs && logs.length > 0) ? logs : mockAlertLogs;

  const getIcon = (type) => {
    switch(type) {
      case 'CAPTURE': return <ShieldAlert size={20} color="var(--alert-red)" />;
      case 'BATTERY': return <BatteryWarning size={20} color="orange" />;
      default: return <Info size={20} color="var(--mocha)" />;
    }
  };

  const getHeader = (type) => {
    if (type === 'CAPTURE') return t.logs.capture_event;
    if (type === 'BATTERY') return t.logs.bat_event;
    return t.logs.sys_event;
  };

  return (
    <div className="page-view slide-in">
      <h2 className="section-title">{t.alerts_hist}</h2>
      <p className="section-subtitle">{t.event_log}</p>

      <div className="timeline-container">
        {displayLogs.map(log => (
          <div key={log.id} className="timeline-item">
            <div className="timeline-icon">
              {getIcon(log.type)}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <strong>{getHeader(log.type)}</strong>
                <span className="timeline-time">{t.dates[log.dateKey] || log.dateKey} {log.time}</span>
              </div>
              <p className="timeline-msg">{t.logs[log.msgKey] || log.msgKey}</p>
              <span className="timeline-node">{log.trapId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
