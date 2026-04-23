import React, { useState } from 'react';
import { Smartphone, Mail, CloudCog, RefreshCcw, BellRing, Wifi } from 'lucide-react';

export default function SettingsScreen({ t }) {
  const [sms, setSms] = useState(true);
  const [email, setEmail] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [isLora, setIsLora] = useState(true);
  const [isDiagnostic, setIsDiagnostic] = useState(false);

  const handleDiagnostic = () => {
    setIsDiagnostic(true);
    setTimeout(() => {
      setIsDiagnostic(false);
      alert(t.logs.sys_diag_pass);
    }, 2000);
  };

  return (
    <div className="page-view slide-in">
      <h2 className="section-title">{t.config}</h2>
      <p className="section-subtitle">{t.sys_pref}</p>

      <div className="settings-group">
        <h3 className="settings-group-title"><BellRing size={14} /> {t.settings.notif}</h3>
        
        <div className="settings-row">
          <div className="settings-label">
            <Smartphone size={18} />
            <span>{t.settings.sms}</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={sms} onChange={() => setSms(!sms)} />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-label">
            <Mail size={18} />
            <span>{t.settings.email}</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={email} onChange={() => setEmail(!email)} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <h3 className="settings-group-title"><Wifi size={14} /> {t.settings.net_mode}</h3>
        
        <div className="settings-row">
          <div className="settings-label" style={{ opacity: isLora ? 0.5 : 1}}>
            <RefreshCcw size={18} />
            <span style={{ fontSize: '0.8rem' }}>{t.settings.wifi}</span>
          </div>
          <label className="switch" style={{ margin: '0 10px'}}>
            <input type="checkbox" checked={isLora} onChange={() => setIsLora(!isLora)} />
            <span className="slider round"></span>
          </label>
          <div className="settings-label" style={{ opacity: !isLora ? 0.5 : 1}}>
            <CloudCog size={18} />
            <span style={{ fontSize: '0.8rem', color: isLora ? '#4CAF50': 'inherit' }}>{t.settings.lora}</span>
          </div>
        </div>
      </div>

      <button 
        className="pro-btn" 
        style={{ marginTop: '20px', opacity: isDiagnostic ? 0.7 : 1 }} 
        onClick={handleDiagnostic}
        disabled={isDiagnostic}
      >
        {isDiagnostic ? t.settings.running : t.settings.run_diag}
      </button>
    </div>
  );
}
