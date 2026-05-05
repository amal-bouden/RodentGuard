import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import Dashboard from './components/Dashboard';
import UnitDetail from './components/UnitDetail';
import MapScreen from './components/MapScreen';
import AlertsScreen from './components/AlertsScreen';
import SettingsScreen from './components/SettingsScreen';
import Splash from './components/Splash';
import { mockTraps } from './mockData';
import { Home, Map as MapIcon, Bell, Settings } from 'lucide-react';

const translations = {
  en: { 
    unit: "SENTINEL_UNIT", ready: "SYSTEM_READY", active: "CAPTURE_ACTIVE", 
    node: "NODE", sector: "SECTOR_ZONE", location: "LOCATION", 
    signal: "LORA_RSSI_SIGNAL", reset: "ACKNOWLEDGE ALERT", test: "TEST SYSTEM ALERT",
    sys_status: "System Status", active_nodes: "Active Nodes", captures: "Captures", low_batt: "Low Battery", connected_units: "Connected Units",
    global_map: "Global Map Overview", gps_nodes: "Real-time GPS nodes",
    alerts_hist: "Alerts History", event_log: "Chronological event log",
    config: "Configuration", sys_pref: "System preferences",
    nav_home: "Home", nav_map: "Map", nav_alerts: "Alerts", nav_settings: "Settings",
    sectors: { kitchen: "KITCHEN NORTH BLOCK", stockA: "STOCK ROOM A", basement: "BASEMENT LEVEL 1", garbage: "GARBAGE AREA" },
    logs: { capture_stock: "Rodent capture detected in Stock Room A.", bat_critical: "Battery level critical (15%). Requires maintenance.", capture_garbage: "Rodent capture detected in Garbage Area.", sys_diag_pass: "Weekly network diagnostic passed successfully.", capture_event: "Capture Detected", bat_event: "Low Battery", sys_event: "System Event" },
    dates: { today: "Today", yesterday: "Yesterday" },
    settings: { notif: "Notifications", sms: "SMS Alerts", email: "Email Reports", connection: "Connection", autosync: "Auto-Sync Mesh (LoRa / ESP Wi-Fi)", run_diag: "Run System Diagnostic", running: "Running Diagnostic...", net_mode: "Global Network Protocol", wifi: "ESP Wi-Fi (Prototype)", lora: "LoRa Mesh (Production)" },
    map_status: { detected: "CAPTURE DETECTED", standby: "STANDBY" },
    sensors: { weight: "WEIGHT", ir: "INFRARED", blocked: "BLOCKED", clear: "CLEAR", buzzer: "TRIGGER BUZZER", buzzer_stop: "STOP ALARM" }
  },
  fr: { 
    unit: "UNITÉ_SENTINELLE", ready: "SYSTÈME_PRÊT", active: "CAPTURE_ACTIVE", 
    node: "NŒUD", sector: "ZONE_SECTEUR", location: "LOCALISATION", 
    signal: "SIGNAL_RSSI_LORA", reset: "ACQUITTER L'ALERTE", test: "TESTER L'ALERTE",
    sys_status: "Statut du Système", active_nodes: "Nœuds Actifs", captures: "Captures", low_batt: "Batterie Faible", connected_units: "Unités Connectées",
    global_map: "Carte Globale", gps_nodes: "Nœuds GPS en temps réel",
    alerts_hist: "Historique", event_log: "Journal des évènements",
    config: "Configuration", sys_pref: "Préférences système",
    nav_home: "Accueil", nav_map: "Carte", nav_alerts: "Alertes", nav_settings: "Réglages",
    sectors: { kitchen: "BLOC NORD CUISINE", stockA: "RÉSERVE A", basement: "SOUS-SOL NIVEAU 1", garbage: "ZONE DÉCHETS" },
    logs: { capture_stock: "Capture de rongeur détectée dans la Réserve A.", bat_critical: "Niveau de batterie critique (15%). Maintenance requise.", capture_garbage: "Capture de rongeur détectée dans la Zone Déchets.", sys_diag_pass: "Diagnostic réseau hebdomadaire réussi.", capture_event: "Capture Détectée", bat_event: "Batterie Faible", sys_event: "Évènement Système" },
    dates: { today: "Aujourd'hui", yesterday: "Hier" },
    settings: { notif: "Notifications", sms: "Alertes SMS", email: "Rapports Email", connection: "Connexion", autosync: "Synchronisation maillée (LoRa / Wi-Fi)", run_diag: "Lancer le Diagnostic", running: "Diagnostic en cours...", net_mode: "Protocole Réseau Global", wifi: "ESP Wi-Fi (Prototype)", lora: "LoRa Mesh (Production)" },
    map_status: { detected: "CAPTURE DÉTECTÉE", standby: "EN VEILLE" },
    sensors: { weight: "POIDS", ir: "INFRAROUGE", blocked: "COUPÉ", clear: "RAS", buzzer: "ACTIVER BUZZER", buzzer_stop: "COUPER L'ALARME" }
  },
  ar: { 
    unit: "وحدة_الحراسة", ready: "النظام_جاهز", active: "تم_الرصد", 
    node: "عقدة", sector: "منطقة_القطاع", location: "الموقع", 
    signal: "إشارة_LORA_RSSI", reset: "تأكيد التنبيه", test: "اختبار التنبيه",
    sys_status: "حالة النظام", active_nodes: "العقد النشطة", captures: "تم رصدها", low_batt: "بطارية ضعيفة", connected_units: "الوحدات المتصلة",
    global_map: "خريطة شاملة", gps_nodes: "عقد GPS حية",
    alerts_hist: "سجل التنبيهات", event_log: "سجل الأحداث الزمني",
    config: "الإعدادات", sys_pref: "تفضيلات النظام",
    nav_home: "الرئيسية", nav_map: "خريطة", nav_alerts: "تنبيهات", nav_settings: "إعدادات",
    sectors: { kitchen: "كتلة المطبخ الشمالية", stockA: "المخزن أ", basement: "الطابق السفلي مستوى ١", garbage: "منطقة النفايات" },
    logs: { capture_stock: "تم رصد قارض في المخزن أ.", bat_critical: "مستوى البطارية حرج (15٪). الصيانة مطلوبة.", capture_garbage: "تم رصد قارض في منطقة النفايات.", sys_diag_pass: "تم اجتياز فحص الشبكة الأسبوعي بنجاح.", capture_event: "تم الرصد", bat_event: "بطارية ضعيفة", sys_event: "حدث بالنظام" },
    dates: { today: "اليوم", yesterday: "أمس" },
    settings: { notif: "الإشعارات", sms: "تنبيهات SMS", email: "تقارير البريد", connection: "الاتصال", autosync: "مزامنة الشبكة", run_diag: "إجراء فحص النظام", running: "جاري الفحص...", net_mode: "بروتوكول الشبكة العام", wifi: "ESP Wi-Fi (نموذج)", lora: "LoRa Mesh (إنتاج)" },
    map_status: { detected: "تم الرصد", standby: "في وضع الاستعداد" },
    sensors: { weight: "الوزن", ir: "مستشعر الأشعة", blocked: "مقطوع", clear: "سليم", buzzer: "تشغيل الإنذار", buzzer_stop: "إيقاف الإنذار" }
  }
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('en');
  const [traps, setTraps] = useState(mockTraps);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTrapId, setSelectedTrapId] = useState(null);

  useEffect(() => {
    // 1. Connect to our Express Backend (Production port 8080)
    const socket = io("http://10.187.74.71:8080");

    // 2. Fetch Initial live state
    fetch("http://10.187.74.71:8080/api/traps")
      .then(res => res.json())
      .then(data => {
        if(data && data.length) setTraps(data);
      })
      .catch(err => console.log('Using mock traps fallback'));

    fetch("http://10.187.74.71:8080/api/logs")
      .then(res => res.json())
      .then(data => {
        if(data && data.length) setLogs(data);
      })
      .catch(err => console.log('Using mock logs fallback'));

    // 3. Listen for asynchronous hardware triggers!
    socket.on("TRAP_UPDATE", (updatedTrap) => {
      if (!updatedTrap) return;
      setTraps(prevTraps => {
        const mac = updatedTrap.macAddress || updatedTrap.id || "UNKNOWN";
        const exists = prevTraps.some(tr => tr.id === updatedTrap.id || tr.macAddress === updatedTrap.macAddress);
        if (exists) {
          return prevTraps.map(tr => tr.id === updatedTrap.id || tr.macAddress === updatedTrap.macAddress ? { ...tr, ...updatedTrap } : tr);
        } else {
          return [...prevTraps, {
            ...updatedTrap,
            id: mac,
            macAddress: mac,
            name: `NODE-${mac.toString().slice(-5)}`,
            sectorKey: "new_zone"
          }];
        }
      });
    });

    socket.on("TRAP_ALERT", (data) => {
      if (!data || !data.trap) return;
      const { trap, log, message } = data;
      console.log(message);
      setLogs(prevLogs => [log, ...prevLogs]);
      
      setTraps(prevTraps => {
        const mac = trap.macAddress || "UNKNOWN";
        const exists = prevTraps.some(tr => tr.macAddress === mac);
        if (exists) {
          return prevTraps.map(tr => tr.macAddress === mac ? { ...tr, ...trap } : tr);
        } else {
          return [...prevTraps, { ...trap, id: mac, name: `NODE-${mac.toString().slice(-5)}` }];
        }
      });
    });

    socket.on("LOG_UPDATE", (newLog) => {
      setLogs(prevLogs => [newLog, ...prevLogs]);
    });

    return () => socket.disconnect();
  }, []);

  const t = translations[lang] || translations.en;

  const handleSelectTrap = (trap) => {
    setSelectedTrapId(trap.id);
  };

  const handleBack = () => {
    setSelectedTrapId(null);
  };

  const toggleAlert = (id) => {
    // Clear the alert on the backend
    fetch(`http://10.187.74.71:8080/api/traps/${id}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      console.log("Alert reset:", data);
      // Update local state immediately
      setTraps(prevTraps => prevTraps.map(t => 
        (t.id === id || t.macAddress === id) 
          ? { ...t, isAlert: false, status: "SYSTEM_READY", weight: 0, irActive: false }
          : t
      ));
    })
    .catch(err => console.error("Reset error:", err));
  };

  const toggleBuzzer = (id) => {
    const trap = traps.find(t => t.id === id || t._id === id || t.macAddress === id);
    if (!trap) {
      console.error("Trap not found:", id);
      return;
    }
    
    const newState = !trap.buzzerOn;

    fetch(`http://10.187.74.71:8080/api/traps/${id}/buzzer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activate: newState })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Buzzer toggled:", data);
      // Update local state immediately
      setTraps(prevTraps => prevTraps.map(t => 
        (t.id === id || t.macAddress === id || t._id === id)
          ? { ...t, buzzerOn: newState }
          : t
      ));
    })
    .catch(err => console.error("Buzzer error:", err));
  };

  const selectedTrap = traps.find(tr => String(tr.id) === String(selectedTrapId) || String(tr._id) === String(selectedTrapId));

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  const renderContent = () => {
    if (selectedTrapId) {
      return (
        <UnitDetail 
          trap={selectedTrap} 
          onBack={handleBack} 
          isDark={isDark} 
          t={t} 
          toggleAlert={toggleAlert}
          toggleBuzzer={toggleBuzzer}
        />
      );
    }
    
    switch (activeTab) {
      case 'map': return <MapScreen traps={traps} isDark={isDark} t={t} />;
      case 'alerts': return <AlertsScreen t={t} logs={logs} />;
      case 'settings': return <SettingsScreen t={t} lang={lang} setLang={setLang} isDark={isDark} setIsDark={setIsDark} />;
      case 'dashboard':
      default:
        return (
          <Dashboard 
            traps={traps} 
            onSelectTrap={handleSelectTrap} 
            t={t} 
          />
        );
    }
  };

  return (
    <div className={`app-canvas ${isDark ? 'mocha-dark' : 'vanilla-light'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="glass-container">
        
        {/* Dynamic Inner Content Window */}
        <div className="content-window">
          {renderContent()}
        </div>

        {/* Bottom Tab Navigation */}
        {!selectedTrapId && (
          <nav className="bottom-nav">
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <Home size={22} />
              <span>{t.nav_home}</span>
            </button>
            <button className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
              <MapIcon size={22} />
              <span>{t.nav_map}</span>
            </button>
            <button className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
              <Bell size={22} />
              <span>{t.nav_alerts}</span>
            </button>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={22} />
              <span>{t.nav_settings}</span>
            </button>
          </nav>
        )}

      </div>
    </div>
  );
}