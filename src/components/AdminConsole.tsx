import React, { useState } from "react";
import { Complaint, User, AdminLog, Language } from "../types";
import { translations } from "../translations";
import { Search, Filter, Check, X, Shield, Users, Database, FileText, MapPin, Eye, ExternalLink, Trash2, ShieldAlert } from "lucide-react";

interface AdminConsoleProps {
  complaints: Complaint[];
  users: User[];
  logs: AdminLog[];
  language: Language;
  onUpdateComplaint: (id: string, status: Complaint["status"], remarks: string) => void;
  onDeleteComplaint: (id: string) => void;
  onUpdateUserStatus: (email: string, status: User["status"]) => void;
}

export default function AdminConsole({
  complaints,
  users,
  logs,
  language,
  onUpdateComplaint,
  onDeleteComplaint,
  onUpdateUserStatus
}: AdminConsoleProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<"complaints" | "users" | "logs">("complaints");
  
  // Complaints management state
  const [compSearch, setCompSearch] = useState("");
  const [compFilter, setCompFilter] = useState("all");
  const [selectedComp, setSelectedComp] = useState<Complaint | null>(null);
  const [adminRemarksInput, setAdminRemarksInput] = useState("");

  // User management state
  const [userSearch, setUserSearch] = useState("");

  const t = translations[language];

  // Filters
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(compSearch.toLowerCase()) || 
                          c.address.toLowerCase().includes(compSearch.toLowerCase()) ||
                          c.reporterName.toLowerCase().includes(compSearch.toLowerCase());
    const matchesFilter = compFilter === "all" ? true : c.status === compFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const openInspection = (c: Complaint) => {
    setSelectedComp(c);
    setAdminRemarksInput(c.adminRemarks || "");
  };

  const handleApplyAction = (status: Complaint["status"]) => {
    if (!selectedComp) return;
    onUpdateComplaint(selectedComp.id, status, adminRemarksInput);
    setSelectedComp({ ...selectedComp, status, adminRemarks: adminRemarksInput });
  };

  const handleDeleteComp = (id: string) => {
    onDeleteComplaint(id);
    setSelectedComp(null);
  };

  // Status visual color maps
  const statusBadges = {
    Pending: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/40",
    "Under Investigation": "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800/40",
    Approved: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/40",
    Rejected: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-800/40",
    Resolved: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40"
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Dashboard header & Tab switcher */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-extrabold text-[10px] uppercase rounded tracking-wider flex items-center gap-1 w-fit mb-1">
            <Shield className="w-3.5 h-3.5" /> SECURE CONTROL NODE
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-50">{t.admin}</h2>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveAdminTab("complaints")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeAdminTab === "complaints" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}
          >
            <Database className="w-4 h-4" /> Reports ({complaints.length})
          </button>
          <button
            onClick={() => setActiveAdminTab("users")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeAdminTab === "users" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}
          >
            <Users className="w-4 h-4" /> Users ({users.length})
          </button>
          <button
            onClick={() => setActiveAdminTab("logs")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeAdminTab === "logs" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}
          >
            <FileText className="w-4 h-4" /> Audit Logs
          </button>
        </div>
      </div>

      {/* RENDER VIEW DEPENDING ON TAB */}
      {activeAdminTab === "complaints" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* List of complaints */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 h-[550px] flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Search & filters */}
              <div className="flex gap-2">
                <div className="flex items-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 flex-1 text-xs">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search ID, Address, Reporter..."
                    className="bg-transparent border-none text-slate-800 dark:text-slate-100 focus:outline-none w-full"
                    value={compSearch}
                    onChange={(e) => setCompSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                  <select
                    value={compFilter}
                    onChange={(e) => setCompFilter(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Investigation">Investigation</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Scrollable list */}
              <div className="space-y-2 overflow-y-auto max-h-[440px] pr-1">
                {filteredComplaints.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-bold text-xs">
                    No environmental crime complaints found matching current filters.
                  </div>
                ) : (
                  filteredComplaints.map((c) => {
                    const statusClass = statusBadges[c.status] || "bg-slate-50 text-slate-500 border-slate-200";
                    return (
                      <div
                        key={c.id}
                        onClick={() => openInspection(c)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex gap-3.5 items-center justify-between ${selectedComp?.id === c.id ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800" : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-200 dark:border-slate-800/60"}`}
                      >
                        <div className="flex gap-3 items-center min-w-0">
                          <img src={c.imageUrl} className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-black text-xs text-indigo-600 dark:text-indigo-400">{c.id}</span>
                              <span className="text-[10px] text-slate-400">{c.date}</span>
                            </div>
                            <h5 className="font-bold text-slate-900 dark:text-slate-50 text-xs truncate">{c.category}</h5>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{c.address}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`px-2 py-0.5 text-[9px] font-black border rounded-full uppercase tracking-wider ${statusClass}`}>
                            {c.status}
                          </span>
                          <span className="block text-[10px] font-bold text-slate-400 mt-1">Conf: {c.confidence}%</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>

          {/* Inspection and actions panel */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 h-[550px] flex flex-col justify-between overflow-hidden">
            {selectedComp ? (
              <div className="flex flex-col justify-between h-full">
                <div className="space-y-4 overflow-y-auto pr-1 max-h-[420px]">
                  
                  {/* Header info */}
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Complaint Inspector</span>
                      <h4 className="font-black text-indigo-600 dark:text-indigo-400 text-sm flex items-center gap-1">
                        {selectedComp.id}
                      </h4>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteComp(selectedComp.id)}
                      title="Delete Invalid complaint"
                      className="text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Prediction overlay container */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img src={selectedComp.imageUrl} className="w-full h-36 object-cover" />
                    
                    {/* Visual YOLO prediction overlays */}
                    {selectedComp.aiPredictions?.map((pred, pIdx) => {
                      const [ymin, xmin, ymax, xmax] = pred.box;
                      return (
                        <div
                          key={pIdx}
                          className="absolute border-2 border-red-500 bg-red-500/10 flex items-start"
                          style={{
                            top: `${ymin}%`,
                            left: `${xmin}%`,
                            width: `${xmax - xmin}%`,
                            height: `${ymax - ymin}%`
                          }}
                        >
                          <span className="bg-red-500 text-white font-extrabold text-[8px] px-1 py-0.5 rounded-br">
                            {pred.label} ({pred.confidence}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-3.5 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold uppercase">Reporter Name</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedComp.reporterName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold uppercase">Contact Information</span>
                      <span className="font-medium text-slate-600 dark:text-slate-400">{selectedComp.reporterPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold uppercase">GIS Coordinates</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {selectedComp.latitude.toFixed(4)}, {selectedComp.longitude.toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold uppercase">Confidence / Threat</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedComp.confidence}% / <span className="text-red-500">{selectedComp.severity}</span>
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] block font-bold uppercase">Resolved Address</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 block">{selectedComp.address}</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedComp.latitude},${selectedComp.longitude}`}
                        target="_blank"
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5 mt-1 hover:underline"
                      >
                        <MapPin className="w-3 h-3" /> View on Google Maps <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  {/* Remarks input */}
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] block font-bold uppercase">Official Admin Action Remarks</span>
                    <textarea
                      placeholder="Add investigation details, fines, scheduled cleanups, etc."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none h-14"
                      value={adminRemarksInput}
                      onChange={(e) => setAdminRemarksInput(e.target.value)}
                    />
                  </div>

                </div>

                {/* Actions footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button
                    onClick={() => handleApplyAction("Under Investigation")}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-[10px] py-2 rounded-xl transition uppercase"
                  >
                    Investigate
                  </button>
                  <button
                    onClick={() => handleApplyAction("Approved")}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-2 rounded-xl transition uppercase"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApplyAction("Resolved")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-2 rounded-xl transition uppercase"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleApplyAction("Rejected")}
                    className="px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] py-2 rounded-xl transition uppercase"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full p-6 text-slate-400">
                <ShieldAlert className="w-10 h-10 text-slate-300 mb-2" />
                <h5 className="font-bold text-xs">No complaint selected</h5>
                <p className="text-[10px] leading-relaxed max-w-[200px] mt-1 text-slate-400">
                  Select an environmental report from the left pane to view YOLO labels, inspect metadata, geolocate, and apply executive municipal directives.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {activeAdminTab === "users" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50 flex items-center gap-1">
              Registered EcoShield User Directory
            </h4>
            
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs w-64">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search user name, email, role..."
                className="bg-transparent border-none text-slate-800 dark:text-slate-100 focus:outline-none w-full"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email / Phone</th>
                  <th className="p-3.5">Authorized Role</th>
                  <th className="p-3.5">Registered Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{u.name}</td>
                    <td className="p-3.5">
                      <div className="font-medium">{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30 font-bold rounded text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{u.regDate}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase border ${u.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {u.status === "Active" ? (
                        <button
                          onClick={() => onUpdateUserStatus(u.email, "Suspended")}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] rounded transition uppercase"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateUserStatus(u.email, "Active")}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-[10px] rounded transition uppercase"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === "logs" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50 flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
            System Security & Audit Activity Logs
          </h4>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-start gap-4 text-xs font-medium"
              >
                <div className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/30 rounded font-black font-mono tracking-tight shrink-0">
                  {log.id}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.user}</span>
                    <span className="text-[10px] font-mono">{log.date} {log.time}</span>
                  </div>
                  <div className="font-extrabold text-slate-800 dark:text-slate-100 text-[11px] uppercase tracking-wide">
                    {log.action}
                  </div>
                  <p className="text-slate-500 text-[11px] italic font-medium">"{log.details}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
