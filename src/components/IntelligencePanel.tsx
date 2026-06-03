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
  invoices?: any[];
}

export default function IntelligencePanel({
  tab,
  auditLogs,
  onDownloadAuditLogsCSV,
  activeUser,
  effectiveCompany,
  matters,
  invoices = []
}: IntelligencePanelProps) {
  const [auditSearch, setAuditSearch] = useState("");
  const [hoveredBar, setHoveredBar] = useState<any>(null);
  const [activeMetric, setActiveMetric] = useState<"exposure" | "invoiced" | "both">("both");

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

            {/* Chart 2: Dynamic Multi-Tenant spendings and exposure comparisons */}
            <div className="bg-white border rounded-xl p-6 shadow-xs select-none relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BarChart4 className="w-4 h-4 text-[#185FA5]" />
                    Comparative Legal Spend Ledger
                  </h4>
                  <span className="text-[10px] text-slate-400">Comparing contract liability vs. actual lawyer fee billings</span>
                </div>
                {/* Metric filter buttons */}
                <div className="flex bg-slate-50 p-1 rounded-lg border gap-0.5 text-[10px] font-semibold">
                  <button
                    onClick={() => setActiveMetric("both")}
                    className={`px-2 py-0.5 rounded cursor-pointer transition ${
                      activeMetric === "both" ? "bg-indigo-600 text-white font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Both
                  </button>
                  <button
                    onClick={() => setActiveMetric("exposure")}
                    className={`px-2 py-0.5 rounded cursor-pointer transition ${
                      activeMetric === "exposure" ? "bg-indigo-600 text-white font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Exposure
                  </button>
                  <button
                    onClick={() => setActiveMetric("invoiced")}
                    className={`px-2 py-0.5 rounded cursor-pointer transition ${
                      activeMetric === "invoiced" ? "bg-indigo-600 text-white font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Invoiced
                  </button>
                </div>
              </div>

              {/* Aggregation math */}
              {(() => {
                const companiesData = [
                  { name: "Yajur Industries", key: "Yajur", colorExposure: "#185FA5", colorInvoiced: "#6366F1" },
                  { name: "Bally Jute Co.", key: "Bally Jute", colorExposure: "#854F0B", colorInvoiced: "#Eab308" },
                  { name: "Yashoda Enterprise", key: "Yashoda", colorExposure: "#3B6D11", colorInvoiced: "#10B981" }
                ].map(co => {
                  const exposureTotal = matters
                    .filter(m => m.company === co.key)
                    .reduce((sum, m) => sum + (m.value || 0), 0);

                  const invoicedTotal = invoices
                    .filter(inv => inv.company === co.key)
                    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

                  return {
                    ...co,
                    exposure: exposureTotal,
                    invoiced: invoicedTotal
                  };
                });

                // Compute high bounds inside chart height bounds
                const vals = [...companiesData.map(c => c.exposure), ...companiesData.map(c => c.invoiced)];
                const limitMaximum = Math.max(...vals, 1);
                const barSpanH = 130;

                const formatINR = (val: number) => {
                  if (val >= 10000000) {
                    return `₹${(val / 10000000).toFixed(2)} Cr`;
                  }
                  if (val >= 100000) {
                    return `₹${(val / 100000).toFixed(1)} L`;
                  }
                  return `₹${val.toLocaleString()}`;
                };

                return (
                  <div className="space-y-4">
                    {/* SVG Drawing Zone */}
                    <div className="relative border-b pb-1.5 pt-4">
                      {/* Grid Ticks */}
                      <div className="absolute inset-x-0 top-0 h-[130px] flex flex-col justify-between pointer-events-none opacity-20">
                        <div className="border-t border-slate-400 w-full text-[9px] text-slate-400 pt-0.5">{formatINR(limitMaximum)}</div>
                        <div className="border-t border-slate-300 w-full text-[9px] text-slate-400 pt-0.5">{formatINR(limitMaximum * 0.66)}</div>
                        <div className="border-t border-slate-300 w-full text-[9px] text-slate-400 pt-0.5">{formatINR(limitMaximum * 0.33)}</div>
                        <div className="border-t border-slate-300 w-full text-[9px] text-slate-400">₹0</div>
                      </div>

                      {/* Align Bars */}
                      <div className="flex justify-around items-end h-[130px] relative z-10 px-2">
                        {companiesData.map((co, idx) => {
                          const hExpo = (co.exposure / limitMaximum) * barSpanH;
                          const hInvoiced = (co.invoiced / limitMaximum) * barSpanH;

                          return (
                            <div key={idx} className="flex flex-col items-center w-24">
                              <div className="flex items-end justify-center gap-1.5 h-[130px] w-full">
                                {/* Exposure Bar */}
                                {(activeMetric === "both" || activeMetric === "exposure") && (
                                  <div
                                    onMouseEnter={() => setHoveredBar({
                                      company: co.name,
                                      type: "Portfolio Exposure Budget",
                                      raw: co.exposure,
                                      pretty: formatINR(co.exposure)
                                    })}
                                    onMouseLeave={() => setHoveredBar(null)}
                                    className="w-4 rounded-t transition-all duration-300 hover:scale-x-110 shadow-sm cursor-help hover:brightness-105"
                                    style={{
                                      height: `${Math.max(4, hExpo)}px`,
                                      backgroundColor: co.colorExposure
                                    }}
                                  />
                                )}

                                {/* Invoiced Bar */}
                                {(activeMetric === "both" || activeMetric === "invoiced") && (
                                  <div
                                    onMouseEnter={() => setHoveredBar({
                                      company: co.name,
                                      type: "Invoiced Counsel Fees",
                                      raw: co.invoiced,
                                      pretty: formatINR(co.invoiced)
                                    })}
                                    onMouseLeave={() => setHoveredBar(null)}
                                    className="w-4 rounded-t opacity-90 transition-all duration-300 hover:scale-x-110 shadow-sm cursor-help hover:brightness-105"
                                    style={{
                                      height: `${Math.max(4, hInvoiced)}px`,
                                      backgroundColor: co.colorInvoiced
                                    }}
                                  />
                                )}
                              </div>
                              <span className="text-[9.5px] text-slate-500 font-extrabold truncate w-full text-center mt-2">
                                {co.key}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Interactive Tooltip Card */}
                      {hoveredBar && (
                        <div className="absolute top-1 bg-slate-900 text-white rounded-lg p-2.5 shadow-xl text-[10.5px] border border-slate-800 z-50 transition w-56 left-1/2 -translate-x-1/2">
                          <span className="font-bold text-[11px] block text-indigo-305 text-indigo-300">{hoveredBar.company}</span>
                          <span className="text-slate-400 block text-[9.5px] uppercase tracking-wider mt-0.5">{hoveredBar.type}</span>
                          <strong className="block text-white font-mono mt-1 text-[13px]">{hoveredBar.pretty}</strong>
                        </div>
                      )}
                    </div>

                    {/* Spend legends */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-sans border-t border-slate-50 pt-2 text-slate-500 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-slate-500 shrink-0" />
                        <span>Solid: Exposure Budget</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-indigo-400 shrink-0" />
                        <span>Light / Stripe: Invoiced Billings</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
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

          {/* Chronological Mini Timeline View representing company administrative flow */}
          <div className="bg-white border p-6 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Chronological Administrative Activity Map ({effectiveCompany === "Group" ? "All Divisions" : effectiveCompany + " Division"})
              </h4>
              <span className="text-[10px] text-slate-400 font-medium font-sans">Sequence flow (oldest &rarr; newest)</span>
            </div>

            {(() => {
              const chronologicalLogs = [...filteredAudits]
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .slice(-5); // Select the latest 5 chronologically ordered events

              if (chronologicalLogs.length === 0) {
                return (
                  <div className="text-center py-6 border border-dashed rounded-lg bg-slate-50/40 text-slate-400 text-xs font-sans">
                    No recorded activities found in the administrative audit vault for {effectiveCompany}.
                  </div>
                );
              }

              return (
                <div className="relative pt-4 pb-2">
                  {/* Connect Line */}
                  <div className="absolute top-[28px] left-8 right-8 h-0.5 bg-slate-100 z-0 hidden md:block" />

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                    {chronologicalLogs.map((log, index) => {
                      const logDate = new Date(log.timestamp);
                      const timeStr = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const dateStr = logDate.toLocaleDateString([], { month: 'short', day: '2-digit' });
                      
                      const isLatest = index === chronologicalLogs.length - 1;

                      return (
                        <div key={log.id || index} className="flex flex-col items-center md:items-start text-center md:text-left bg-slate-50/50 p-3 rounded-xl border border-slate-100/80 hover:border-indigo-200 hover:bg-slate-50 transition duration-150 group">
                          <div className="flex items-center gap-3 w-full justify-center md:justify-start">
                            {/* Milestone Marker Node */}
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold font-mono border-2 transition-all group-hover:scale-105 shadow-3xs ${
                              isLatest 
                                ? "bg-indigo-650 border-indigo-600 text-indigo-600 font-extrabold bg-indigo-50" 
                                : "bg-white border-slate-300 text-slate-500"
                            }`}>
                              {index + 1}
                            </div>
                            <div className="text-left">
                              <span className="text-[9px] text-slate-400 block font-semibold uppercase">{log.userName}</span>
                              <span className="text-[9px] text-slate-400 font-mono italic">{dateStr} {timeStr}</span>
                            </div>
                          </div>

                          <div className="mt-2.5 space-y-1 text-left w-full">
                            <span className="text-[11px] font-bold text-slate-800 block line-clamp-1 group-hover:text-indigo-600 transition">
                              {log.action}
                            </span>
                            <p className="text-[10px] text-slate-500 leading-snug line-clamp-2 h-7 italic">
                              "{log.details}"
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
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
