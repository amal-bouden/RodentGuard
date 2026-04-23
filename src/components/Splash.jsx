import React, { useEffect, useState } from 'react';

const SplashRatIcon = () => (
  <svg viewBox="0 0 100 100" className="splash-icon">
    <path d="M50 25C35 25 22 38 22 55C22 72 35 85 50 85C65 85 78 72 78 55C78 38 65 25 50 25Z" fill="none" stroke="currentColor" strokeWidth="3"/>
    <circle cx="28" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="72" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="40" cy="52" r="3" fill="currentColor" />
    <circle cx="60" cy="52" r="3" fill="currentColor" />
    <path d="M15 60L5 62M15 65L4 70M85 60L95 62M85 65L96 70" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default function Splash({ onComplete }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fade out after 2.5s
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 2500);

    // Unmount after 3s (allowing 0.5s for fade animation)
    const unmountTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-screen ${fade ? 'splash-fade' : ''}`}>
      <div className="splash-content">
        <SplashRatIcon />
        <h1 className="splash-title">RodentGuard</h1>
        <p className="splash-subtitle">Système de dératisation connecté</p>
        <div className="splash-loader"></div>
      </div>
    </div>
  );
}
