import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  FileCheck, 
  Lock, 
  FileSignature, 
  Archive, 
  ChevronRight, 
  Check, 
  X, 
  Mail, 
  RefreshCw, 
  ArrowUpRight 
} from "lucide-react";
import { LegalDocument, Matter } from "../types";

interface DocumentsPanelProps {
  tab: string; // "dms" | "templates" | "approvals" | "esign" | "archive"
  documents: LegalDocument[];
  matters: Matter[];
  effectiveCompany: string;
  approvals: any[];
  onApprove: (id: string, decision: "Approved" | "Rejected") => void;
  onTriggerSignRemind: (id: string) => void;
  onDocClick: () => void;
  theme: any;
}

export default function DocumentsPanel({
  tab,
  documents,
  matters,
  effectiveCompany,
  approvals,
  onApprove,
  onTriggerSignRemind,
  onDocClick,
  theme
}: DocumentsPanelProps) {
  const [dmsSearch, setDmsSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Filter GDrive documents
  const compDocs = documents.filter(d => effectiveCompany === "Group" || d.company === effectiveCompany);
  const filteredDocs = compDocs.filter(d => {
    const matchesSearch = d.fileName.toLowerCase().includes(dmsSearch.toLowerCase()) || d.category.toLowerCase().includes(dmsSearch.toLowerCase());
    const matchesCategory = activeCategory === "All" || d.category.toLowerCase().includes(activeCategory.toLowerCase()) || d.fileName.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Contracts", "Notices", "Audits", "Agreements", "Compliance", "Licenses"];

  return (
    <div className="space-y-6">
      
      {/* Header Info Banner */}
      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-display text-slate-900 uppercase tracking-wide">
            {tab === "dms" && "GDrive Synced Document Library"}
            {tab === "templates" && "Standard Contract Boilerplates & Templates"}
            {tab === "approvals" && "Document Approvals Workflow Queue"}
            {tab === "esign" && "E-Signature Signing Progress Ledger"}
            {tab === "archive" && "Secure Long-term Archived Files"}
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            {tab === "dms" && "Immutable, secure document tracking system synced with Google Drive folders."}
            {tab === "templates" && "Approved template documents for NDAs, leases, MOUs, and employment agreements."}
            {tab === "approvals" && "Check outstanding contract revisions and authorize signatures."}
            {tab === "esign" && "Dispatched sign dockets currently awaiting execution."}
            {tab === "archive" && "Archived filings and audit returns from prior fiscal years."}
          </p>
        </div>
      </div>

      {/* RENDER BY SUB-TAB */}
      {tab === "dms" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search GDrive files..."
                value={dmsSearch}
                onChange={e => setDmsSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 rounded-lg outline-none font-sans"
              />
            </div>
            {/* Category Chips */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    activeCategory === cat
                      ? "bg-indigo-650 bg-indigo-600 text-white"
                      : "bg-slate-50 border text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(doc => (
              <div 
                key={doc.id} 
                onClick={onDocClick}
                className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:border-indigo-400 hover:shadow-xs transition duration-200 cursor-pointer flex flex-col justify-between h-44"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><FileText className="w-5 h-5" /></span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      doc.riskLevel === "High" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      Risk level: {doc.riskLevel || "Low"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 font-sans mt-3 truncate" title={doc.fileName}>{doc.fileName}</h4>
                  <span className="text-[10.5px] block text-slate-400 mt-1">Classification: {doc.category}</span>
                </div>
                
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-500">
                  <span className="font-semibold text-slate-400">Ver: v{doc.version}</span>
                  <span className="text-indigo-600 hover:underline">Download Link &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Standard Non-Disclosure Agreement", code: "TMP-NDA-201", use: "Sourcing disclosures" },
            { title: "Memorandum of Understanding (MOU)", code: "TMP-MOU-105", use: "JV collaborations" },
            { title: "Standard Commercial Vendor Contract", code: "TMP-SVR-301", use: "Commercial purchases" },
            { title: "Kolkata Physical Site Lease Deed", code: "TMP-LSD-099", use: "Real estate properties" },
            { title: "Employment Agreement Boilerplate", code: "TMP-EMP-204", use: "Payroll hiring" },
            { title: "Out-of-court Settlement Agreement", code: "TMP-SET-441", use: "Labour unions" }
          ].map((tmpl, idx) => (
            <div key={idx} className="bg-white border rounded-xl p-4 shadow-3xs flex flex-col justify-between h-36">
              <div>
                <h4 className="text-xs font-bold text-slate-800">{tmpl.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Designed for: {tmpl.use}</p>
              </div>
              <div className="border-t border-slate-50 pt-2 flex items-center justify-between text-[10.5px]">
                <span className="font-mono font-bold text-slate-400">{tmpl.code}</span>
                <span className="text-indigo-600 font-bold hover:underline cursor-pointer">Download Template &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "approvals" && (
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-xs font-sans text-slate-700">
            <thead className="bg-slate-50 border-b select-none font-bold text-slate-400">
              <tr className="text-left">
                <th className="p-3.5 uppercase text-[10px] tracking-wider pl-5">Document Draft</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Submitted By</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Company Division</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Date</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Priority</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Clearance Status</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider pr-5 text-right">Approve / Reject Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvals.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-5 font-semibold text-slate-800">{app.title}</td>
                  <td className="p-4 text-slate-600">{app.requester}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      app.company === "Yajur" ? "bg-blue-50 text-blue-700" : app.company === "Bally Jute" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
                    }`}>
                      {app.company}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{app.date}</td>
                  <td className="p-4 font-semibold text-rose-600">{app.priority}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      app.status === "Pending" ? "bg-amber-50 text-amber-700" : app.status === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 pr-5 text-right">
                    {app.status === "Pending" ? (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onApprove(app.id, "Approved")}
                          className="p-1 text-emerald-650 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onApprove(app.id, "Rejected")}
                          className="p-1 text-rose-650 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Decision Recorded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "esign" && (
        <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-xs font-sans text-slate-700">
            <thead className="bg-slate-50 border-b select-none font-bold text-slate-400">
              <tr className="text-left">
                <th className="p-3.5 pl-5 uppercase text-[10px] tracking-wider">Document Name</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Signatories Roster</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Signed Ratio</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Sent Date</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Expiry date</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider pr-5 text-right">Recall / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { title: "NDA - Bengal Jute Traders Supply", signers: "Ramesh Agarwal + MD", ratio: "1 / 2", date: "2026-05-28", exp: "2026-06-11", status: "Pending" },
                { title: "Commercial Warehouse Lease Deed Dankuni", signers: "Rahul Verma + Proprietor", ratio: "0 / 2", date: "2026-05-30", exp: "2026-06-14", status: "Pending" },
                { title: "Corporate IT Services Agreement draft", signers: "Anuj Mehta + CTO SoftTech", ratio: "2 / 2", date: "2026-05-25", exp: "Completed", status: "Completed" }
              ].map((es, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-5 font-semibold text-slate-800">{es.title}</td>
                  <td className="p-4 text-slate-550 font-medium">{es.signers}</td>
                  <td className="p-4 font-mono font-bold text-[#185FA5]">{es.ratio}</td>
                  <td className="p-4 font-mono">{es.date}</td>
                  <td className="p-4 font-semibold text-rose-650 text-rose-600">{es.exp}</td>
                  <td className="p-4 pr-5 text-right">
                    {es.status === "Pending" ? (
                      <button
                        onClick={() => onTriggerSignRemind(es.title)}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-650 border text-slate-500 rounded font-semibold transition cursor-pointer"
                      >
                        Send Email Reminder
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-bold">Successfully Executed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "archive" && (
        <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-xs font-sans text-slate-705">
            <thead className="bg-slate-50 border-b select-none font-bold text-slate-400">
              <tr className="text-left">
                <th className="p-3.5 pl-5 uppercase text-[10px] tracking-wider">Archived File</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Original Company</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Division Type</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Archived Date</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider pr-5 text-right">Retrieve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 pl-5 font-medium text-slate-700">Raw_Sourcing_Agreement_2020.zip</td>
                <td className="p-4">Yajur Industries</td>
                <td className="p-4 font-semibold text-sky-750 text-sky-600">Contract Archive</td>
                <td className="p-4 font-mono text-slate-400">12 Jan 2026</td>
                <td className="p-4 pr-5 text-right">
                  <button className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded text-slate-450 text-slate-600 cursor-pointer font-bold">Unzip file</button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 pl-5 font-medium text-slate-700">ESI_Statutory_Returns_FY_2022_2023.zip</td>
                <td className="p-4">Bally Jute Co.</td>
                <td className="p-4 font-semibold text-sky-750 text-sky-600">Compliance Archive</td>
                <td className="p-4 font-mono text-slate-400">01 Apr 2026</td>
                <td className="p-4 pr-5 text-right">
                  <button className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded text-slate-450 text-slate-600 cursor-pointer font-bold font-sans">Unzip file</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
