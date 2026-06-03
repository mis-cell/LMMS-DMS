import React, { useState } from "react";
import { 
  Briefcase, 
  Search, 
  Plus, 
  Filter, 
  Shield, 
  TrendingUp, 
  FileText, 
  FileCheck, 
  ChevronRight, 
  History 
} from "lucide-react";
import { Matter, LegalNotice, CompanyType, MatterStatus } from "../types";

interface MattersPanelProps {
  tab: string; // "matters" | "litigation" | "contracts" | "compliance" | "ip" | "employment" | "property" | "tax"
  matters: Matter[];
  notices: LegalNotice[];
  activeUser: any;
  effectiveCompany: string;
  onViewMatterDetail: (matter: Matter) => void;
  onInstantiateMatterClick: () => void;
  onLogNoticeClick: () => void;
  onBulkStatusUpdate?: (ids: string[], newStatus: MatterStatus) => void;
  theme: any;
}

export default function MattersPanel({
  tab,
  matters,
  notices,
  activeUser,
  effectiveCompany,
  onViewMatterDetail,
  onInstantiateMatterClick,
  onLogNoticeClick,
  onBulkStatusUpdate,
  theme
}: MattersPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [classificationFilter, setClassificationFilter] = useState<"All" | "Litigation" | "Contract" | "Regulatory" | "IP/Trademark" | "Labor Matter" | "Property">("All");
  const [selectedMatterIds, setSelectedMatterIds] = useState<Set<string>>(new Set());

  // Determine active item type mapping to this tab
  const getTabMatters = () => {
    // Isolated by active company
    const baseList = matters.filter(m => effectiveCompany === "Group" || m.company === effectiveCompany);

    switch (tab) {
      case "litigation":
        return baseList.filter(m => m.type === "Litigation");
      case "contracts":
        return baseList.filter(m => m.type === "Contract");
      case "ip":
        return baseList.filter(m => m.type === "IP/Trademark");
      case "employment":
        return baseList.filter(m => m.type === "Labor Matter");
      case "property":
        return baseList.filter(m => m.type === "Property");
      case "tax":
        return baseList.filter(m => m.type === "Regulatory");
      default:
        // matters (All Matters)
        return baseList;
    }
  };

  const listItems = getTabMatters();

  // Filter items matching user search, status dropdowns, and classifications
  const filteredList = listItems.filter(m => {
    const matchesSearch = 
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.opponentParty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.courtOrAuthority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.externalCounsel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All Statuses" || m.status === statusFilter;
    const matchesClassification = classificationFilter === "All" || m.type === classificationFilter;

    return matchesSearch && matchesStatus && matchesClassification;
  });

  // Unique counts for subtab KPIs
  const totalCount = listItems.length;
  const inProgressCount = listItems.filter(m => m.status !== "Closed" && m.status !== "Opened").length;
  const closedCount = listItems.filter(m => m.status === "Closed").length;

  return (
    <div className="space-y-6">
      
      {/* Title & Actions Row */}
      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-bold font-display text-slate-900 uppercase tracking-wide">
            {tab === "matters" && "Matter Directory Registry"}
            {tab === "litigation" && "High Court & Tribunal Litigations Register"}
            {tab === "contracts" && "Procurement & Sourcing Agreements"}
            {tab === "compliance" && "Corporate Compliance Directory"}
            {tab === "ip" && "Intellectual Property & Patents Index"}
            {tab === "employment" && "Labour Arbitrations & IC POSH Policies"}
            {tab === "property" && "Physical Assets & Leases Register"}
            {tab === "tax" && "Revenue Tax & GST Assessments Appeals"}
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            {tab === "matters" && "Master database mapping cases, agreements and regulatory proceedings."}
            {tab === "litigation" && "Trial stages, counters and hearing schedules of contested litigations."}
            {tab === "contracts" && "Commercial sourcing agreements, NDAs and financial exposures."}
            {tab === "compliance" && "Log of statutory requirements, PF filings and factory certificates."}
            {tab === "ip" && "Inventions patents filings, copyrights and active trademarks."}
            {tab === "employment" && "Union wage revision negotiations, arbitration drafts and payroll coverage."}
            {tab === "property" && "Real estate parcels, headquarters rentals, warehouses and owned factory plots."}
            {tab === "tax" && "ITAT assessments and contested customs, excise, or CGST demand reviews."}
          </p>
        </div>

        {["Super Admin", "Company Admin", "Legal Head"].includes(activeUser?.role || "") && (
          <button
            onClick={tab === "compliance" ? onLogNoticeClick : onInstantiateMatterClick}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>
              {tab === "compliance" && "Log Notice / Compliance Alert"}
              {tab === "litigation" && "File New Case"}
              {tab === "contracts" && "Log Agreement"}
              {tab === "ip" && "Register IP"}
              {tab === "property" && "Add Property"}
              {tab === "tax" && "Add Tax Demand"}
              {tab === "matters" && "Instantiate New Matter"}
              {["employment"].includes(tab) && "Log Labor Matter"}
            </span>
          </button>
        )}
      </div>

      {/* Compliance Special Template View */}
      {tab === "compliance" ? (() => {
        const companyNotices = notices.filter(n => effectiveCompany === "Group" || n.company === effectiveCompany);
        const totalObligations = companyNotices.length;
        const overdueAlerts = companyNotices.filter(n => n.status === "Pending Action").length;
        const filedThisMonth = companyNotices.filter(n => n.status === "Responded" || n.status === "Resolved").length;
        const clearanceScore = totalObligations > 0 ? Math.round(((totalObligations - overdueAlerts) / totalObligations) * 100) : 100;

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Obligations</span>
                <p className="text-xl font-bold text-slate-800 mt-2">{totalObligations} Audits</p>
              </div>
              <div className="bg-white border rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Filed this month</span>
                <p className="text-xl font-bold text-emerald-600 mt-2">{filedThisMonth} filings</p>
              </div>
              <div className="bg-white border rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Overdue Alerts</span>
                <p className="text-xl font-bold text-rose-600 mt-2">{overdueAlerts} Pending Action</p>
              </div>
              <div className="bg-white border rounded-xl p-4 shadow-3xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Clearance Score</span>
                <p className="text-xl font-bold text-indigo-600 mt-2">{clearanceScore}% ratio</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl overflow-x-auto shadow-xs">
              <table className="w-full min-w-[700px] text-xs font-sans text-slate-700">
                <thead className="bg-slate-50 border-b select-none font-bold text-slate-400">
                  <tr className="text-left">
                    <th className="p-3.5 uppercase text-[10px] tracking-wider pl-5">Compliance Obligation</th>
                    <th className="p-3.5 uppercase text-[10px] tracking-wider">Act / Regulation Context</th>
                    <th className="p-3.5 uppercase text-[10px] tracking-wider">Frequency</th>
                    <th className="p-3.5 uppercase text-[10px] tracking-wider">Due date</th>
                    <th className="p-3.5 uppercase text-[10px] tracking-wider">Responsible personnel</th>
                    <th className="p-3.5 uppercase text-[10px] tracking-wider pr-5 text-right">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companyNotices.map(ntc => (
                    <tr key={ntc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-5 font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ntc.company === "Yajur" ? "#185FA5" : ntc.company === "Bally Jute" ? "#854F0B" : "#3B6D11" }} />
                        {ntc.senderOrRecipient}
                      </td>
                      <td className="p-4">{ntc.subType} Regulator Guidelines</td>
                      <td className="p-4 font-mono text-xs">Monthly Ledger</td>
                      <td className="p-4 font-semibold text-rose-650 text-rose-600">{ntc.deadlineDate || "15 Jun 2026"}</td>
                      <td className="p-4 text-slate-500 font-medium">{ntc.legalTeamLead}</td>
                      <td className="p-4 pr-5 text-right">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                          ntc.status === "Pending Action" ? "bg-rose-50 text-rose-700 border border-rose-150" : "bg-emerald-50 text-emerald-700 border border-emerald-150"
                        }`}>
                          {ntc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })() : (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search index..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 rounded-lg outline-none font-sans"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg outline-none cursor-pointer focus:border-indigo-400 max-w-full"
            >
              <option value="All Statuses">All Trial / Contract Statuses</option>
              <option value="Opened">Opened / Drafted</option>
              <option value="Under Review">Under Review</option>
              <option value="Filed">Filed dockets</option>
              <option value="Hearing">Hearing proceedings</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Secondary Classification Filter Bar */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex items-center gap-1.5 overflow-x-auto select-none">
            <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 px-3 select-none flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Toggle Classification:
            </span>
            {[
              { id: "All", label: "All Portfolios" },
              { id: "Litigation", label: "Litigation Cases" },
              { id: "Contract", label: "Agreements & Contracts" },
              { id: "Regulatory", label: "Regulatory Compliance" },
              { id: "IP/Trademark", label: "Intellectual Property" },
              { id: "Labor Matter", label: "Labor Disputes" },
              { id: "Property", label: "Property & Real Estate" }
            ].map((clazz) => {
              const active = classificationFilter === clazz.id;
              return (
                <button
                  key={clazz.id}
                  onClick={() => setClassificationFilter(clazz.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition duration-150 cursor-pointer text-nowrap whitespace-nowrap border ${
                    active 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-3xs" 
                      : "bg-white text-slate-650 text-slate-600 border-slate-200/50 hover:text-slate-900 hover:bg-slate-50/70"
                  }`}
                >
                  {clazz.label}
                </button>
              );
            })}
          </div>

          {/* Bulk Action Header */}
          {selectedMatterIds.size > 0 && (
            <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                  {selectedMatterIds.size} Selected
                </span>
                <span className="text-xs text-slate-700 font-medium font-sans">
                  Batch administrative status update in progress...
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold whitespace-nowrap">Apply Stage:</span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const status = e.target.value as MatterStatus;
                    if (status && onBulkStatusUpdate) {
                      onBulkStatusUpdate(Array.from(selectedMatterIds), status);
                      setSelectedMatterIds(new Set());
                    }
                  }}
                  className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>-- Select New Status --</option>
                  <option value="Opened">Opened / Drafted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Filed">Filed dockets</option>
                  <option value="Hearing">Hearing proceedings</option>
                  <option value="Closed">Closed</option>
                </select>

                <button
                  onClick={() => setSelectedMatterIds(new Set())}
                  className="px-3 py-1.5 hover:bg-white text-slate-500 border border-slate-150 text-xs font-semibold rounded-lg cursor-pointer transition"
                >
                  Deselect all
                </button>
              </div>
            </div>
          )}

          {/* Database Grid */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-x-auto shadow-xs">
            {filteredList.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-800">No matching legal matters found.</p>
                <p className="text-xs text-slate-500 mt-1">Refine your search parameters or register a new matter folder.</p>
              </div>
            ) : (
              <table className="w-full min-w-[850px] text-xs text-slate-600 font-sans">
                <thead className="bg-slate-50 border-b select-none font-bold text-slate-400">
                  <tr className="text-left">
                    <th className="p-3.5 pl-5 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={filteredList.length > 0 && filteredList.every(m => selectedMatterIds.has(m.id))}
                        onChange={() => {
                          const allSelected = filteredList.every(m => selectedMatterIds.has(m.id));
                          const copy = new Set(selectedMatterIds);
                          if (allSelected) {
                            filteredList.forEach(m => copy.delete(m.id));
                          } else {
                            filteredList.forEach(m => copy.add(m.id));
                          }
                          setSelectedMatterIds(copy);
                        }}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5 pl-2 uppercase text-[10px] tracking-wider">Matter/ID</th>
                    <th className="p-3.5 uppercase text-[10px] tracking-wider">Company</th>
                    <th className="p-3.5 uppercase text-[10px] tracking-wider">Stage Status</th>
                    <th className="p-3.5 uppercase text-[10px] tracking-wider">Jurisdiction / Court</th>
                    <th className="p-3.5 uppercase text-[10px] tracking-wider">Assigned Counsel</th>
                    <th className="p-3.5 uppercase text-[10px] tracking-wider text-right">Exposure Value</th>
                    <th className="p-3.5 uppercase text-[10px] tracking-wider pr-5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map(m => (
                    <tr 
                      key={m.id} 
                      onClick={() => onViewMatterDetail(m)}
                      className="hover:bg-indigo-50/20 hover:shadow-2xs transition duration-150 cursor-pointer group"
                    >
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedMatterIds.has(m.id)}
                          onChange={() => {
                            const copy = new Set(selectedMatterIds);
                            if (copy.has(m.id)) {
                              copy.delete(m.id);
                            } else {
                              copy.add(m.id);
                            }
                            setSelectedMatterIds(copy);
                          }}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 pl-2">
                        <div className="font-semibold text-slate-800 text-[12.5px] leading-snug group-hover:text-indigo-600 transition-colors">{m.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {m.id} • {m.department}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.company === "Yajur" ? "bg-blue-50 text-blue-700" : m.company === "Bally Jute" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
                        }`}>
                          {m.company}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          m.status === "Closed" 
                            ? "bg-slate-100 text-slate-705 text-slate-650 text-slate-605 text-slate-500 border-slate-200" 
                            : m.status === "Settlement"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : m.status === "Hearing"
                            ? "bg-orange-50 text-orange-750 text-orange-700 border-orange-100"
                            : m.status === "Filed"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : m.status === "Under Review"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-blue-50 text-blue-700 border-blue-100"
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        {m.courtOrAuthority || "Arbitration Chamber / GDrive Draft"}
                      </td>
                      <td className="p-4 text-slate-550 font-medium">{m.externalCounsel || "Internal Team"}</td>
                      <td className="p-4 text-right font-mono font-bold text-slate-900">
                        ₹{m.value ? (m.value / 100000).toFixed(1) + " L" : "—"}
                      </td>
                      <td className="p-4 pr-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewMatterDetail(m);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 rounded font-bold cursor-pointer transition-all duration-150"
                        >
                          Observe Log
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
