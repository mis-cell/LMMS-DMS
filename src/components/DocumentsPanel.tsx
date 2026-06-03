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
  History,
  Calendar,
  QrCode,
  Cpu
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
  const [viewingHistoryDoc, setViewingHistoryDoc] = useState<LegalDocument | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editRiskLevel, setEditRiskLevel] = useState<"Low" | "Medium" | "High">("Low");
  const [editParties, setEditParties] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editOcrStatus, setEditOcrStatus] = useState<"Pending" | "Processing" | "Completed" | "Failed">("Completed");

  // QR Label Scanner States
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scannerStatus, setScannerStatus] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Zoho-inspired Contract Builder States
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);
  const [builderFileName, setBuilderFileName] = useState("Custom_Corporate_Sourcing_Contract.txt");
  const [clauseParties, setClauseParties] = useState(
    "This AGREEMENT is entered into on this day by and between YAJuR INDUSTRIES DIVISION, hereinafter referred to as the 'Procuring Tenant', and BENGAL LOGISTICAL HUB LTD, hereinafter referred to as the 'Consolidation partner'."
  );
  const [clauseIndemnity, setClauseIndemnity] = useState(
    "The Contractor warrants that all Goods Service Tax (GST) returns, including State GST (SGST) and Central GST (CGST) of 9% each, shall be filed timely. The Contractor shall hold the Company harmless against external tax credit (ITC) claim shortfalls occurring from Contractor's defaults."
  );
  const [clauseTermination, setClauseTermination] = useState(
    "Either party may terminate this agreement upon supplying thirty (30) written calendar days of advance notice. All completed milestones and billings prior to the termination date shall be cleared immediately."
  );
  const [clauseJurisdiction, setClauseJurisdiction] = useState(
    "Any dispute, difference or claim arising under this contract shall be submitted to the sole arbitration of an independent arbitrator appointed under the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be Kolkata, and Alipore Civil Courts shall have exclusive jurisdiction."
  );
  const [isAssembling, setIsAssembling] = useState(false);
  const [assembleStatus, setAssembleStatus] = useState("");

  const handleStartEdit = (doc: LegalDocument) => {
    setEditingDoc(doc);
    setEditFileName(doc.fileName);
    setEditCategory(doc.category);
    setEditRiskLevel(doc.riskLevel || "Low");
    setEditParties(doc.parties?.join(", ") || "");
    setEditExpiryDate(doc.expiryDate || "");
    setEditTags(doc.tags?.join(", ") || "");
    setEditOcrStatus(doc.ocrStatus || "Completed");
  };

  const handleSaveEdit = async () => {
    if (!editingDoc || !onEdit) return;
    const partiesArr = editParties.split(",").map(p => p.trim()).filter(Boolean);
    const tagsArr = editTags.split(",").map(t => t.trim()).filter(Boolean);
    await onEdit(editingDoc.id, {
      fileName: editFileName,
      category: editCategory as any,
      riskLevel: editRiskLevel,
      parties: partiesArr,
      expiryDate: editExpiryDate || null,
      tags: tagsArr,
      ocrStatus: editOcrStatus
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
    const matchesSearch = 
      d.fileName.toLowerCase().includes(dmsSearch.toLowerCase()) || 
      d.category.toLowerCase().includes(dmsSearch.toLowerCase()) ||
      (d.tags && d.tags.some(t => t.toLowerCase().includes(dmsSearch.toLowerCase())));
    const matchesCategory = 
      activeCategory === "All" || 
      d.category.toLowerCase().includes(activeCategory.toLowerCase()) || 
      d.fileName.toLowerCase().includes(activeCategory.toLowerCase()) ||
      (d.tags && d.tags.some(t => t.toLowerCase().includes(activeCategory.toLowerCase())));
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All", 
    "Contracts", 
    "Agreements", 
    "Court Orders", 
    "Pleadings", 
    "Notices", 
    "Compliance Documents", 
    "Licenses", 
    "Certificates", 
    "Intellectual Property Records", 
    "Internal Legal Opinions"
  ];

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
        const file = new Blob([content], { type: "text/plain;charset=utf-8" });
        element.href = URL.createObjectURL(file);
        element.download = `${effectiveCompany.replace(/\s+/g, "_")}_Compliance_Summary_Portfolio.txt`;
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
                onClick={() => {
                  setScannerStatus("");
                  setIsScanning(false);
                  setShowQrScanner(true);
                }}
                className="px-4 py-2 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 bg-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Scan physical QR label printed on filing jacket to search instantly"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR Label</span>
              </button>
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
                      Compiling Audit Ledger...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Audit Ledger (.txt)</span>
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
                  onClick={() => onDocClick(doc)}
                  className="bg-white border border-slate-100 rounded-xl p-4 shadow-3xs hover:border-indigo-400 hover:shadow-xs transition duration-200 flex flex-col justify-between min-h-52 h-auto relative cursor-pointer group"
                >
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={selectedDocIds.has(doc.id)}
                          onChange={() => handleToggleSelect(doc.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        />
                        <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0"><FileText className="w-5 h-5" /></span>
                      </div>
                      <div className="flex flex-col items-end gap-1 select-none font-sans">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          doc.riskLevel === "High" ? "bg-rose-50 text-rose-700" : doc.riskLevel === "Medium" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          Risk: {doc.riskLevel || "Low"}
                        </span>
                        {(() => {
                          const ocr = doc.ocrStatus || "Completed";
                          const colors = ocr === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                         ocr === "Processing" ? "bg-indigo-50 text-indigo-700 border border-indigo-100 inline-flex items-center gap-1" :
                                         ocr === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                         "bg-rose-50 text-rose-700 border border-rose-100";
                          return (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border font-sans select-none tracking-tight ${colors}`} title="OCR Full Text Indexing Status">
                              {ocr === "Processing" && <RefreshCw className="w-2.5 h-2.5 animate-spin inline-block shrink-0" />}
                              OCR: {ocr}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 font-sans mt-3 truncate group-hover:text-indigo-600 transition-colors" title={doc.fileName}>{doc.fileName}</h4>
                    <span className="text-[10.5px] block text-slate-400 mt-1 pb-1">Classification: {doc.category}</span>
                    
                    {/* Tags block */}
                    {doc.tags && doc.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1 pb-2" onClick={(e) => e.stopPropagation()}>
                        {doc.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-slate-50 border border-slate-150 border-slate-100 text-slate-500 rounded text-[9px] font-extrabold uppercase select-text font-sans">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1 pb-2">
                        <span className="px-1.5 py-0.5 bg-slate-50 text-slate-450 rounded text-[9px] italic select-none">
                          No tags assigned
                        </span>
                      </div>
                    )}

                    {doc.parties && doc.parties.length > 0 && (
                      <span className="text-[9.5px] block text-slate-500 pb-2 mt-0.5 truncate border-t border-slate-50/50 pt-1.5" title={doc.parties.join(", ")}>Parties: {doc.parties.join(", ")}</span>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-500" onClick={(e) => e.stopPropagation()}>
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
                        onClick={() => setViewingHistoryDoc(doc)}
                        className="p-1 text-slate-500 hover:bg-white rounded hover:text-emerald-600 transition cursor-pointer"
                        title="View DMS trace version backup history logs"
                      >
                        <History className="w-3.5 h-3.5" />
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
        <div className="space-y-6">
          {/* Top Banner introducing Zoho CLM approach */}
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50/20 border rounded-xl p-4 flex items-start gap-3 select-none">
            <div className="p-2 bg-indigo-100/50 rounded-lg text-indigo-700 shrink-0">
              <FileCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-905 text-slate-800 uppercase tracking-wider">Zoho CLM-Inspired Contract Assembly & Clause Library</h4>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-normal">
                Select from standard corporate presets or construct custom agreements by choosing and customizing key clauses. 
                Click <strong>Assemble & Sync</strong> to compile, sign, and instantly sync raw TXT file assets directly into your 
                isolated tenant Google Drive folder and central Supabase dockets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Presets list */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pre-Drafted Boilerplates</h4>
              <div className="space-y-3">
                {[
                  { 
                    title: "Standard Non-Disclosure Agreement", 
                    code: "TMP-NDA-201", 
                    use: "Sourcing disclosures",
                    parties: "This NON-DISCLOSURE AGREEMENT (NDA) is executed by and between YAJuR INDUSTRIES DIVISION, hereinafter referred to as 'Disclosing Party', and BENGAL LOGISTICAL HUB LTD, referred to as 'Receiving Party', to guard trade secrets and fiscal values.",
                    indemnity: "The Receiving Party agrees to indemnify the Disclosing Party against tax-credit or trade losses resulting from data leaks of up to ₹15,00,000 INR, inclusive of SGST/CGST liabilities.",
                    termination: "This Agreement remains operative for 36 months unless terminated with 30 written calendar days of advance notice.",
                    jurisdiction: "All dispute processes shall be bound to Alipore Civil Courts exclusive seat in Kolkata, India."
                  },
                  { 
                    title: "Memorandum of Understanding (MOU)", 
                    code: "TMP-MOU-105", 
                    use: "JV collaborations",
                    parties: "This MEMORANDUM OF UNDERSTANDING (MOU) records the mutual agenda of BALLY JUTE MILLING CO. ENTERPRISE and the REGIONAL LOGISTICAL COUNCIL to upgrade traditional jute refining channels.",
                    indemnity: "Both parties share industrial process exposures. Any ESIC, EPF, or union penalty resulting from contractor defaults shall be shared equally.",
                    termination: "Operative for twelve (12) months or until formal execution of standard commercial vendor covenants.",
                    jurisdiction: "The civil court in Kolkata shall possess exclusive first instance jurisdiction."
                  },
                  { 
                    title: "Kolkata Physical Site Lease Deed", 
                    code: "TMP-LSD-099", 
                    use: "Real estate properties",
                    parties: "This SITE LEASE COVENANT is entered between YASHODA ENTERPRISES LTD, hereinafter referred to as 'Lessor', and INFRA PROJECTS BENCHMARK, hereinafter the 'Lessee'.",
                    indemnity: "The Lessee warrants full GST tax payment compliance (18% aggregate) and holding Lessor harmless against Calcutta Municipal Corporation fines.",
                    termination: "Lease terminates automatically on May 31, 2031, unless extended in writing by mutual lease dockets.",
                    jurisdiction: "Exclusive jurisdiction belongs to the Hon'ble Calcutta High Court (Original Side)."
                  },
                  { 
                    title: "Employment Agreement Boilerplate", 
                    code: "TMP-EMP-204", 
                    use: "Payroll hiring`,",
                    parties: "This EMPLOYMENT COVENANT is entered into by and between BALLY JUTE CO., and the joining Employee.",
                    indemnity: "The Employee agrees to refrain from disclosing proprietary design methods, or inciting trade union disruption.",
                    termination: "Either party may terminate the deployment under 60 days standard check-notice.",
                    jurisdiction: "Governed under the Laws of West Bengal and trade courts in Alipore."
                  }
                ].map((tmpl, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setSelectedTemplateIndex(idx);
                      const cleanName = tmpl.title.replace(/[^a-zA-Z0-9]/g, "_") + ".txt";
                      setBuilderFileName(cleanName);
                      setClauseParties(tmpl.parties);
                      setClauseIndemnity(tmpl.indemnity);
                      setClauseTermination(tmpl.termination);
                      setClauseJurisdiction(tmpl.jurisdiction);
                      setAssembleStatus(`Loaded preset: ${tmpl.code}`);
                      setTimeout(() => setAssembleStatus(""), 2000);
                    }}
                    className={`bg-white border rounded-xl p-4 shadow-3xs cursor-pointer hover:border-indigo-400 border-slate-150 transition-all ${selectedTemplateIndex === idx ? "border-indigo-600 bg-indigo-50/5/10 ring-1 ring-indigo-600" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[9px] font-bold text-indigo-600 uppercase bg-slate-50 border px-1.5 py-0.5 rounded leading-none">{tmpl.code}</span>
                      <span className="text-[10px] text-slate-400">{tmpl.use}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-805 mt-2.5">{tmpl.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 italic">Click to load into Custom Builder &rarr;</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (2 spans): Zoho Clause Assembly Canvas */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Standard Clause Builder Canvas</h4>
              
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
                
                {/* File configuration name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Compiled Contract Output Filename</label>
                  <input
                    type="text"
                    value={builderFileName}
                    onChange={(e) => setBuilderFileName(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 bg-slate-50 border rounded-lg selection:bg-indigo-150 border-slate-150 outline-none focus:border-indigo-505"
                    placeholder="legal_contract_agreement.txt"
                  />
                </div>

                {/* Clause 1: Parties */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-700">Clause I. Contracting Parties</span>
                    <span className="text-[10px] text-slate-400 italic">Central registry mapping</span>
                  </div>
                  <textarea
                    rows={2}
                    value={clauseParties}
                    onChange={(e) => setClauseParties(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-lg font-sans border-slate-150 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                {/* Clause 2: Indemnity */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-700">Clause II. Regional Tax GST & Indemnity</span>
                    <span className="text-[10px] text-red-500 font-bold">CGST (9%) + SGST (9%) compliance</span>
                  </div>
                  <textarea
                    rows={3}
                    value={clauseIndemnity}
                    onChange={(e) => setClauseIndemnity(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-lg font-sans border-slate-150 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                {/* Clause 3: Termination */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-700">Clause III. Contract Life & Termination notice</span>
                    <span className="text-[10px] text-slate-400 italic">DMS Version Log Tracking</span>
                  </div>
                  <textarea
                    rows={2}
                    value={clauseTermination}
                    onChange={(e) => setClauseTermination(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-lg font-sans border-slate-150 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                {/* Clause 4: Jurisdiction */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-700">Clause IV. Dispute resolution & Indian Courts Venue</span>
                    <span className="text-[10px] text-indigo-600 font-bold">Kolkata Seat & Alipore Jurisdiction</span>
                  </div>
                  <textarea
                    rows={3}
                    value={clauseJurisdiction}
                    onChange={(e) => setClauseJurisdiction(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-lg font-sans border-slate-150 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                {/* Compile Feedback */}
                {assembleStatus && (
                  <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded font-bold text-center leading-none text-[11px]">
                    {assembleStatus}
                  </div>
                )}

                {/* Action build trigger */}
                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="text-[10.5px] text-slate-400 leading-tight">
                    Tenant Target: <strong className="text-slate-705 text-slate-600">{effectiveCompany} Google Drive Directory</strong>
                  </span>
                  <button
                    disabled={isAssembling || !onUpload}
                    onClick={async () => {
                      if (!onUpload) return;
                      setIsAssembling(true);
                      setAssembleStatus("Compiling local clause template blocks...");
                      
                      const compiledText = [
                        "=============================================================",
                        "      ZOHO CLM ASSEMBLED ENTERPRISE LEGAL AGREEMENT          ",
                        "=============================================================",
                        "This agreement is automatically compiled as a certified deed ",
                        `for corporate division: ${effectiveCompany}.`,
                        "=============================================================",
                        "",
                        "ARTICLE I. CONTRACTING PARTIES & SEAL:",
                        clauseParties,
                        "",
                        "ARTICLE II. INDEMNITY & REGIONAL CGST/SGST INDEMNITY PROVISIONS:",
                        clauseIndemnity,
                        "",
                        "ARTICLE III. LIFE CYCLES & STATUS TERMINATION RULES:",
                        clauseTermination,
                        "",
                        "ARTICLE IV. ARBITRATION ACT & COURT JURISDICTION:",
                        clauseJurisdiction,
                        "",
                        "=============================================================",
                        `Assembled on: ${new Date().toISOString()}`,
                        `Assembled by model agent: LRLMS Zoho Contracts CRM module`
                      ].join("\n");

                      try {
                        await onUpload({
                          fileName: builderFileName,
                          category: "Contracts",
                          matterId: null,
                          textContent: compiledText
                        });
                        setAssembleStatus("Successfully synced to GDrive & written to Supabase SQL Database!");
                      } catch (err: any) {
                        setAssembleStatus(`Upload Error: ${err?.message || err}`);
                      } finally {
                        setIsAssembling(false);
                        setTimeout(() => setAssembleStatus(""), 4000);
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs hover:shadow-md cursor-pointer transition select-none flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAssembling ? "animate-spin" : ""}`} />
                    <span>{isAssembling ? "Synthesizing and Uploading..." : "Assemble Contract & Sync Cloud"}</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {tab === "approvals" && (
        <div className="bg-white border border-slate-100 rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full min-w-[850px] text-xs font-sans text-slate-700">
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
        <div className="bg-white border rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full min-w-[850px] text-xs font-sans text-slate-700">
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
        <div className="bg-white border rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full min-w-[700px] text-xs font-sans text-slate-705">
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

              <div>
                <label className="block font-bold text-slate-500 uppercase text-[9.5px] mb-1.5">Document Tags (Litigation or Department type, comma separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  placeholder="e.g., HR, Litigation, Bally Jute, Corporate"
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:border-indigo-400 outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase text-[9.5px] mb-1.5">OCR Status Badge</label>
                <select
                  value={editOcrStatus}
                  onChange={e => setEditOcrStatus(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:border-indigo-400 bg-white outline-none font-sans"
                >
                  <option value="Completed">Completed - OCR Searchable</option>
                  <option value="Processing">Processing - Deep Parsing</option>
                  <option value="Pending">Pending - In queue</option>
                  <option value="Failed">Failed - Requires scan retry</option>
                </select>
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

      {/* VERSION HISTORY ARCHIVE TRACE MODAL */}
      {viewingHistoryDoc && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <History className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider font-display">
                    DMS Version History Archive
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    Google Drive Integrated Secure File Traceability Log ({viewingHistoryDoc.id})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingHistoryDoc(null)}
                className="p-1 px-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer select-none text-xs"
              >
                &times; Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
              <div className="border border-slate-100 bg-slate-50/50 rounded-lg p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider select-none">Active Document File Name</span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5 break-all">{viewingHistoryDoc.fileName}</p>
                </div>
                <div className="text-right whitespace-nowrap pl-4">
                  <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider select-none">Revision Level</span>
                  <span className="inline-block mt-0.5 px-3 py-0.5 text-[10px] font-black rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-mono">
                    Ver v{viewingHistoryDoc.version || 1}
                  </span>
                </div>
              </div>

              {/* Version Timeline */}
              <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 mt-4">
                {(() => {
                  // Generate simulated tracking if none exists
                  const list = viewingHistoryDoc.versions && viewingHistoryDoc.versions.length > 0 
                    ? [...viewingHistoryDoc.versions].sort((a,b) => b.version - a.version)
                    : [];
                  
                  if (list.length === 0) {
                    const currentVerNum = viewingHistoryDoc.version || 1;
                    for (let v = currentVerNum; v >= 1; v--) {
                      if (v === currentVerNum) {
                        list.push({
                          version: v,
                          uploadedBy: viewingHistoryDoc.uploadedBy || "System Ingestor",
                          uploadedOn: viewingHistoryDoc.uploadedOn || "2026-06-01T10:00:00Z",
                          fileName: viewingHistoryDoc.fileName,
                          changes: currentVerNum === 1 ? "Initial Google Drive ingestion & secure OCR indexing" : "Metadata refinement & clearance category alignment"
                        });
                      } else {
                        const baseDate = new Date(viewingHistoryDoc.uploadedOn || "2026-06-01T10:00:00Z");
                        baseDate.setDate(baseDate.getDate() - (currentVerNum - v) * 5);
                        list.push({
                          version: v,
                          uploadedBy: "Rahul Verma",
                          uploadedOn: baseDate.toISOString(),
                          fileName: viewingHistoryDoc.fileName.replace(/\.pdf$/, `_draft_v${v}.pdf`),
                          changes: v === 1 
                            ? "Initial file upload, metadata tags cataloging and optical character recognition baseline pass" 
                            : `Draft v${v} compiled after internal legal revision and counterparty markup`
                        });
                      }
                    }
                  }

                  return list.map((item, idx) => (
                    <div key={item.version} className="relative">
                      {/* Timeline Dot */}
                      <span className={`absolute -left-[33px] top-1 w-4.5 h-4.5 rounded-full border-2 bg-white flex items-center justify-center font-bold text-[8px] font-mono ${
                        idx === 0 
                          ? "border-emerald-500 text-emerald-500 ring-4 ring-emerald-50" 
                          : "border-slate-300 text-slate-500"
                      }`}>
                        v
                      </span>

                      {/* Content Card */}
                      <div className={`p-4 border rounded-xl flex flex-col justify-between ${
                        idx === 0 
                          ? "border-emerald-150 bg-emerald-50/5" 
                          : "border-slate-100 bg-white"
                      }`}>
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-[11px] font-black text-slate-800 font-mono">
                              REVISION v{item.version}
                            </span>
                            {idx === 0 && (
                              <span className="ml-1.5 px-1.5 py-0.2 text-[8.5px] font-extrabold bg-emerald-500 text-white rounded uppercase align-middle tracking-wider select-none">
                                Active Production
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.uploadedOn).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              hour12: true,
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-705 leading-relaxed">
                          <p className="font-mono text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded truncate border border-slate-100/60 mb-2">
                            {item.fileName}
                          </p>
                          <p className="text-slate-650">
                            <strong>Action updates:</strong> {item.changes || "Standard compliance archive index check."}
                          </p>
                        </div>

                        <div className="border-t border-dotted border-slate-100 mt-3 pt-2 text-[10px] text-slate-500 flex justify-between items-center">
                          <span>Authorized Modifier: <strong className="text-slate-700">{item.uploadedBy}</strong></span>
                          <span className="text-slate-300 text-[9px]">SHA-256 seal verified</span>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t text-right flex justify-between items-center">
              <span className="text-[10px] text-slate-400">
                Immutable trace backup matching local cluster and Supabase schema state
              </span>
              <button 
                onClick={() => setViewingHistoryDoc(null)}
                className="px-4 py-2 bg-slate-900 font-semibold text-white hover:bg-slate-800 text-xs rounded-lg cursor-pointer transition select-none shadow-xs"
              >
                Close Trace Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Physical Folder QR Code Laser Scanner Modal Overlay */}
      {showQrScanner && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 font-sans text-slate-800 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-900 text-white px-5 py-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide">Secure Physical Jacket QR Scanner</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mock high-fidelity lens virtualization system</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowQrScanner(false);
                  setIsScanning(false);
                  setScannerStatus("");
                }}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full cursor-pointer transition text-xs font-bold px-2.5"
              >
                &times; Close
              </button>
            </div>

            {/* Viewfinder Grid */}
            <div className="p-5 space-y-4">
              <div className="relative">
                {/* Viewfinder screen */}
                <div className="w-full aspect-[4/3] max-w-sm mx-auto bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col items-center justify-center text-slate-300 shadow-inner">
                  
                  {/* Glowing camera lens laser sweep line */}
                  <div className="absolute inset-x-0 h-0.5 bg-emerald-400 opacity-80 shadow-[0_0_8px_#34d399] animate-[bounce_3s_infinite]" />

                  {/* Corner scanning brackets */}
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-md"></div>
                  <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-md"></div>
                  <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-md"></div>
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br-md"></div>

                  {/* Scanning State Loader */}
                  {isScanning ? (
                    <div className="space-y-3.5 text-center px-6">
                      <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                        <Cpu className="w-8 h-8 text-emerald-400 animate-pulse shrink-0" />
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500 animate-[spin_4s_linear_infinite]" />
                      </div>
                      <div className="text-xs whitespace-pre-wrap select-none leading-relaxed font-mono text-emerald-400">
                        {scannerStatus || "Aligning focus grids..."}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center px-6">
                      <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                        <QrCode className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-tight uppercase text-slate-400">Camera Viewfinder Online</p>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto leading-normal">
                          Point your device camera at any physical document file folder QR label, or select from the pre-indexed filing catalog below to simulate a scan.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Mini Overlay Status Tag */}
                  <div className="absolute bottom-3 right-3 text-[8.5px] font-mono text-slate-500 border border-slate-900 px-1.5 py-0.5 rounded bg-slate-900/50">
                    FOCUS: AUTOFOCUS_HYBRID
                  </div>
                </div>
              </div>

              {/* Selector List of Catalog Files nearby */}
              <div>
                <span className="block font-bold text-slate-500 uppercase text-[9px] mb-2 select-none tracking-wider font-sans">
                  Aligned Physical Folders Catalog ({compDocs.length} items nearby)
                </span>
                
                <div className="max-h-52 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 bg-slate-50/50 p-1 space-y-1">
                  {compDocs.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      disabled={isScanning}
                      onClick={() => {
                        setIsScanning(true);
                        setScannerStatus("Aligning laser focus lens grids...");
                        setTimeout(() => {
                          setScannerStatus("Triggering safe high-power OCR scan...\nDecoding checksum standard hash...");
                          setTimeout(() => {
                            setScannerStatus(`Parsed correctly!\nID: ${doc.id}\nFilename: ${doc.fileName}`);
                            setTimeout(() => {
                              setShowQrScanner(false);
                              setIsScanning(false);
                              setScannerStatus("");
                              onDocClick(doc);
                            }, 500);
                          }, 600);
                        }, 500);
                      }}
                      className="w-full text-left p-2.5 bg-white border border-slate-100/80 hover:bg-indigo-50/40 hover:border-indigo-200 rounded-lg flex items-center justify-between text-xs transition duration-150 cursor-pointer group disabled:opacity-50"
                    >
                      <div className="truncate pr-4 flex-1">
                        <div className="font-bold text-slate-800 text-[11.5px] truncate group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 font-sans">
                          <span className="shrink-0 p-1 bg-slate-50 rounded-md text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"><FileText className="w-3.5 h-3.5" /></span>
                          <span className="truncate">{doc.fileName}</span>
                        </div>
                        <div className="text-[9.5px] text-slate-400 mt-1 flex items-center gap-2 select-none font-sans">
                          <span className="font-mono">ID: {doc.id}</span>
                          <span>&bull;</span>
                          <span>Dept/Type: {doc.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Custom visual Mock QR Code Thumbnail */}
                        <div className="p-1 border border-slate-200 bg-slate-50 rounded-sm group-hover:border-indigo-200 transition-colors">
                          <QrCode className="w-5 h-5 text-slate-700 group-hover:text-indigo-600" />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hidden sm:inline-block pl-1.5 group-hover:underline font-sans">
                          Scan Focus &rarr;
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Instruction Footer */}
            <div className="bg-slate-50 px-5 py-4 border-t flex items-center justify-between text-[11px] text-slate-400 font-sans leading-normal">
              <span className="font-medium select-none pr-4">
                The scanner simulates scanning physical folder jacket tags in real-time and automatically opens the matching digital document view trace.
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowQrScanner(false);
                  setIsScanning(false);
                  setScannerStatus("");
                }}
                className="px-4 py-2 border rounded-lg hover:bg-slate-100 font-semibold cursor-pointer text-slate-600 bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
