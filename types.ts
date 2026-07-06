export interface Complaint {
  id: string;
  title: string;
  citizen: string;
  citizenAvatar?: string;
  type: string;
  urgency: string;
  status: string;
  location: string;
  coordinates: string;
  date: string;
  time: string;
  description: string;
  imageUrl?: string;
  confidence: number;
  severity: string;
  composition: string[];
  impactRadius?: string;
  aiNotes?: string;
}

export interface NotificationItem {
  id: string;
  caseId: string;
  type: string;
  time: string;
  content: string;
  read: boolean;
  actionUrl?: string;
}

export type ScreenType = 
  | "SPLASH"
  | "HOME"
  | "RIVER_DETECTION"
  | "WASTE_DETECTION"
  | "ENVIRONMENTAL_MAP"
  | "COMPLAINT_HISTORY"
  | "GENERATE_COMPLAINT"
  | "ADMIN_DASHBOARD";
