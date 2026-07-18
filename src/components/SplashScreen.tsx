import React, { useState, useEffect } from "react";
import { Language } from "../types";
import { translations } from "../translations";
import { 
  Shield, 
  Globe, 
  Sun, 
  Moon, 
  Cpu, 
  Layers, 
  Wifi, 
  Bot, 
  ChevronRight,
  Sparkles,
  Zap,
  Compass,
  Battery,
  Signal,
  Smartphone,
  Check,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SplashScreenProps {
  onLaunch: (language: Language, theme: "light" | "dark") => void;
  defaultLanguage?: Language;
  defaultTheme?: "light" | "dark";
}

const indianLanguages: { code: Language; name: string; native: string; flag: string }[] = [
  { code: "English", name: "English", native: "National", flag: "🇮🇳" },
  { code: "Hindi", name: "Hindi", native: "हिन्दी", flag: "🕉️" },
  { code: "Tamil", name: "Tamil", native: "தமிழ்", flag: "🔱" },
  { code: "Telugu", name: "Telugu", native: "తెలుగు", flag: "🌾" },
  { code: "Kannada", name: "Kannada", native: "ಕನ್ನಡ", flag: "🎨" },
  { code: "Malayalam", name: "Malayalam", native: "മലയാളം", flag: "🌴" },
  { code: "Bengali", name: "Bengali", native: "বাংলা", flag: "🎭" },
  { code: "Gujarati", name: "Gujarati", native: "ગુજરાતી", flag: "⚡" },
  { code: "Marathi", name: "Marathi", native: "मराठी", flag: "🏰" },
  { code: "Punjabi", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🔥" }
];

export default function SplashScreen({ onLaunch, defaultLanguage = "English", defaultTheme = "dark" }: SplashScreenProps) {
  const [step, setStep] = useState<"welcome" | "setup">("welcome");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(defaultLanguage);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(defaultTheme);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentTime, setCurrentTime] = useState("09:41");

  const t = translations[selectedLanguage] || translations.English;

  // Sync real time inside status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const stepsText = [
    "Establishing connection to CPCB Network...",
    "Downloading YOLOv8 Vision Weights...",
    "Caching Sentinel-2 Satellite Maps...",
    "Loading Multi-tier GIS Telemetry...",
    "Security Check Verified! Launching Hub..."
  ];

  const handleLaunch = () => {
    setLoading(true);
    let currentStep = 0;
    const intervalId = setInterval(() => {
      if (currentStep < stepsText.length - 1) {
        currentStep++;
        setLoadingStep(currentStep);
      } else {
        clearInterval(intervalId);
        onLaunch(selectedLanguage, selectedTheme);
      }
    }, 400);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 select-none transition-colors duration-500 overflow-y-auto ${selectedTheme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
      
      {/* Background decoration elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
        <motion.div 
          animate={{ 
            scale: [1, 1.12, 1],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl ${selectedTheme === "dark" ? "bg-indigo-900/50" : "bg-indigo-300/40"}`} 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl ${selectedTheme === "dark" ? "bg-emerald-900/50" : "bg-emerald-300/40"}`} 
        />
      </div>

      {/* Main Flex layout to hold phone frame & high-fidelity workspace labels */}
      <div className="relative w-full max-w-lg flex flex-col items-center">
        
        {/* Device Wrapper Header Description */}
        <div className="text-center mb-4 hidden sm:block">
          <span className="text-[10px] font-mono font-black tracking-widest text-indigo-500 uppercase flex items-center justify-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 animate-bounce" /> ECOSHIELD PHONE TERMINAL MOCKUP
          </span>
          <p className="text-[9px] text-slate-500 font-medium mt-1">
            Tap or click inside the smartphone mockup to configure and boot EcoShield.
          </p>
        </div>

        {/* HIGH-FIDELITY SMARTPHONE CONTAINER */}
        <div className={`relative w-full max-w-[365px] h-[740px] rounded-[52px] border-[14px] shadow-[0_0_60px_rgba(0,0,0,0.4)] transition-all duration-300 ${
          selectedTheme === "dark" 
            ? "bg-slate-950 border-slate-900 shadow-indigo-500/5" 
            : "bg-white border-slate-800 shadow-slate-400/20"
        } overflow-hidden flex flex-col`}>
          
          {/* Dynamic Island Notch */}
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          </div>

          {/* Device Speaker Ear Piece */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-1 bg-slate-800 rounded-full z-50" />

          {/* Smartphone Bezel Status Bar */}
          <div className={`absolute top-2 left-0 right-0 px-6 pt-7 pb-2 flex justify-between items-center text-[10px] font-bold font-mono tracking-wider z-40 ${
            selectedTheme === "dark" ? "text-slate-300" : "text-slate-800"
          }`}>
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5 shrink-0" />
              <Wifi className="w-3.5 h-3.5 shrink-0" />
              <div className="flex items-center gap-0.5">
                <span className="text-[9px]">98%</span>
                <Battery className="w-4 h-4 shrink-0" />
              </div>
            </div>
          </div>

          {/* Bottom Native Home Indicator Pill */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-500/40 rounded-full z-50" />

          {/* SCREEN BODY CONTENT WITH DYNAMIC OVERLAY TRANSITIONS */}
          <div className={`flex-1 flex flex-col justify-between pt-16 pb-8 px-5 overflow-y-auto scrollbar-none transition-colors duration-300 ${
            selectedTheme === "dark" 
              ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100" 
              : "bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900"
          }`}>
            
            <AnimatePresence mode="wait">
              {step === "welcome" ? (
                /* SCREEN 1: PORTRAIT WELCOME & LOGO (Centering App name, animated logo) */
                <motion.div
                  key="welcome-portrait"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col justify-between"
                >
                  {/* Empty gap to push logo to optical center */}
                  <div className="h-4" />

                  {/* Centered Graphic Display */}
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      {/* Nested orbital animations */}
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border border-dashed border-emerald-500/30 rounded-full"
                      />
                      <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-3 border border-indigo-500/40 rounded-full"
                      />
                      <motion.div 
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-6 bg-gradient-to-br from-emerald-500/10 to-indigo-600/10 rounded-full blur-lg"
                      />

                      {/* Floating glowing shield */}
                      <div className="relative p-5 bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/40 rounded-full shadow-xl flex items-center justify-center z-10">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            filter: ["drop-shadow(0 0 2px rgba(16, 185, 129, 0.2))", "drop-shadow(0 0 10px rgba(99, 102, 241, 0.4))", "drop-shadow(0 0 2px rgba(16, 185, 129, 0.2))"]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="relative flex items-center justify-center"
                        >
                          <Shield className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
                          <Compass className="w-6 h-6 text-white absolute" />
                        </motion.div>
                      </div>

                      {/* Corner Scanner lines */}
                      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-indigo-500" />
                      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-indigo-500" />
                      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-emerald-500" />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-emerald-500" />
                    </div>

                    {/* App Title & Slogan */}
                    <div className="space-y-2">
                      <h1 className="text-3xl font-black tracking-tight uppercase bg-gradient-to-r from-emerald-400 via-indigo-500 to-indigo-400 bg-clip-text text-transparent">
                        ECOSHIELD AI
                      </h1>
                      <span className="bg-emerald-500/10 text-emerald-400 font-extrabold text-[8px] px-2.5 py-0.5 border border-emerald-500/20 rounded-full tracking-wider uppercase inline-block">
                        🇮🇳 National Surveillance Node
                      </span>
                      <p className={`text-[10px] leading-relaxed max-w-[240px] mx-auto ${selectedTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                        India's Environmental Crime Intelligence hub using real-time YOLOv8 machine vision, satellite maps & citizen reporting.
                      </p>
                    </div>
                  </div>

                  {/* Proceed Action Button & Swachh Bharat Integration footer */}
                  <div className="space-y-4">
                    <button
                      onClick={() => setStep("setup")}
                      className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-[11px] py-3.5 px-5 rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-98 transition flex items-center justify-center gap-1.5 uppercase tracking-wider group"
                    >
                      <span>Configure Phone App</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className={`pt-3 border-t text-center text-[8px] font-mono uppercase tracking-widest ${selectedTheme === "dark" ? "border-slate-900 text-slate-500" : "border-slate-100 text-slate-400"}`}>
                      <span>SWACHH BHARAT GRID REGISTERED</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* SCREEN 2: PHONE CONFIG & INITIALIZATION */
                <motion.div
                  key="setup-portrait"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Tiny header details */}
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">App Configurations</span>
                      <h2 className="text-sm font-black uppercase tracking-tight mt-0.5">Select Language & Theme</h2>
                    </div>

                    {/* SELECT LANGUAGE LIST SCROLLER */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                        Regional Language Node
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 max-h-[175px] overflow-y-auto pr-0.5 scrollbar-thin">
                        {indianLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setSelectedLanguage(lang.code)}
                            className={`px-2.5 py-2 rounded-lg text-left border transition-all flex items-center gap-1.5 ${
                              selectedLanguage === lang.code
                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-extrabold shadow-sm"
                                : selectedTheme === "dark"
                                ? "border-slate-900 bg-slate-950/40 text-slate-400"
                                : "border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            <span className="text-xs">{lang.flag}</span>
                            <div className="flex flex-col min-w-0 leading-tight">
                              <span className="text-[9px] font-bold truncate">{lang.name}</span>
                              <span className="text-[7px] text-slate-400 truncate">{lang.native}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* THEME SELECTION BOX */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                        UI Appearance Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Light Mode */}
                        <button
                          onClick={() => setSelectedTheme("light")}
                          className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                            selectedTheme === "light"
                              ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <Sun className={`w-4 h-4 shrink-0 ${selectedTheme === "light" ? "text-amber-500" : "text-slate-400"}`} />
                          <div className="leading-tight">
                            <span className="text-[9px] font-black block">Light Mode</span>
                            <span className="text-[7px] text-slate-400 block">Clean & bright</span>
                          </div>
                        </button>

                        {/* Dark Mode */}
                        <button
                          onClick={() => setSelectedTheme("dark")}
                          className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                            selectedTheme === "dark"
                              ? "border-indigo-500 bg-indigo-500/10 text-white font-bold"
                              : "border-slate-900 bg-slate-950/40 text-slate-400"
                          }`}
                        >
                          <Moon className={`w-4 h-4 shrink-0 ${selectedTheme === "dark" ? "text-indigo-400" : "text-slate-400"}`} />
                          <div className="leading-tight">
                            <span className="text-[9px] font-black block text-slate-100">Dark Cosmic</span>
                            <span className="text-[7px] text-slate-500 block">Eye-safe OLED</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* INITIALIZATION ACTIONS & BACK NAVIGATION */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => setStep("welcome")}
                      className={`text-[9px] font-bold text-center block w-full hover:underline ${selectedTheme === "dark" ? "text-slate-500" : "text-slate-400"}`}
                    >
                      ← Back to Welcome Screen
                    </button>

                    {loading ? (
                      <div className={`p-3 rounded-xl border font-mono text-[8px] space-y-1.5 ${selectedTheme === "dark" ? "bg-slate-950 border-slate-900 text-emerald-400" : "bg-slate-50 border-slate-200 text-emerald-700"}`}>
                        <div className="flex items-center justify-between">
                          <span>BOOT PROTOCOL RUNNING</span>
                          <span className="animate-pulse">ONLINE</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(loadingStep + 1) * 20}%` }} />
                        </div>
                        <p className="text-slate-400 truncate animate-pulse font-semibold">&gt; {stepsText[loadingStep]}</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleLaunch}
                        className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-[11px] py-3.5 px-5 rounded-xl shadow-lg active:scale-98 transition flex items-center justify-center gap-1.5 uppercase tracking-wider"
                      >
                        <span>🚀 Launch Phone Hub</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Outer Frame Footer Info */}
        <div className="text-center mt-4">
          <p className={`text-[10px] ${selectedTheme === "dark" ? "text-slate-500" : "text-slate-400"} font-medium`}>
            CPCB surveillance systems active. Powered by Gemini & YOLO algorithms.
          </p>
        </div>

      </div>
    </div>
  );
}
