import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Complaint, Language } from "../types";
import { translations } from "../translations";
import { MapPin, Info, Search, Filter, Layers, Maximize2, Eye, ShieldAlert } from "lucide-react";

interface GisMapProps {
  complaints: Complaint[];
  language: Language;
  selectedTab: "air" | "river" | "solid" | "complaints";
  onSelectComplaint?: (complaint: Complaint) => void;
}

// 1. Predefined National Air Quality Heatmap Data (AQI)
const airQualityData = [
  { city: "Delhi NCR", lat: 28.6139, lng: 77.2090, aqi: 342, pm25: 185, pm10: 290, co: 2.1, no2: 56, so2: 12, o3: 45, status: "Hazardous", color: "#7e0023" },
  { city: "Mumbai Suburban", lat: 19.0760, lng: 72.8777, aqi: 112, pm25: 42, pm10: 95, co: 1.1, no2: 24, so2: 8, o3: 31, status: "Moderate", color: "#f7e400" },
  { city: "Bengaluru Urban", lat: 12.9716, lng: 77.5946, aqi: 65, pm25: 18, pm10: 45, co: 0.6, no2: 14, so2: 4, o3: 28, status: "Good", color: "#00e400" },
  { city: "Kolkata Metro", lat: 22.5726, lng: 88.3639, aqi: 198, pm25: 88, pm10: 160, co: 1.8, no2: 41, so2: 10, o3: 38, status: "Poor", color: "#ff7e00" },
  { city: "Chennai Central", lat: 13.0827, lng: 80.2707, aqi: 88, pm25: 29, pm10: 55, co: 0.8, no2: 18, so2: 6, o3: 33, status: "Moderate", color: "#f7e400" },
  { city: "Hyderabad Urban", lat: 17.3850, lng: 78.4867, aqi: 135, pm25: 55, pm10: 110, co: 1.3, no2: 28, so2: 7, o3: 35, status: "Moderate", color: "#f7e400" },
  { city: "Varanasi District", lat: 25.3176, lng: 83.0062, aqi: 215, pm25: 110, pm10: 185, co: 1.9, no2: 45, so2: 11, o3: 40, status: "Very Poor", color: "#ff0000" },
  { city: "Agra Taj Hub", lat: 27.1767, lng: 78.0081, aqi: 285, pm25: 145, pm10: 220, co: 2.0, no2: 51, so2: 14, o3: 42, status: "Very Poor", color: "#ff0000" }
];

// 2. Predefined National River Pollution Heatmap Data
const riverPollutionData = [
  { name: "Yamuna River - Delhi Stretch", lat: 28.6250, lng: 77.2500, severity: "Critical", oxygenLevel: 1.2, ph: 8.5, pollutants: "Industrial Effluents, Sewage, Plastic", status: "Critically Polluted", color: "#ef4444" },
  { name: "Ganga River - Kanpur Stretch", lat: 26.4499, lng: 80.3319, severity: "Critical", oxygenLevel: 2.1, ph: 7.9, pollutants: "Tannery Waste, Toxic Chemicals", status: "Critically Polluted", color: "#ef4444" },
  { name: "Mula Mutha River - Pune", lat: 18.5204, lng: 73.8567, severity: "High", oxygenLevel: 3.5, ph: 7.6, pollutants: "Domestic Sewage, Plastic", status: "Highly Polluted", color: "#f97316" },
  { name: "Cooum River - Chennai", lat: 13.0620, lng: 80.2500, severity: "Critical", oxygenLevel: 0.8, ph: 8.2, pollutants: "Sludge, Solid Waste, Chemical Effluents", status: "Critically Polluted", color: "#ef4444" },
  { name: "Sabarmati River - Ahmedabad", lat: 23.0225, lng: 72.5714, severity: "High", oxygenLevel: 2.8, ph: 7.4, pollutants: "Textile Dye, Industrial Acid", status: "Highly Polluted", color: "#f97316" },
  { name: "Vrishabhavathy River - Bengaluru", lat: 12.9250, lng: 77.5360, severity: "High", oxygenLevel: 1.9, ph: 8.0, pollutants: "E-waste effluents, Domestic discharge", status: "Highly Polluted", color: "#f97316" },
  { name: "Ganga River - Varanasi Ghats", lat: 25.3120, lng: 83.0100, severity: "Moderate", oxygenLevel: 4.2, ph: 7.8, pollutants: "Microplastics, Ritual Waste", status: "Moderately Polluted", color: "#eab308" },
  { name: "Hooghly River - Kolkata Stretch", lat: 22.5650, lng: 88.3500, severity: "Moderate", oxygenLevel: 4.0, ph: 7.5, pollutants: "Jute Mill Discharge, Urban Waste", status: "Moderately Polluted", color: "#eab308" }
];

// 3. Predefined Solid Waste Dump Heatmap Data
const solidWasteData = [
  { landfill: "Ghazipur Landfill - Delhi", lat: 28.6258, lng: 77.3236, area: "70 Acres", height: "65 Meters", weight: "14 Million Tons", hazard: "Methane Gas Fires, Leachate Outflow", status: "Overfilled / Hazardous", color: "#7e0023" },
  { landfill: "Deonar Landfill - Mumbai", lat: 19.0652, lng: 72.9304, area: "132 Acres", height: "35 Meters", weight: "16 Million Tons", hazard: "Toxic Smoke, Ground Water Poisoning", status: "Critical / At Capacity", color: "#ef4444" },
  { landfill: "Kodungaiyur Landfill - Chennai", lat: 13.1368, lng: 80.2483, area: "100 Acres", height: "20 Meters", weight: "8 Million Tons", hazard: "Heavy Metal Leaks, Air Degradation", status: "Critical Risk", color: "#f97316" },
  { landfill: "Mavallipura Dump Yard - Bengaluru", lat: 13.1205, lng: 77.5450, area: "45 Acres", height: "15 Meters", weight: "4 Million Tons", hazard: "Leachate Soil Toxicity", status: "High Risk Area", color: "#f97316" },
  { landfill: "Dhapa Dump Yard - Kolkata", lat: 22.5458, lng: 88.4111, area: "80 Acres", height: "18 Meters", weight: "6 Million Tons", hazard: "Methane Generation, Heavy Smog", status: "Critical Risk", color: "#ef4444" },
  { landfill: "Jawaharnagar Dump Yard - Hyderabad", lat: 17.5248, lng: 78.5830, area: "120 Acres", height: "25 Meters", weight: "9 Million Tons", hazard: "Odour Plumes, Water Seepage", status: "Critical Risk", color: "#ef4444" }
];

export default function GisMap({ complaints, language, selectedTab, onSelectComplaint }: GisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [temporalFilter, setTemporalFilter] = useState("all");
  const [mapStyle, setMapStyle] = useState<"street" | "satellite" | "terrain">("street");
  const t = translations[language];

  // 4. Dynamic Checkbox Layer Visibility States
  const [showComplaints, setShowComplaints] = useState(true);
  const [showAir, setShowAir] = useState(false);
  const [showRiver, setShowRiver] = useState(false);
  const [showSolid, setShowSolid] = useState(false);

  // Sync checkboxes with tab switches from Government Admin Console
  useEffect(() => {
    if (selectedTab === "complaints") {
      setShowComplaints(true);
      setShowAir(false);
      setShowRiver(false);
      setShowSolid(false);
    } else if (selectedTab === "air") {
      setShowComplaints(false);
      setShowAir(true);
      setShowRiver(false);
      setShowSolid(false);
    } else if (selectedTab === "river") {
      setShowComplaints(false);
      setShowAir(false);
      setShowRiver(true);
      setShowSolid(false);
    } else if (selectedTab === "solid") {
      setShowComplaints(false);
      setShowAir(false);
      setShowRiver(false);
      setShowSolid(true);
    }
  }, [selectedTab]);

  // Map Tile Providers
  const tileProviders = {
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
  };

  // Trigger search positioning
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapRef.current || !searchQuery) return;

    const query = searchQuery.toLowerCase();
    
    // Check if matching Air Quality dataset
    const foundAir = airQualityData.find(aq => aq.city.toLowerCase().includes(query));
    if (foundAir) {
      mapRef.current.setView([foundAir.lat, foundAir.lng], 10);
      return;
    }

    // Check if matching River Pollution dataset
    const foundRiver = riverPollutionData.find(r => r.name.toLowerCase().includes(query));
    if (foundRiver) {
      mapRef.current.setView([foundRiver.lat, foundRiver.lng], 10);
      return;
    }

    // Check if matching Solid Waste dump dataset
    const foundLand = solidWasteData.find(l => l.landfill.toLowerCase().includes(query));
    if (foundLand) {
      mapRef.current.setView([foundLand.lat, foundLand.lng], 10);
      return;
    }

    // Check matching citizen complaints
    const foundComp = complaints.find(c => c.address.toLowerCase().includes(query) || c.id.toLowerCase().includes(query));
    if (foundComp) {
      mapRef.current.setView([foundComp.latitude, foundComp.longitude], 12);
    }
  };

  const locateUserSimulated = () => {
    if (!mapRef.current) return;
    if (complaints.length > 0) {
      mapRef.current.setView([complaints[0].latitude, complaints[0].longitude], 10);
    } else {
      mapRef.current.setView([21.0, 78.0], 5);
    }
  };

  // Main Leaflet Map renderer
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultCenter: L.LatLngExpression = [21.0, 78.0]; // Center of India
    const defaultZoom = 5;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: true,
      attributionControl: false
    });

    mapRef.current = map;

    // Add selected Base Tile layer
    L.tileLayer(tileProviders[mapStyle], {
      maxZoom: 18
    }).addTo(map);

    // Filter citizen reports temporally
    const now = new Date();
    const filteredComplaints = complaints.filter(c => {
      if (temporalFilter === "today") {
        const cDate = new Date(c.date);
        const diffTime = Math.abs(now.getTime() - cDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 1;
      }
      if (temporalFilter === "7days") {
        const cDate = new Date(c.date);
        const diffTime = Math.abs(now.getTime() - cDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (temporalFilter === "30days") {
        const cDate = new Date(c.date);
        const diffTime = Math.abs(now.getTime() - cDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }
      return true;
    });

    // LAYER 1: AIR QUALITY HEATMAP OVERLAY (Visualized as concentric vector radial gradients)
    if (showAir) {
      airQualityData.forEach(aq => {
        const circleColor = aq.color;
        
        // Dynamic concentric rings creating vector glowing heatmap
        const radii = [45000, 25000, 10000];
        const opacities = [0.12, 0.28, 0.55];
        
        radii.forEach((r, idx) => {
          L.circle([aq.lat, aq.lng], {
            color: circleColor,
            weight: 0.8,
            opacity: opacities[idx] * 0.3,
            fillColor: circleColor,
            fillOpacity: opacities[idx] * 0.7,
            radius: r
          }).addTo(map);
        });

        // Interactive transparent circle for seamless popup triggers
        const interactionCircle = L.circle([aq.lat, aq.lng], {
          color: "transparent",
          fillColor: "transparent",
          radius: 45000
        }).addTo(map);

        const popupContent = `
          <div class="p-3 font-sans max-w-xs text-slate-800">
            <div class="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2">
              <span class="w-3.5 h-3.5 rounded-full" style="background-color: ${circleColor}"></span>
              <h4 class="font-bold text-sm text-slate-900">${aq.city}</h4>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <span class="text-slate-500 font-medium">AQI Level:</span>
              <span class="font-black" style="color: ${circleColor}">${aq.aqi} (${aq.status})</span>
              <span class="text-slate-500">PM2.5 Conc:</span>
              <span class="font-semibold text-slate-900">${aq.pm25} µg/m³</span>
              <span class="text-slate-500">PM10 Conc:</span>
              <span class="font-semibold text-slate-900">${aq.pm10} µg/m³</span>
              <span class="text-slate-500">Nitrogen NO₂:</span>
              <span class="font-semibold text-slate-900">${aq.no2} ppb</span>
              <span class="text-slate-500">Carbon CO:</span>
              <span class="font-semibold text-slate-900">${aq.co} ppm</span>
            </div>
          </div>
        `;
        interactionCircle.bindPopup(popupContent);
      });
    }

    // LAYER 2: RIVER POLLUTION HEATMAP OVERLAY (Fuses predefined river hotspots + citizen report anchors)
    if (showRiver) {
      riverPollutionData.forEach(river => {
        const radii = [40000, 22000, 9000];
        const opacities = [0.12, 0.28, 0.55];

        radii.forEach((r, idx) => {
          L.circle([river.lat, river.lng], {
            color: river.color,
            weight: 0.8,
            opacity: opacities[idx] * 0.3,
            fillColor: river.color,
            fillOpacity: opacities[idx] * 0.7,
            radius: r
          }).addTo(map);
        });

        const interactionCircle = L.circle([river.lat, river.lng], {
          color: "transparent",
          fillColor: "transparent",
          radius: 40000
        }).addTo(map);

        const popupContent = `
          <div class="p-3 font-sans max-w-xs text-slate-800">
            <div class="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2">
              <span class="w-3.5 h-3.5 rounded-full" style="background-color: ${river.color}"></span>
              <h4 class="font-bold text-sm text-slate-900">${river.name}</h4>
            </div>
            <div class="text-xs space-y-1.5">
              <div><strong class="text-slate-500">Threat Severity:</strong> <span class="font-black" style="color: ${river.color}">${river.severity}</span></div>
              <div><strong class="text-slate-500">Index Classification:</strong> <span class="font-bold text-slate-850">${river.status}</span></div>
              <div><strong class="text-slate-500">Dissolved Oxygen:</strong> <span class="font-semibold text-slate-900">${river.oxygenLevel} mg/L</span></div>
              <div><strong class="text-slate-500">Water pH:</strong> <span class="font-semibold text-slate-900">${river.ph}</span></div>
              <div><strong class="text-slate-500">Identified Effluents:</strong> <span class="font-bold text-red-600">${river.pollutants}</span></div>
            </div>
          </div>
        `;
        interactionCircle.bindPopup(popupContent);
      });

      // Overlay river complaints as auxiliary glowing heat buffers
      const activeRiverComplaints = filteredComplaints.filter(c => c.category === "River Pollution");
      activeRiverComplaints.forEach(c => {
        const sevColors = { Low: "#22c55e", Moderate: "#eab308", High: "#f97316", Critical: "#ef4444" };
        const color = sevColors[c.severity] || "#ef4444";

        L.circle([c.latitude, c.longitude], {
          color: color,
          fillColor: color,
          fillOpacity: 0.28,
          radius: 20000,
          weight: 0.5
        }).addTo(map);
      });
    }

    // LAYER 3: SOLID WASTE LANDFILL DENSITY OVERLAY (Fuses national landfills + active trash piles)
    if (showSolid) {
      solidWasteData.forEach(land => {
        const radii = [32000, 18000, 7000];
        const opacities = [0.12, 0.28, 0.55];

        radii.forEach((r, idx) => {
          L.circle([land.lat, land.lng], {
            color: land.color,
            weight: 0.8,
            opacity: opacities[idx] * 0.3,
            fillColor: land.color,
            fillOpacity: opacities[idx] * 0.7,
            radius: r
          }).addTo(map);
        });

        const interactionCircle = L.circle([land.lat, land.lng], {
          color: "transparent",
          fillColor: "transparent",
          radius: 32000
        }).addTo(map);

        const popupContent = `
          <div class="p-3 font-sans max-w-xs text-slate-800">
            <div class="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2">
              <span class="w-3.5 h-3.5 rounded-full" style="background-color: ${land.color}"></span>
              <h4 class="font-bold text-sm text-slate-900">${land.landfill}</h4>
            </div>
            <div class="text-xs space-y-1.5">
              <div><strong class="text-slate-500">Hazard Category:</strong> <span class="font-black" style="color: ${land.color}">${land.status}</span></div>
              <div><strong class="text-slate-500">Estimated Weight:</strong> <span class="font-semibold text-slate-900">${land.weight}</span></div>
              <div><strong class="text-slate-500">Peak Summit Height:</strong> <span class="font-semibold text-slate-900">${land.height}</span></div>
              <div><strong class="text-slate-500">Surface Footprint:</strong> <span class="font-semibold text-slate-900">${land.area}</span></div>
              <div><strong class="text-slate-500">Inherent Threat:</strong> <span class="font-bold text-red-600">${land.hazard}</span></div>
            </div>
          </div>
        `;
        interactionCircle.bindPopup(popupContent);
      });

      // Overlay solid waste complaints as auxiliary glowing heap buffers
      const activeSolidComplaints = filteredComplaints.filter(c => c.category === "Solid Waste" || c.category === "Open Waste Burning");
      activeSolidComplaints.forEach(c => {
        const sevColors = { Low: "#22c55e", Moderate: "#eab308", High: "#f97316", Critical: "#ef4444" };
        const color = sevColors[c.severity] || "#f97316";

        L.circle([c.latitude, c.longitude], {
          color: color,
          fillColor: color,
          fillOpacity: 0.28,
          radius: 18000,
          weight: 0.5
        }).addTo(map);
      });
    }

    // LAYER 4: CITIZEN COMPLAINT INCIDENT MARKERS OVERLAY
    if (showComplaints) {
      filteredComplaints.forEach(c => {
        const catIcons = {
          "River Pollution": "🌊",
          "Open Waste Burning": "🔥",
          "Solid Waste": "🗑️"
        };
        const markerIcon = catIcons[c.category] || "📍";

        const statusColors = {
          Pending: "#ef4444",
          "Under Investigation": "#eab308",
          Approved: "#3b82f6",
          Rejected: "#6b7280",
          Resolved: "#22c55e"
        };
        const pinColor = statusColors[c.status] || "#ef4444";

        const customMarkerHtml = `
          <div class="flex items-center justify-center rounded-full border-2 border-white shadow-md w-8 h-8 font-bold text-white transition hover:scale-110 cursor-pointer" 
               style="background-color: ${pinColor}; font-size: 14px;">
            ${markerIcon}
          </div>
        `;

        const leafletIcon = L.divIcon({
          html: customMarkerHtml,
          className: "custom-div-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([c.latitude, c.longitude], { icon: leafletIcon }).addTo(map);

        const popupContent = `
          <div class="p-3 font-sans w-64 text-slate-800">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span class="font-bold text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">${c.id}</span>
              <span class="text-[10px] text-slate-400 font-mono">${c.date} ${c.time}</span>
            </div>
            <div class="mb-2">
              <img src="${c.imageUrl}" class="w-full h-28 object-cover rounded shadow-sm" />
            </div>
            <div class="text-xs space-y-1 mb-2">
              <div><strong class="text-slate-500">Category:</strong> <span class="font-semibold text-slate-800">${c.category}</span></div>
              <div><strong class="text-slate-500">Detected:</strong> <span class="font-semibold text-red-600 text-[10px] bg-red-50 px-1.5 py-0.5 rounded">${c.detectedObjects.join(", ")}</span></div>
              <div><strong class="text-slate-500">AI YOLO Match:</strong> <span class="font-semibold text-slate-800">${c.confidence}%</span></div>
              <div><strong class="text-slate-500">Severity:</strong> <span class="font-bold text-amber-600">${c.severity}</span></div>
              <div class="truncate"><strong class="text-slate-500">Location:</strong> <span class="text-slate-600" title="${c.address}">${c.address}</span></div>
              <div><strong class="text-slate-500">Status:</strong> <span class="font-bold" style="color: ${pinColor}">${c.status}</span></div>
              ${c.adminRemarks ? `<div class="mt-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded text-[11px] italic text-slate-600">"${c.adminRemarks}"</div>` : ""}
            </div>
            <div class="flex gap-2 pt-2 border-t border-slate-100">
              <a href="https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}" target="_blank" 
                 class="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] py-1 px-1.5 rounded transition">
                Google Maps
              </a>
              <button id="inspect-btn-${c.id}" class="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] py-1 px-1.5 rounded transition">
                Inspect
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("popupopen", () => {
          const btn = document.getElementById(`inspect-btn-${c.id}`);
          if (btn && onSelectComplaint) {
            btn.addEventListener("click", () => {
              onSelectComplaint(c);
              map.closePopup();
            });
          }
        });
      });
    }

    // Auto centering zoom levels based on state
    if (selectedTab === "complaints" && filteredComplaints.length > 0) {
      const group = L.featureGroup(filteredComplaints.map(c => L.marker([c.latitude, c.longitude])));
      map.fitBounds(group.getBounds().pad(0.15));
    } else {
      map.setView([21.0, 78.0], 5); // Default whole India view for heatmaps
    }

    return () => {
      map.remove();
    };
  }, [complaints, temporalFilter, mapStyle, showAir, showRiver, showSolid, showComplaints]);

  return (
    <div className={`relative flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg ${isFullscreen ? "fixed inset-0 z-50 p-4 bg-slate-100 dark:bg-slate-950" : "h-[500px] md:h-[620px]"}`}>
      
      {/* Top Floating Controls Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap gap-2 items-center justify-between pointer-events-none">
        
        {/* Real-time search */}
        <form onSubmit={handleSearch} className="flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-lg pointer-events-auto max-w-sm w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder={t.mapSearchPlaceholder || "Search cities, landfills, rivers..."}
            className="bg-transparent border-none text-xs text-slate-800 dark:text-slate-100 focus:outline-none w-full placeholder-slate-400 dark:placeholder-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="hidden" />
        </form>

        {/* Global Controls */}
        <div className="flex gap-2 pointer-events-auto shrink-0 flex-wrap">
          {/* Base Map Switcher */}
          <div className="flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 p-1 rounded-full shadow-lg gap-1">
            <button
              onClick={() => setMapStyle("street")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${mapStyle === "street" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              Street
            </button>
            <button
              onClick={() => setMapStyle("satellite")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${mapStyle === "satellite" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle("terrain")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${mapStyle === "terrain" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              Terrain
            </button>
          </div>

          {/* Temporal Filter Selector */}
          <div className="flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-lg text-xs gap-1 text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <select
              value={temporalFilter}
              onChange={(e) => setTemporalFilter(e.target.value)}
              className="bg-transparent border-none text-[11px] font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-slate-100"
            >
              <option value="all" className="bg-white dark:bg-slate-900">{t.allTime}</option>
              <option value="today" className="bg-white dark:bg-slate-900">{t.today}</option>
              <option value="7days" className="bg-white dark:bg-slate-900">{t.sevenDays}</option>
              <option value="30days" className="bg-white dark:bg-slate-900">{t.thirtyDays}</option>
            </select>
          </div>

          {/* Current center locator */}
          <button
            onClick={locateUserSimulated}
            title={t.myLocation}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <MapPin className="w-4 h-4" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={t.fullscreen}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DYNAMIC LAYER MANAGER PANEL (Checkbox Toggles for multi-overlay combination) */}
      <div className="absolute top-16 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl font-sans w-56 flex flex-col gap-2.5 pointer-events-auto">
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-0.5">
          <Layers className="w-3.5 h-3.5 text-indigo-500" /> Active GIS Map Layers
        </span>
        
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          <input
            type="checkbox"
            checked={showComplaints}
            onChange={(e) => setShowComplaints(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
          />
          <span>🚨 Citizen Incident Markers</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          <input
            type="checkbox"
            checked={showAir}
            onChange={(e) => setShowAir(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
          />
          <span>💨 Air Quality Heatmap</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          <input
            type="checkbox"
            checked={showRiver}
            onChange={(e) => setShowRiver(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
          />
          <span>🌊 River Pollution Heatmap</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          <input
            type="checkbox"
            checked={showSolid}
            onChange={(e) => setShowSolid(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
          />
          <span>🗑️ Landfill & Waste Heatmap</span>
        </label>
      </div>

      {/* Map Target */}
      <div id="gis-map" ref={mapContainerRef} className="w-full flex-1 z-[1]" />

      {/* Legend & Telemetry Indicators Panel (Expands dynamically based on active checkboxes) */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl text-[10px] leading-relaxed w-72 md:w-80 pointer-events-auto max-h-[300px] overflow-y-auto scrollbar-thin">
        <h5 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-500" /> GIS Layer Legends
        </h5>
        
        <div className="space-y-3.5">
          {showComplaints && (
            <div className="space-y-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-extrabold block uppercase tracking-wide">Incident Status:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" />
                  <span>Investigation</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span>Approved</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                  <span>Resolved</span>
                </div>
              </div>
            </div>
          )}

          {showAir && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400 font-extrabold block uppercase tracking-wide">CPCB National AQI Index:</span>
              <div className="flex gap-1 h-2 rounded overflow-hidden">
                <span className="flex-1 bg-[#00e400]" title="Good (0-50)" />
                <span className="flex-1 bg-[#ffff00]" title="Moderate (51-150)" />
                <span className="flex-1 bg-[#ff7e00]" title="Poor (151-200)" />
                <span className="flex-1 bg-[#ff0000]" title="Very Poor (201-300)" />
                <span className="flex-1 bg-[#7e0023]" title="Hazardous (301+)" />
              </div>
              <div className="grid grid-cols-5 text-[8px] text-slate-400 font-bold text-center gap-0.5">
                <span>Good</span>
                <span>Mod</span>
                <span>Poor</span>
                <span>V.Poor</span>
                <span>Severe</span>
              </div>
            </div>
          )}

          {showRiver && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400 font-extrabold block uppercase tracking-wide">River Contamination:</span>
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                  <span>Moderate</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  <span>Highly Polluted</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span>Critical Stretch</span>
                </div>
              </div>
            </div>
          )}

          {showSolid && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400 font-extrabold block uppercase tracking-wide">Landfill/Dump Pile Density:</span>
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  <span>High Risk Yard</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span>Overfilled Critical</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#7e0023] shrink-0" />
                  <span>Toxic Hazard</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
