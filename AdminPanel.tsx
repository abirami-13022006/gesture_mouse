import React, { useState } from "react";
import { Shield, Bell, Search, Filter, X, Send, Share2, TrendingUp, TrendingDown, Clock, Layers, Users, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { Complaint } from "../types";

interface AdminPanelProps {
  complaints: Complaint[];
  onClose: () => void;
  onDispatchTeam: (id: string) => void;
}

export default function AdminPanel({ complaints, onClose, onDispatchTeam }: AdminPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Filter complaints based on search
  const filteredComplaints = complaints.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.citizen.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24">
      {/* Top Admin Header */}
      <header className="fixed top-0 left-0 w-full h-16 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 flex justify-between items-center px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-emerald-700 fill-emerald-100 animate-pulse" />
          <h1 className="text-xl font-bold text-emerald-800 tracking-tight flex items-center gap-2">
            EcoShield AI <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">ADMIN</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-stone-100 rounded-full active:scale-95 transition-transform relative">
            <Bell className="w-6 h-6 text-stone-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-2" onClick={onClose} style={{ cursor: "pointer" }}>
            <div className="w-10 h-10 rounded-full border-2 border-emerald-700 p-0.5 active:scale-95 transition-transform">
              <img
                className="w-full h-full rounded-full object-cover"
                alt="Admin Official Headshot"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtrELeu3Xmq42Kkk0fq_9Hr2y7zwN_JW0JNvy4tjnEg72Kk9rYvGSdb2c7PAfYJPsz1h2L9mRxRuWQL6N9rVQiDa3CU2f10ZXmtHLDGBDAkzBFtcO5pMeBj7cNl5Xbcv-L0isu2bLO_7FEiiWYjsGIUtEUAO05hdRIarOMUoj99sLSiFT0zY9mYR751PrVujYIhWOEEqWeiqpdF8ef5AmADL2Gfq01if1JIQF8s5tC9b1aqkO2asah8w"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xs font-bold text-emerald-800 hover:underline hidden sm:inline">Exit Admin</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="pt-20 px-4 max-w-7xl mx-auto space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Complaints */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
            <span className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Total Active Complaints</span>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-extrabold text-emerald-700">45</span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +12%
              </span>
            </div>
          </div>

          {/* Priority Cases */}
          <div className="bg-white p-5 rounded-2xl border-l-4 border-l-red-600 border border-stone-200 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
            <span className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Priority Cases</span>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-extrabold text-red-600">8</span>
              <span className="text-red-700 bg-red-100 px-2 py-1 rounded-lg text-xs font-bold">Critical</span>
            </div>
          </div>

          {/* Field Units */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
            <span className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Field Units Active</span>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-extrabold text-blue-600">14</span>
              <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded-lg text-xs font-bold">Deployable</span>
            </div>
          </div>

          {/* Mean Resolution */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
            <span className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Mean Resolution</span>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-extrabold text-amber-700">
                3.2<span className="text-lg font-bold">h</span>
              </span>
              <span className="text-amber-700 bg-amber-100 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> -15m
              </span>
            </div>
          </div>
        </div>

        {/* Charts Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-stone-800">Pollution Types</h3>
              <Layers className="w-5 h-5 text-stone-400" />
            </div>
            
            {/* Custom Interactive SVG Pie Chart */}
            <div className="h-48 relative flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                {/* Water Contamination: 50% (Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#0d631b"
                  strokeWidth="16"
                  strokeDasharray="125.6 251.2"
                  strokeDashoffset="0"
                  className="transition-all duration-500 hover:stroke-[20px] cursor-pointer"
                />
                {/* Air Quality: 30% (Blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#005db7"
                  strokeWidth="16"
                  strokeDasharray="75.36 251.2"
                  strokeDashoffset="-125.6"
                  className="transition-all duration-500 hover:stroke-[20px] cursor-pointer"
                />
                {/* Illegal Dumping: 20% (Gold) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#a18115"
                  strokeWidth="16"
                  strokeDasharray="50.24 251.2"
                  strokeDashoffset="-200.96"
                  className="transition-all duration-500 hover:stroke-[20px] cursor-pointer"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-bold text-lg text-emerald-800">AI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Audit</span>
              </div>
            </div>

            {/* Pie Chart Legend */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0d631b]"></div>
                  <span className="text-stone-600 font-medium">Water Contamination</span>
                </div>
                <span className="font-bold text-stone-800">50%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#005db7]"></div>
                  <span className="text-stone-600 font-medium">Air Quality</span>
                </div>
                <span className="font-bold text-stone-800">30%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#a18115]"></div>
                  <span className="text-stone-600 font-medium">Illegal Dumping</span>
                </div>
                <span className="font-bold text-stone-800">20%</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-stone-800">Weekly Resolution Speed</h3>
              <div className="flex gap-2 bg-stone-100 p-1 rounded-full text-[11px] font-bold">
                <button className="px-3 py-1 text-stone-500">Daily</button>
                <button className="px-3 py-1 bg-emerald-700 text-white rounded-full shadow-sm">Weekly</button>
              </div>
            </div>

            {/* Custom Interactive SVG Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-4 px-4 pb-4 border-b border-stone-100">
              {/* Mon */}
              <div className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
                <div className="w-full bg-emerald-200/40 rounded-t-lg relative group cursor-pointer" style={{ height: "65%" }}>
                  <div className="absolute bottom-0 w-full bg-emerald-700 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-600" style={{ height: "80%" }} />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md pointer-events-none transition-opacity font-mono">
                    3.8h
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-bold">Mon</span>
              </div>

              {/* Tue */}
              <div className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
                <div className="w-full bg-emerald-200/40 rounded-t-lg relative group cursor-pointer" style={{ height: "85%" }}>
                  <div className="absolute bottom-0 w-full bg-emerald-700 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-600" style={{ height: "95%" }} />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md pointer-events-none transition-opacity font-mono">
                    4.5h
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-bold">Tue</span>
              </div>

              {/* Wed */}
              <div className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
                <div className="w-full bg-emerald-200/40 rounded-t-lg relative group cursor-pointer" style={{ height: "45%" }}>
                  <div className="absolute bottom-0 w-full bg-emerald-700 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-600" style={{ height: "60%" }} />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md pointer-events-none transition-opacity font-mono">
                    2.1h
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-bold">Wed</span>
              </div>

              {/* Thu */}
              <div className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
                <div className="w-full bg-emerald-200/40 rounded-t-lg relative group cursor-pointer" style={{ height: "95%" }}>
                  <div className="absolute bottom-0 w-full bg-emerald-700 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-600" style={{ height: "85%" }} />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md pointer-events-none transition-opacity font-mono">
                    4.9h
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-bold">Thu</span>
              </div>

              {/* Fri */}
              <div className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
                <div className="w-full bg-emerald-200/40 rounded-t-lg relative group cursor-pointer" style={{ height: "75%" }}>
                  <div className="absolute bottom-0 w-full bg-emerald-700 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-600" style={{ height: "75%" }} />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md pointer-events-none transition-opacity font-mono">
                    3.9h
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-bold">Fri</span>
              </div>

              {/* Sat */}
              <div className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
                <div className="w-full bg-emerald-200/40 rounded-t-lg relative group cursor-pointer" style={{ height: "35%" }}>
                  <div className="absolute bottom-0 w-full bg-emerald-700 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-600" style={{ height: "40%" }} />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md pointer-events-none transition-opacity font-mono">
                    1.5h
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-bold">Sat</span>
              </div>

              {/* Sun */}
              <div className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
                <div className="w-full bg-emerald-200/40 rounded-t-lg relative group cursor-pointer" style={{ height: "25%" }}>
                  <div className="absolute bottom-0 w-full bg-emerald-700 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-600" style={{ height: "30%" }} />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md pointer-events-none transition-opacity font-mono">
                    1.2h
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-bold">Sun</span>
              </div>
            </div>
            
            <p className="text-xs text-stone-400 text-right mt-2 font-medium">Resolution statistics verified by satellite analytics feedback loop</p>
          </div>
        </div>

        {/* Recent Reports Table Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 bg-stone-50">
            <h3 className="font-bold text-stone-800 text-lg">Recent Field Reports</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <input
                  type="text"
                  placeholder="Search case or citizen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 w-full sm:w-64"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
              <button className="p-2 bg-white border border-stone-200 rounded-xl active:scale-95 transition-transform">
                <Filter className="w-5 h-5 text-stone-600" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Report ID</th>
                  <th className="px-6 py-4">Citizen</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Urgency</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredComplaints.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedComplaint(item)}
                  >
                    <td className="px-6 py-4 font-bold text-emerald-800">{item.id}</td>
                    <td className="px-6 py-4 text-stone-700 font-medium">{item.citizen}</td>
                    <td className="px-6 py-4 text-stone-600 font-medium">{item.type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold text-xs ${
                          item.urgency.toLowerCase() === "critical"
                            ? "text-red-600"
                            : item.urgency.toLowerCase() === "moderate"
                            ? "text-amber-600"
                            : "text-stone-500"
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "REVIEW"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {item.status === "RESOLVED" ? (
                        <span className="text-stone-400 text-xs font-medium">Closed</span>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedComplaint(item)}
                            className="bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow hover:bg-emerald-800 active:scale-95 transition-all"
                          >
                            Investigate
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredComplaints.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-stone-400 font-medium">
                      No matching field reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Details View Deep Dive Overlay */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Left Side: Photo & Holographic heatmaps */}
            <div className="w-full md:w-3/5 relative bg-black h-64 md:h-auto min-h-[300px]">
              <img
                className="w-full h-full object-cover opacity-85"
                alt="Case Visual Forensic Evidence"
                src={selectedComplaint.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCrfcgxMCgdJSFCzF301Zm37Q65vZBA452frbsgLbu51vEZeLk59i0G0ZsYHzXBp2BuOMYjmxJt5tBaZ93HSzDYveWpSXqYeIuxMnD0TWNMqT0vRRPqXpF-imW3A0nMIA6FmIAsAjY7VPObTMfJZd1cuEHgMMnOkHFKdQF280dtJIgYTKpudNJF40QhoUqJ99vCzzLvQYpKdVm2Kmsey1bVqc1lrkhBmUBDR6dEZRhzCiJeOs54Tp_qdw"}
                referrerPolicy="no-referrer"
              />
              {/* Heatmap & detector visuals */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-600/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl" />
                
                {/* YOLOv8 bounding box */}
                <div className="absolute top-[35%] left-[30%] border-2 border-red-600 rounded w-44 h-24 flex flex-col">
                  <span className="bg-red-600 text-white text-[10px] font-mono px-2 py-0.5 self-start font-bold uppercase rounded-br">
                    SPILL_DETECTION {selectedComplaint.confidence}%
                  </span>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                {selectedComplaint.coordinates}
              </div>
            </div>

            {/* Right Side: Investigation Details */}
            <div className="w-full md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-full">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-stone-950">{selectedComplaint.title}</h2>
                    <p className="text-xs text-stone-400 font-bold mt-1 uppercase tracking-wider font-mono">
                      ID: {selectedComplaint.id} • {selectedComplaint.date}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div>
                  <h4 className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-2">Environmental Impact</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                    <span className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Severity Score</span>
                    <span className="text-lg font-extrabold text-red-600">
                      {selectedComplaint.urgency === "Critical" ? "8.4 / 10" : "5.8 / 10"}
                    </span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                    <span className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Impact Radius</span>
                    <span className="text-lg font-extrabold text-blue-600">{selectedComplaint.impactRadius || "2.5 km"}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-2">Composition Profile</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedComplaint.composition.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-stone-900 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedComplaint.aiNotes && (
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 italic text-sm text-stone-600">
                    "{selectedComplaint.aiNotes}"
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-stone-100 space-y-3">
                {selectedComplaint.status !== "RESOLVED" ? (
                  <button
                    onClick={() => {
                      onDispatchTeam(selectedComplaint.id);
                      setSelectedComplaint(null);
                    }}
                    className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
                  >
                    <Send className="w-5 h-5 fill-white" />
                    Dispatch Response Team
                  </button>
                ) : (
                  <div className="bg-emerald-50 text-emerald-800 py-3 rounded-xl border border-emerald-200 text-center text-sm font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Case Cleared & Resolved
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl font-semibold text-sm transition-all">
                    Escalate to EPA
                  </button>
                  <button className="px-4 py-3 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
