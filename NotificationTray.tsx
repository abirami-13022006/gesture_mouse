import React from "react";
import { X, Bell, ArrowRight } from "lucide-react";
import { NotificationItem } from "../types";

interface NotificationTrayProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onViewReport: (caseId: string) => void;
}

export default function NotificationTray({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onViewReport,
}: NotificationTrayProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-out Tray */}
      <aside
        className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-stone-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Tray Header */}
        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-100">
          <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-700 fill-emerald-100" />
            Notifications
          </h2>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-200/60 active:scale-95 transition-transform"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Tray Content */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border-l-4 shadow-sm transition-all duration-200 ${
                item.read ? "opacity-75" : "opacity-100"
              } ${
                item.type === "RESOLVED"
                  ? "bg-emerald-50 border-emerald-600"
                  : item.type === "REVIEW"
                  ? "bg-amber-50 border-amber-500"
                  : "bg-blue-50 border-blue-500"
              }`}
            >
              <div className="flex justify-between mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    item.type === "RESOLVED"
                      ? "text-emerald-700"
                      : item.type === "REVIEW"
                      ? "text-amber-700"
                      : "text-blue-700"
                  }`}
                >
                  {item.type === "RESOLVED"
                    ? "Case Resolved"
                    : item.type === "REVIEW"
                    ? "In Review"
                    : "Community Alert"}
                </span>
                <span className="text-[11px] text-stone-500">{item.time}</span>
              </div>
              <p className="text-stone-900 text-sm font-medium leading-snug">
                {item.content}
              </p>
              {item.caseId && (
                <button
                  onClick={() => onViewReport(item.caseId)}
                  className="mt-3 text-emerald-700 text-xs font-semibold flex items-center gap-1 hover:underline active:translate-x-0.5 transition-transform"
                >
                  View Report{" "}
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </button>
              )}
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-stone-400">
              <Bell className="w-12 h-12 mb-2 stroke-1" />
              <p className="text-sm">No new notifications</p>
            </div>
          )}
        </div>

        {/* Tray Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-100">
          <button
            onClick={onMarkAllAsRead}
            className="w-full py-3 rounded-full bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-800 transition-colors active:scale-95 duration-200"
          >
            Mark all as read
          </button>
        </div>
      </aside>
    </div>
  );
}
