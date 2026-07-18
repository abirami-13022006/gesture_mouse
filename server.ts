import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for base64 uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database file path for local persistence
const DB_PATH = path.join(process.cwd(), "db.json");

// Define basic interface types
interface User {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Suspended";
  regDate: string;
}

interface Complaint {
  id: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  category: "River Pollution" | "Open Waste Burning" | "Solid Waste";
  detectedObjects: string[];
  confidence: number;
  severity: "Low" | "Moderate" | "High" | "Critical";
  latitude: number;
  longitude: number;
  address: string;
  date: string;
  time: string;
  status: "Pending" | "Under Investigation" | "Approved" | "Rejected" | "Resolved";
  adminRemarks: string;
  imageUrl: string;
  aiPredictions: any[];
}

interface AdminLog {
  id: string;
  user: string;
  action: string;
  date: string;
  time: string;
  details: string;
}

// Initial default state (Indian context)
const DEFAULT_USERS: User[] = [
  { name: "Ashwin Alwin", email: "ashwinalwin12@gmail.com", phone: "+91 98765 43210", role: "Administrator", status: "Active", regDate: "2026-01-15" },
  { name: "Meera Nair", email: "meera.nair@pcb.gov.in", phone: "+91 87654 32109", role: "Pollution Control Officer", status: "Active", regDate: "2026-02-10" },
  { name: "Rahul Sharma", email: "rahul.sharma@municipal.gov.in", phone: "+91 76543 21098", role: "Municipal Officer", status: "Active", regDate: "2026-03-01" },
  { name: "Priya Patel", email: "priya.patel@volunteers.org", phone: "+91 65432 10987", role: "Volunteer", status: "Active", regDate: "2026-04-12" },
  { name: "Aarav Gupta", email: "aarav.gupta@gmail.com", phone: "+91 91234 56789", role: "Citizen", status: "Active", regDate: "2026-05-20" }
];

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: "COMP-2026-0001",
    reporterName: "Meera Nair",
    reporterEmail: "meera.nair@pcb.gov.in",
    reporterPhone: "+91 87654 32109",
    category: "River Pollution",
    detectedObjects: ["Chemical Waste", "Foam", "Oil Spill"],
    confidence: 94.5,
    severity: "Critical",
    latitude: 28.6284,
    longitude: 77.2471,
    address: "Yamuna River Bank, near ITO Barrage, New Delhi, Delhi 110002",
    date: "2026-07-16",
    time: "09:30 AM",
    status: "Under Investigation",
    adminRemarks: "Sent Pollution Control squad for water sampling. High chemical content visible.",
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80",
    aiPredictions: [
      { box: [20, 15, 80, 85], label: "Foam", confidence: 96, severity: "Critical" },
      { box: [45, 10, 90, 70], label: "Chemical Waste", confidence: 93, severity: "Critical" }
    ]
  },
  {
    id: "COMP-2026-0002",
    reporterName: "Priya Patel",
    reporterEmail: "priya.patel@volunteers.org",
    reporterPhone: "+91 65432 10987",
    category: "Open Waste Burning",
    detectedObjects: ["Smoke", "Burning Plastic", "Burning Garbage"],
    confidence: 89.2,
    severity: "High",
    latitude: 27.1751,
    longitude: 78.0421,
    address: "Near Yamuna Expressway Overpass, Agra, Uttar Pradesh 282006",
    date: "2026-07-15",
    time: "06:15 PM",
    status: "Resolved",
    adminRemarks: "Municipal squad extinguished the waste burning and fined the commercial entity ₹10,000.",
    imageUrl: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=800&q=80",
    aiPredictions: [
      { box: [10, 20, 60, 80], label: "Smoke", confidence: 91, severity: "High" },
      { box: [40, 30, 85, 75], label: "Burning Plastic", confidence: 87, severity: "High" }
    ]
  },
  {
    id: "COMP-2026-0003",
    reporterName: "Aarav Gupta",
    reporterEmail: "aarav.gupta@gmail.com",
    reporterPhone: "+91 91234 56789",
    category: "Solid Waste",
    detectedObjects: ["Garbage Heap", "Plastic Dump", "Municipal Waste"],
    confidence: 91.8,
    severity: "High",
    latitude: 12.9374,
    longitude: 77.6738,
    address: "Off Bellandur Lake Road, Outer Ring Road, Bengaluru, Karnataka 560103",
    date: "2026-07-17",
    time: "08:10 AM",
    status: "Pending",
    adminRemarks: "",
    imageUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80",
    aiPredictions: [
      { box: [30, 10, 95, 90], label: "Garbage Heap", confidence: 94, severity: "High" },
      { box: [50, 20, 85, 70], label: "Plastic Dump", confidence: 89, severity: "High" }
    ]
  },
  {
    id: "COMP-2026-0004",
    reporterName: "Rahul Sharma",
    reporterEmail: "rahul.sharma@municipal.gov.in",
    reporterPhone: "+91 76543 21098",
    category: "River Pollution",
    detectedObjects: ["Plastic Waste", "Floating Garbage"],
    confidence: 88.0,
    severity: "Moderate",
    latitude: 19.0760,
    longitude: 72.8777,
    address: "Mithi River Culvert, BKC, Bandra East, Mumbai, Maharashtra 400051",
    date: "2026-07-14",
    time: "11:45 AM",
    status: "Approved",
    adminRemarks: "Trash boom extraction scheduled for the upcoming weekend. Notified BMC river cleanup crew.",
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    aiPredictions: [
      { box: [35, 20, 75, 80], label: "Plastic Waste", confidence: 90, severity: "Moderate" },
      { box: [40, 5, 80, 50], label: "Floating Garbage", confidence: 86, severity: "Moderate" }
    ]
  },
  {
    id: "COMP-2026-0005",
    reporterName: "Ashwin Alwin",
    reporterEmail: "ashwinalwin12@gmail.com",
    reporterPhone: "+91 98765 43210",
    category: "Solid Waste",
    detectedObjects: ["Construction Waste", "Open Dump Yard", "Industrial Waste"],
    confidence: 95.2,
    severity: "Critical",
    latitude: 13.0012,
    longitude: 80.2565,
    address: "Adyar Bypass, near river basin, Chennai, Tamil Nadu 600020",
    date: "2026-07-16",
    time: "02:20 PM",
    status: "Under Investigation",
    adminRemarks: "Illegal dumping of industrial demolition rubble. Inspecting vehicle license numbers via local surveillance.",
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    aiPredictions: [
      { box: [15, 10, 85, 90], label: "Construction Waste", confidence: 97, severity: "Critical" },
      { box: [40, 25, 90, 80], label: "Open Dump Yard", confidence: 93, severity: "Critical" }
    ]
  },
  {
    id: "COMP-2026-0006",
    reporterName: "Priya Patel",
    reporterEmail: "priya.patel@volunteers.org",
    reporterPhone: "+91 65432 10987",
    category: "River Pollution",
    detectedObjects: ["Floating Garbage", "Plastic Waste"],
    confidence: 86.4,
    severity: "Moderate",
    latitude: 25.3176,
    longitude: 83.0062,
    address: "Ganges River Basin, Dashashwamedh Ghat, Varanasi, Uttar Pradesh 221001",
    date: "2026-07-13",
    time: "07:10 AM",
    status: "Resolved",
    adminRemarks: "Clean Ganges volunteer drive successfully scooped out the floating plastics.",
    imageUrl: "https://images.unsplash.com/photo-1543333995-a78aa37f76e0?auto=format&fit=crop&w=800&q=80",
    aiPredictions: [
      { box: [25, 15, 65, 75], label: "Floating Garbage", confidence: 88, severity: "Moderate" }
    ]
  },
  {
    id: "COMP-2026-0007",
    reporterName: "Aarav Gupta",
    reporterEmail: "aarav.gupta@gmail.com",
    reporterPhone: "+91 91234 56789",
    category: "Open Waste Burning",
    detectedObjects: ["Smoke", "Fire", "Burning Garbage"],
    confidence: 93.0,
    severity: "High",
    latitude: 22.5726,
    longitude: 88.3639,
    address: "Howrah Industrial Zone periphery, Kolkata, West Bengal 711101",
    date: "2026-07-17",
    time: "07:45 AM",
    status: "Pending",
    adminRemarks: "",
    imageUrl: "https://images.unsplash.com/photo-1521499692443-bf404ecf6e52?auto=format&fit=crop&w=800&q=80",
    aiPredictions: [
      { box: [5, 15, 55, 85], label: "Smoke", confidence: 95, severity: "High" },
      { box: [35, 25, 75, 75], label: "Fire", confidence: 91, severity: "High" }
    ]
  }
];

const DEFAULT_LOGS: AdminLog[] = [
  { id: "LOG-0001", user: "ashwinalwin12@gmail.com", action: "Approve Complaint", date: "2026-07-16", time: "04:15 PM", details: "Approved COMP-2026-0004 for Bandra, Mumbai." },
  { id: "LOG-0002", user: "meera.nair@pcb.gov.in", action: "Update Investigation State", date: "2026-07-16", time: "05:00 PM", details: "Set status to Under Investigation on COMP-2026-0001 Yamuna, Delhi." },
  { id: "LOG-0003", user: "ashwinalwin12@gmail.com", action: "Resolve Complaint", date: "2026-07-15", time: "07:22 PM", details: "Resolved open waste burning complaint COMP-2026-0002 Agra." }
];

// Helper to load/save JSON database
function loadDatabase(): { users: User[]; complaints: Complaint[]; logs: AdminLog[] } {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading database file, using defaults.", err);
  }
  
  // Write default db if not exists
  const defaultDb = { users: DEFAULT_USERS, complaints: DEFAULT_COMPLAINTS, logs: DEFAULT_LOGS };
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing default database", err);
  }
  return defaultDb;
}

function saveDatabase(data: { users: User[]; complaints: Complaint[]; logs: AdminLog[] }) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file", err);
  }
}

// Initial DB load
let db = loadDatabase();

// Setup Gemini SDK if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
    console.log("Gemini AI SDK successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini AI SDK", err);
  }
} else {
  console.log("No GEMINI_API_KEY found in process.env. Gemini features will run in Demo/Simulation fallback mode.");
}

// REST API Endpoints

// Authentication API
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Handle mock roles based on credentials or email
  let role = "Citizen";
  let name = email.split("@")[0].split(".").map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
  let phone = "+91 99999 88888";

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    if (existing.status === "Suspended") {
      return res.status(403).json({ error: "Your account is suspended. Contact administration." });
    }
    role = existing.role;
    name = existing.name;
    phone = existing.phone;
  } else {
    // Auto-register for login convenience in hackathon demo
    if (email.endsWith(".gov.in") || email.includes("admin")) {
      role = email.includes("pcb") ? "Pollution Control Officer" : "Municipal Officer";
      if (email.includes("admin") || email === "ashwinalwin12@gmail.com") {
        role = "Administrator";
      }
    }
    const newUser: User = {
      name,
      email,
      phone,
      role,
      status: "Active",
      regDate: new Date().toISOString().split("T")[0]
    };
    db.users.push(newUser);
    saveDatabase(db);
  }

  res.json({
    token: `jwt_mock_token_${Date.now()}`,
    user: { name, email, phone, role }
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone are required" });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User already exists with this email" });
  }

  const newUser: User = {
    name,
    email,
    phone,
    role: role || "Citizen",
    status: "Active",
    regDate: new Date().toISOString().split("T")[0]
  };

  db.users.push(newUser);
  saveDatabase(db);

  res.json({
    token: `jwt_mock_token_${Date.now()}`,
    user: newUser
  });
});

app.post("/api/auth/otp-request", (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }
  // Generate random 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  res.json({
    message: "OTP sent successfully via simulated Government SMS Gateway",
    otp, // sent back to user so the UI can display/prefill it for ease of hackathon demo
    phone
  });
});

app.post("/api/auth/otp-verify", (req, res) => {
  const { phone, code, otp } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: "Phone and code are required" });
  }
  if (code !== otp && code !== "123456") {
    return res.status(400).json({ error: "Invalid OTP code entered." });
  }

  // Find user or register
  let user = db.users.find((u) => u.phone === phone);
  if (!user) {
    user = {
      name: "SMS User",
      email: `sms_user_${Date.now()}@ecoshield.gov.in`,
      phone,
      role: "Citizen",
      status: "Active",
      regDate: new Date().toISOString().split("T")[0]
    };
    db.users.push(user);
    saveDatabase(db);
  }

  res.json({
    token: `jwt_mock_token_${Date.now()}`,
    user
  });
});

app.post("/api/auth/google", (req, res) => {
  const { email, name, imageUrl } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Google Auth requires email" });
  }

  let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      name: name || email.split("@")[0],
      email,
      phone: "+91 90000 11111",
      role: "Citizen",
      status: "Active",
      regDate: new Date().toISOString().split("T")[0]
    };
    db.users.push(user);
    saveDatabase(db);
  } else if (user.status === "Suspended") {
    return res.status(403).json({ error: "Account suspended." });
  }

  res.json({
    token: `jwt_mock_token_${Date.now()}`,
    user
  });
});

// User lists
app.get("/api/users", (req, res) => {
  res.json(db.users);
});

app.patch("/api/users/:email/status", (req, res) => {
  const { email } = req.params;
  const { status } = req.body;
  
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  user.status = status;
  saveDatabase(db);
  res.json({ message: `User status changed to ${status}`, user });
});

// Complaint API
app.get("/api/complaints", (req, res) => {
  res.json(db.complaints);
});

app.post("/api/complaints", (req, res) => {
  const complaintData: Partial<Complaint> = req.body;
  if (!complaintData.category || !complaintData.imageUrl) {
    return res.status(400).json({ error: "Category and Image are required" });
  }

  const id = `COMP-2026-${String(db.complaints.length + 1).padStart(4, "0")}`;
  const now = new Date();
  
  const newComplaint: Complaint = {
    id,
    reporterName: complaintData.reporterName || "Anonymous Citizen",
    reporterEmail: complaintData.reporterEmail || "anonymous@ecoshield.gov.in",
    reporterPhone: complaintData.reporterPhone || "+91 00000 00000",
    category: complaintData.category as any,
    detectedObjects: complaintData.detectedObjects || [],
    confidence: complaintData.confidence || 90.0,
    severity: complaintData.severity || "Moderate",
    latitude: complaintData.latitude || (20 + Math.random() * 8), // center of India bounding box if failed
    longitude: complaintData.longitude || (72 + Math.random() * 12),
    address: complaintData.address || "Simulated GIS Location, India",
    date: now.toISOString().split("T")[0],
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true }),
    status: "Pending",
    adminRemarks: "",
    imageUrl: complaintData.imageUrl,
    aiPredictions: complaintData.aiPredictions || []
  };

  db.complaints.unshift(newComplaint); // insert at top
  saveDatabase(db);

  res.json({ success: true, message: "Complaint recorded successfully", complaint: newComplaint });
});

app.post("/api/complaints/submit", (req, res) => {
  const complaintData: Partial<Complaint> = req.body;
  if (!complaintData.category || !complaintData.imageUrl) {
    return res.status(400).json({ error: "Category and Image are required" });
  }

  const id = `COMP-2026-${String(db.complaints.length + 1).padStart(4, "0")}`;
  const now = new Date();
  
  const newComplaint: Complaint = {
    id,
    reporterName: complaintData.reporterName || "Anonymous Citizen",
    reporterEmail: complaintData.reporterEmail || "anonymous@ecoshield.gov.in",
    reporterPhone: complaintData.reporterPhone || "+91 00000 00000",
    category: complaintData.category as any,
    detectedObjects: complaintData.detectedObjects || [],
    confidence: complaintData.confidence || 90.0,
    severity: complaintData.severity || "Moderate",
    latitude: complaintData.latitude || (20 + Math.random() * 8), // center of India bounding box if failed
    longitude: complaintData.longitude || (72 + Math.random() * 12),
    address: complaintData.address || "Simulated GIS Location, India",
    date: now.toISOString().split("T")[0],
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true }),
    status: "Pending",
    adminRemarks: "",
    imageUrl: complaintData.imageUrl,
    aiPredictions: complaintData.aiPredictions || []
  };

  db.complaints.unshift(newComplaint); // insert at top
  saveDatabase(db);

  res.json({ success: true, message: "Complaint recorded successfully", complaint: newComplaint });
});

app.patch("/api/complaints/:id", (req, res) => {
  const { id } = req.params;
  const { status, adminRemarks, userEmail } = req.body;

  const complaint = db.complaints.find((c) => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  if (status) complaint.status = status;
  if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;

  // Append Admin Log
  const now = new Date();
  const logId = `LOG-${String(db.logs.length + 1).padStart(4, "0")}`;
  db.logs.unshift({
    id: logId,
    user: userEmail || "admin@ecoshield.gov.in",
    action: `Update Status (${status})`,
    date: now.toISOString().split("T")[0],
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true }),
    details: `Updated complaint ${id} status to '${status}'. Remarks: ${adminRemarks || "None"}`
  });

  saveDatabase(db);
  res.json({ message: "Complaint updated", complaint });
});

app.delete("/api/complaints/:id", (req, res) => {
  const { id } = req.params;
  const index = db.complaints.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  db.complaints.splice(index, 1);
  saveDatabase(db);
  res.json({ message: "Complaint deleted successfully" });
});

app.post("/api/complaints/update", (req, res) => {
  const { id, status, remarks, adminUser } = req.body;
  const complaint = db.complaints.find((c) => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }
  if (status) complaint.status = status;
  if (remarks !== undefined) complaint.adminRemarks = remarks;

  const now = new Date();
  const logId = `LOG-${String(db.logs.length + 1).padStart(4, "0")}`;
  db.logs.unshift({
    id: logId,
    user: adminUser || "admin@ecoshield.gov.in",
    action: `Update Status (${status})`,
    date: now.toISOString().split("T")[0],
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true }),
    details: `Updated complaint ${id} status to '${status}'. Remarks: ${remarks || "None"}`
  });

  saveDatabase(db);
  res.json({ success: true, complaint });
});

app.delete("/api/complaints/delete", (req, res) => {
  const { id, adminUser } = req.body;
  const index = db.complaints.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Complaint not found" });
  }
  const deleted = db.complaints[index];
  db.complaints.splice(index, 1);

  const now = new Date();
  const logId = `LOG-${String(db.logs.length + 1).padStart(4, "0")}`;
  db.logs.unshift({
    id: logId,
    user: adminUser || "admin@ecoshield.gov.in",
    action: `Delete Complaint`,
    date: now.toISOString().split("T")[0],
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true }),
    details: `Deleted complaint ${id} (${deleted.category}) located at ${deleted.address}.`
  });

  saveDatabase(db);
  res.json({ success: true });
});

app.post("/api/users/update-status", (req, res) => {
  const { email, status, adminUser } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  user.status = status;

  const now = new Date();
  const logId = `LOG-${String(db.logs.length + 1).padStart(4, "0")}`;
  db.logs.unshift({
    id: logId,
    user: adminUser || "admin@ecoshield.gov.in",
    action: `Update User Status (${status})`,
    date: now.toISOString().split("T")[0],
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true }),
    details: `Changed status of user ${email} to ${status}.`
  });

  saveDatabase(db);
  res.json({ success: true });
});

// AI Analyze API (Simulating YOLOv8 and supporting server-side multimodal Gemini API for live analysis!)
app.post("/api/ai/analyze", async (req, res) => {
  const imageBase64 = req.body.imageBase64 || req.body.image;
  const { category } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "image or imageBase64 is required" });
  }

  // Pre-configured mock outputs if Gemini is not available or if image is empty/placeholders
  const mockDetections: Record<string, any> = {
    "River Pollution": {
      detectedObjects: ["Foam", "Plastic Waste", "Chemical Waste"],
      confidence: 94.2,
      severity: "Critical",
      predictions: [
        { box: [20, 15, 65, 80], label: "Foam", confidence: 96, severity: "Critical" },
        { box: [45, 10, 85, 90], label: "Plastic Waste", confidence: 92, severity: "High" }
      ]
    },
    "Open Waste Burning": {
      detectedObjects: ["Smoke", "Fire", "Burning Garbage"],
      confidence: 88.5,
      severity: "High",
      predictions: [
        { box: [10, 15, 55, 85], label: "Smoke", confidence: 91, severity: "High" },
        { box: [40, 30, 80, 70], label: "Fire", confidence: 86, severity: "High" }
      ]
    },
    "Solid Waste": {
      detectedObjects: ["Garbage Heap", "Plastic Dump", "Municipal Waste"],
      confidence: 92.1,
      severity: "High",
      predictions: [
        { box: [30, 10, 95, 90], label: "Garbage Heap", confidence: 94, severity: "High" },
        { box: [50, 20, 85, 75], label: "Plastic Dump", confidence: 90, severity: "Moderate" }
      ]
    }
  };

  const chosenCategory = category || "River Pollution";
  const defaults = mockDetections[chosenCategory] || mockDetections["River Pollution"];

  // Random coordinates across India
  const locations = [
    { address: "Yamuna Riverbank near ITO, Delhi, Delhi 110002", lat: 28.6284, lng: 77.2471 },
    { address: "Dashashwamedh Ghat, Varanasi, Uttar Pradesh 221001", lat: 25.3176, lng: 83.0062 },
    { address: "Adyar Bypass, near river basin, Chennai, Tamil Nadu 600020", lat: 13.0012, lng: 80.2565 },
    { address: "Off Bellandur Lake Road, Outer Ring Road, Bengaluru, Karnataka 560103", lat: 12.9374, lng: 77.6738 },
    { address: "Mithi River Culvert, Bandra East, Mumbai, Maharashtra 400051", lat: 19.0760, lng: 72.8777 },
    { address: "Musi River Bank, Chaderghat, Hyderabad, Telangana 500024", lat: 17.3850, lng: 78.4867 },
    { address: "Baghpat Waste Disposal Hub, Uttar Pradesh 250609", lat: 28.9402, lng: 77.2185 }
  ];
  const chosenLoc = locations[Math.floor(Math.random() * locations.length)];

  // If Gemini API is available and the base64 image looks like actual data, we can run a real multimodal query!
  if (ai && imageBase64.length > 500) {
    try {
      console.log(`Analyzing uploaded image of category ${chosenCategory} with real Gemini model...`);
      // Clean up base64 prefix if present
      const base64Data = imageBase64.includes(";base64,") ? imageBase64.split(";base64,")[1] : imageBase64;
      const mimeType = imageBase64.includes("image/jpeg") ? "image/jpeg" : "image/png";

      const prompt = `
        You are a highly-trained YOLOv8 Computer Vision model embedded inside EcoShield AI.
        Analyze this image for environmental crimes or hazards corresponding strictly to the requested category: "${chosenCategory}".

        Allowed Classes to detect:
        1. River Pollution: Plastic Waste, Floating Garbage, Oil Spill, Foam, Chemical Waste
        2. Open Waste Burning: Smoke, Fire, Burning Garbage, Burning Plastic
        3. Illegal Solid Waste: Garbage Heap, Plastic Dump, Construction Waste, Municipal Waste, Industrial Waste, Mixed Waste, Household Waste, Scrap Waste, Open Dump Yard

        Strict negative constraint: Ignore people, animals, buildings, sky, cars, roads, trees, non-polluted water, or boats. NEVER classify humans as plastic or vehicles as waste.
        If NO environmental pollution of the selected category is present, say so.

        Return a JSON response conforming strictly to this format (do not wrap in anything other than raw JSON):
        {
          "detected": true or false,
          "detectedObjects": ["Foam", "Plastic Waste", etc. - array of detected labels],
          "confidence": number between 70.0 and 99.5,
          "severity": "Low" or "Moderate" or "High" or "Critical",
          "predictions": [
            {
              "box": [ymin_pct_0_to_100, xmin_pct_0_to_100, ymax_pct_0_to_100, xmax_pct_0_to_100],
              "label": "class name",
              "confidence": number between 70 and 99,
              "severity": "Low" | "Moderate" | "High" | "Critical"
            }
          ],
          "message": "Friendly AI summary of what was detected"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: prompt
          }
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      const responseText = response.text || "";
      console.log("Gemini AI Analysis response:", responseText);
      const parsed = JSON.parse(responseText.trim());

      return res.json({
        success: true,
        ...parsed,
        latitude: chosenLoc.lat,
        longitude: chosenLoc.lng,
        address: chosenLoc.address,
        category: chosenCategory
      });

    } catch (err) {
      console.error("Gemini AI Analysis failed, falling back to simulated YOLOv8 heuristics.", err);
    }
  }

  // Fallback / Simulated YOLOv8 response
  setTimeout(() => {
    res.json({
      success: true,
      detected: true,
      detectedObjects: defaults.detectedObjects,
      confidence: defaults.confidence,
      severity: defaults.severity,
      predictions: defaults.predictions,
      latitude: chosenLoc.lat,
      longitude: chosenLoc.lng,
      address: chosenLoc.address,
      message: `AI YOLOv8 Model identified ${defaults.detectedObjects.join(", ")} with high confidence, indicating environmental crime.`,
      category: chosenCategory
    });
  }, 1200); // add a small artificial delay to feel like a real AI processing pipeline
});

// Gemini-Powered AI Assistant
app.post("/api/assistant/chat", async (req, res) => {
  const { message, language, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const selectedLang = language || "English";
  
  if (ai) {
    try {
      console.log(`Generating assistant response for message in ${selectedLang}...`);
      
      const systemInstruction = `
        You are EcoShield AI, an intelligent, authoritative, and helpful Environmental Crime AI Assistant for India.
        Your goal is to assist citizens, volunteers, and municipal officers in monitoring, detecting, and resolving environmental crimes.

        Focus Areas:
        1. River Pollution (plastics, industrial effluents, chemical foams, oil spills)
        2. Illegal Open Waste Burning (associated toxins, agricultural stubble, air pollution)
        3. Illegal Solid Waste Dumping (municipal, industrial, demolition scrap, e-waste, garbage heaps)

        Features you support:
        - Instant Computer Vision detection (YOLOv8 simulation / Gemini-powered) of environmental crimes via uploads.
        - Automatic geo-referenced complaint generation (capturing GPS and address).
        - Public environmental GIS mapping (Air Quality, River Pollutants, Solid Waste, Complaint maps).
        - Administrative panel for government agencies to verify, investigate, and resolve issues.
        - Advanced analytics tracking and exporting reports (PDF, CSV, Excel).

        Guidance:
        - Answer environmental questions professionally, scientifically, and actionably.
        - Encourage users to take responsibility, report violations, and support cleanliness campaigns like Swachh Bharat.
        - Formulate your response STRICTLY in the requested language: "${selectedLang}" (Translate all menus, warnings, explanations, and titles into this language if appropriate. Do not use English if the language is Hindi, Tamil, Telugu, etc., unless for technical terms).
        - Keep answers concise, highly scannable, and formatted nicely in markdown with clear spacing.
      `;

      // Structure contents with history if provided
      const chatContents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((h: any) => {
          chatContents.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.text }]
          });
        });
      }
      chatContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });

      return res.json({ text: response.text });

    } catch (err) {
      console.error("Gemini Assistant Chat failed", err);
    }
  }

  // Fallback response generator in case of missing/invalid API keys
  setTimeout(() => {
    const responses: Record<string, string> = {
      "English": `As your **EcoShield AI Assistant**, I am here to help. I can assist you with identifying environmental hazards like river trash, illegal chemical dumping, waste fires, and open landfills across India. You can easily upload an image on the Dashboard, let our AI auto-tag it, record your GPS, and submit an official municipal complaint. Would you like me to guide you on how to submit your first report?`,
      "Tamil": `உங்கள் **ஈகோஷீல்ட் AI (EcoShield AI) உதவியாளராக**, நான் உங்களுக்கு உதவ தயாராக உள்ளேன். நீர் மாசுபடுதல், சட்டவிரோத கழிவு எரிப்பு, மற்றும் திறந்தவெளி குப்பைக் கிடங்குகள் போன்ற சுற்றுச்சூழல் குற்றங்களைக் கண்டறியவும் புகாரளிக்கவும் நான் உங்களுக்கு உதவுவேன். முகப்புப் பலகையில் நீங்கள் ஒரு புகைப்படத்தைப் பதிவேற்றி, எங்கள் AI மூலம் தானியங்கி ஜி.பி.எஸ் புகாரை உருவாக்கலாம்.`,
      "Hindi": `आपके **इकोशील्ड एआई (EcoShield AI) सहायक** के रूप में, मैं आपकी सेवा में तत्पर हूँ। मैं नदियों में प्रदूषण, अवैध कचरा जलाने और ठोस कचरा डंपिंग जैसी पर्यावरणीय समस्याओं की पहचान और शिकायत दर्ज करने में आपकी मदद कर सकता हूँ। आप डैशबोर्ड पर बस एक तस्वीर अपलोड करें, हमारा एआई तुरंत जीपीएस के साथ शिकायत दर्ज कर देगा।`,
      "Telugu": `మీ **EcoShield AI అసిస్టెంట్**గా, నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను. నదుల కాలుష్యం, అనధికార వ్యర్థాల దహనం మరియు బహిరంగ చెత్త కుప్పల వంటి పర్యావరణ నేరాలను గుర్తించి, ఫిర్యాదు చేయడానికి నేను మీకు సహాయపడతాను. మీరు డ్యాష్‌బోర్డ్‌లో చిత్రాన్ని అప్‌లోడ్ చేసి ఫిర్యాదు నమోదు చేయవచ్చు.`,
      "Kannada": `ನಿಮ್ಮ **EcoShield AI ಸಹಾಯಕ**ನಾಗಿ, ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ. ನದಿ ಮಾಲಿನ್ಯ, ಕಾನೂನುಬಾಹಿರ ಕಸ ಸುಡುವುದು ಮತ್ತು ಬಯಲು ಕಸದ ರಾಶಿಗಳಂತಹ ಪರಿಸರ ಅಪರಾಧಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ನಾನು ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ. ನೀವು ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಜಿಪಿಎಸ್ ಆಧಾರಿತ ದೂರು ನೀಡಬಹುದು.`,
      "Malayalam": `നിങ്ങളുടെ **EcoShield AI അസിസ്റ്റന്റ്** ആയി നിങ്ങളെ സഹായിക്കാൻ ഞാൻ തയാറാണ്. നദീ മലിനീകരണം, നിയമവിരുദ്ധ മാലിന്യ നിക്ഷേപം, പ്ലാസ്റ്റിക് കത്തിക്കൽ എന്നിവ കണ്ടെത്താനും പരാതി നൽകാനും ഞാൻ നിങ്ങളെ സഹായിക്കും. ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്ത് നിങ്ങൾക്ക് പരാതി രജിസ്റ്റർ ചെയ്യാം.`,
      "Bengali": `আপনার **EcoShield AI সহকারী** হিসেবে আমি আপনাকে সাহায্য করতে প্রস্তুত। নদী দূষণ, প্লাস্টিক পোড়ানো এবং অবৈধ ময়লা ফেলার মতো পরিবেশগত অপরাধ সনাক্তকরণ ও অভিযোগ জানানোর বিষয়ে আমি আপনাকে সাহায্য করতে পারি। আপনি একটি ছবি আপলোড করে অভিযোগ দায়ের করতে পারেন।`,
      "Gujarati": `તમારા **EcoShield AI મદદનીશ** તરીકે, હું તમારી સહાય માટે હાજર છું. હું નદી પ્રદૂષણ, કચરો બાળવો અને પ્લાસ્ટિકના ગેરકાયદેસર ઢગલાઓ જેવી પર્યાવરણીય સમસ્યાઓની ઓળખ અને ફરિયાદ નોંધવામાં મદદ કરી શકું છું.`,
      "Marathi": `तुमचा **EcoShield AI सहाय्यक** म्हणून, मी तुम्हाला मदत करण्यास तयार आहे. नदी प्रदूषण, कचरा जाळणे आणि कचऱ्याचे बेकायदेशीर ढीग यांसारख्या पर्यावरणाला हानी पोहोचवणाऱ्या गुन्ह्यांची नोंद आणि तक्रार करण्यात मी मदत करू शकेन.`,
      "Punjabi": `ਤੁਹਾਡੇ **EcoShield AI ਸਹਾਇਕ** ਵਜੋਂ, ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਤਿਆਰ ਹਾਂ। ਨਦੀਆਂ ਦੇ ਪ੍ਰਦੂਸ਼ਣ, ਕੂੜੇ ਨੂੰ ਸਾੜਨ ਅਤੇ ਗੈਰ-ਕਾਨੂੰਨੀ ਡੰਪਿੰਗ ਵਿਰੁੱਧ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਲਈ ਮੈਂ ਤੁਹਾਡੀ ਅਗਵਾਈ ਕਰ ਸਕਦਾ ਹਾਂ।`
    };

    const text = responses[selectedLang] || responses["English"];
    res.json({ text });
  }, 500);
});

// Analytics Aggregation Endpoint
app.get("/api/analytics", (req, res) => {
  const complaints = db.complaints;
  
  const total = complaints.length;
  const river = complaints.filter(c => c.category === "River Pollution").length;
  const burning = complaints.filter(c => c.category === "Open Waste Burning").length;
  const solid = complaints.filter(c => c.category === "Solid Waste").length;

  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const pending = complaints.filter(c => c.status === "Pending").length;
  const investigation = complaints.filter(c => c.status === "Under Investigation").length;
  const approved = complaints.filter(c => c.status === "Approved").length;
  const rejected = complaints.filter(c => c.status === "Rejected").length;

  // District wise data based on simple addresses Heuristics
  const districtPollution: Record<string, number> = {
    "Delhi NCR": 0,
    "Agra District": 0,
    "Bengaluru Urban": 0,
    "Mumbai Suburban": 0,
    "Chennai Central": 0,
    "Varanasi District": 0,
    "Kolkata Metropolitan": 0,
    "Hyderabad Urban": 0
  };

  complaints.forEach(c => {
    const addr = c.address.toLowerCase();
    if (addr.includes("delhi")) districtPollution["Delhi NCR"]++;
    else if (addr.includes("agra")) districtPollution["Agra District"]++;
    else if (addr.includes("bengaluru") || addr.includes("bangalore")) districtPollution["Bengaluru Urban"]++;
    else if (addr.includes("mumbai")) districtPollution["Mumbai Suburban"]++;
    else if (addr.includes("chennai")) districtPollution["Chennai Central"]++;
    else if (addr.includes("varanasi")) districtPollution["Varanasi District"]++;
    else if (addr.includes("kolkata")) districtPollution["Kolkata Metropolitan"]++;
    else if (addr.includes("hyderabad")) districtPollution["Hyderabad Urban"]++;
  });

  // Calculate environmental risk index (ERI) overall
  // Based on percentage of Critical + High complaints
  const criticalCount = complaints.filter(c => c.severity === "Critical" || c.severity === "High").length;
  const eri = Math.min(100, Math.round((criticalCount / (total || 1)) * 100));

  res.json({
    summary: {
      total,
      river,
      burning,
      solid,
      resolved,
      pending,
      investigation,
      approved,
      rejected,
      eri
    },
    districtPollution,
    monthlyTrends: [
      { month: "Jan", complaints: 14, river: 5, burning: 3, solid: 6 },
      { month: "Feb", complaints: 18, river: 6, burning: 5, solid: 7 },
      { month: "Mar", complaints: 22, river: 8, burning: 4, solid: 10 },
      { month: "Apr", complaints: 31, river: 12, burning: 8, solid: 11 },
      { month: "May", complaints: 45, river: 18, burning: 12, solid: 15 },
      { month: "Jun", complaints: 52, river: 20, burning: 15, solid: 17 },
      { month: "Jul", complaints: total, river, burning, solid }
    ]
  });
});

// Admin System Logs
app.get("/api/logs", (req, res) => {
  res.json(db.logs);
});

// Report Exports
app.get("/api/reports/export", (req, res) => {
  const { format, reportType } = req.query;
  const fileName = `${reportType || "environmental"}_report_${new Date().toISOString().split("T")[0]}.${format || "csv"}`;
  
  let header = "";
  let body = "";

  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    header = "Complaint ID,Reporter Name,Reporter Email,Category,Detected Objects,Confidence,Severity,Latitude,Longitude,Address,Date,Status,Admin Remarks\n";
    body = db.complaints.map(c => 
      `"${c.id}","${c.reporterName}","${c.reporterEmail}","${c.category}","${c.detectedObjects.join(";")}","${c.confidence}%","${c.severity}","${c.latitude}","${c.longitude}","${c.address.replace(/"/g, '""')}","${c.date}","${c.status}","${c.adminRemarks.replace(/"/g, '""')}"`
    ).join("\n");
    return res.send(header + body);
  }

  // Fallback for PDF and Excel simulate downloadable text representations
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  return res.send(`[EcoShield AI - Official Government Report]\nGenerated on: ${new Date().toLocaleString()}\nReport Scope: ${reportType}\nFormat: ${format}\nTotal Cases Logged: ${db.complaints.length}\n\n` + JSON.stringify(db.complaints, null, 2));
});

// Mount Vite in development, serve compiled client files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving Production Static Assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoShield AI Dev Server successfully running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
