import React, { useState } from "react";
import { 
  FileText, 
  Upload, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  FolderLock,
  ChevronDown,
  BookOpen,
  CheckCircle,
  HelpCircle,
  FolderOpen,
  Download,
  X
} from "lucide-react";
import { LegalDocument, DocCategory, Matter } from "../types";

interface DocumentUploadModalProps {
  onUpload: (payload: {
    fileName: string;
    category: DocCategory;
    matterId: string | null;
    textContent: string;
  }) => Promise<void>;
  matters: Matter[];
  documents: LegalDocument[];
  currentCompany: string;
}

const CATEGORIES: DocCategory[] = [
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

export default function DocumentUploadModal({ onUpload, matters, documents, currentCompany }: DocumentUploadModalProps) {
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState<DocCategory>("Contracts");
  const [linkedMatterId, setLinkedMatterId] = useState<string>("");
  const [typedOcrText, setTypedOcrText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // GDrive folder exploration filter state
  const [gdriveSubfolder, setGdriveSubfolder] = useState<string>("All Folders");
  const [previewDoc, setPreviewDoc] = useState<LegalDocument | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      // Simulate reading a brief draft of content
      setTypedOcrText(`MOCK OCR EXTRACT:\nFile name: ${file.name}\nSize: ${(file.size/1024).toFixed(1)} KB\nMIME Type: ${file.type || "application/pdf"}\nUploaded by user inside safe multi-tenant channel.`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setTypedOcrText(`MOCK OCR EXTRACT:\nFile: ${file.name}\nCaptured on: ${new Date().toLocaleDateString()}\nSize: ${(file.size/1024).toFixed(1)} KB\n- Sourcing provisions\n- Retrospective risk considerations.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    setIsUploading(true);
    try {
      await onUpload({
        fileName,
        category,
        matterId: linkedMatterId || null,
        textContent: typedOcrText || `General record upload of ${fileName} in folder ${category}.`
      });
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setFileName("");
        setLinkedMatterId("");
        setTypedOcrText("");
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const loadPrescriptionTemplate = (type: "agreement" | "gst" | "trademark") => {
    if (type === "agreement") {
      setFileName("Strategic_Raw_Supply_Agreement_Yajur_FY27.txt");
      setCategory("Contracts");
      setTypedOcrText(`RAW JUTE SUPPLY DEED
This Agreement of Sourcing is entered on June 2026 by and between Bally Jute Mills Ltd (Purchaser) and Bengal Jute Traders Co. (Vendor).
1. SCOPE OF SUPPLY: Vendor agrees to deliver 500 Tons of premium grade Tossa Core Jute.
2. DELAY PENALTY CAPS: No non-performance penalties shall be assessed if the delivery delay is under thirty (30) days from target June-end schedules.
3. ARBITRATION: All disputes shall be finally referred to single Arbitrator sitting in Kolkata at the Arbitral chamber of IJMA under Indian Rules.`);
    } else if (type === "gst") {
      setFileName("GST_Assessment_Notice_Input_Tax_Credit_Yajur.txt");
      setCategory("Notices");
      setTypedOcrText(`REGULATORY NOTICE: TAX REVERSAL DEMAND
Assistant Commissioner of State Tax, Sector V Commercial Wing, Kolkata.
REVALUATION ASSESSMENT REPLICATED FOR: Yajur Holdings Private Limited.
Subject: Retrospective Audit Mismatch of CGST Claim. Total Demand: INR 18,50,000 for structural columnar material steel claims. Reversals must be filed with 18% p.a. compound delay penalties.`);
    } else {
      setFileName("Trademarks_Injunction_Exparte_Order_Yashoda.txt");
      setCategory("Court Orders");
      setTypedOcrText(`HON'BLE HIGH COURT OF CALCUTTA (INTELLECTUAL PROPERTY DIVISION)
TM Application suit No 1024 / 2026
Yashoda Brands Private Limited (Petitioner) VS Yashoda Organic Aggregates Private Limited (Respondent)
ORDER: Ex-parte ad-interim injunction granted. Respondent, their directors, agents and associates are hereby strictly restrained from manufacturing, packing, selling or marketing consumer merchandise under the derivative mark or logo of 'Yashoda Organic' until further listings on the next hearing docket.`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-800">
      
      {/* Upload Column */}
      <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-xl shadow-xs">
        <h3 className="text-base font-bold font-display text-slate-900 mb-1 flex items-center gap-1.5">
          <Upload className="h-4 w-4 text-indigo-600" />
          Virtual Document Uploader
        </h3>
        <p className="text-xs text-slate-500 mb-4 font-sans">
          Simulate uploading files into Google Drive and triggering Gemini-assisted AI clause assessments.
        </p>

        {uploadSuccess ? (
          <div className="bg-emerald-50 text-emerald-800 p-5 rounded-lg border border-emerald-100 flex flex-col items-center justify-center text-center py-8">
            <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
            <h4 className="text-sm font-bold">Successfully Synced!</h4>
            <p className="text-xs mt-1">
              File synced with Google Drive. AI extracted contract nodes and updated audit databases.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer relative ${
                dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                id="file-element-uploader"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".txt,.pdf,.doc,.docx"
              />
              <label htmlFor="file-element-uploader" className="cursor-pointer">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <span className="block text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  Select a document
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  or drag and drop TXT, PDF or agreements
                </span>
              </label>

              {fileName && (
                <div className="mt-3 p-2 bg-slate-50 rounded text-xs truncate max-w-full text-slate-700 font-medium">
                  Selected: {fileName}
                </div>
              )}
            </div>

            {/* AI Sandbox Pre-filled Templates */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Load OCR Playground Templates
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  id="template-btn-agreement"
                  onClick={() => loadPrescriptionTemplate("agreement")}
                  className="text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  📄 Jute Agreement
                </button>
                <button
                  type="button"
                  id="template-btn-gst"
                  onClick={() => loadPrescriptionTemplate("gst")}
                  className="text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  📄 GST Reversal Notice
                </button>
                <button
                  type="button"
                  id="template-btn-trademark"
                  onClick={() => loadPrescriptionTemplate("trademark")}
                  className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  📄 Injunction Court Order
                </button>
              </div>
            </div>

            {/* Document details */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Document Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocCategory)}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-white outline-none focus:border-indigo-400 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Link to Matter (Optional)
                </label>
                <select
                  value={linkedMatterId}
                  onChange={(e) => setLinkedMatterId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-white outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="">-- Standalone Record --</option>
                  {matters.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.id}] {m.title.substring(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* OCR Paste Zone */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center justify-between">
                <span>OCR Extract Text (For AI Clause Reader)</span>
                <span className="text-slate-400 normal-case flex items-center gap-0.5 font-normal">
                  <Sparkles className="h-3 w-3 text-indigo-500" />
                  Gemini-processed
                </span>
              </label>
              <textarea
                placeholder="Paste structural clauses, letters, or compliance text here to let Gemini auto-tag risks, analyze liability, and extract party entities."
                value={typedOcrText}
                onChange={(e) => setTypedOcrText(e.target.value)}
                rows={5}
                className="w-full text-xs border border-slate-200 rounded p-2 bg-slate-50 font-mono focus:bg-white focus:border-indigo-400 outline-none leading-relaxed"
              ></textarea>
            </div>

            <button
              id="submit-virtual-upload"
              type="submit"
              disabled={isUploading || !fileName}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Extracting Clauses & GDrive Synced...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Upload & Run AI Risk Analysis
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Directory structure column */}
      <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-xl shadow-xs">
        
        {/* Directory Explorer Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 mb-0.5 flex items-center gap-1.5">
              <FolderLock className="h-4 w-4 text-emerald-600" />
              Secure GDrive Litigation Vault
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Google Drive Cloud File Ledger index for <span className="font-semibold text-slate-700">{currentCompany}</span>.
            </p>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400 font-medium">Folder:</span>
            <select
              value={gdriveSubfolder}
              onChange={(e) => setGdriveSubfolder(e.target.value)}
              className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded px-2 py-1 outline-none font-medium text-slate-700 cursor-pointer"
            >
              <option value="All Folders">All Folders</option>
              <option value="Contracts">Contracts & agreements</option>
              <option value="Court Orders">Court Orders</option>
              <option value="Pleadings">Pleadings</option>
              <option value="Notices">Regulatory notices</option>
              <option value="Internal Legal Opinions">Opinions</option>
            </select>
          </div>
        </div>

        {/* Directory path indicator */}
        <div className="text-[11px] font-mono bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-slate-500 mb-4 flex items-center gap-1 text-wrap">
          <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
          <span>Shared Google Drive / LRLMS / </span>
          <span className="text-slate-800 font-semibold">{currentCompany}</span>
          <span> / </span>
          <span className="text-slate-800 font-semibold">{gdriveSubfolder}</span>
        </div>

        {/* File inventory */}
        <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-2">
          {documents.filter((d) => gdriveSubfolder === "All Folders" || d.category.includes(gdriveSubfolder) || (gdriveSubfolder === "Notices" && d.category === "Notices")).length === 0 ? (
            <div className="p-8 border border-dashed rounded-lg bg-slate-50/50 text-center text-slate-400">
              <FileText className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-semibold">No indexed files in this directory folder node.</p>
              <p className="text-[10px] text-slate-400 mt-1">Upload files using the virtual engine on your left.</p>
            </div>
          ) : (
            documents
              .filter((d) => gdriveSubfolder === "All Folders" || d.category.includes(gdriveSubfolder) || (gdriveSubfolder === "Notices" && d.category === "Notices"))
              .map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-white border border-slate-100 rounded-xl hover:shadow-xs hover:border-slate-200 transition-all text-slate-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                          {doc.category}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                          {doc.id}
                        </span>
                        {doc.riskLevel && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            doc.riskLevel === "High" ? "bg-rose-100 text-rose-800" :
                            doc.riskLevel === "Medium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            AI Risk: {doc.riskLevel}
                          </span>
                        )}
                        {doc.matterId && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-medium">
                            Linked: {doc.matterId}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-2 truncate font-display" title={doc.fileName}>
                        {doc.fileName}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Synced: <span className="font-semibold text-slate-600">{new Date(doc.uploadedOn).toLocaleString()}</span> by <span className="font-semibold text-slate-600">{doc.uploadedBy}</span> (V{doc.version})
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 shrink-0">
                      <a
                        href={doc.googleDriveLink}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-850 bg-slate-50 hover:bg-slate-100 p-2 rounded-lg transition-all border border-slate-200"
                        title="View raw link on external Google Drive"
                      >
                        <ExternalLink className="h-3 w-3" />
                        GDive
                      </a>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        download
                        className="flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-950 bg-indigo-50 hover:bg-indigo-150/60 p-2 rounded-lg transition-all border border-indigo-100"
                        title="Download verified, synced functional dummy text file physically"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition-all border border-emerald-100 cursor-pointer"
                        title="Read direct OCR transcript inline"
                      >
                        <BookOpen className="h-3 w-3" />
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* AI Extracted Clause Risk Assessment card */}
                  {doc.riskSummary && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold mb-1">
                        <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
                        <span>AI Document Risk Analysis & Extracted Parties</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed italic">
                        "{doc.riskSummary}"
                      </p>
                      
                      {doc.parties && doc.parties.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Parties Involved:</span>
                          {doc.parties.map((p) => (
                            <span key={p} className="text-[9px] bg-slate-200/80 font-medium px-2 py-0.5 rounded-full text-slate-700">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}

                      {doc.expiryDate && (
                        <div className="mt-1.5 text-[10px] font-medium text-slate-500 font-mono">
                          Agreement Expiration Target: <span className="text-rose-700 font-semibold">{doc.expiryDate}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Structured Document Viewer Modal Overlay */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-500 text-white p-1.5 rounded">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display leading-none text-white block">
                    {previewDoc.fileName}
                  </h3>
                  <span className="text-[10.5px] font-mono text-slate-400 mt-1 block">
                    System Node Reference: {previewDoc.id}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition cursor-pointer"
                title="Exit Reader Workspace"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] text-slate-800 text-xs">
              
              {/* Core Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wide">Category</span>
                  <span className="font-bold text-slate-850 mt-1 block">{previewDoc.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wide">Owner tenant</span>
                  <span className="font-bold text-slate-850 mt-1 block">{previewDoc.company} Division</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wide">Revision Status</span>
                  <span className="font-bold text-slate-850 mt-1 block">Version {previewDoc.version}.0</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wide">Expiration Target</span>
                  <span className="font-bold text-rose-600 mt-1 block">{previewDoc.expiryDate || "Indefinite Lock"}</span>
                </div>
              </div>

              {/* AI Risk Score banner */}
              {previewDoc.riskSummary && (
                <div className={`p-4 rounded-xl border ${
                  previewDoc.riskLevel === "High" ? "bg-rose-50 border-rose-100 text-rose-900" :
                  previewDoc.riskLevel === "Medium" ? "bg-amber-50 border-amber-100 text-amber-900" :
                  "bg-emerald-50 border-emerald-100 text-emerald-900"
                }`}>
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Sparkles className={`h-4 w-4 ${
                      previewDoc.riskLevel === "High" ? "text-rose-600 animate-pulse" :
                      previewDoc.riskLevel === "Medium" ? "text-amber-600" : "text-emerald-600"
                    }`} />
                    <span>LRLMS Automated Compliance Audit Analytics</span>
                    <span className={`text-[9.5px] px-1.5 py-0.5 rounded ml-auto text-white font-mono font-bold uppercase ${
                      previewDoc.riskLevel === "High" ? "bg-rose-600" :
                      previewDoc.riskLevel === "Medium" ? "bg-amber-600" : "bg-emerald-600"
                    }`}>
                      Risk Category: {previewDoc.riskLevel || "Low"}
                    </span>
                  </div>
                  <p className="text-[11.5px] italic leading-normal">
                    "{previewDoc.riskSummary}"
                  </p>
                  
                  {previewDoc.parties && previewDoc.parties.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-200/50 pt-2.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Parties Identified:</span>
                      {previewDoc.parties.map((entity, i) => (
                        <span key={i} className="text-[10px] bg-white border font-semibold px-2 py-0.5 rounded text-slate-700">
                          {entity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Raw file Transcript Viewer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">
                    Google Drive OCR Text / Structured Clauses
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Encoding: UTF-8 Plaintext
                  </span>
                </div>
                <div className="bg-slate-900 text-slate-100 p-5 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-72 border border-slate-800 shadow-inner">
                  {previewDoc.textContent || `==============================================================================
LRLMS ENTERPRISE CLOUD SYNC FILE ARCHIVE: PORTAL GATEWAY [${previewDoc.company.toUpperCase()}]
==============================================================================

Title: ${previewDoc.fileName}
System Document Registry ID: ${previewDoc.id}
Uploaded On: ${new Date(previewDoc.uploadedOn).toLocaleString()}
Uploaded By Operations Officer: ${previewDoc.uploadedBy}

CLAUSE I. DESCRIPTION & RECORD RETRIEVABILITY
This serves as a simulated transcription backup of files stored securely inside GDrive vault. 
No third-party access is authorized. Material exposures and litigious outcomes are governed under regional tribunal jurisdictions.

CLAUSE II. AI PARSED RISK OVERVIEW
${previewDoc.riskSummary || "No critical threats flagged. Retain original with central records."}`}
                </div>
              </div>

            </div>

            {/* Footer buttons row */}
            <div className="bg-slate-50 p-5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
              <span className="text-[10px] text-slate-400 font-medium">
                Verified File Integrity Checksum: SHA-256 Enabled
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer font-semibold select-none"
                >
                  Close Reader
                </button>
                <a
                  href={`/api/documents/${previewDoc.id}/download`}
                  download
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition flex items-center gap-1 shadow-xs cursor-pointer select-none"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download File
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
