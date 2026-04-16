import { useState } from 'react';
import './App.css';
import TrapMap from './assets/Map'; 

// 1. Stable Icon Component (Fixed outside to prevent render errors)
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

const translations = {
  en: { 
    unit: "SENTINEL_UNIT_01", ready: "SYSTEM_READY", active: "CAPTURE_ACTIVE", 
    node: "NODE: NEXYS-3-6SLX16", sector: "SECTOR_ZONE", location: "KITCHEN_NORTH_BLOCK", 
    signal: "VHDL_SIGNAL_STATUS", reset: "ACKNOWLEDGE ALERT", test: "TEST SYSTEM ALERT" 
  },
  fr: { 
    unit: "UNITÉ_SENTINELLE_01", ready: "SYSTÈME_PRÊT", active: "CAPTURE_ACTIVE", 
    node: "NŒUD: NEXYS-3-6SLX16", sector: "ZONE_SECTEUR", location: "BLOC_NORD_CUISINE", 
    signal: "STATUT_SIGNAL_VHDL", reset: "ACQUITTER L'ALERTE", test: "TESTER L'ALERTE" 
  },
  ar: { 
    unit: "وحدة_الحراسة_01", ready: "النظام_جاهز", active: "تم_الرصد", 
    node: "عقدة: NEXYS-3-6SLX16", sector: "منطقة_القطاع", location: "كتلة_المطبخ_الشمالية", 
    signal: "حالة_إشارة_VHDL", reset: "تأكيد التنبيه", test: "اختبار التنبيه" 
  }
};

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [lang, setLang] = useState('en');

  const t = translations[lang];

  return (
    <div className={`app-canvas ${isDark ? 'mocha-dark' : 'vanilla-light'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="glass-container">
        {/* Navbar */}
        <nav className="navbar">
          <div className="lang-switcher">
            {['en', 'fr', 'ar'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={lang === l ? 'active-lang' : ''}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="toggle-pill" onClick={() => setIsDark(!isDark)}>
            <div className={`pill-circle ${isDark ? 'right' : 'left'}`}></div>
          </button>
        </nav>

        {/* Hero Section */}
        <header className="hero-status">
          <div className="logo-group">
            <div className="logo-box" style={{ background: isAlert ? 'var(--alert-red)' : 'var(--mocha)' }}>RG</div>
            <span>{t.unit}</span>
          </div>
          <div className="icon-vault">
            <RatIcon isAlert={isAlert} />
          </div>
          <h1 className="status-heading">{isAlert ? t.active : t.ready}</h1>
          <span className="sub-text">{t.node}</span>
        </header>

        {/* Info Deck */}
        <div className="info-deck">
          <TrapMap isDark={isDark} />
          <div className="data-tile">
            <label>{t.sector}</label>
            <strong>{t.location}</strong>
          </div>
          <div className="data-tile">
            <label>{t.signal}</label>
            <strong style={{ color: isAlert ? 'var(--alert-red)' : 'inherit' }}>
                {isAlert ? "0x01 (DETECTED)" : "0x00 (STANDBY)"}
            </strong>
          </div>
        </div>

        {/* Action Button */}
        <button 
          className="pro-btn" 
          onClick={() => setIsAlert(!isAlert)}
          style={{ background: isAlert ? 'var(--alert-red)' : 'var(--mocha)' }}
        >
          {isAlert ? t.reset : t.test}
        </button>
      </div>
    </div>
  );
}