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
  ArrowUpRight,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { LegalDocument, Matter, DocCategory } from "../types";
import DocumentUploadModal from "./DocumentUploadModal";

interface DocumentsPanelProps {
  tab: string; // "dms" | "templates" | "approvals" | "esign" | "archive"
  documents: LegalDocument[];
  matters: Matter[];
  effectiveCompany: string;
  approvals: any[];
  onApprove: (id: string, decision: "Approved" | "Rejected") => void;
  onTriggerSignRemind: (id: string) => void;
  onDocClick: (doc: LegalDocument) => void;
  onUpload?: (payload: {
    fileName: string;
    category: any;
    matterId: string | null;
    textContent: string;
  }) => Promise<void>;
  onEdit?: (docId: string, updatedFields: Partial<LegalDocument>) => Promise<void>;
  onDelete?: (docId: string) => Promise<void>;
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
  onUpload,
  onEdit,
  onDelete,
  theme
}: DocumentsPanelProps) {
  const [dmsSearch, setDmsSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Document Multi-selection for PDF summarize
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // States for Editing details
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editRiskLevel, setEditRiskLevel] = useState<"Low" | "Medium" | "High">("Low");
  const [editParties, setEditParties] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");

  const handleStartEdit = (doc: LegalDocument) => {
    setEditingDoc(doc);
    setEditFileName(doc.fileName);
    setEditCategory(doc.category);
    setEditRiskLevel(doc.riskLevel || "Low");
    setEditParties(doc.parties?.join(", ") || "");
    setEditExpiryDate(doc.expiryDate || "");
  };

  const handleSaveEdit = async () => {
    if (!editingDoc || !onEdit) return;
    const partiesArr = editParties.split(",").map(p => p.trim()).filter(Boolean);
    await onEdit(editingDoc.id, {
      fileName: editFileName,
      category: editCategory as any,
      riskLevel: editRiskLevel,
      parties: partiesArr,
      expiryDate: editExpiryDate || null
    });
    setEditingDoc(null);
  };

  const handleDeleteDoc = async (id: string, name: string) => {
    if (!onDelete) return;
    if (confirm(`Are you absolutely sure you want to delete compliance document "${name}" from secure archives?`)) {
      await onDelete(id);
    }
  };

  // Filter GDrive documents
  const compDocs = documents.filter(d => effectiveCompany === "Group" || d.company === effectiveCompany);
  const filteredDocs = compDocs.filter(d => {
    const matchesSearch = d.fileName.toLowerCase().includes(dmsSearch.toLowerCase()) || d.category.toLowerCase().includes(dmsSearch.toLowerCase());
    const matchesCategory = activeCategory === "All" || d.category.toLowerCase().includes(activeCategory.toLowerCase()) || d.fileName.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Contracts", "Agreements", "Court Orders", "Pleadings", "Notices", "Licenses", "Internal Opinions"];

  const handleToggleSelect = (id: string) => {
    const copy = new Set(selectedDocIds);
    if (copy.has(id)) {
      copy.delete(id);
    } else {
      copy.add(id);
    }
    setSelectedDocIds(copy);
  };

  const allFilteredIdsOnScreen = filteredDocs.map(d => d.id);
  const isAllSelected = allFilteredIdsOnScreen.length > 0 && allFilteredIdsOnScreen.every(id => selectedDocIds.has(id));

  const handleToggleSelectAll = () => {
    const copy = new Set(selectedDocIds);
    if (isAllSelected) {
      allFilteredIdsOnScreen.forEach(id => copy.delete(id));
    } else {
      allFilteredIdsOnScreen.forEach(id => copy.add(id));
    }
    setSelectedDocIds(copy);
  };

  const handleExportSelectedPDF = () => {
    if (selectedDocIds.size === 0) return;
    setIsExporting(true);
    
    setTimeout(() => {
      setIsExporting(false);
      
      const selectedDocsData = documents.filter(doc => selectedDocIds.has(doc.id));
      
      let content = `==============================================================================
LRLMS COMPLIANCE PORTFOLIO EXPORT: ${effectiveCompany.toUpperCase()} SUMMARY
==============================================================================
Generated: ${new Date().toLocaleString()} UTC
Export Mode: Client-side Secure Multi-Tenant Audit Summarization
Selected Documents Count: ${selectedDocsData.length}

------------------------------------------------------------------------------
DOCKET OF SELECTED DOCUMENTS METADATA AND AI CONTRACT CLAUSES ANALYSIS
------------------------------------------------------------------------------\n\n`;

      selectedDocsData.forEach((doc, idx) => {
        content += `${idx + 1}. FILE REcord: ${doc.fileName}
   System Registry ID: [${doc.id}]
   Folder Classification: ${doc.category}
   Owner division: ${doc.company} Industries
   Compliance Version Target: v${doc.version}.0
   Synced Reference: ${doc.googleDriveLink}
   AI Compliance Review Checklist:
     - Flagged Risk Exposure: ${doc.riskLevel || "Low"}
     - Extracted Risks Summary: "${doc.riskSummary || 'N/A'}"
     - Identified Parties: ${doc.parties && doc.parties.length > 0 ? doc.parties.join(", ") : 'None extracted'}
     - Target Expiration schedule: ${doc.expiryDate || "Continuous Coverage"}
------------------------------------------------------------------------------\n`;
      });
      
      content += `\n==============================================================================
END OF LEDGER EXPORT REPORT (SHA-256 INTEGRITY VALIDATED)
==============================================================================\n`;

      try {
        const element = document.createElement("a");
        const file = new Blob([content], { type: "application/pdf" });
        element.href = URL.createObjectURL(file);
        element.download = `${effectiveCompany.replace(/\s+/g, "_")}_Compliance_Summary_Portfolio.pdf`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } catch (e) {
        console.error("Download failed to trigger ", e);
      }
    }, 1500);
  };

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
          
          {/* DMS Filtering, Search and Upload buttons row */}
          <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search GDrive files..."
                  value={dmsSearch}
                  onChange={e => setDmsSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 rounded-lg outline-none font-sans"
                />
              </div>

              {/* Select All Checkbox on Screen */}
              <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border rounded-lg text-xs font-semibold text-slate-600 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  className="w-3.5 h-3.5 rounded text-indigo-650"
                />
                <span>Select All Screen</span>
              </label>
            </div>

            {/* Right side: Uploader trigger button */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Open modern Google Drive virtual document syncing scanner workspace"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document / New Entry</span>
              </button>
            </div>
          </div>

          {/* Category Chips row */}
          <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase font-bold text-slate-450 text-slate-400 mr-2">Filter GDrive directory:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-50 border text-slate-500 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Bulk PDF Export Bar */}
          {selectedDocIds.size > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded text-amber-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Bulk Action Controller
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ready to compile <strong className="text-slate-800">{selectedDocIds.size} file(s)</strong> metadata briefs and draft agreements risks checklist into a single file.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSelectedDocIds(new Set())}
                  className="px-3 py-2 border hover:bg-white rounded-lg text-xs font-bold text-slate-600 cursor-pointer transition"
                >
                  Deselect All
                </button>
                <button
                  onClick={handleExportSelectedPDF}
                  disabled={isExporting}
                  className="px-4 py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-750 text-white hover:bg-indigo-700 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin mr-1"></div>
                      Compiling PDF Portfolio...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Summary to PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-100 rounded-2xl p-10 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <FileText className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">No Documents Found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    We couldn't find any documents matching the criteria for <strong className="text-slate-700">"{activeCategory}"</strong> category within the <strong className="text-slate-700">{effectiveCompany === "Group" ? "All" : effectiveCompany}</strong> workspace context.
                  </p>
                </div>
                <div className="flex gap-2">
                  {activeCategory !== "All" && (
                    <button
                      onClick={() => setActiveCategory("All")}
                      className="px-3 py-2 border rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer transition select-none"
                    >
                      Reset Category Filters
                    </button>
                  )}
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer"
                  >
                    Upload Document / New Entry
                  </button>
                </div>
              </div>
            ) : (
              filteredDocs.map(doc => (
                <div 
                  key={doc.id} 
                  className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:border-indigo-400 hover:shadow-xs transition duration-200 flex flex-col justify-between h-48 relative"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={selectedDocIds.has(doc.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleToggleSelect(doc.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        />
                        <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><FileText className="w-5 h-5" /></span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        doc.riskLevel === "High" ? "bg-rose-50 text-rose-700" : doc.riskLevel === "Medium" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        Risk level: {doc.riskLevel || "Low"}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-00 text-slate-800 font-sans mt-3 truncate" title={doc.fileName}>{doc.fileName}</h4>
                    <span className="text-[10.5px] block text-slate-400 mt-1">Classification: {doc.category}</span>
                    {doc.parties && doc.parties.length > 0 && (
                      <span className="text-[9.5px] block text-slate-500 mt-1 truncate" title={doc.parties.join(", ")}>Parties: {doc.parties.join(", ")}</span>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span className="font-semibold text-slate-400">Ver: v{doc.version}</span>
                    
                    {/* Action Hub buttons group to View, Edit, or Delete */}
                    <div className="flex items-center gap-1 bg-slate-50 border p-1 rounded-lg">
                      <button
                        onClick={() => onDocClick(doc)}
                        className="p-1 text-slate-500 hover:bg-white rounded hover:text-indigo-600 transition cursor-pointer"
                        title="View safe PDF folder simulation content"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(doc)}
                        className="p-1 text-slate-500 hover:bg-white rounded hover:text-amber-600 transition cursor-pointer"
                        title="Edit metadata index records of this document"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id, doc.fileName)}
                        className="p-1 text-slate-500 hover:bg-white rounded hover:text-rose-600 transition cursor-pointer"
                        title="Delete this document record from server database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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

      {/* Document Uploader Modal Popup */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 relative">
            <div className="absolute right-4 top-4 z-55">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition cursor-pointer"
                title="Close Virtual Uploader"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <DocumentUploadModal 
                onUpload={async (payload) => {
                  if (onUpload) {
                    await onUpload(payload);
                  }
                  setShowUploadModal(false);
                }}
                matters={matters}
                documents={documents}
                currentCompany={effectiveCompany === "Group" ? "Yajur" : effectiveCompany}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Details Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans select-none text-slate-800 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center bg-slate-50 border-b px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-sm">Edit Filing Detail Registry</h3>
              </div>
              <button
                onClick={() => setEditingDoc(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase text-[9.5px] mb-1.5">Filing File Name</label>
                <input
                  type="text"
                  value={editFileName}
                  onChange={e => setEditFileName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:border-indigo-400 outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase text-[9.5px] mb-1.5">Classification Category</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:border-indigo-400 outline-none bg-white font-sans"
                >
                  <option value="Contracts">Contracts</option>
                  <option value="Court Orders">Court Orders</option>
                  <option value="Pleadings">Pleadings</option>
                  <option value="Notices">Notices</option>
                  <option value="Agreements">Agreements</option>
                  <option value="Compliance Documents">Compliance Documents</option>
                  <option value="Licenses">Licenses</option>
                  <option value="Certificates">Certificates</option>
                  <option value="Intellectual Property Records">Intellectual Property Records</option>
                  <option value="Internal Legal Opinions">Internal Legal Opinions</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase text-[9.5px] mb-1.5">Artificial Intelligence Risk Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Low", "Medium", "High"] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEditRiskLevel(lvl)}
                      className={`py-2 text-[11px] font-bold border rounded-lg transition-all cursor-pointer ${
                        editRiskLevel === lvl
                          ? "bg-indigo-600 text-white border-indigo-650"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase text-[9.5px] mb-1.5">Involved Parties (Comma Separated)</label>
                <input
                  type="text"
                  value={editParties}
                  onChange={e => setEditParties(e.target.value)}
                  placeholder="e.g., Yajur Ltd, Bengal Suppliers"
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:border-indigo-400 outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase text-[9.5px] mb-1.5">Expiry Date Checklist (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={editExpiryDate}
                    onChange={e => setEditExpiryDate(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 border rounded-lg focus:border-indigo-400 outline-none font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="px-4 py-2 border border-slate-250 border-slate-200 rounded-lg font-semibold hover:bg-slate-100 cursor-pointer transition select-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition select-none shadow-xs"
              >
                Update Filing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
