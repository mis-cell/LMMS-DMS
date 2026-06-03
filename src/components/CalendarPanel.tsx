import React, { useState } from "react";
import { Calendar, AlertTriangle, MapPin, Clock, Info } from "lucide-react";
import { Hearing } from "../types";

interface CalendarPanelProps {
  hearings: Hearing[];
  effectiveCompany: string;
  theme: any;
}

export default function CalendarPanel({ hearings, effectiveCompany, theme }: CalendarPanelProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(3); // Default value June 3
  
  // Filter hearings for the company
  const companyHearings = hearings.filter(h => effectiveCompany === "Group" || h.company === effectiveCompany);

  // Helper map grouping by date (days in June 2026)
  const getDayEvents = (dayNum: number) => {
    return companyHearings.filter(h => {
      if (!h.hearingDate) return false;
      const dateParts = h.hearingDate.split("-");
      const year = dateParts[0];
      const month = dateParts[1];
      const day = dateParts[2];
      return year === "2026" && parseInt(month) === 6 && parseInt(day) === dayNum;
    });
  };

  // June 2026 structure (June 1 is a Monday)
  // Calendar days grid: Monday is column 0, Sunday is column 6.
  // 30 days in June.
  const GRID_DAYS = [];
  
  // Total of 42 boxes standard grid representation
  for (let i = 1; i <= 30; i++) {
    GRID_DAYS.push(i);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
            Judicial Calendar & Docket Tracker — June 2026
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Real-time scheduling of hearings, submissions deadlines, and tribunal actions across the division.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Day Grid Board */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm font-bold text-slate-800 font-display">June 2026 calendar</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border rounded-lg text-slate-400">Standard Grid View</span>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-1.5 text-center min-w-[550px] md:min-w-0">
              {/* Headers */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-1">{d}</div>
              ))}

              {/* Empty boxes if any (June 1, 2026 is indeed a Monday, so 0 offset!) */}
              {GRID_DAYS.map(dayNum => {
                const dayEvents = getDayEvents(dayNum);
                const isToday = dayNum === 3;
                const isSelected = selectedDay === dayNum;

                return (
                  <div 
                    key={dayNum} 
                    onClick={() => setSelectedDay(dayNum)}
                    className={`min-h-[84px] border border-slate-100/60 rounded-xl p-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected ? "ring-2 ring-indigo-500 border-indigo-200" : "hover:bg-slate-50/60"
                    } ${isToday ? "bg-indigo-50/50" : "bg-white"}`}
                  >
                    <div className="flex justify-between items-center leading-none">
                      <span className={`text-xs font-bold ${isToday ? "text-indigo-600" : "text-slate-400"}`}>
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                      )}
                    </div>

                    <div className="mt-2 space-y-1 overflow-hidden max-h-[48px]">
                      {dayEvents.map(evt => (
                        <div 
                          key={evt.id} 
                          className="text-[9px] font-bold truncate px-1 py-0.5 rounded border"
                          style={{
                            backgroundColor: evt.company === "Yajur" ? "#E6F1FB" : evt.company === "Bally Jute" ? "#FAEEDA" : "#EAF3DE",
                            color: evt.company === "Yajur" ? "#0C447C" : evt.company === "Bally Jute" ? "#854F0B" : "#3B6D11",
                            borderColor: "transparent"
                          }}
                          title={evt.matterTitle}
                        >
                          {evt.status === "Scheduled" ? "⚖️ " : ""} {evt.matterTitle}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Calendar Side Ledger panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trial Deadlines List</h3>
            
            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {companyHearings.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 rounded border border-dashed">
                  No active trials registered in system database.
                </p>
              ) : (
                companyHearings.map(h => {
                  const dateParts = h.hearingDate ? h.hearingDate.split("-") : ["2026", "06", "15"];
                  const day = dateParts[2] || "15";

                  return (
                    <div 
                      key={h.id} 
                      className={`p-3 rounded-xl border transition-all ${
                        selectedDay === parseInt(day) ? "border-indigo-400 bg-indigo-50/20" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-wider bg-rose-50 border border-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold uppercase leading-none">
                          Hearing Trial
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold font-mono">
                          June {day}, 2026
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-2 font-display">
                        {h.matterTitle}
                      </h4>
                      
                      <div className="mt-3 space-y-1 text-[11px] text-slate-550 border-t border-slate-100/50 pt-2 flex flex-col gap-1">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <strong className="text-slate-700">{h.court}</strong></span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Status: <span className="font-semibold text-emerald-600">{h.status}</span></span>
                        <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="italic">"{h.remarks}"</span></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
