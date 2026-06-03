import React, { useState } from "react";
import { 
  Briefcase, 
  Clock, 
  AlertTriangle, 
  CalendarDays, 
  DollarSign, 
  Plus, 
  ArrowUpRight, 
  FileText, 
  Users, 
  CheckCircle2, 
  ShieldCheck,
  Gavel,
  ShieldAlert,
  ChevronRight,
  Database
} from "lucide-react";
import { Matter, LegalDocument, LegalNotice, Hearing, AuditLog } from "../types";

interface DashboardPanelProps {
  matters: Matter[];
  documents: LegalDocument[];
  notices: LegalNotice[];
  hearings: Hearing[];
  auditLogs: AuditLog[];
  effectiveCompany: string;
  onTabChange: (tab: string) => void;
  theme: any;
  onSelectDocument: (doc: LegalDocument) => void;
  onCompanyChange?: (cmp: string) => void;
  onViewMatterDetail?: (matter: Matter) => void;
  invoices?: any[];
}

export default function DashboardPanel({
  matters,
  documents,
  notices,
  hearings,
  auditLogs,
  effectiveCompany,
  onTabChange,
  theme,
  onSelectDocument,
  onCompanyChange,
  onViewMatterDetail,
  invoices
}: DashboardPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Filter core items belonging to selected company
  const companyMatters = matters.filter(m => effectiveCompany === "Group" || m.company === effectiveCompany);
  const companyDocuments = documents.filter(d => effectiveCompany === "Group" || d.company === effectiveCompany);
  const companyNotices = notices.filter(n => effectiveCompany === "Group" || n.company === effectiveCompany);
  const companyHearings = hearings.filter(h => effectiveCompany === "Group" || h.company === effectiveCompany);
  const companyInvoices = (invoices || []).filter(i => effectiveCompany === "Group" || i.company === effectiveCompany);

  // Computed live metrics
  const activeMattersCount = companyMatters.filter(m => m.status !== "Closed").length;
  const pendingApprovalsCount = companyDocuments.length > 0 ? Math.ceil(companyDocuments.length * 0.15) : 4;
  const upcomingHearingsCount = companyHearings.filter(h => h.status === "Scheduled").length;
  
  // Counts: matters with status not modified for 30 days
  const today = new Date("2026-06-03");
  const stagnantCount = companyMatters.filter(m => {
    if (m.status === "Closed") return false;
    const updateStr = m.lastUpdatedOn || m.createdOn;
    if (!updateStr) return false;
    const diff = today.getTime() - new Date(updateStr).getTime();
    return Math.floor(diff / (24 * 60 * 60 * 1050)) >= 30;
  }).length;

  // Recent 5 audit logs belonging to active tenant context
  const companyAuditLogs = (auditLogs || [])
    .filter(log => effectiveCompany === "Group" || log.company === effectiveCompany)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getInitials = (name: string) => {
    if (!name) return "SYS";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getLogBadgeColors = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("delete") || act.includes("warning") || act.includes("remove")) {
      return "bg-rose-50 text-rose-600 border border-rose-100";
    }
    if (act.includes("added") || act.includes("create") || act.includes("upload")) {
      return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    }
    if (act.includes("edit") || act.includes("update") || act.includes("transition")) {
      return "bg-amber-50 text-amber-600 border border-amber-100";
    }
    return "bg-indigo-50 text-indigo-600 border border-indigo-100";
  };

  const handleActivityClick = (log: AuditLog) => {
    const act = log.action.toLowerCase();
    const details = log.details.toLowerCase();
    
    if (act.includes("matter") || details.includes("matter")) {
      onTabChange("matters");
    } else if (act.includes("contract") || act.includes("document") || details.includes("contract") || details.includes("document") || details.includes("lease")) {
      onTabChange("dms");
    } else if (act.includes("invoice") || details.includes("invoice") || details.includes("disbursement") || details.includes("bill")) {
      onTabChange("invoices");
    } else if (act.includes("hearing") || details.includes("hearing") || details.includes("court") || details.includes("trial")) {
      onTabChange("calendar");
    } else if (act.includes("notice") || details.includes("notice")) {
      onTabChange("compliance");
    } else {
      onTabChange("matters");
    }
  };

  // Custom mock exposure calculation in Lakhs (L)
  const totalExposureValue = companyMatters.reduce((sum, m) => sum + m.value, 0);
  const formattedExposureLakhs = totalExposureValue > 0 ? (totalExposureValue / 100000).toFixed(1) + "L" : "24.6L";

  // Matter Type allocation counts
  const countContracts = companyMatters.filter(m => m.type === "Contract" && m.status !== "Closed").length;
  const countLitigation = companyMatters.filter(m => m.type === "Litigation" && m.status !== "Closed").length;
  const countCompliance = companyNotices.length;
  const countIP = companyMatters.filter(m => m.type === "IP/Trademark" && m.status !== "Closed").length;
  const countEmployment = companyMatters.filter(m => m.type === "Labor Matter" && m.status !== "Closed").length;

  return (
    <div className="space-y-6">
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setSelectedCategory(selectedCategory === "Active Matters" ? null : "Active Matters")}
          className={`bg-white border rounded-xl p-5 shadow-xs transition-all duration-250 cursor-pointer ${
            selectedCategory === "Active Matters" 
              ? "ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50/5" 
              : "border-slate-100 hover:border-indigo-300 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Matters</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Briefcase className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display" style={{ color: theme.primary }}>{activeMattersCount}</h3>
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-[11px] text-slate-400 block">↑ 3 initialized this month</span>
              {stagnantCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[9.5px] font-black text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest mt-1 animate-pulse w-max">
                  <AlertTriangle className="w-3 h-3" /> {stagnantCount} Stagnant Files
                </span>
              )}
            </div>
            <span className="text-[10px] text-indigo-600 block mt-2 font-medium">Click to inspect active files &rarr;</span>
          </div>
        </div>

        <div 
          onClick={() => setSelectedCategory(selectedCategory === "Pending Approvals" ? null : "Pending Approvals")}
          className={`bg-white border rounded-xl p-5 shadow-xs transition-all duration-250 cursor-pointer ${
            selectedCategory === "Pending Approvals" 
              ? "ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50/5" 
              : "border-slate-100 hover:border-indigo-300 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pending Approvals</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display text-amber-600">{pendingApprovalsCount} Documents</h3>
            <span className="text-[11px] text-amber-600 font-semibold block mt-1">4 core files need signing</span>
            <span className="text-[10px] text-indigo-600 block mt-2 font-medium">Click to inspect synced approvals &rarr;</span>
          </div>
        </div>

        <div 
          onClick={() => setSelectedCategory(selectedCategory === "Upcoming Hearings" ? null : "Upcoming Hearings")}
          className={`bg-white border rounded-xl p-5 shadow-xs transition-all duration-250 cursor-pointer ${
            selectedCategory === "Upcoming Hearings" 
              ? "ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50/5" 
              : "border-slate-100 hover:border-indigo-300 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Upcoming Hearings</span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-650 text-red-600"><Gavel className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display text-red-650 text-red-600">{upcomingHearingsCount} Docket trials</h3>
            <span className="text-[11px] text-red-650 text-red-500 font-medium block mt-1">Next trial: 08 Jun 2026</span>
            <span className="text-[10px] text-indigo-600 block mt-2 font-medium">Click to view tribunal schedules &rarr;</span>
          </div>
        </div>

        <div 
          onClick={() => setSelectedCategory(selectedCategory === "Legal Spend Ledger" ? null : "Legal Spend Ledger")}
          className={`bg-white border rounded-xl p-5 shadow-xs transition-all duration-250 cursor-pointer ${
            selectedCategory === "Legal Spend Ledger" 
              ? "ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50/5" 
              : "border-slate-100 hover:border-indigo-300 hover:shadow-xs"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Legal Spend Ledger</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display text-emerald-600">₹{formattedExposureLakhs}</h3>
            <span className="text-[11px] text-slate-400 block mt-1">Isolated Corporate Trial Budget</span>
            <span className="text-[10px] text-indigo-600 block mt-2 font-medium">Click to inspect bills & spendings &rarr;</span>
          </div>
        </div>
      </div>

      {/* Relevant Documents Block (Renders Dynamically upon clicking KPI card) */}
      {selectedCategory && (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-3 duration-250">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#E6F1FB]">
                  {selectedCategory === "Active Matters" ? "Synced Active Matters Listing" : 
                   selectedCategory === "Pending Approvals" ? "Synced Approval Workflows" :
                   selectedCategory === "Upcoming Hearings" ? "Upcoming Docket Schedules" :
                   "Legal Spend & disbursement Ledger"}
                </h4>
                <p className="text-[10px] text-slate-400">Live Secure Isolated Partition: <strong className="text-indigo-300 font-mono">{selectedCategory}</strong></p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-slate-400 hover:text-white text-xs font-semibold px-2.5 py-1 rounded hover:bg-slate-800 cursor-pointer transition"
            >
              Close Ledger View &times;
            </button>
          </div>

          {/* Filtering */}
          {(() => {
            if (selectedCategory === "Active Matters") {
              const activeMatters = companyMatters.filter(m => m.status !== "Closed");
              if (activeMatters.length === 0) {
                return (
                  <div className="py-6 text-center text-xs text-slate-500 font-mono">
                    No active matter folders found synced for this corporate context.
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeMatters.map(matter => (
                    <div 
                      key={matter.id}
                      onClick={() => onViewMatterDetail && onViewMatterDetail(matter)}
                      className="group bg-slate-800 border border-slate-700/60 rounded-lg p-3 hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between hover:bg-slate-700/40"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="p-1.5 rounded bg-slate-700/50 text-indigo-300 group-hover:text-white"><Briefcase className="w-4 h-4" /></span>
                          <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-900/40">
                            {matter.type}
                          </span>
                        </div>
                        <h5 className="text-[11.5px] font-bold text-white mt-2 truncate font-mono" title={matter.title}>{matter.title}</h5>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">"{matter.description}"</p>
                      </div>
                      <div className="border-t border-slate-800 mt-2.5 pt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-mono">ID: {matter.id}</span>
                        <span className="text-indigo-400 group-hover:underline font-semibold flex items-center gap-0.5">
                          View details &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            if (selectedCategory === "Pending Approvals") {
              const matchedDocs = companyDocuments.filter(d => d.riskLevel === "High" || d.category === "Contracts");
              if (matchedDocs.length === 0) {
                return (
                  <div className="py-6 text-center text-xs text-slate-500 font-mono">
                    No pending core files require instant signatures.
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {matchedDocs.map(doc => (
                    <div 
                      key={doc.id}
                      onClick={() => onSelectDocument(doc)}
                      className="group bg-slate-800 border border-slate-700/60 rounded-lg p-3 hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between hover:bg-slate-700/40"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="p-1.5 rounded bg-slate-700/50 text-indigo-300 group-hover:text-white"><FileText className="w-4 h-4" /></span>
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            doc.riskLevel === "High" ? "bg-red-950 text-red-450 border border-red-900" : "bg-emerald-950 text-emerald-450 border border-emerald-900"
                          }`}>
                            Risk: {doc.riskLevel || "Low"}
                          </span>
                        </div>
                        <h5 className="text-[11.5px] font-bold text-white mt-2 truncate font-mono" title={doc.fileName}>{doc.fileName}</h5>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Category: {doc.category}</span>
                      </div>
                      <div className="border-t border-slate-800 mt-2.5 pt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-mono">Ver v{doc.version}</span>
                        <span className="text-indigo-400 group-hover:underline font-semibold flex items-center gap-0.5">
                          Launch GDrive Sync View &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            if (selectedCategory === "Upcoming Hearings") {
              const activeHearings = companyHearings.filter(h => h.status === "Scheduled");
              if (activeHearings.length === 0) {
                return (
                  <div className="py-6 text-center text-xs text-slate-500 font-mono">
                    No scheduled trial schedules or active hearing updates.
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeHearings.map(hearing => (
                    <div 
                      key={hearing.id}
                      onClick={() => onTabChange("calendar")}
                      className="group bg-slate-800 border border-slate-700/60 rounded-lg p-3 hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between hover:bg-slate-700/40"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="p-1.5 rounded bg-slate-700/50 text-indigo-300 group-hover:text-white"><Gavel className="w-4 h-4" /></span>
                          <span className="text-[8.5px] font-mono bg-amber-950 text-amber-400 border border-amber-900/60 px-1.5 py-0.5 rounded font-bold uppercase">
                            Trial Date
                          </span>
                        </div>
                        <h5 className="text-[11.5px] font-bold text-white mt-2 truncate font-mono">{hearing.court}</h5>
                        <p className="text-[10px] text-slate-300 mt-1">Matter: {hearing.matterTitle}</p>
                        <span className="text-[10px] text-slate-400 block mt-0.5 italic">Schedule: {hearing.hearingDate}</span>
                      </div>
                      <div className="border-t border-slate-800 mt-2.5 pt-2 flex items-center justify-between text-[10px]">
                        <span className="text-rose-455 text-rose-400 font-bold uppercase tracking-wider">{hearing.status}</span>
                        <span className="text-indigo-400 group-hover:underline font-semibold flex items-center gap-0.5">
                          Open Schedule &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            if (selectedCategory === "Legal Spend Ledger") {
              if (companyInvoices.length === 0) {
                return (
                  <div className="py-6 text-center text-xs text-slate-500 font-mono">
                    No client-side billing log disbursements registered.
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {companyInvoices.map(inv => (
                    <div 
                      key={inv.id}
                      onClick={() => onTabChange("invoices")}
                      className="group bg-slate-800 border border-slate-700/60 rounded-lg p-3 hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between hover:bg-slate-700/40"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="p-1.5 rounded bg-slate-700/50 text-emerald-400 group-hover:text-emerald-300"><DollarSign className="w-4 h-4" /></span>
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            inv.status === "Paid" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-amber-950 text-amber-400 border border-amber-900"
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <h5 className="text-[11.5px] font-bold text-white mt-2 truncate font-mono">{inv.firm}</h5>
                        <p className="text-[10px] text-slate-450 text-slate-400 mt-1">Due Date: {inv.dueDate}</p>
                        <span className="text-sm font-bold text-emerald-400 block mt-2">₹{inv.amount.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-slate-800 mt-2.5 pt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-mono">{inv.id}</span>
                        <span className="text-indigo-400 group-hover:underline font-semibold flex items-center gap-0.5">
                          Pay Invoice Ledger &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            return null;
          })()}
        </div>
      )}

      {/* Activities and Timelines section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activities widget */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold font-display text-slate-900 mb-4 uppercase tracking-wide text-xs">Recent Activity Stream</h3>
          <div className="space-y-3.5">
            {companyAuditLogs.length > 0 ? (
              companyAuditLogs.map((log) => (
                <div 
                  key={log.id} 
                  onClick={() => handleActivityClick(log)}
                  className="flex items-start gap-3 p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg transition-all cursor-pointer group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${getLogBadgeColors(log.action)}`}>
                    {getInitials(log.userName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 font-medium font-sans">
                      <strong className="text-slate-950 font-bold group-hover:text-indigo-600 transition-colors">{log.action}</strong> &mdash; {log.details}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                      <span className="font-semibold text-slate-600">{log.userName}</span>
                      <span>&bull;</span>
                      <span className="font-mono text-[9.5px] uppercase tracking-wider">{log.company}</span>
                      <span>&bull;</span>
                      <span className="font-medium">
                        {new Date(log.timestamp).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (() => {
              const fallbackLogs = [
                { tab: "dms", initials: "RS", color: "bg-blue-50 text-blue-600", title: "Contract amended — Bally Jute Supply Agreement", sub: "Rajan Sharma • Yajur • 2 hours ago", company: "Yajur" },
                { tab: "matters", initials: "PM", color: "bg-emerald-50 text-emerald-600", title: "New litigation registered — Labour Tribunal West Bengal", sub: "P. Mukherjee • Yashoda • Yesterday, 3:40 PM", company: "Yashoda" },
                { tab: "matters", initials: "AP", color: "bg-indigo-50 text-indigo-605 text-indigo-600", title: "Patent renewal reminder logs — Patent IN 312456", sub: "A. Prasad • Yajur • 2 days ago", company: "Yajur" },
                { tab: "invoices", initials: "SK", color: "bg-amber-50 text-amber-600", title: "Counsel invoice approved — ₹1,80,000 disbursement ledger", sub: "S. Kumar • Bally Jute • 3 days ago", company: "Bally Jute" }
              ].filter(item => effectiveCompany === "Group" || item.company === effectiveCompany);

              if (fallbackLogs.length === 0) {
                return (
                  <div className="py-4 text-center text-xs text-slate-400 italic">No recent activities for {effectiveCompany}</div>
                );
              }

              return fallbackLogs.map((log, idx) => (
                <div key={idx} onClick={() => onTabChange(log.tab)} className="flex items-start gap-3 p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg transition-all cursor-pointer group">
                  <div className={`w-8 h-8 rounded-full ${log.color} flex items-center justify-center font-bold text-xs shrink-0`}>{log.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 font-medium font-sans group-hover:text-indigo-600">{log.title}</p>
                    <span className="text-[10px] text-slate-400 font-sans">{log.sub}</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Calendar deadlines widgets */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold font-display text-slate-900 mb-4 uppercase tracking-wide text-xs">Upcoming Hearings & Deadlines</h3>
          <div className="space-y-3.5">
            {(() => {
              const deadlines: any[] = [];
              
              companyHearings.forEach(h => {
                if (h.status === "Scheduled") {
                  deadlines.push({
                    title: `${h.court} — Hearing: ${h.matterTitle}`,
                    subtitle: `Scheduled Court Hearing`,
                    badge: "Hearing",
                    badgeColor: "text-rose-600 bg-rose-50",
                    borderColor: "border-rose-500",
                    hoverBg: "hover:bg-rose-50/40",
                    tab: "calendar"
                  });
                }
              });

              companyNotices.forEach(n => {
                if (n.status === "Pending Action") {
                  deadlines.push({
                    title: `${n.subType} Notice compliance response pending — ${n.senderOrRecipient}`,
                    subtitle: n.deadlineDate ? `Deadline: ${n.deadlineDate}` : "Action Required",
                    badge: "Pending",
                    badgeColor: "text-amber-600 bg-amber-50",
                    borderColor: "border-amber-500",
                    hoverBg: "hover:bg-amber-50/40",
                    tab: "compliance"
                  });
                }
              });

              const fallbackDeadlines = [
                {
                  title: "Calcutta High Court — Written Objections filing",
                  subtitle: "8 Days Remaining · Deadline: 11 Jun 2026",
                  badge: "Urgent",
                  badgeColor: "text-rose-600 bg-rose-50",
                  borderColor: "border-rose-500",
                  hoverBg: "hover:bg-rose-50/40",
                  tab: "calendar",
                  company: "Yajur"
                },
                {
                  title: "ESI / PF Monthly Compulsory Audit Challan submission",
                  subtitle: "13 Days Remaining · Deadline: 16 Jun 2026",
                  badge: "Pending",
                  badgeColor: "text-amber-600 bg-amber-50",
                  borderColor: "border-amber-500",
                  hoverBg: "hover:bg-amber-50/40",
                  tab: "compliance",
                  company: "Bally Jute"
                },
                {
                  title: "Warehouse Lease Agreement Renewal Kolkata Node",
                  subtitle: "18 Days Remaining · Deadline: 21 Jun 2026",
                  badge: "General",
                  badgeColor: "text-indigo-600 bg-indigo-50",
                  borderColor: "border-indigo-500",
                  hoverBg: "hover:bg-indigo-50/40",
                  tab: "property",
                  company: "Yashoda"
                },
                {
                  title: "Patent Renewal IPO submission — Advanced Sourcing process",
                  subtitle: "30 Days Remaining · Deadline: 03 Jul 2026",
                  badge: "IP Portfolio",
                  badgeColor: "text-emerald-600 bg-emerald-50",
                  borderColor: "border-emerald-500",
                  hoverBg: "hover:bg-emerald-50/45",
                  tab: "ip",
                  company: "Yajur"
                }
              ].filter(item => effectiveCompany === "Group" || item.company === effectiveCompany);

              const itemsToRender = deadlines.length > 0 ? deadlines.slice(0, 4) : fallbackDeadlines;

              if (itemsToRender.length === 0) {
                return (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    No upcoming deadlines found for {effectiveCompany === "Group" ? 'All Divisions' : effectiveCompany}.
                  </div>
                );
              }

              return itemsToRender.map((dl, idx) => (
                <div 
                  key={idx}
                  onClick={() => onTabChange(dl.tab)}
                  className={`border-l-4 ${dl.borderColor} pl-3 pr-2.5 cursor-pointer ${dl.hoverBg} py-2.5 rounded transition-all hover:translate-x-1`}
                >
                  <h4 className="text-xs font-bold text-slate-900 leading-snug hover:text-indigo-600 transition-colors">{dl.title}</h4>
                  <div className="text-[10.5px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{dl.subtitle}</span>
                    <span className={`font-semibold px-1.5 py-0.2 rounded text-[9.5px] uppercase tracking-wider ${dl.badgeColor}`}>{dl.badge}</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Allocation Splits list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Allocation */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Matters by Allocation</h3>
          <div className="space-y-3">
            <div onClick={() => onTabChange("contracts")} className="cursor-pointer group hover:bg-slate-50 p-2.5 rounded-lg border border-transparent hover:border-slate-100 transition-all">
              <div className="flex justify-between text-xs font-semibold mb-1 group-hover:text-indigo-600 transition-colors">
                <span>Contracts ({countContracts})</span>
                <span className="text-slate-400">77%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "77%" }} />
              </div>
            </div>
            <div onClick={() => onTabChange("litigation")} className="cursor-pointer group hover:bg-slate-50 p-2.5 rounded-lg border border-transparent hover:border-slate-100 transition-all">
              <div className="flex justify-between text-xs font-semibold mb-1 group-hover:text-indigo-600 transition-colors">
                <span>Litigation ({countLitigation})</span>
                <span className="text-slate-400">60%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>
            <div onClick={() => onTabChange("compliance")} className="cursor-pointer group hover:bg-slate-50 p-2.5 rounded-lg border border-transparent hover:border-slate-100 transition-all">
              <div className="flex justify-between text-xs font-semibold mb-1 group-hover:text-indigo-600 transition-colors">
                <span>Compliance ({countCompliance})</span>
                <span className="text-slate-400">34%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "34%" }} />
              </div>
            </div>
            <div onClick={() => onTabChange("ip")} className="cursor-pointer group hover:bg-slate-50 p-2.5 rounded-lg border border-transparent hover:border-slate-100 transition-all font-mono">
              <div className="flex justify-between text-xs font-semibold mb-1 group-hover:text-indigo-600 transition-colors font-sans">
                <span>IP / Patents ({countIP})</span>
                <span className="text-slate-400">17%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "17%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Company Group Splits */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Company Context</h3>
          <div className="space-y-3.5">
            <div 
              onClick={() => onCompanyChange && onCompanyChange("Yajur")}
              className={`flex items-center gap-2.5 cursor-pointer hover:bg-indigo-50/50 p-2.5 rounded-xl border border-transparent hover:border-slate-200 transition ${effectiveCompany === "Yajur" ? 'bg-indigo-55 bg-indigo-50/40 border-indigo-200 shadow-xs' : ''}`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#185FA5] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 select-none">Y</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="hover:text-[#185FA5] font-bold">Yajur Industries</span>
                  <span className="text-slate-500 font-mono">26 Files</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-[#185FA5] rounded-full" style={{ width: "55%" }} />
                </div>
              </div>
            </div>

            <div 
              onClick={() => onCompanyChange && onCompanyChange("Bally Jute")}
              className={`flex items-center gap-2.5 cursor-pointer hover:bg-amber-50/50 p-2.5 rounded-xl border border-transparent hover:border-slate-200 transition-all ${effectiveCompany === "Bally Jute" ? 'bg-amber-50/40 border-amber-200 shadow-xs' : ''}`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#854F0B] flex items-center justify-center font-bold text-xs shrink-0 border border-amber-100 select-none">B</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="hover:text-[#854F0B] font-bold">Bally Jute Co.</span>
                  <span className="text-slate-500 font-mono font-normal">17 Files</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-[#854F0B] rounded-full" style={{ width: "36%" }} />
                </div>
              </div>
            </div>

            <div 
              onClick={() => onCompanyChange && onCompanyChange("Yashoda")}
              className={`flex items-center gap-2.5 cursor-pointer hover:bg-emerald-50/50 p-2.5 rounded-xl border border-transparent hover:border-slate-200 transition-all ${effectiveCompany === "Yashoda" ? 'bg-emerald-50/40 border-emerald-200 shadow-xs' : ''}`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#3B6D11] flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-100 select-none">Y</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="hover:text-[#3B6D11] font-bold">Yashoda Enterprise</span>
                  <span className="text-slate-500 font-mono font-normal">10 Files</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-[#3B6D11] rounded-full" style={{ width: "21%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Documents statistics */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 font-display">GDrive DMS Vault</h3>
            <div className="font-sans text-xs space-y-2">
              <div 
                onClick={() => onTabChange("dms")}
                className="flex justify-between py-2 border-b border-slate-100/60 hover:bg-indigo-50/30 px-2 rounded-lg transition cursor-pointer group"
              >
                <span className="text-slate-550 font-semibold group-hover:text-indigo-600 text-slate-500">Synced Documents</span>
                <span className="font-bold text-slate-800">1,284 entries</span>
              </div>
              <div 
                onClick={() => onTabChange("approvals")}
                className="flex justify-between py-2 border-b border-slate-100/60 hover:bg-indigo-50/30 px-2 rounded-lg transition cursor-pointer group"
              >
                <span className="text-slate-550 font-semibold group-hover:text-indigo-600 text-slate-500">Pending Approval</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">12 Files</span>
              </div>
              <div 
                onClick={() => onTabChange("archive")}
                className="flex justify-between py-2 border-b border-slate-100/60 hover:bg-indigo-50/30 px-2 rounded-lg transition cursor-pointer group"
              >
                <span className="text-slate-550 font-semibold group-hover:text-indigo-600 text-slate-500">Archived Files</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">342 Files</span>
              </div>
              <div 
                onClick={() => onTabChange("dms")}
                className="flex justify-between py-2 hover:bg-indigo-50/30 px-2 rounded-lg transition cursor-pointer group"
              >
                <span className="text-slate-550 font-semibold group-hover:text-indigo-600 text-slate-500">GDrive Sync Link</span>
                <span className="text-indigo-600 font-bold">Secure Active &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
