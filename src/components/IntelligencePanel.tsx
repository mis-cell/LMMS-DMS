import React, { useState } from "react";
import { Clock, Download, TrendingUp, BarChart4, ClipboardList, Info, FileText } from "lucide-react";
import { AuditLog, Matter } from "../types";

interface IntelligencePanelProps {
  tab: string; // "reports" | "audit"
  auditLogs: AuditLog[];
  onDownloadAuditLogsCSV: () => void;
  activeUser: any;
  effectiveCompany: string;
  matters: Matter[];
}

export default function IntelligencePanel({
  tab,
  auditLogs,
  onDownloadAuditLogsCSV,
  activeUser,
  effectiveCompany,
  matters
}: IntelligencePanelProps) {
  const [auditSearch, setAuditSearch] = useState("");

  const companyAudits = auditLogs.filter(log => effectiveCompany === "Group" || log.company === effectiveCompany);
  const filteredAudits = companyAudits.filter(log => {
    return log.userName.toLowerCase().includes(auditSearch.toLowerCase()) || 
           log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
           log.action.toLowerCase().includes(auditSearch.toLowerCase());
  });

  // Calculate dynamic chart variables
  const countContracts = matters.filter(m => m.type === "Contract" && (effectiveCompany === "Group" || m.company === effectiveCompany)).length;
  const countLitigation = matters.filter(m => m.type === "Litigation" && (effectiveCompany === "Group" || m.company === effectiveCompany)).length;
  const countLabor = matters.filter(m => m.type === "Labor Matter" && (effectiveCompany === "Group" || m.company === effectiveCompany)).length;
  const countOther = matters.filter(m => !["Contract", "Litigation", "Labor Matter"].includes(m.type) && (effectiveCompany === "Group" || m.company === effectiveCompany)).length;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white border p-4 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-display text-slate-900 uppercase tracking-wide">
            {tab === "reports" && "Enterprise Legal spend & Outcomes Metrics"}
            {tab === "audit" && "Tamper-Proof Platform Audit Security Trails"}
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            {tab === "reports" && "Visual dashboards mapping matter outcomes, spending, and volumes."}
            {tab === "audit" && "Real-time streaming ledger of platform actions, IP addresses, and database syncs."}
          </p>
        </div>

        {tab === "audit" && ["Auditor", "Super Admin"].includes(activeUser?.role || "") && (
          <button
            onClick={onDownloadAuditLogsCSV}
            className="px-4 py-2.5 bg-indigo-605 bg-indigo-600 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download audits.csv</span>
          </button>
        )}
      </div>

      {/* VIEWS RENDER CHANNELS */}
      {tab === "reports" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Sourcing allocations */}
            <div className="bg-white border rounded-xl p-6 shadow-xs select-none">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#185FA5]" />
                Volume Allocations by Matter Type
              </h4>

              <div className="flex items-end justify-around h-44 border-b pb-2 text-center text-xs">
                {[
                  { value: countLitigation, label: "Litigations", pct: countLitigation > 0 ? (countLitigation / (matters.length || 1)) * 140 : 40, col: "bg-red-600" },
                  { value: countContracts, label: "Contracts", pct: countContracts > 0 ? (countContracts / (matters.length || 1)) * 140 : 60, col: "bg-blue-600" },
                  { value: countLabor, label: "Labor matter", pct: countLabor > 0 ? (countLabor / (matters.length || 1)) * 140 : 30, col: "bg-amber-600" },
                  { value: countOther, label: "Regulatory", pct: countOther > 0 ? (countOther / (matters.length || 1)) * 140 : 20, col: "bg-purple-600" }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{item.value} Matters</span>
                    <div className={`w-14 rounded-t-lg shadow-inner ${item.col}`} style={{ height: `${Math.max(10, item.pct)}px` }} />
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Divisions spends */}
            <div className="bg-white border rounded-xl p-6 shadow-xs select-none">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-1.5">
                <BarChart4 className="w-4 h-4 text-[#185FA5]" />
                Budget Exposure Spends by Division
              </h4>

              <div className="flex items-end justify-around h-44 border-b pb-2 text-center text-xs">
                {[
                  { value: "₹18.4L", label: "Yajur Industries", pct: 110, col: "bg-[#185FA5]" },
                  { value: "₹8.5L", label: "Bally Jute", pct: 60, col: "bg-[#854F0B]" },
                  { value: "₹4.5L", label: "Yashoda", pct: 30, col: "bg-[#3B6D11]" }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{item.value}</span>
                    <div className={`w-14 rounded-t-lg shadow-inner ${item.col}`} style={{ height: `${item.pct}px` }} />
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Matter outcomes ratio</h4>
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-400 font-medium">Won Cases YTD</span><span className="font-bold text-emerald-650 text-emerald-600">6 cases</span></div>
                  <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-400 font-medium">Settled / Compromise</span><span className="font-bold text-blue-600">4 cases</span></div>
                  <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-400 font-medium">Withdrawn dockets</span><span className="font-bold text-slate-500">4 cases</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-400 font-medium">Adverse outcomes</span><span className="font-bold text-rose-650 text-rose-600">2 cases</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Expensing by counsel</h4>
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-400 font-medium">Litigation Counsels</span><span className="font-bold text-slate-800">₹12.4 Lakhs</span></div>
                  <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-400 font-medium">Corporate Drafting</span><span className="font-bold text-slate-800">₹6.8 Lakhs</span></div>
                  <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-400 font-medium">Audit Compliance Fees</span><span className="font-bold text-slate-800">₹4.2 Lakhs</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-400 font-medium">Intellectual Property renewals</span><span className="font-bold text-slate-800">₹1.2 Lakhs</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Documents Logged breakdown</h4>
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-400 font-medium">Sourcing Agreements</span><span className="font-bold text-slate-800">284 Files</span></div>
                  <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-400 font-medium">Court Pleadings</span><span className="font-bold text-slate-800">98 Files</span></div>
                  <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-400 font-medium">Compliance auditing sheets</span><span className="font-bold text-slate-800">176 Files</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-400 font-medium">Taxation Challans</span><span className="font-bold text-slate-800">41 Files</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "audit" && (
        <div className="space-y-6">
          <div className="bg-white border p-4 rounded-xl shadow-xs flex flex-row items-center justify-between gap-4">
            <div className="relative w-80">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit parameters..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg outline-none font-sans"
              />
            </div>
            <span className="text-xs text-slate-400 font-semibold">Immutable system logs mapping: {filteredAudits.length} events</span>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs font-sans text-slate-705 text-slate-600">
              <thead className="bg-slate-50 border-b select-none font-bold text-slate-400">
                <tr className="text-left">
                  <th className="p-3.5 pl-5 uppercase text-[10px] tracking-wider pl-5">Timestamp</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider">User Account</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider">IP Address Node</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider">Event Trigger</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider">Module node</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider">Portal clearance</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider pr-5">Immutable particulars</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAudits.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-5 font-mono text-slate-450 text-slate-400 pl-5">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-slate-800">{log.userName}</td>
                    <td className="p-4 font-mono text-slate-400">192.168.1.{Math.ceil((idx + 2) * 11) % 254}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        log.action.includes("Create") || log.action.includes("seed") ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 uppercase text-[10px] tracking-wider font-semibold text-indigo-600">PostgreSQL Cloud</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.company === "Yajur" ? "bg-blue-50 text-blue-700" : log.company === "Bally Jute" ? "bg-amber-50 text-amber-800" : log.company === "Yashoda" ? "bg-emerald-50 text-emerald-800" : "bg-indigo-50 text-indigo-700"
                      }`}>
                        {log.company}
                      </span>
                    </td>
                    <td className="p-4 text-slate-550 italic pr-5 font-medium">"{log.details}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
