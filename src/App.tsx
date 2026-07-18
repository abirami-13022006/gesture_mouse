import React, { useState, useEffect } from "react";
import { Complaint, User, AdminLog, Language } from "./types";
import { translations } from "./translations";
import { 
  Shield, 
  Map, 
  Sparkles, 
  BarChart3, 
  Bot, 
  LogOut, 
  Globe, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Lock, 
  Layers, 
  FileText, 
  Phone, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  X,
  Smartphone,
  Laptop,
  Clock,
  Radio,
  UserCheck,
  RotateCw,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GisMap from "./components/GisMap";
import AnalyticsHub from "./components/AnalyticsHub";
import AdminConsole from "./components/AdminConsole";
import AIAssistant from "./components/AIAssistant";
import AIDetector from "./components/AIDetector";
import SplashScreen from "./components/SplashScreen";
import { getOfflineQueue, syncOfflineQueue, queueOfflineComplaint } from "./utils/offlineManager";

export default function App() {
  // Splash Screen & Custom Theme States
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Localization & language switcher
  const [language, setLanguage] = useState<Language>("English");
  const t = translations[language];

  // System States
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // View state for mobile/small screens (toggle between Phone app and PC control center)
  const [viewMode, setViewMode] = useState<"citizen" | "admin">("citizen");

  // Phone time simulator clock
  const [phoneTime, setPhoneTime] = useState("12:00");

  // Authentication Mode
  const [currentUser, setCurrentUser] = useState<User>({
    name: "Ramesh Kumar",
    email: "ramesh.kumar@gmail.com",
    phone: "+91 98765 43210",
    role: "Citizen",
    status: "Active",
    regDate: "2026-02-14"
  });

  // Citizen App Navigation tabs (active inside the simulated smartphone)
  const [activeTab, setActiveTab] = useState<"home" | "map" | "detector" | "analytics" | "assistant">("home");

  // PC Admin Control Center active tabs
  const [adminActiveTab, setAdminActiveTab] = useState<"console" | "analytics" | "map">("console");
  
  // Embedded map-specific layer filter state
  const [mapLayerFilter, setMapLayerFilter] = useState<"air" | "river" | "solid" | "complaints">("complaints");

  // Selected complaint for inspect overlay
  const [inspectComplaint, setInspectComplaint] = useState<Complaint | null>(null);

  // Fetch initial collections from server
  const fetchAllCollections = async () => {
    try {
      // 1. Fetch complaints
      const compRes = await fetch("/api/complaints");
      if (compRes.ok) {
        const compData = await compRes.json();
        setComplaints(compData.complaints || []);
      }

      // 2. Fetch users
      const userRes = await fetch("/api/users");
      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(userData.users || []);
      }

      // 3. Fetch logs
      const logRes = await fetch("/api/logs");
      if (logRes.ok) {
        const logData = await logRes.json();
        setLogs(logData.logs || []);
      }
    } catch (err) {
      console.error("Failed fetching collection records from mock db.json", err);
    }
  };

  useEffect(() => {
    fetchAllCollections();

    // Smartphone dynamic clock updater
    const updateTime = () => {
      const now = new Date();
      setPhoneTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    // Listen to network status
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue((syncedList) => {
        setSyncMessage(`Successfully synchronized ${syncedList.length} offline environmental reports back to government database!`);
        fetchAllCollections();
        setTimeout(() => setSyncMessage(null), 5000);
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.clearInterval(clockInterval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Update a complaint record
  const handleUpdateComplaint = async (id: string, status: Complaint["status"], remarks: string) => {
    try {
      const res = await fetch("/api/complaints/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, remarks, adminUser: "Sanjay Deshmukh" })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchAllCollections();
        }
      }
    } catch (err) {
      console.error("Failed updating complaint record", err);
    }
  };

  // Delete a complaint record
  const handleDeleteComplaint = async (id: string) => {
    try {
      const res = await fetch("/api/complaints/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminUser: "Sanjay Deshmukh" })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchAllCollections();
        }
      }
    } catch (err) {
      console.error("Failed deleting complaint", err);
    }
  };

  // Update User Status
  const handleUpdateUserStatus = async (email: string, status: User["status"]) => {
    try {
      const res = await fetch("/api/users/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, status, adminUser: "Sanjay Deshmukh" })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchAllCollections();
        }
      }
    } catch (err) {
      console.error("Failed updating user status", err);
    }
  };

  const handleSelectComplaintFromMap = (c: Complaint) => {
    setInspectComplaint(c);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 ${theme === "dark" ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Dynamic Splash Screen Node Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 z-50"
          >
            <SplashScreen
              defaultLanguage={language}
              defaultTheme={theme}
              onLaunch={(lang, thm) => {
                setLanguage(lang);
                setTheme(thm);
                setShowSplash(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ONLINE / OFFLINE STATUS BARS */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-600 text-white font-extrabold text-[11px] py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 z-50 relative"
          >
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            OFFLINE MODE ENABLED: Captures will be stored locally and synced automatically when signal returns.
          </motion.div>
        )}
        {syncMessage && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-600 text-white font-black text-xs py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 z-50 relative"
          >
            <CheckCircle2 className="w-4 h-4 animate-bounce" />
            {syncMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER WITH CPCB EMBLEM & LANGUAGE */}
      <header className={`border-b shadow-xl py-3 px-4 md:px-8 flex flex-col sm:flex-row gap-3 items-center justify-between z-10 transition-colors duration-300 ${theme === "dark" ? "bg-slate-950 border-slate-850 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-sm"}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Shield className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-sm font-black tracking-tight uppercase ${theme === "dark" ? "text-white" : "text-indigo-900"}`}>
                {language === "English" ? "ECOSHIELD AI" : t.appName || "ECOSHIELD AI"}
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 font-extrabold text-[9px] px-2 py-0.5 border border-emerald-500/20 rounded-full tracking-wider uppercase">
                National Control Node
              </span>
            </div>
            <p className={`text-[10px] font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              {t.tagline || "India's Environmental Crime Intelligence Platform"}
            </p>
          </div>
        </div>

        {/* Global actions: Language selector, Light/Dark Mode toggle & Auto-refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Dynamic Language switcher */}
          <div className={`flex items-center rounded-xl px-2.5 py-1.5 text-xs gap-1.5 border transition-all ${theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"}`}>
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className={`bg-transparent border-none focus:outline-none font-bold cursor-pointer ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}
            >
              <option value="English" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>English (National)</option>
              <option value="Tamil" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>தமிழ் (Tamil)</option>
              <option value="Hindi" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>हिन्दी (Hindi)</option>
              <option value="Telugu" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>తెలుగు (Telugu)</option>
              <option value="Kannada" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>ಕನ್ನಡ (Kannada)</option>
              <option value="Malayalam" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>മലയാളം (Malayalam)</option>
              <option value="Bengali" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>বাংলা (Bengali)</option>
              <option value="Gujarati" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>ગુજરાતી (Gujarati)</option>
              <option value="Marathi" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>मराठी (Marathi)</option>
              <option value="Punjabi" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>ਪੰਜਾਬੀ (Punjabi)</option>
            </select>
          </div>

          {/* Interactive Light / Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${theme === "dark" ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-amber-400" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-indigo-700"}`}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Database refresh */}
          <button
            onClick={fetchAllCollections}
            className={`p-2 border rounded-xl transition-all ${theme === "dark" ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"}`}
            title="Refresh National Database"
          >
            <RotateCw className="w-4 h-4 text-indigo-500" />
          </button>

          <div className={`hidden md:flex items-center gap-2 border rounded-xl px-3 py-1.5 text-xs ${theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-100/60 border-slate-200"}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className={`text-[10px] font-mono ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>CPCB Grid: Connected</span>
          </div>

        </div>
      </header>

      {/* RESPONSIVE SEGMENTED SWITCHER BAR (Visible ONLY on tablet/mobile) */}
      <div className="block lg:hidden bg-slate-950/90 border-b border-slate-850 p-2 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex bg-slate-900 p-1 rounded-xl max-w-md mx-auto">
          <button
            onClick={() => setViewMode("citizen")}
            className={`flex-1 py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${viewMode === "citizen" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            📱 Citizen Phone App
          </button>
          <button
            onClick={() => setViewMode("admin")}
            className={`flex-1 py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${viewMode === "admin" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            <Laptop className="w-3.5 h-3.5" />
            🖥️ Govt Control Center
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT BODY */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 lg:p-6 grid grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ==========================================
            COLUMN 1: CITIZEN SMARTPHONE SIMULATOR 
            ========================================== */}
        <div className={`col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col items-center justify-center ${viewMode === "citizen" ? "block" : "hidden lg:flex"}`}>
          
          <div className="w-full max-w-[375px] text-center mb-2 flex items-center justify-between px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> Citizen Simulator
            </span>
            <span className="text-[10px] text-indigo-400 font-bold">100% Real-time Sync</span>
          </div>

          {/* SMARTPHONE DEVICE OUTER BEZEL FRAME */}
          <div className="w-full max-w-[375px] h-[780px] bg-slate-950 rounded-[50px] border-[12px] border-slate-950 shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-slate-800">
            
            {/* Dynamic Island / Camera Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>

            {/* Simulated Phone Status Bar */}
            <div className="absolute top-0 inset-x-0 h-9 bg-slate-950/80 backdrop-blur-sm flex items-center justify-between px-6 z-30 text-[11px] font-black tracking-wide text-slate-300">
              {/* Carrier Name */}
              <span className="text-[10px] text-slate-400">EcoShield IN</span>
              {/* Simulated Clock (Live time) */}
              <span className="font-semibold text-slate-200">{phoneTime}</span>
              {/* Status symbols */}
              <div className="flex items-center gap-1">
                {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
                <span className="text-[9px] text-slate-400">98%</span>
                <div className="w-5 h-2.5 bg-slate-800 border border-slate-700 rounded-sm p-0.5 flex items-center">
                  <div className="h-full w-4 bg-emerald-500 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* SMARTPHONE CONTENT CONTAINER SCREEN (Scrollable) */}
            <div className="flex-1 bg-slate-900 text-slate-100 overflow-y-auto pt-9 pb-16 flex flex-col scrollbar-thin scrollbar-thumb-slate-800">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col p-4 space-y-4"
                >
                  {/* TAB 1: SMARTPHONE APP HOME / OVERVIEW */}
                  {activeTab === "home" && (
                    <div className="space-y-4 flex-1">
                      
                      {/* Swachh Bharat Welcome Header */}
                      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-4 rounded-2xl border border-indigo-500/15 relative overflow-hidden shadow-md">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[8px] font-black uppercase rounded tracking-wider">
                            Verified Account
                          </span>
                          <span className="text-[8px] text-slate-400 font-mono">ID: IND-8761</span>
                        </div>
                        <h3 className="text-base font-black text-white">Namaste, {currentUser.name}</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                          Empowering citizens with AI to safeguard our rivers, soil, and air quality across India.
                        </p>

                        <div className="mt-3 pt-3 border-t border-indigo-950 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-bold">Verified Reports filed:</span>
                          <span className="font-bold text-white bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
                            {complaints.filter(c => c.reporterName === currentUser.name).length} Cases
                          </span>
                        </div>
                      </div>

                      {/* Swachh Bharat Pledge */}
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center gap-3">
                        <div className="text-xl">🇮🇳</div>
                        <div className="text-[10px] leading-tight">
                          <strong className="text-white block font-black">SWACHH BHARAT PLEDGE</strong>
                          <span className="text-slate-400">"I will devote time and report environmental hazards to protect our motherland."</span>
                        </div>
                      </div>

                      {/* Rapid Actions */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => setActiveTab("detector")}
                          className="bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl flex flex-col items-center justify-center text-center text-xs font-black text-white shadow shadow-indigo-600/10 transition"
                        >
                          <Sparkles className="w-5 h-5 mb-1 text-white animate-bounce" />
                          <span>AI camera</span>
                        </button>
                        <button
                          onClick={() => setActiveTab("map")}
                          className="bg-slate-950 border border-slate-800 hover:bg-slate-900 p-3 rounded-xl flex flex-col items-center justify-center text-center text-xs font-black text-slate-300 transition"
                        >
                          <Map className="w-5 h-5 mb-1 text-indigo-400" />
                          <span>Local Grid Map</span>
                        </button>
                      </div>

                      {/* Local Hazard Meter */}
                      <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-400">Local ERI Risk Meter</span>
                          <span className="text-emerald-400 font-black">Stable (Good)</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-black text-white">42 <span className="text-[10px] text-slate-500">/ 100</span></span>
                          <span className="text-[9px] text-slate-500">Yamuna River Region</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: "42%" }} />
                        </div>
                      </div>

                      {/* Active Grid Stream List */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-wider">
                          <span>Latest Incident Stream</span>
                          <span className="text-indigo-400">Live</span>
                        </div>

                        {complaints.length === 0 ? (
                          <div className="text-center py-6 border border-slate-800/60 border-dashed rounded-xl">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">No reports in region</span>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[180px] overflow-y-auto scrollbar-none">
                            {complaints.slice(0, 4).map((c) => (
                              <div
                                key={c.id}
                                onClick={() => setInspectComplaint(c)}
                                className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-2.5 hover:bg-slate-900 cursor-pointer transition"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <img src={c.imageUrl} className="w-8 h-8 rounded-md object-cover shrink-0" />
                                  <div className="min-w-0">
                                    <span className="font-black text-[10px] text-white block truncate">{c.category}</span>
                                    <span className="text-[9px] text-slate-500 block truncate">{c.address}</span>
                                  </div>
                                </div>
                                <span className={`shrink-0 px-1.5 py-0.5 text-[7px] font-black rounded border uppercase ${
                                  c.status === "Resolved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                  c.status === "Pending" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                }`}>
                                  {c.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 2: SMARTPHONE APP MAP LAYER */}
                  {activeTab === "map" && (
                    <div className="flex-1 flex flex-col space-y-3 min-h-0">
                      <div className="flex justify-between items-center bg-slate-950 p-2 border border-slate-850 rounded-xl">
                        <span className="text-[10px] font-black text-slate-300">INCIDENT GIS MARKERS</span>
                        <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-extrabold uppercase rounded">Map Grid</span>
                      </div>
                      
                      <div className="flex-1 h-[420px] rounded-xl overflow-hidden border border-slate-850">
                        <GisMap
                          complaints={complaints}
                          language={language}
                          selectedTab="complaints"
                          onSelectComplaint={handleSelectComplaintFromMap}
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SMARTPHONE APP CAMERA & AI DETECTOR */}
                  {activeTab === "detector" && (
                    <div className="flex-1">
                      <AIDetector
                        language={language}
                        onComplaintSubmitted={() => {
                          fetchAllCollections();
                          setActiveTab("home");
                        }}
                      />
                    </div>
                  )}

                  {/* TAB 4: SMARTPHONE APP STATS & RECHARTS */}
                  {activeTab === "analytics" && (
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-center bg-slate-950 p-2 border border-slate-850 rounded-xl">
                        <span className="text-[10px] font-black text-slate-300">ANALYTICS & THREAT LEAGUES</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Interactive</span>
                      </div>
                      <div className="h-[460px] overflow-y-auto scrollbar-none">
                        <AnalyticsHub
                          complaints={complaints}
                          language={language}
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 5: SMARTPHONE APP GEMINI CONVERSATIONAL AI CHATBOT */}
                  {activeTab === "assistant" && (
                    <div className="flex-1 h-[480px] flex flex-col min-h-0">
                      <AIAssistant
                        language={language}
                      />
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

            </div>

            {/* Simulated Smartphone Bottom Application Dock (Tab Switcher) */}
            <div className="absolute bottom-0 inset-x-0 h-14 bg-slate-950 border-t border-slate-850 flex justify-around items-center px-2 pb-2 z-30">
              {[
                { id: "home", label: "Overview", icon: "🏠" },
                { id: "map", label: "GIS Map", icon: "🗺️" },
                { id: "detector", label: "AI Camera", icon: "📸" },
                { id: "analytics", label: "Stats", icon: "📊" },
                { id: "assistant", label: "AI Chat", icon: "💬" }
              ].map((dockTab) => (
                <button
                  key={dockTab.id}
                  onClick={() => setActiveTab(dockTab.id as any)}
                  className={`flex flex-col items-center justify-center transition-all px-2.5 py-1 rounded-xl cursor-pointer ${activeTab === dockTab.id ? "bg-slate-900 text-white shadow-inner scale-105" : "text-slate-500 hover:text-slate-300 scale-95"}`}
                >
                  <span className="text-base mb-0.5">{dockTab.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-wider">{dockTab.label}</span>
                </button>
              ))}
            </div>

            {/* Virtual Home Indicator Bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-700/80 rounded-full z-40 pointer-events-none" />

          </div>
        </div>

        {/* ==========================================
            COLUMN 2: PC GOVERNMENT CONTROL CENTER
            ========================================== */}
        <div className={`col-span-12 lg:col-span-7 xl:col-span-8 space-y-6 ${viewMode === "admin" ? "block" : "hidden lg:block"}`}>
          
          {/* CONTROL CENTER DECORATIVE MARGIN PANEL */}
          <div className={`flex items-center justify-between border-b pb-3 ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-indigo-400" />
              <span className={`text-xs font-black uppercase tracking-widest ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                🌎 National Environmental Control Panel
              </span>
            </div>
            
            {/* Quick action: role switcher and CPCB details */}
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] font-mono hidden sm:inline ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>ROOT NODE // Delhi_Sector_04</span>
              
              <button
                onClick={() => {
                  const nextRole = currentUser.role === "Citizen" ? "Government Admin" : "Citizen";
                  setCurrentUser({
                    ...currentUser,
                    role: nextRole,
                    name: nextRole === "Citizen" ? "Ramesh Kumar" : "Sanjay Deshmukh (CPCB Commissioner)"
                  });
                }}
                className={`flex items-center gap-1.5 px-3 py-1 border rounded-lg text-[10px] font-black uppercase tracking-wider transition ${currentUser.role === "Government Admin" ? "bg-red-950/40 border-red-500 text-red-400" : theme === "dark" ? "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200" : "bg-white border-slate-200 text-slate-600 hover:text-indigo-600"}`}
              >
                <UserCheck className="w-3 h-3 text-red-400" /> Toggle Admin Role
              </button>
            </div>
          </div>

          {/* DYNAMIC TELEMETRY KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Card 1: Total Incidents */}
            <div className={`${theme === "dark" ? "bg-slate-950/60 border-slate-850 hover:border-slate-800" : "bg-white border-slate-200 hover:border-indigo-100 shadow-sm"} p-4 border rounded-2xl space-y-1 relative overflow-hidden group transition-all`}>
              <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-full blur-lg" />
              <span className={`text-[9px] font-black uppercase tracking-wider block ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>Total Grid Incidents</span>
              <span className={`text-2xl font-black block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{complaints.length}</span>
              <span className="text-[9px] text-indigo-500 font-bold block">National database size</span>
            </div>

            {/* Card 2: Pending Investigation */}
            <div className={`${theme === "dark" ? "bg-slate-950/60 border-slate-850 hover:border-slate-800" : "bg-white border-slate-200 hover:border-amber-100 shadow-sm"} p-4 border rounded-2xl space-y-1 relative overflow-hidden group transition-all`}>
              <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/5 rounded-full blur-lg" />
              <span className={`text-[9px] font-black uppercase tracking-wider block ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>Under Investigation</span>
              <span className="text-2xl font-black text-amber-500 block">
                {complaints.filter(c => c.status !== "Resolved" && c.status !== "Rejected").length}
              </span>
              <span className="text-[9px] text-amber-600 font-bold block">Awaiting immediate response</span>
            </div>

            {/* Card 3: Resolved Environmental cases */}
            <div className={`${theme === "dark" ? "bg-slate-950/60 border-slate-850 hover:border-slate-800" : "bg-white border-slate-200 hover:border-emerald-100 shadow-sm"} p-4 border rounded-2xl space-y-1 relative overflow-hidden group transition-all`}>
              <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-lg" />
              <span className={`text-[9px] font-black uppercase tracking-wider block ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>Resolved & Cleaned</span>
              <span className={`text-2xl font-black block ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                {complaints.filter(c => c.status === "Resolved").length}
              </span>
              <span className="text-[9px] text-emerald-500 font-bold block">Completed operations success</span>
            </div>

            {/* Card 4: Threat Index */}
            <div className={`${theme === "dark" ? "bg-slate-950/60 border-slate-850 hover:border-slate-800" : "bg-white border-slate-200 hover:border-red-100 shadow-sm"} p-4 border rounded-2xl space-y-1 relative overflow-hidden group transition-all`}>
              <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/5 rounded-full blur-lg" />
              <span className={`text-[9px] font-black uppercase tracking-wider block ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>Grid Avg Threat Rating</span>
              <span className="text-2xl font-black text-red-500 block">High</span>
              <span className="text-[9px] text-red-400 font-bold block">Avg computer confidence: 91.2%</span>
            </div>

          </div>

          {/* CONTROL CENTER TAB SELECTION BAR */}
          <div className={`p-1.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors duration-300 ${theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className="flex gap-2.5">
              <button
                onClick={() => setAdminActiveTab("console")}
                className={`py-2 px-4 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${adminActiveTab === "console" ? "bg-indigo-600 text-white shadow" : theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-indigo-600"}`}
              >
                📋 Incidents queue & Verification console
              </button>
              <button
                onClick={() => setAdminActiveTab("analytics")}
                className={`py-2 px-4 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${adminActiveTab === "analytics" ? "bg-indigo-600 text-white shadow" : theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-indigo-600"}`}
              >
                📊 National Analytics Hub
              </button>
              <button
                onClick={() => setAdminActiveTab("map")}
                className={`py-2 px-4 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${adminActiveTab === "map" ? "bg-indigo-600 text-white shadow" : theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-indigo-600"}`}
              >
                🗺️ Master GIS grid Map Layer
              </button>
            </div>
            
            <div className="hidden xl:flex items-center gap-1 text-[9px] font-mono text-slate-500">
              <Radio className="w-3.5 h-3.5 text-indigo-500 animate-ping" />
              <span>Real-time DB Stream</span>
            </div>
          </div>

          {/* COGNITIVE TAB VIEWPORT CONTAINER */}
          <div className={`p-6 rounded-3xl border min-h-[600px] shadow-2xl relative overflow-hidden transition-all duration-300 ${theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-white border-slate-200"}`}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/[0.01] rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={adminActiveTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* ADMIN TAB 1: ADMIN CONSOLE DIRECTORY */}
                {adminActiveTab === "console" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div>
                        <h3 className={`text-base font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Central Registry Verification Engine</h3>
                        <p className="text-[11px] text-slate-500">Review machine YOLO bounding boxes, modify cases, approve action routes, manage users, and inspect security logs.</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-full border ${theme === "dark" ? "bg-red-950/40 text-red-400 border-red-900/40" : "bg-red-50 text-red-600 border-red-200"}`}>
                        Admin Session: SANJAY DESHMUKH
                      </span>
                    </div>

                    <AdminConsole
                      complaints={complaints}
                      users={users}
                      logs={logs}
                      language={language}
                      onUpdateComplaint={handleUpdateComplaint}
                      onDeleteComplaint={handleDeleteComplaint}
                      onUpdateUserStatus={handleUpdateUserStatus}
                    />
                  </div>
                )}

                {/* ADMIN TAB 2: NATIONAL STATS ANALYTICS */}
                {adminActiveTab === "analytics" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                      <div>
                        <h3 className={`text-base font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>State & National Crime Analytics Room</h3>
                        <p className="text-[11px] text-slate-500">View month-over-month crime volume spikes, top polluted districts, and action resolution rates.</p>
                      </div>
                    </div>

                    <AnalyticsHub
                      complaints={complaints}
                      language={language}
                    />
                  </div>
                )}

                {/* ADMIN TAB 3: MASTER GIS MAP LAYER */}
                {adminActiveTab === "map" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div>
                        <h3 className={`text-base font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>National GIS Telemetry Grid</h3>
                        <p className="text-[11px] text-slate-500">Overlay dynamic Air Quality (AQI), River Plume and Landfill density indexes across India's master satellite mapping canvas.</p>
                      </div>

                      {/* Map filters inside administrative view */}
                      <div className={`flex items-center p-1 rounded-xl border gap-1 ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                        {[
                          { id: "complaints", label: "Incident Markers" },
                          { id: "air", label: "AQI Heatmap" },
                          { id: "river", label: "River Pollution" },
                          { id: "solid", label: "Landfill Density" }
                        ].map(layerTab => (
                          <button
                            key={layerTab.id}
                            onClick={() => setMapLayerFilter(layerTab.id as any)}
                            className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${mapLayerFilter === layerTab.id ? "bg-indigo-600 text-white" : theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-indigo-600"}`}
                          >
                            {layerTab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-850 shadow-inner">
                      <GisMap
                        complaints={complaints}
                        language={language}
                        selectedTab={mapLayerFilter}
                        onSelectComplaint={handleSelectComplaintFromMap}
                      />
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </main>

      {/* FULL COMPLAINT INSPECT MODAL OVERLAY */}
      <AnimatePresence>
        {inspectComplaint && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full text-slate-100 shadow-2xl relative"
            >
              <button 
                onClick={() => setInspectComplaint(null)}
                className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-750 text-slate-400 p-1.5 rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="font-mono text-[10px] text-indigo-400 font-bold block">{inspectComplaint.id}</span>
                  <h4 className="font-black text-white text-base">{inspectComplaint.category}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{inspectComplaint.date} {inspectComplaint.time}</span>
                </div>

                <div className="relative rounded-xl overflow-hidden max-h-[220px] bg-slate-950">
                  <img src={inspectComplaint.imageUrl} className="w-full h-full object-contain mx-auto" />
                  
                  {/* Bounding predictions boxes overlay in modal */}
                  {inspectComplaint.aiPredictions?.map((pred, idx) => {
                    const [ymin, xmin, ymax, xmax] = pred.box;
                    return (
                      <div
                        key={idx}
                        className="absolute border-2 border-red-500 bg-red-500/15 flex items-start"
                        style={{
                          top: `${ymin}%`,
                          left: `${xmin}%`,
                          width: `${xmax - xmin}%`,
                          height: `${ymax - ymin}%`
                        }}
                      >
                        <span className="bg-red-500 text-white font-black text-[8px] px-1 py-0.5 rounded-br">
                          {pred.label} ({pred.confidence}%)
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-slate-500 block font-bold uppercase text-[9px]">Case Status</span>
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded-full uppercase border ${
                      inspectComplaint.status === "Resolved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      inspectComplaint.status === "Pending" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    }`}>
                      {inspectComplaint.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold uppercase text-[9px]">AI YOLO Accuracy</span>
                    <span className="font-bold text-slate-300">{inspectComplaint.confidence}% Confidence</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold uppercase text-[9px]">Threat Severity</span>
                    <span className="font-bold text-amber-500">{inspectComplaint.severity} Severity</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold uppercase text-[9px]">GIS coordinates</span>
                    <span className="font-mono text-slate-300">{inspectComplaint.latitude.toFixed(4)}, {inspectComplaint.longitude.toFixed(4)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block font-bold uppercase text-[9px]">Detected Visual Pollutants</span>
                    <span className="font-black text-red-400">{inspectComplaint.detectedObjects.join(", ") || "Plastic Solid Waste"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block font-bold uppercase text-[9px]">Resolved Reverse-Geocoded Landmark</span>
                    <span className="font-medium text-slate-300">{inspectComplaint.address}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${inspectComplaint.latitude},${inspectComplaint.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-400 font-bold flex items-center gap-0.5 mt-1 hover:underline w-fit"
                    >
                      Inspect in Google Maps <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  {inspectComplaint.adminRemarks && (
                    <div className="col-span-2 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-slate-500 block font-bold uppercase text-[9px]">Official CPCB Action Remarks</span>
                      <p className="text-[11px] italic text-slate-300 mt-0.5">"{inspectComplaint.adminRemarks}"</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER SYSTEM STATUS COGNIZANCE RAIL */}
      <footer className="bg-slate-950 border-t border-slate-850 py-6 px-4 text-center text-[11px] text-slate-500 font-medium mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 md:text-left">
            <span className="font-black text-slate-400 uppercase tracking-wider block">EcoShield Govt Cognizance Rail</span>
            <p className="text-slate-500">This intelligence node operates in strict accordance with the Central Pollution Control Board (CPCB) and National Green Tribunal (NGT) directives. Secure AES-256 telemetry transmission active.</p>
          </div>
          <div className="flex gap-4 text-slate-500 shrink-0 font-mono">
            <span>Grid Latency: <strong className="text-emerald-500">1.2ms</strong></span>
            <span>API Gateway: <strong className="text-indigo-400">ONLINE</strong></span>
            <span>Uptime: <strong className="text-slate-400">99.98%</strong></span>
          </div>
        </div>
      </footer>

    </div>
  );
}
