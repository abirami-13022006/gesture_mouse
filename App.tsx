import React, { useState, useEffect } from "react";
import { 
  Shield, Bell, ArrowLeft, ArrowRight, Camera, Upload, Globe, 
  History, Map, Home, User, Sparkles, AlertTriangle, Info, Check, 
  Plus, Filter, Search, FileText, Send, Share2, HelpCircle, 
  CheckCircle2, ChevronRight, RefreshCw, Layers, Crosshair, 
  ZoomIn, ZoomOut, Flame, Droplets, Trash2, ShieldAlert, Cpu,
  TrendingUp, TrendingDown, X, LogOut
} from "lucide-react";
import { Complaint, ScreenType, NotificationItem } from "./types";
import EarthGlobe from "./components/EarthGlobe";
import NotificationTray from "./components/NotificationTray";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  // Navigation & Screens state
  const [screen, setScreen] = useState<ScreenType>("SPLASH");
  const [activeTab, setActiveTab] = useState<"HOME" | "MAP" | "HISTORY" | "PROFILE">("HOME");
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Complaints & Notifications state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "N-1",
      caseId: "ESH-402",
      type: "RESOLVED",
      time: "2h ago",
      content: "Case #ESH-402 Resolved - The area has been cleared by municipal authorities.",
      read: false
    },
    {
      id: "N-2",
      caseId: "ESH-415",
      type: "REVIEW",
      time: "5h ago",
      content: "Your report for Case #ESH-415 is now under official review by the Environmental Agency.",
      read: false
    },
    {
      id: "N-3",
      caseId: "",
      type: "ALERT",
      time: "Yesterday",
      content: "High AQI detected in your saved location 'Industrial Park E'. Mask recommended.",
      read: true
    }
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Statistics state (can increment on submission!)
  const [stats, setStats] = useState({
    riverCases: 24,
    wasteBurning: 12,
    totalComplaints: 156,
    resolved: 142
  });

  // Current Detection flow state (River & Waste)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [detectionType, setDetectionType] = useState<"river" | "waste">("river");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [yoloBbox, setYoloBbox] = useState<boolean>(false);

  // Complaint Submission form states
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintNotes, setComplaintNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);

  // Interactive Map states
  const [activeMapPopup, setActiveMapPopup] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(14);

  // Search & Filters on History Screen
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "RESOLVED" | "REVIEW" | "PENDING">("ALL");
  const [selectedDetailComplaint, setSelectedDetailComplaint] = useState<Complaint | null>(null);

  // Filter complaints based on search
  const filteredComplaints = complaints.filter(c => 
    c.id.toLowerCase().includes(historySearch.toLowerCase()) ||
    c.title.toLowerCase().includes(historySearch.toLowerCase()) ||
    c.location.toLowerCase().includes(historySearch.toLowerCase())
  );

  const selectedComplaint = selectedDetailComplaint;
  const setSelectedComplaint = setSelectedDetailComplaint;

  // Fetch complaints from server on mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const res = await fetch("/api/complaints");
      const data = await res.json();
      if (data.complaints) {
        setComplaints(data.complaints);
        
        // Dynamically adjust statistics indicators based on current list length
        const resolvedCount = data.complaints.filter((c: any) => c.status === "RESOLVED").length;
        setStats({
          riverCases: 24 + data.complaints.filter((c: any) => c.type.toLowerCase().includes("river")).length,
          wasteBurning: 12 + data.complaints.filter((c: any) => c.type.toLowerCase().includes("burn") || c.type.toLowerCase().includes("waste")).length,
          totalComplaints: 150 + data.complaints.length,
          resolved: 140 + resolvedCount
        });
      }
    } catch (err) {
      console.error("Error loading complaints:", err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  // Dispatch a field unit
  const handleDispatchTeam = (id: string) => {
    setComplaints(prev => 
      prev.map(c => c.id === id ? { ...c, status: "REVIEW", aiNotes: "Field Unit Dispatched. Response team heading to coordinates." } : c)
    );
    // Add a new notification
    const newNotif: NotificationItem = {
      id: `N-${Date.now()}`,
      caseId: id,
      type: "REVIEW",
      time: "Just now",
      content: `Response team dispatched to coordinates of Case #${id}.`,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setIsNotificationsOpen(true);
  };

  // Pre-set high-fidelity sample photos for analysis
  const PRESET_RIVER_PHOTOS = [
    {
      name: "Murky Chemical Foam",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9KgxAdyl2TGwC8lXEKEEEPa29CU4pV7tXyiDmR5zcKoPZomjdN0olqcqdNbSntsp-8M33vwklYu39cXKexvsJTLgPH7oXC2bBm0LVqW6tI_i1Q_fRA7eSGu-j7-2l73bLK6lyvq2BeZ0GXd59v_NxNCqW-bLxusgoX6oPDFmrpUGc-8D64pDauhLw42kKX7L95IUSvRdh3P8Nwr7kP8yuXxD9-Yy57TrvculF2pc8_Mn_go-iGGspcw"
    },
    {
      name: "Plastic Litter Spill",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDStlPLCPrIdVGPLmDRa5FyjNN77H7PI6GmXcLUvQacnbsjJ94U-UZitmA8sMH4tk1iXu0nglQZ6ogKQsTEBOW1HrAAJSDmRecgtG3zSBPA8wPVbX33gN445n73nxID3wZUl3a2H5dHge_e7wTm23WFQbtUe4OlUDPwGCsHdYiwJya_VAn1quAd4rpn_awBtTtvg4-UAEGoubZBw719wgQvp6i833gEEUWj_szQCFc-ipepWLZd_IDsyQ"
    },
    {
      name: "River Bank Sewage",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM6ZFEyaF1cBSWAipHfT7zJJ-Y2Cv5ab2YyTRPX39GBvtjIdIcmDCOY8SymZrNBcc-3yHrf87711UZrnDehEHu7Jt2MzpF82We_aQxQcWIO_Hes1GPKpQiHbyBT0l5hsUNANDqmWBLbJ0QKYvmRvyDok8ajbSEkb05o6RWcqGiRH-7hum1xa4N_SRD5J3PnGUu7KqpZ3YNH8KNXLpL6D1dhl_IF5qYdMhM_pYrE56XvwCFNV0ECX_nbw"
    }
  ];

  const PRESET_WASTE_PHOTOS = [
    {
      name: "Open Chemical Smoke",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeAaIhMdVEYLZIFv0xwrtFXuAJNj7st_CBu3oZmTxRxISrJypyeF8ZXFOJOEmdZqJbxQBSr2O51BodX_urMznRVmmz-iXymHHtAW7B8ecarDBxJX8xgOLbQdGDukEauw8wuRsnHcRyZSYLOd54XnBZBN-hxsKm1lAglZr4ZMjwvK8OJ1SkVgytoUE5jUPYdeu7hDsT9O7bj9WvBgDUIkt6rT-G2eFQbSV_LJ9Pf1RfSEkKizwnxH0jew"
    },
    {
      name: "Landfill Smoldering",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuYvOyAVu2Pr-L4bkAzSHkHWQOj4PnpQZ7wmsV1skskPudNuSptC93Qcb_Pj77P5aLYpvcW6Fda6AbDYYjDi6tTLGgsfRHMkR_SDDjb_yvyu_zqSAWCKtjUlsU3fFHdKkFx0a3heFkKgah9szr_1iMxYABPR3EaF8-lkBry80rRcd1_Cix91AExebbUHGSRp1aVpdkPEcJpQlYFq0bHQzfBf-WrVRpJY5GWJ3biKCFyiJpiAYE6UvccA"
    }
  ];

  // Convert uploaded image file to Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhoto(reader.result as string);
        setAnalysisResult(null);
        setYoloBbox(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform full-stack AI Image analysis
  const triggerAIAnalysis = async () => {
    if (!selectedPhoto) return;
    setIsAnalyzing(true);
    setYoloBbox(false);

    try {
      const res = await fetch("/api/complaints/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedPhoto,
          type: detectionType
        })
      });
      const result = await res.json();
      setAnalysisResult(result);
      setYoloBbox(true); // Triggers visual YOLO layout bounds
    } catch (err) {
      console.error("Analysis api error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Perform complaint submission
  const submitComplaint = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: complaintTitle || (detectionType === "river" ? "River Pollution Incident" : "Illegal Waste Burning"),
        type: detectionType === "river" ? "River Pollution Detection" : "Open Waste Burning",
        urgency: analysisResult?.severity === "CRITICAL" ? "Critical" : "High",
        status: "PENDING",
        location: detectionType === "river" ? "Sector 7G Delta" : "Urban Wasteland Block 2",
        coordinates: detectionType === "river" ? "28.6139° N, 77.2090° E" : "28.6410° N, 77.1950° E",
        description: analysisResult?.description || "High-fidelity AI detection flagged local chemical pollution.",
        imageUrl: selectedPhoto,
        confidence: analysisResult?.confidence || 94,
        composition: analysisResult?.composition || ["Pollution"],
        aiNotes: `AI analysis completed with high severity. Automated alert forwarded to the Pollution Control Board.`
      };

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.complaint) {
        setSubmittedCaseId(data.complaint.id);
        setScreen("GENERATE_COMPLAINT"); // Show successful result page

        // Update stats counters immediately
        setStats(prev => ({
          ...prev,
          totalComplaints: prev.totalComplaints + 1,
          riverCases: detectionType === "river" ? prev.riverCases + 1 : prev.riverCases,
          wasteBurning: detectionType === "waste" ? prev.wasteBurning + 1 : prev.wasteBurning
        }));

        // Refresh database complains array
        fetchComplaints();
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // View togglers
  const openAnalysis = (type: "river" | "waste") => {
    setDetectionType(type);
    setSelectedPhoto(type === "river" ? PRESET_RIVER_PHOTOS[0].url : PRESET_WASTE_PHOTOS[0].url);
    setAnalysisResult(null);
    setYoloBbox(false);
    setScreen(type === "river" ? "RIVER_DETECTION" : "WASTE_DETECTION");
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleViewReport = (caseId: string) => {
    const matched = complaints.find(c => c.id === caseId);
    if (matched) {
      setSelectedDetailComplaint(matched);
      setScreen("COMPLAINT_HISTORY");
      setActiveTab("HISTORY");
      setIsNotificationsOpen(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col max-w-md mx-auto bg-stone-50 shadow-2xl border-x border-stone-200 overflow-x-hidden">
      
      {/* GLOBAL NOTIFICATION TRAY */}
      <NotificationTray
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onViewReport={handleViewReport}
      />

      {/* ADMIN INTERFACE DETECTOR */}
      {isAdminMode ? (
        <AdminPanel
          complaints={complaints}
          onClose={() => setIsAdminMode(false)}
          onDispatchTeam={handleDispatchTeam}
        />
      ) : (
        <>
          {/* SCREEN 1: SPLASH SCREEN */}
          {screenState(screen, "SPLASH") && (
            <main className="relative h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-black text-white">
              {/* Animated WebGL Rotating Organic Earth Globe Background */}
              <EarthGlobe />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

              {/* Top Branding Section */}
              <div className="relative z-10 pt-16 flex flex-col items-center px-6 text-center">
                <div className="mb-4 inline-flex items-center justify-center p-3 rounded-2xl glass-card-dark text-emerald-400 animate-float">
                  <Shield className="w-10 h-10 fill-emerald-500/20" />
                </div>
                <h1 className="text-4xl font-black title-glow tracking-tighter mb-2">
                  EcoShield AI
                </h1>
                <p className="text-sm font-medium text-white/80 max-w-xs leading-relaxed uppercase tracking-widest">
                  India's Environmental Crime Intelligence Platform
                </p>
              </div>

              {/* Central Area: Empty to let glowing globe shine through */}
              <div className="flex-grow w-full" />

              {/* Bottom Section: Details and Action */}
              <div className="relative z-10 w-full px-6 pb-16 flex flex-col items-center max-w-md">
                {/* Core Capabilities Card */}
                <div className="glass-card-dark rounded-3xl p-6 mb-8 text-center w-full">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-[1px] flex-1 bg-white/20" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Core Capabilities</span>
                    <div className="h-[1px] flex-1 bg-white/20" />
                  </div>
                  <p className="text-xs text-stone-200 leading-relaxed font-medium">
                    AI-powered detection of river pollution and illegal open waste burning using high-fidelity Computer Vision and satellite telemetry. Protecting our resources through real-time intelligence.
                  </p>
                </div>

                {/* Primary Button */}
                <button
                  onClick={() => setScreen("HOME")}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-full shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 active-scale cursor-pointer group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Status indicator */}
                <div className="mt-6 flex items-center gap-2 opacity-60 text-[10px] uppercase font-bold tracking-widest text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  System Online: All Nodes Active
                </div>
              </div>
            </main>
          )}

          {/* SCREEN 2: MAIN HOME TAB DASHBOARD */}
          {screenState(screen, "HOME") && activeTab === "HOME" && (
            <div className="flex flex-col min-h-screen bg-stone-50 pb-28">
              {/* TOP DASHBOARD HEADER */}
              <header className="fixed top-0 left-0 w-full max-w-md mx-auto h-16 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100 flex justify-between items-center px-4 shadow-sm">
                <div className="flex items-center gap-2" onClick={() => setIsAdminMode(true)} style={{ cursor: "pointer" }}>
                  <Shield className="w-6 h-6 text-emerald-700 fill-emerald-100 animate-pulse" />
                  <h1 className="text-lg font-black text-emerald-800 tracking-tight">EcoShield AI</h1>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsNotificationsOpen(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 active:scale-95 transition-transform relative"
                  >
                    <Bell className="w-5 h-5 text-stone-700" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-white" />
                  </button>
                </div>
              </header>

              {/* SCROLLABLE BODY */}
              <main className="pt-20 px-4 space-y-6">
                {/* Hero Sunrise Scenic Banner */}
                <section className="relative w-full h-44 rounded-3xl overflow-hidden shadow-md group">
                  <img
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Pristine Environmental Valley"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuANbzdhR_V-1eJ4ys_rUumjr7J_UihVTUYwrRI2xMLddWMRC7WS3TtwHGw50vyvoDMrkaiyvqScuFgu9Aj6QqFPF540AX529gZiEqIpsP2zQckFDFx6jIUofLsHNh4hvpfYIYWckM4nosms91bXTQyDeIoR8IHYA0nG9LQWXgYcl0JRYYi2z1zpGxGBTj21FH52SR4QrbJQKfVzYA6frylXAv-mIvF5LWY2iUmjKfqxOUxc11TCDvWkaw"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 p-5 z-20">
                    <h2 className="text-lg font-bold text-white leading-tight max-w-[85%] font-sans drop-shadow-md">
                      Together we can protect our environment.
                    </h2>
                  </div>
                </section>

                {/* Core Services Bento Grid */}
                <section className="grid grid-cols-2 gap-4">
                  {/* Bento 1: River Pollution */}
                  <div 
                    onClick={() => openAnalysis("river")}
                    className="glass-card p-5 rounded-3xl flex flex-col justify-between aspect-square active-scale cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-sm">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-800 leading-tight">River Pollution Detection</h3>
                      <p className="text-[11px] text-stone-500 font-medium mt-1">AI-powered monitoring</p>
                    </div>
                  </div>

                  {/* Bento 2: Waste Burning */}
                  <div 
                    onClick={() => openAnalysis("waste")}
                    className="glass-card p-5 rounded-3xl flex flex-col justify-between aspect-square active-scale cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-sm">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-800 leading-tight">Open Waste Burning</h3>
                      <p className="text-[11px] text-stone-500 font-medium mt-1">Thermal detection</p>
                    </div>
                  </div>

                  {/* Bento 3: Map */}
                  <div 
                    onClick={() => setActiveTab("MAP")}
                    className="glass-card p-5 rounded-3xl flex flex-col justify-between aspect-square active-scale cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-sm">
                      <Map className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-blue-800 leading-tight">Environmental Map</h3>
                      <p className="text-[11px] text-stone-500 font-medium mt-1">Real-time delta sensors</p>
                    </div>
                  </div>

                  {/* Bento 4: History */}
                  <div 
                    onClick={() => setActiveTab("HISTORY")}
                    className="glass-card p-5 rounded-3xl flex flex-col justify-between aspect-square active-scale cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-800 leading-tight">Complaint History</h3>
                      <p className="text-[11px] text-stone-500 font-medium mt-1">Track your submissions</p>
                    </div>
                  </div>
                </section>

                {/* Statistics panel */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">Today's Statistics</h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">LIVE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
                      <p className="text-[10px] uppercase font-bold text-stone-400">River Cases</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-emerald-800">{stats.riverCases}</span>
                        <span className="text-[10px] font-bold text-red-600 flex items-center">
                          <TrendingUp className="w-3 h-3" /> +12%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
                      <p className="text-[10px] uppercase font-bold text-stone-400">Waste Burning</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-amber-800">{stats.wasteBurning}</span>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                          <TrendingDown className="w-3 h-3" /> -5%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
                      <p className="text-[10px] uppercase font-bold text-stone-400">Total Complaints</p>
                      <span className="text-2xl font-black text-stone-800 mt-1 block">{stats.totalComplaints}</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 relative overflow-hidden">
                      <p className="text-[10px] uppercase font-bold text-stone-400">Resolved</p>
                      <span className="text-2xl font-black text-emerald-700 mt-1 block">{stats.resolved}</span>
                      <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold px-1 py-0.5 rounded">
                        91%
                      </div>
                    </div>
                  </div>
                </section>
              </main>

              {/* Floating report trigger pill */}
              <button 
                onClick={() => openAnalysis("river")}
                className="fixed bottom-24 right-4 bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 px-5 py-3.5 rounded-full shadow-lg z-30 active-scale duration-200 cursor-pointer"
              >
                <Plus className="w-5 h-5 font-bold" />
                <span className="text-xs font-bold uppercase tracking-wider">Report Hazard</span>
              </button>
            </div>
          )}

          {/* SCREEN 3: INTERACTIVE ENVIRONMENTAL MAP TAB */}
          {screenState(screen, "HOME") && activeTab === "MAP" && (
            <div className="relative h-screen w-full flex flex-col bg-stone-100">
              {/* TOP HEADER */}
              <header className="fixed top-0 left-0 w-full max-w-md mx-auto h-16 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 flex justify-between items-center px-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-emerald-700 fill-emerald-100" />
                  <h1 className="text-lg font-black text-emerald-800 tracking-tight">Live EcoMap</h1>
                </div>
                <button 
                  onClick={() => setIsNotificationsOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 active:scale-95 transition-all relative"
                >
                  <Bell className="w-5 h-5 text-stone-700" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-white" />
                </button>
              </header>

              {/* MAP CANVAS VIEWPORT */}
              <div className="relative flex-grow h-full w-full mt-16 overflow-hidden">
                <img
                  className="w-full h-full object-cover grayscale-[0.1] contrast-[0.95] brightness-[1.02]"
                  alt="Satellite Delta Map Mapbox Representation"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDApwr1vD924Lq_B78oNtx2XHOXW51vmgF9Bs2F_il_ZAEbFViLnMFJYI2pGuVRjEAEWVLRZ1JEIyrUV0_NDXxmVk_NfC5Pqz5py47AmutMSzHl-ZGgOV51eH9S4zsmBNOU7oq3YfbniSLk0Uxl4rUURTJsFohhZGTdK3H8OIT0-HGlr2-hQuvueLp9mEqxjua7YuvpKjY2MNFOIMtXaq0hSXweR4O7-XbRf0b0Y-UpiqEFwrGi8UiqmQ"
                  referrerPolicy="no-referrer"
                />

                {/* OVERLAY MAP CONTROLS */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                  <button className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-stone-800 hover:bg-white active-scale shadow">
                    <Layers className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-stone-800 hover:bg-white active-scale shadow">
                    <Crosshair className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col glass-card rounded-xl divide-y divide-stone-200/40 shadow">
                    <button className="w-10 h-10 flex items-center justify-center text-stone-800 hover:bg-white font-bold" onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}>+</button>
                    <button className="w-10 h-10 flex items-center justify-center text-stone-800 hover:bg-white font-bold" onClick={() => setMapZoom(prev => Math.max(prev - 1, 10))}>-</button>
                  </div>
                </div>

                {/* INTERACTIVE MARKERS LAYER */}
                {/* 1. Green Marker Upstream Clean */}
                <div 
                  className="absolute top-[30%] left-[45%] pointer-events-auto cursor-pointer transform hover:scale-110 duration-200"
                  onClick={() => togglePopup("safe")}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-emerald-700 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 bg-white text-emerald-800 font-bold text-[9px] rounded-md shadow-md border border-stone-100">Upstream Safe</span>
                  </div>
                </div>

                {/* 2. Yellow Marker Runoff Suspected */}
                <div 
                  className="absolute top-[55%] left-[65%] pointer-events-auto cursor-pointer transform hover:scale-110 duration-200"
                  onClick={() => togglePopup("runoff")}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-amber-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 bg-white text-amber-800 font-bold text-[9px] rounded-md shadow-md border border-stone-100">Runoff Suspected</span>
                  </div>
                </div>

                {/* 3. Red Marker Pollution Active Alert */}
                <div 
                  className="absolute top-[48%] left-[28%] pointer-events-auto cursor-pointer transform hover:scale-110 duration-200 animate-bounce"
                  onClick={() => togglePopup("alert-card")}
                >
                  <div className="flex flex-col items-center relative">
                    <div className="absolute -inset-2 bg-red-600/30 rounded-full animate-ping" />
                    <div className="w-10 h-10 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xl">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <span className="mt-1 px-2.5 py-1 bg-red-600 text-white font-black text-[10px] uppercase rounded-md shadow-md">Critical Alert</span>
                  </div>
                </div>

                {/* ACTIVE MAP POPUP CARD */}
                {activeMapPopup === "alert-card" && (
                  <div className="absolute bottom-6 left-4 right-4 bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/40 animate-in slide-in-from-bottom-5 duration-300 z-30">
                    <div className="relative h-32">
                      <img
                        className="w-full h-full object-cover"
                        alt="Live Pollution Overlay Detail"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDStlPLCPrIdVGPLmDRa5FyjNN77H7PI6GmXcLUvQacnbsjJ94U-UZitmA8sMH4tk1iXu0nglQZ6ogKQsTEBOW1HrAAJSDmRecgtG3zSBPA8wPVbX33gN445n73nxID3wZUl3a2H5dHge_e7wTm23WFQbtUe4OlUDPwGCsHdYiwJya_VAn1quAd4rpn_awBtTtvg4-UAEGoubZBw719wgQvp6i833gEEUWj_szQCFc-ipepWLZd_IDsyQ"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> LIVE
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-stone-900">River Pollution</h3>
                          <p className="text-xs text-stone-500 font-medium">Sector 7G Delta • Near Blue Creek</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-red-600">94%</span>
                          <span className="block text-[8px] uppercase tracking-wider font-bold text-stone-400">Confidence</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedPhoto(PRESET_RIVER_PHOTOS[1].url);
                            setDetectionType("river");
                            setAnalysisResult({
                              confidence: 94,
                              severity: "HIGH",
                              composition: ["Plastic Waste", "Chemical Foam", "Industrial Silt"],
                              description: "Severe floating polymer discharge near delta sector. Immediate field cleanup and deploy sequence suggested."
                            });
                            setScreen("GENERATE_COMPLAINT");
                            setComplaintTitle("River Pollution - Sector 7G Delta");
                          }}
                          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 active-scale cursor-pointer"
                        >
                          <FileText className="w-4 h-4" /> Deploy Unit
                        </button>
                        <button 
                          onClick={() => setActiveMapPopup(null)}
                          className="w-12 h-10 border border-stone-200 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeMapPopup === "safe" && (
                  <div className="absolute bottom-6 left-4 right-4 bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-800 text-sm">Upstream Water Quality</h4>
                        <p className="text-xs text-emerald-600">Perfect sensor parameters. Normal pH and DO levels.</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveMapPopup(null)} className="text-stone-400 hover:text-stone-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {activeMapPopup === "runoff" && (
                  <div className="absolute bottom-6 left-4 right-4 bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-800 text-sm">Delta Outflow Station</h4>
                        <p className="text-xs text-amber-600">Turbidity warning. Possible agricultural chemical discharge.</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveMapPopup(null)} className="text-stone-400 hover:text-stone-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Floating Action Button */}
              <button 
                onClick={() => openAnalysis("river")}
                className="fixed bottom-24 right-4 bg-emerald-700 hover:bg-emerald-800 text-white h-14 px-5 rounded-full shadow-lg flex items-center gap-2 active-scale z-30 cursor-pointer"
              >
                <Camera className="w-5 h-5 fill-white/20" />
                <span className="text-xs font-bold uppercase tracking-wider">Report Incident</span>
              </button>
            </div>
          )}

          {/* SCREEN 4: COMPLAINT HISTORY TAB */}
          {screenState(screen, "HOME") && activeTab === "HISTORY" && (
            <div className="flex flex-col min-h-screen bg-stone-50 pb-28">
              {/* TOP HEADER */}
              <header className="fixed top-0 left-0 w-full max-w-md mx-auto h-16 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 flex justify-between items-center px-4 shadow-sm">
                <h1 className="text-lg font-black text-emerald-800 tracking-tight">EcoShield History</h1>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setIsNotificationsOpen(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 relative"
                  >
                    <Bell className="w-5 h-5 text-stone-700" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-white" />
                  </button>
                </div>
              </header>

              {/* SCROLLABLE LIST OF CASES */}
              <main className="pt-20 px-4 space-y-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-stone-800">Submitted Cases</h2>
                    <div className="flex gap-1.5 text-xs font-bold text-stone-600 bg-stone-200/50 p-1 rounded-full">
                      <button
                        onClick={() => setSelectedComplaint(null)}
                        className="px-3 py-1 rounded-full hover:bg-stone-100"
                      >
                        All
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search reports or ID..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 shadow-sm"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Complaints Bento Cards */}
                <div className="space-y-4">
                  {filteredComplaints.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedComplaint(item)}
                      className="bg-white rounded-2xl p-4 flex gap-4 items-start active:scale-[0.98] transition-all cursor-pointer border border-stone-100 hover:shadow-md shadow-sm"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                        <img
                          className="w-full h-full object-cover"
                          alt={item.title}
                          src={item.imageUrl || "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51"}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h3 className="text-sm font-bold text-stone-900 leading-tight">{item.title}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${
                              item.status === "RESOLVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "REVIEW"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-stone-400 text-xs font-semibold mb-2">Case #{item.id} • {item.location}</p>
                        <div className="flex items-center gap-3 text-stone-400 text-[10px] font-bold">
                          <span className="flex items-center gap-0.5"><History className="w-3.5 h-3.5" /> {item.date}</span>
                          <span className="flex items-center gap-0.5"><Map className="w-3.5 h-3.5" /> 1.5km away</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredComplaints.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                      <FileText className="w-16 h-16 stroke-1 mb-2" />
                      <p className="font-semibold text-sm">No environmental cases match your query</p>
                    </div>
                  )}
                </div>
              </main>

              {/* REPORT DEEP DIVE OVERLAY */}
              {selectedDetailComplaint && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-end justify-center">
                  <div className="bg-stone-50 w-full max-w-md rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300">
                    {/* Visual section */}
                    <div className="h-56 relative bg-black">
                      <img
                        className="w-full h-full object-cover opacity-90"
                        alt="Evidence overview"
                        src={selectedDetailComplaint.imageUrl}
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={() => setSelectedDetailComplaint(null)}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white active:scale-95 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 left-4 bg-emerald-800 text-white font-mono text-[10px] px-3 py-1 rounded-full font-bold uppercase shadow">
                        Coordinates: {selectedDetailComplaint.coordinates}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h2 className="text-lg font-bold text-stone-900 leading-snug">{selectedDetailComplaint.title}</h2>
                            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider font-mono mt-1">Case ID: {selectedDetailComplaint.id}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              selectedDetailComplaint.status === "RESOLVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : selectedDetailComplaint.status === "REVIEW"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {selectedDetailComplaint.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs uppercase font-extrabold text-stone-400 tracking-wider">AI Impact Summary</h4>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {selectedDetailComplaint.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
                          <span className="block text-[10px] uppercase font-bold text-stone-400 mb-0.5">Confidence Score</span>
                          <span className="text-base font-extrabold text-emerald-800">{selectedDetailComplaint.confidence}%</span>
                        </div>
                        <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
                          <span className="block text-[10px] uppercase font-bold text-stone-400 mb-0.5">Pollution Severity</span>
                          <span className="text-base font-extrabold text-red-600">{selectedDetailComplaint.severity}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs uppercase font-extrabold text-stone-400 tracking-wider">Pollution Spectrum</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDetailComplaint.composition.map((tag, idx) => (
                            <span 
                              key={idx}
                              className="bg-stone-900 text-white text-xs px-3.5 py-1.5 rounded-full font-semibold shadow-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {selectedDetailComplaint.aiNotes && (
                        <div className="bg-stone-100 p-4 rounded-2xl text-xs italic text-stone-600 border border-stone-200">
                          "{selectedDetailComplaint.aiNotes}"
                        </div>
                      )}

                      <div className="pt-4 border-t border-stone-100 flex gap-2">
                        <button
                          onClick={() => {
                            handleDispatchTeam(selectedDetailComplaint.id);
                            setSelectedDetailComplaint(null);
                          }}
                          className="flex-grow py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                        >
                          Dispatch Action Unit
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`Case ${selectedDetailComplaint.id}: ${selectedDetailComplaint.title} - reported at coordinates ${selectedDetailComplaint.coordinates}`);
                            alert("Case data coordinates copied to clipboard!");
                          }}
                          className="px-4 py-3.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCREEN 5: USER PROFILE TAB */}
          {screenState(screen, "HOME") && activeTab === "PROFILE" && (
            <div className="flex flex-col min-h-screen bg-stone-50 pb-28">
              {/* TOP HEADER */}
              <header className="fixed top-0 left-0 w-full max-w-md mx-auto h-16 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 flex justify-between items-center px-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-emerald-700 fill-emerald-100" />
                  <h1 className="text-lg font-black text-emerald-800 tracking-tight">User Profile</h1>
                </div>
                <button 
                  onClick={() => setIsNotificationsOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 active:scale-95 transition-all relative"
                >
                  <Bell className="w-5 h-5 text-stone-700" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-white" />
                </button>
              </header>

              {/* PROFILE MAIN CANVAS */}
              <main className="pt-20 px-4 space-y-6">
                {/* Profile Header Block */}
                <section className="flex flex-col items-center py-6 text-center">
                  <div className="relative mb-4" onClick={() => setIsAdminMode(true)} style={{ cursor: "pointer" }}>
                    <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-emerald-600 to-emerald-300 shadow-xl active:scale-95 transition-transform duration-200">
                      <img
                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-inner"
                        alt="Aryan Sharma portrait avatar"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_2wYtJFfShesVzitWLfP4GMwOu9lEH7E9jU9sHDeP_dpb6xdXe8XkcJg9dStdcdS3OlgjoRZriFeTu3h7ElcaxcxU8WXoqdEgm7_nNfuXEqdSyJ8zUX_RIHNsJcLk_SkuQ_ulpUypj9nCqamTE73sngWh84-CjPHqmwfAHXL3o8QVKb3UkAluYJe4B0_7unDDYleojHjnlIU_7DUh8MN8JxoJHFnn96NywKjRgck9PTD2brt1Txl5ig"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <button className="absolute bottom-1 right-1 bg-emerald-700 text-white p-2 rounded-full shadow-lg hover:bg-emerald-800 transition-colors">
                      <Cpu className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-black text-stone-900 leading-snug">Aryan Sharma</h2>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">aryan.sharma@ecoshield.ai</p>
                </section>

                {/* User Stats Bento Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                    <AlertTriangle className="w-6 h-6 text-emerald-700 mb-1" />
                    <span className="text-2xl font-black text-emerald-800">12</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400 mt-0.5">Complaints</span>
                  </div>

                  <div className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                    <Sparkles className="w-6 h-6 text-emerald-700 mb-1" />
                    <span className="text-2xl font-black text-emerald-800">4.2k</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400 mt-0.5">Contributions</span>
                  </div>
                </div>

                {/* Settings menu list */}
                <div className="glass-card rounded-2xl overflow-hidden shadow-sm divide-y divide-stone-100">
                  <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors active:scale-95 duration-150">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-stone-500" />
                      <span className="text-sm font-semibold text-stone-800">Notification Prefs</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors active:scale-95 duration-150">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-stone-500" />
                      <div className="text-left">
                        <span className="text-sm font-semibold text-stone-800 block">App Language</span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">English (US)</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors active:scale-95 duration-150">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-stone-500" />
                      <span className="text-sm font-semibold text-stone-800">Help & FAQ</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>

                  <button 
                    onClick={() => setIsAdminMode(true)}
                    className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors active:scale-95 duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-stone-500" />
                      <span className="text-sm font-semibold text-stone-800">Admin Control Panel</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                </div>

                {/* Logout Action */}
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to exit and return to splash screen?")) {
                        setScreen("SPLASH");
                      }
                    }}
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm shadow-sm transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-700" />
                    Logout
                  </button>
                  <p className="text-center mt-6 text-[10px] text-stone-400 font-extrabold uppercase tracking-widest">
                    ECOSHIELD AI V2.4.1
                  </p>
                </div>
              </main>
            </div>
          )}

          {/* SCREEN 6: RIVER POLLUTION DETECTION VIEW */}
          {screenState(screen, "RIVER_DETECTION") && (
            <div className="flex flex-col min-h-screen bg-stone-50 pb-20">
              {/* TOP HEADER */}
              <header className="fixed top-0 left-0 w-full max-w-md mx-auto h-16 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 flex justify-between items-center px-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setScreen("HOME")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-emerald-800" />
                  </button>
                  <h1 className="text-base font-black text-emerald-800 tracking-tight">River Pollution</h1>
                </div>
                <button 
                  onClick={() => setIsNotificationsOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 relative"
                >
                  <Bell className="w-5 h-5 text-stone-700" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-white" />
                </button>
              </header>

              {/* CAMERA INTERACTIVE VIEWPORT */}
              <main className="pt-20 px-4 space-y-6">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-black border-4 border-white/60 shadow-2xl">
                  {selectedPhoto ? (
                    <img
                      className="w-full h-full object-cover"
                      alt="Active Source Environment"
                      src={selectedPhoto}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${PRESET_RIVER_PHOTOS[0].url}')` }} />
                  )}

                  {/* Top YOLO Indicator if analyzed */}
                  {yoloBbox && analysisResult && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                      <div className="glass-card-dark px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border-l-4 border-l-red-600">
                        <AlertTriangle className="w-4 h-4 text-red-500 fill-red-500/20" />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">{analysisResult.severity} SEVERITY</span>
                      </div>
                    </div>
                  )}

                  {/* Simulated YOLO neural overlay box */}
                  {yoloBbox && (
                    <div className="absolute top-[35%] left-[25%] w-1/2 h-1/2 border-2 border-amber-400 rounded-2xl flex flex-col pointer-events-none z-20">
                      <div className="bg-amber-400 text-stone-900 px-2.5 py-1 text-[9px] font-black uppercase self-start rounded-br-lg rounded-tl-lg font-mono tracking-wider shadow">
                        YOLOv8: POLLUTION {analysisResult?.confidence || 94}%
                      </div>
                    </div>
                  )}

                  {/* In-scanning overlay state */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none overflow-hidden z-20">
                      <div className="absolute w-full h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan" style={{ top: "40%" }} />
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-900/65 backdrop-blur-md">
                        <div className="text-center p-6 space-y-4">
                          <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
                          <div>
                            <h3 className="text-base font-black text-emerald-400 uppercase tracking-widest">Neural Analysis...</h3>
                            <p className="text-stone-300 text-xs mt-1">Scanning spectral parameters for polymers, oils, and runoff.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gradient bottom overlay coordinates */}
                  <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 text-white flex flex-col justify-end">
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/20 text-[9px] font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      GPS: 28.6139° N, 77.2090° E
                    </div>
                  </div>
                </div>

                {/* PHOTO SELECTION METHOD PRESETS */}
                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Select Test Satellite Scenario</p>
                  <div className="flex gap-2">
                    {PRESET_RIVER_PHOTOS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPhoto(p.url);
                          setAnalysisResult(null);
                          setYoloBbox(false);
                        }}
                        className={`flex-1 p-2 rounded-xl text-center bg-white border font-bold text-[10px] uppercase truncate transition-all ${
                          selectedPhoto === p.url ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-stone-200 text-stone-600"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* IMAGE UPLOAD TRIGGER */}
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white border border-stone-200 py-3 rounded-2xl font-bold text-xs text-stone-700 hover:bg-stone-50 cursor-pointer active-scale">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Take Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white border border-stone-200 py-3 rounded-2xl font-bold text-xs text-stone-700 hover:bg-stone-50 cursor-pointer active-scale">
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>

                {/* CHIEF YOLO TRIGGER */}
                <button
                  onClick={triggerAIAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-4.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 active-scale duration-200 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Analyze using YOLOv8</span>
                </button>

                {/* AI LIVE COMPOSITION BREAKDOWN PANELS */}
                {analysisResult && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5">
                    {/* Warning Card */}
                    <div className="glass-card p-5 rounded-3xl border-l-[6px] border-l-red-600 shadow animate-pulse">
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div>
                          <span className="text-red-600 text-[10px] font-black uppercase tracking-wider">AI Incident Flags</span>
                          <h2 className="text-base font-extrabold text-stone-900 leading-tight">RED ALERT: Water Pollution Detected</h2>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-stone-400">Confidence Match</span>
                          <span className="block text-lg font-black text-emerald-800">{analysisResult.confidence}%</span>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-stone-400">Hazard Level</span>
                          <span className="block text-lg font-black text-red-600">{analysisResult.severity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detected tags composition panel */}
                    <div className="glass-card p-5 rounded-3xl shadow">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Compositional Analysis</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.composition?.map((tag: any, idx: number) => (
                          <span key={idx} className="bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-stone-100 flex items-start gap-2.5 text-xs text-stone-500 leading-relaxed italic">
                        <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                        <span>{analysisResult.description}</span>
                      </div>
                    </div>

                    {/* Complaint Form Launch Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setComplaintTitle("River Runoff - Delta Sector 7G");
                          setScreen("GENERATE_COMPLAINT");
                        }}
                        className="w-full py-4.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active-scale duration-200 cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-white" />
                        <span>Generate Complaint</span>
                      </button>
                    </div>
                  </div>
                )}
              </main>
            </div>
          )}

          {/* SCREEN 7: OPEN WASTE BURNING VIEW */}
          {screenState(screen, "WASTE_DETECTION") && (
            <div className="flex flex-col min-h-screen bg-stone-50 pb-20">
              {/* TOP HEADER */}
              <header className="fixed top-0 left-0 w-full max-w-md mx-auto h-16 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 flex justify-between items-center px-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setScreen("HOME")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-emerald-800" />
                  </button>
                  <h1 className="text-base font-black text-emerald-800 tracking-tight">Open Waste Burning</h1>
                </div>
                <button 
                  onClick={() => setIsNotificationsOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 relative"
                >
                  <Bell className="w-5 h-5 text-stone-700" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-white" />
                </button>
              </header>

              {/* CAMERA INTERACTIVE VIEWPORT */}
              <main className="pt-20 px-4 space-y-6">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-black border-4 border-white/60 shadow-2xl">
                  {selectedPhoto ? (
                    <img
                      className="w-full h-full object-cover"
                      alt="Active Source Environment"
                      src={selectedPhoto}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${PRESET_WASTE_PHOTOS[0].url}')` }} />
                  )}

                  {/* Top YOLO Indicator if analyzed */}
                  {yoloBbox && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                      <div className="glass-card-dark px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border-l-4 border-l-red-600">
                        <AlertTriangle className="w-4 h-4 text-red-500 fill-red-500/20" />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">CRITICAL SEVERITY</span>
                      </div>
                    </div>
                  )}

                  {/* Simulated YOLO neural overlay box */}
                  {yoloBbox && (
                    <div className="absolute top-[28%] left-[28%] w-1/2 h-1/2 border-2 border-yellow-500 rounded-2xl flex flex-col pointer-events-none z-20">
                      <div className="bg-yellow-500 text-stone-950 px-2.5 py-1 text-[9px] font-black uppercase self-start rounded-br-lg rounded-tl-lg font-mono tracking-wider shadow">
                        YOLOv8: SMOKE 98%
                      </div>
                    </div>
                  )}

                  {/* In-scanning overlay state */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none overflow-hidden z-20">
                      <div className="absolute w-full h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan" style={{ top: "40%" }} />
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-900/65 backdrop-blur-md">
                        <div className="text-center p-6 space-y-4">
                          <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
                          <div>
                            <h3 className="text-base font-black text-emerald-400 uppercase tracking-widest">Neural Analysis...</h3>
                            <p className="text-stone-300 text-xs mt-1">Scanning atmospheric particulate content and thermal density.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gradient bottom overlay coordinates */}
                  <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 text-white flex flex-col justify-end">
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/20 text-[9px] font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      GPS: 28.6410° N, 77.1950° E
                    </div>
                  </div>
                </div>

                {/* PHOTO SELECTION METHOD PRESETS */}
                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Select Test Satellite Scenario</p>
                  <div className="flex gap-2">
                    {PRESET_WASTE_PHOTOS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPhoto(p.url);
                          setAnalysisResult(null);
                          setYoloBbox(false);
                        }}
                        className={`flex-1 p-2 rounded-xl text-center bg-white border font-bold text-[10px] uppercase truncate transition-all ${
                          selectedPhoto === p.url ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-stone-200 text-stone-600"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* IMAGE UPLOAD TRIGGER */}
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white border border-stone-200 py-3 rounded-2xl font-bold text-xs text-stone-700 hover:bg-stone-50 cursor-pointer active-scale">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Take Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white border border-stone-200 py-3 rounded-2xl font-bold text-xs text-stone-700 hover:bg-stone-50 cursor-pointer active-scale">
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>

                {/* CHIEF YOLO TRIGGER */}
                <button
                  onClick={triggerAIAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-4.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 active-scale duration-200 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Analyze using YOLOv8</span>
                </button>

                {/* AI LIVE COMPOSITION BREAKDOWN PANELS */}
                {analysisResult && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5">
                    {/* Warning Card */}
                    <div className="glass-card p-5 rounded-3xl border-l-[6px] border-l-red-600 shadow">
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div>
                          <span className="text-red-600 text-[10px] font-black uppercase tracking-wider">Active Incident</span>
                          <h2 className="text-base font-extrabold text-stone-900 leading-tight">EMERGENCY: Illegal Waste Burning Detected</h2>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                          <Flame className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-stone-400">Confidence Score</span>
                          <span className="block text-lg font-black text-emerald-800">{analysisResult.confidence}%</span>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-stone-400">Risk Assessment</span>
                          <span className="block text-lg font-black text-red-600">{analysisResult.severity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detected tags composition panel */}
                    <div className="glass-card p-5 rounded-3xl">
                      <h3 class="text-xs font-bold text-stone-400 uppercase mb-4 tracking-widest">Compositional Analysis</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.composition.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1.5 bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-bold"
                          >
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-stone-100 flex items-start gap-2.5 text-xs text-stone-500 leading-relaxed italic">
                        <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                        <span>{analysisResult.description}</span>
                      </div>
                    </div>

                    {/* Complaint Form Launch Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setComplaintTitle("Illegal Burning - Industrial Outflow Zone");
                          setScreen("GENERATE_COMPLAINT");
                        }}
                        className="w-full py-4.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active-scale duration-200 cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-white" />
                        <span>Generate Urgent Complaint</span>
                      </button>
                    </div>
                  </div>
                )}
              </main>
            </div>
          )}

          {/* SCREEN 8: GENERATE COMPLAINT FORM & SUCCESS OVERLAY */}
          {screenState(screen, "GENERATE_COMPLAINT") && (
            <div className="flex flex-col min-h-screen bg-stone-50 pb-20 relative">
              {/* SUCCESS OVERLAY PANEL */}
              {submittedCaseId && (
                <div className="absolute inset-0 bg-stone-50/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mb-6 shadow animate-bounce">
                    <Check className="w-12 h-12 stroke-[3]" />
                  </div>
                  <h2 className="text-2xl font-black text-emerald-800 mb-2">Complaint Submitted</h2>
                  <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-6">Case Registered & Dispatched Successfully</p>

                  <div className="bg-emerald-100/50 border-2 border-dashed border-emerald-300 px-6 py-3 rounded-2xl mb-12">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">Reference Case ID</span>
                    <span className="text-xl font-extrabold text-emerald-950 font-mono tracking-wider">{submittedCaseId}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSubmittedCaseId(null);
                      setScreen("HOME");
                      setActiveTab("HISTORY");
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-xl active-scale cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}

              {/* TOP HEADER */}
              <header className="fixed top-0 left-0 w-full max-w-md mx-auto h-16 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 flex justify-between items-center px-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setScreen(detectionType === "river" ? "RIVER_DETECTION" : "WASTE_DETECTION")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-emerald-800" />
                  </button>
                  <h1 className="text-base font-black text-emerald-800 tracking-tight">Generate Complaint</h1>
                </div>
              </header>

              {/* COMPLAINT SUBMISSION DETAILS */}
              <main className="pt-20 px-4 space-y-6">
                {/* Micro GPS Delta Map Preview */}
                <section className="glass-card rounded-3xl overflow-hidden border border-stone-200 shadow-sm relative">
                  <div className="h-44 w-full relative">
                    <img
                      className="w-full h-full object-cover brightness-[1.02]"
                      alt="Pinpointed satellite mapping coordinates overview"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8q2-o1iti-w_z0VDsOoK1883HtQDrt0HIaKa0H6caPpn5hF9NZZ_uwuxYD135TUlBth5aCnWxeAhJA1KvG81fbbmBxnKOaym7udF7Orf93hXNSN_yVnjASyKGVnV5wYyLAdOdJR8pa8w9VnJiF89UZUlDg4wdBqUMXxx0upcatpB8pto8dqnew-FmNTP6O9g5ht7cOPDfcQZpAJdrqBm3wPYt55xty_fv58b0J9LQxUIX3a7pltg-Mg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    
                    {/* Centered locator pin */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <span className="w-3 h-3 bg-red-600 rounded-full border border-white animate-ping absolute top-3" />
                      <Map className="w-8 h-8 text-red-600 drop-shadow" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-stone-100 shadow flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-emerald-800">
                    <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
                    Live Coordinates Locked
                  </div>
                </section>

                {/* Evidence Photo details */}
                <section className="grid grid-cols-2 gap-4">
                  <div className="glass-card rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Evidence</span>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                      <img
                        className="w-full h-full object-cover"
                        alt="Evidence submission snapshot"
                        src={selectedPhoto || PRESET_RIVER_PHOTOS[0].url}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-emerald-600/95 text-white p-1 rounded-lg">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Detection AI</span>
                      <h3 className="text-sm font-extrabold text-emerald-800 mt-1">
                        {detectionType === "river" ? "River Pollution" : "Illegal Fire Burning"}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-xs font-bold text-stone-800">
                        <Cpu className="w-4 h-4 text-emerald-700" />
                        <span>{analysisResult?.confidence || 94}% Confidence</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100">
                      <div className="flex items-center gap-1.5 text-red-600 font-bold text-[10px] uppercase tracking-wider animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        CRITICAL ALERT
                      </div>
                    </div>
                  </div>
                </section>

                {/* Complaint Entry Form */}
                <section className="glass-card rounded-3xl p-5 space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Custom Case Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Block 4 Outflow Leak"
                      value={complaintTitle}
                      onChange={(e) => setComplaintTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700/20 shadow-inner"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans">Incident Coordinates</label>
                    <div className="flex items-center gap-2 bg-stone-100/50 px-4 py-3 rounded-xl border border-stone-100">
                      <Crosshair className="w-4 h-4 text-emerald-700" />
                      <input
                        className="bg-transparent border-none p-0 text-xs font-mono font-bold text-stone-600 w-full focus:ring-0 focus:outline-none"
                        readOnly
                        type="text"
                        value={detectionType === "river" ? "28.6139° N, 77.2090° E" : "28.6410° N, 77.1950° E"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Date Logged</label>
                      <div className="flex items-center gap-2 bg-stone-100/50 px-4 py-3 rounded-xl border border-stone-100">
                        <input className="bg-transparent border-none p-0 text-xs font-bold text-stone-600 w-full focus:ring-0 focus:outline-none" readOnly type="text" value="Oct 24, 2023" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Time Logged</label>
                      <div className="flex items-center gap-2 bg-stone-100/50 px-4 py-3 rounded-xl border border-stone-100">
                        <input className="bg-transparent border-none p-0 text-xs font-bold text-stone-600 w-full focus:ring-0 focus:outline-none" readOnly type="text" value="14:32" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">AI Generated Impact Analysis</label>
                    <div className="bg-stone-100/50 px-4 py-3 rounded-xl border border-stone-100 text-[11px] font-medium leading-relaxed text-stone-600">
                      {analysisResult?.description || "High-fidelity AI detection has flagged local chemical pollution and floating waste. Action sequence scheduled."}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Citizen Field Notes / Details</label>
                    <textarea
                      placeholder="Add additional visual or smell indicators seen on ground..."
                      value={complaintNotes}
                      onChange={(e) => setComplaintNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700/20 shadow-inner resize-none"
                    />
                  </div>
                </section>

                {/* Form Action */}
                <div className="pt-2">
                  <button
                    onClick={submitComplaint}
                    disabled={isSubmitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm py-4.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active-scale duration-200 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {isSubmitting ? "Submitting Case File..." : "Submit Verified Complaint"}
                  </button>
                  <p className="text-center text-[9px] font-bold text-stone-400 mt-4 uppercase tracking-widest leading-relaxed">
                    Authorized government reporting channel under automated telemetry signature.
                  </p>
                </div>
              </main>
            </div>
          )}

          {/* PERSISTENT TAB BAR NAVIGATION */}
          {screenState(screen, "HOME") && (
            <nav className="fixed bottom-0 left-0 w-full max-w-md mx-auto z-40 bg-white/90 backdrop-blur-md border-t border-stone-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.03)] flex justify-around py-3 px-2 pb-safe rounded-t-3xl">
              {/* Tab 1: Home */}
              <button
                onClick={() => {
                  setScreen("HOME");
                  setActiveTab("HOME");
                }}
                className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full active-scale transition-all duration-200 ${
                  activeTab === "HOME" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                <Shield className={`w-5 h-5 ${activeTab === "HOME" ? "fill-emerald-800/10" : ""}`} />
                <span className="text-[10px] mt-1 font-bold">Home</span>
              </button>

              {/* Tab 2: Map */}
              <button
                onClick={() => {
                  setScreen("HOME");
                  setActiveTab("MAP");
                  setActiveMapPopup(null);
                }}
                className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full active-scale transition-all duration-200 ${
                  activeTab === "MAP" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                <Map className={`w-5 h-5 ${activeTab === "MAP" ? "fill-emerald-800/10" : ""}`} />
                <span className="text-[10px] mt-1 font-bold">Map</span>
              </button>

              {/* Tab 3: History */}
              <button
                onClick={() => {
                  setScreen("HOME");
                  setActiveTab("HISTORY");
                }}
                className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full active-scale transition-all duration-200 ${
                  activeTab === "HISTORY" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                <History className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-bold">History</span>
              </button>

              {/* Tab 4: Profile */}
              <button
                onClick={() => {
                  setScreen("HOME");
                  setActiveTab("PROFILE");
                }}
                className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full active-scale transition-all duration-200 ${
                  activeTab === "PROFILE" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                <User className={`w-5 h-5 ${activeTab === "PROFILE" ? "fill-emerald-800/10" : ""}`} />
                <span className="text-[10px] mt-1 font-bold">Profile</span>
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );

  // Helper filter checks for screen routing
  function screenState(current: ScreenType, target: ScreenType): boolean {
    if (target === "HOME") {
      return current === "HOME";
    }
    return current === target;
  }

  // Multi-pin toggler for map popup details
  function togglePopup(key: string) {
    setActiveMapPopup(prev => (prev === key ? null : key));
  }
}
