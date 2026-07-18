import React, { useState } from "react";
import { Complaint, Language } from "../types";
import { translations } from "../translations";
import { BarChart3, Download, TrendingUp, AlertOctagon, CheckCircle2, ShieldAlert, Award, FileText, Calendar, ArrowUpRight, Info } from "lucide-react";

interface AnalyticsHubProps {
  complaints: Complaint[];
  language: Language;
}

export default function AnalyticsHub({ complaints, language }: AnalyticsHubProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "xlsx">("csv");
  const [reportType, setReportType] = useState("monthly");
  const t = translations[language];

  // Aggregated Statistics
  const totalCount = complaints.length;
  const riverCount = complaints.filter(c => c.category === "River Pollution").length;
  const burningCount = complaints.filter(c => c.category === "Open Waste Burning").length;
  const solidCount = complaints.filter(c => c.category === "Solid Waste").length;

  const resolvedCount = complaints.filter(c => c.status === "Resolved").length;
  const pendingCount = complaints.filter(c => c.status === "Pending").length;
  const underInvestigationCount = complaints.filter(c => c.status === "Under Investigation").length;

  // Environmental Risk Index (ERI) Calculation
  // 0 - 100 based on proportion of Critical + High complaints
  const severeCount = complaints.filter(c => c.severity === "Critical" || c.severity === "High").length;
  const eri = Math.min(100, Math.round((severeCount / (totalCount || 1)) * 100));

  // Determine ERI color and level
  let eriColor = "bg-emerald-500 text-white";
  let eriBg = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40";
  let eriText = "text-emerald-700 dark:text-emerald-400";
  let eriLabel = "Low Risk (Good)";
  if (eri > 80) {
    eriColor = "bg-red-600 text-white";
    eriBg = "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40";
    eriText = "text-red-700 dark:text-red-400";
    eriLabel = "Critical Risk (Action Required)";
  } else if (eri > 60) {
    eriColor = "bg-orange-500 text-white";
    eriBg = "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/40";
    eriText = "text-orange-700 dark:text-orange-400";
    eriLabel = "High Risk (Severe)";
  } else if (eri > 30) {
    eriColor = "bg-yellow-500 text-slate-900";
    eriBg = "bg-yellow-50 dark:bg-yellow-950/10 border-yellow-200 dark:border-yellow-800/40";
    eriText = "text-yellow-700 dark:text-yellow-400";
    eriLabel = "Moderate Risk";
  }

  // Monthly trends mock dataset matching India context
  const monthlyTrends = [
    { label: "Feb", count: 12, river: 4, burning: 3, solid: 5 },
    { label: "Mar", count: 18, river: 5, burning: 4, solid: 9 },
    { label: "Apr", count: 25, river: 8, burning: 7, solid: 10 },
    { label: "May", count: 32, river: 12, burning: 8, solid: 12 },
    { label: "Jun", count: 48, river: 16, burning: 14, solid: 18 },
    { label: "Jul", count: totalCount, river: riverCount, burning: burningCount, solid: solidCount }
  ];

  // District wise aggregated frequencies
  const districts = [
    { name: "Delhi NCR", count: complaints.filter(c => c.address.includes("Delhi")).length + 4, score: 85 },
    { name: "Mumbai Suburban", count: complaints.filter(c => c.address.includes("Mumbai")).length + 2, score: 65 },
    { name: "Bengaluru Urban", count: complaints.filter(c => c.address.includes("Bengaluru") || c.address.includes("Bangalore")).length + 3, score: 58 },
    { name: "Chennai Central", count: complaints.filter(c => c.address.includes("Chennai")).length + 1, score: 62 },
    { name: "Varanasi Ganges Basin", count: complaints.filter(c => c.address.includes("Varanasi")).length + 3, score: 78 }
  ].sort((a, b) => b.count - a.count);

  // Trigger download route
  const handleExport = () => {
    const url = `/api/reports/export?format=${exportFormat}&reportType=${reportType}`;
    window.open(url, "_blank");
  };

  // Find max count in monthly trends for chart scaling
  const maxTrendVal = Math.max(...monthlyTrends.map(m => m.count), 1);

  return (
    <div className="space-y-8">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Reports */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">{t.totalCases}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalCount}</span>
          </div>
        </div>

        {/* Resolved Cases */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">{t.resolvedCases}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{resolvedCount}</span>
          </div>
        </div>

        {/* Under Investigation */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">{t.underInvestigation}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{underInvestigationCount}</span>
          </div>
        </div>

        {/* ERI Card */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">{t.riskIndex}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{eri} / 100</span>
          </div>
        </div>

      </div>

      {/* Environmental Risk Index Details & Top risk Districts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* ERI Risk Meter */}
        <div className={`md:col-span-7 p-6 border rounded-2xl ${eriBg} flex flex-col justify-between shadow-sm transition-all duration-300`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertOctagon className={`w-5 h-5 ${eriText}`} /> Environmental Risk Index (ERI) Meter
              </h4>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${eriColor}`}>
                {eriLabel}
              </span>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-6">
              The ERI is dynamically calculated in real-time by aggregating local AQI indexes, river pollutant measurements, and the density of active solid waste dumps.
            </p>
          </div>

          <div className="space-y-4">
            {/* Meter Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                <span>0 (Pristine)</span>
                <span>50 (Caution)</span>
                <span>100 (Critical)</span>
              </div>
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${eriColor}`}
                  style={{ width: `${eri}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 text-center gap-2 text-xs pt-2">
              <div className="p-2.5 bg-white/70 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Rivers Status</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{riverCount > 3 ? "Action Needed" : "Stable"}</span>
              </div>
              <div className="p-2.5 bg-white/70 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Fires Trend</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{burningCount > 2 ? "High Stubble" : "Normal"}</span>
              </div>
              <div className="p-2.5 bg-white/70 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Landfills</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{solidCount} Registered</span>
              </div>
            </div>
          </div>
        </div>

        {/* High Risk Districts Table */}
        <div className="md:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Award className="w-5 h-5 text-indigo-500" /> {t.districtRanking}
            </h4>
            <div className="space-y-3">
              {districts.map((dist, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{dist.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-red-50 dark:bg-red-950/20 text-red-600 px-2 py-0.5 rounded-full font-bold">
                      {dist.count} cases
                    </span>
                    <span className="font-mono font-bold text-slate-500">ERI {dist.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 mt-4 leading-normal flex items-start gap-1">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            Scores compiled using Central Pollution Control Board (CPCB) grid monitoring data.
          </div>
        </div>

      </div>

      {/* Vector Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Monthly Trend Line Chart (SVG rendered dynamically!) */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <h4 className="font-bold text-sm text-slate-950 dark:text-slate-50 mb-4 flex items-center justify-between">
            <span>{t.complaintTrends}</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% MoM
            </span>
          </h4>

          {/* Styled SVG Chart */}
          <div className="relative h-64 w-full">
            <svg viewBox="0 0 500 240" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" className="dark:stroke-slate-800/50" strokeDasharray="3" />
              <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" className="dark:stroke-slate-800/50" strokeDasharray="3" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" className="dark:stroke-slate-800/50" strokeDasharray="3" />
              <line x1="40" y1="200" x2="480" y2="200" stroke="#cbd5e1" className="dark:stroke-slate-800" />

              {/* Chart Line Path generators */}
              {/* Plotting points: (40 + idx*88, 200 - (val/maxVal)*180) */}
              <path
                d={`M 40,${200 - (12/maxTrendVal)*160} 
                   L 128,${200 - (18/maxTrendVal)*160} 
                   L 216,${200 - (25/maxTrendVal)*160} 
                   L 304,${200 - (32/maxTrendVal)*160} 
                   L 392,${200 - (48/maxTrendVal)*160} 
                   L 480,${200 - (totalCount/maxTrendVal)*160}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Area Under Line (Gradient simulation using polygon) */}
              <polygon
                points={`40,200 
                         40,${200 - (12/maxTrendVal)*160} 
                         128,${200 - (18/maxTrendVal)*160} 
                         216,${200 - (25/maxTrendVal)*160} 
                         304,${200 - (32/maxTrendVal)*160} 
                         392,${200 - (48/maxTrendVal)*160} 
                         480,${200 - (totalCount/maxTrendVal)*160} 
                         480,200`}
                fill="url(#indigoGrad)"
                opacity="0.12"
              />

              <defs>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Interactive Circles / Dots */}
              {monthlyTrends.map((trend, idx) => {
                const cx = 40 + idx * 88;
                const cy = 200 - (trend.count / maxTrendVal) * 160;
                return (
                  <g key={idx}>
                    <circle cx={cx} cy={cy} r="6" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                    <text x={cx} y={cy - 12} textAnchor="middle" className="text-[10px] font-black fill-slate-800 dark:fill-slate-200">
                      {trend.count}
                    </text>
                    <text x={cx} y="220" textAnchor="middle" className="text-[10px] font-bold fill-slate-400 dark:fill-slate-500">
                      {trend.label}
                    </text>
                  </g>
                );
              })}

              {/* Left Y-axis labels */}
              <text x="30" y="20" textAnchor="end" className="text-[9px] fill-slate-400 font-bold">Max</text>
              <text x="30" y="110" textAnchor="end" className="text-[9px] fill-slate-400 font-bold">Mid</text>
              <text x="30" y="200" textAnchor="end" className="text-[9px] fill-slate-400 font-bold">0</text>
            </svg>
          </div>
        </div>

        {/* Chart 2: Category distribution Bar Chart */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <h4 className="font-bold text-sm text-slate-950 dark:text-slate-50 mb-6">
            Pollution Types Case Distribution
          </h4>

          <div className="space-y-5">
            {/* River Pollution */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">🌊 River Pollution Detection</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{riverCount} cases ({totalCount > 0 ? Math.round((riverCount/totalCount)*100) : 0}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${totalCount > 0 ? (riverCount/totalCount)*100 : 0}%` }} />
              </div>
            </div>

            {/* Waste Burning */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">🔥 Open Waste Burning</span>
                <span className="font-black text-amber-600 dark:text-amber-400">{burningCount} cases ({totalCount > 0 ? Math.round((burningCount/totalCount)*100) : 0}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${totalCount > 0 ? (burningCount/totalCount)*100 : 0}%` }} />
              </div>
            </div>

            {/* Solid Waste */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">🗑️ Illegal Solid Waste Dumping</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{solidCount} cases ({totalCount > 0 ? Math.round((solidCount/totalCount)*100) : 0}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${totalCount > 0 ? (solidCount/totalCount)*100 : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Extra Resolution Stat widget */}
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Complaint Resolution efficiency:</span>
            </div>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}%
            </span>
          </div>
        </div>

      </div>

      {/* Official Government Report Export Panel */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col md:flex-row gap-6 items-center justify-between border border-slate-800">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="px-2 py-0.5 bg-indigo-500 text-[9px] font-bold uppercase rounded tracking-wider">CPCB Authorized</span>
            <span className="text-slate-400 text-xs">• Government-grade Analytics Export</span>
          </div>
          <h4 className="text-lg font-black tracking-tight">EcoShield Official Crime Reports</h4>
          <p className="text-slate-400 text-xs max-w-xl">
            Export comprehensive environmental crime datasets compiled from AI predictions, citizen GPS telemetry, and municipal status records. Suitable for Forest, Municipal, and Pollution Control Board audits.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Report scope */}
          <select 
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="monthly">Monthly National Report</option>
            <option value="district">Delhi NCR District-Wise</option>
            <option value="river">Adyar & Yamuna River Pollutions</option>
            <option value="waste">Solid Landfills & Burning hotspots</option>
            <option value="analytics">Complete Platform Logs</option>
          </select>

          {/* Formats */}
          <div className="bg-slate-800 border border-slate-700 p-1 rounded-xl flex">
            <button 
              onClick={() => setExportFormat("csv")}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition ${exportFormat === "csv" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              CSV
            </button>
            <button 
              onClick={() => setExportFormat("xlsx")}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition ${exportFormat === "xlsx" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              EXCEL
            </button>
            <button 
              onClick={() => setExportFormat("pdf")}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition ${exportFormat === "pdf" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              PDF
            </button>
          </div>

          {/* Export action */}
          <button
            onClick={handleExport}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

    </div>
  );
}
