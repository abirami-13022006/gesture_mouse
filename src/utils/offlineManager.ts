import { Complaint } from "../types";

const OFFLINE_KEY = "offline_eco_complaints";

export function getOfflineQueue(): any[] {
  try {
    const raw = localStorage.getItem(OFFLINE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed reading offline reports queue", err);
    return [];
  }
}

export function queueOfflineComplaint(payload: any): void {
  try {
    const queue = getOfflineQueue();
    const uniqueId = `OFF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const offlinePayload = {
      ...payload,
      id: uniqueId,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
      status: "Pending" as const,
      isOfflineQueued: true
    };
    
    queue.push(offlinePayload);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error("Failed writing offline report", err);
  }
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_KEY);
}

export async function syncOfflineQueue(onSyncSuccess: (syncedComplaints: Complaint[]) => void) {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  const syncedList: Complaint[] = [];
  
  for (const payload of queue) {
    try {
      const response = await fetch("/api/complaints/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.complaint) {
          syncedList.push(data.complaint);
        }
      }
    } catch (err) {
      console.error("Failed syncing item", err);
    }
  }

  if (syncedList.length > 0) {
    clearOfflineQueue();
    onSyncSuccess(syncedList);
  }
}
