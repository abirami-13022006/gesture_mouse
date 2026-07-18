export interface User {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Suspended";
  regDate: string;
}

export interface Complaint {
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

export interface AdminLog {
  id: string;
  user: string;
  action: string;
  date: string;
  time: string;
  details: string;
}

export type Language = 
  | "English"
  | "Tamil"
  | "Hindi"
  | "Telugu"
  | "Kannada"
  | "Malayalam"
  | "Bengali"
  | "Gujarati"
  | "Marathi"
  | "Punjabi";

export type Theme = "light" | "dark" | "system";
