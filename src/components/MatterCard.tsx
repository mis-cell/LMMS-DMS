import React, { useState } from "react";
import { 
  Briefcase, 
  User, 
  ExternalLink, 
  Calendar, 
  Plus, 
  DollarSign, 
  Check, 
  MapPin, 
  ChevronRight, 
  FolderPlus,
  IndianRupee,
  Activity
} from "lucide-react";
import { motion } from "motion/react";
import { Matter, LegalDocument, MatterStatus, Hearing } from "../types";

interface MatterCardProps {
  key?: string;
  matter: Matter;
  documents: LegalDocument[];
  hearings: Hearing[];
  onUpdateStatus: (id: string, nextStatus: MatterStatus) => void;
  onScheduleHearing: (matterId: string, hearingDate: string, court: string, remarks: string) => void;
  onAddDocumentClick: (matterId: string) => void;
}

const STAGES: MatterStatus[] = ["Opened", "Under Review", "Filed", "Hearing", "Settlement", "Closed"];

export default function MatterCard({ 
  matter, 
  documents, 
  hearings,
  onUpdateStatus, 
  onScheduleHearing,
  onAddDocumentClick
}: MatterCardProps) {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [hearingDate, setHearingDate] = useState("");
  const [court, setCourt] = useState("");
  const [remarks, setRemarks] = useState("");

  const linkedDocs = documents.filter((doc) => doc.matterId === matter.id);
  const linkedHearings = hearings.filter((h) => h.matterId === matter.id);

  const handleSubmitHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hearingDate) return;
    onScheduleHearing(matter.id, hearingDate, court || matter.courtOrAuthority, remarks);
    setHearingDate("");
    setCourt("");
    setRemarks("");
    setShowScheduleForm(false);
  };

  // Stage indicator styling mapper
  const getStageColor = (status: MatterStatus, current: MatterStatus) => {
    const statusIdx = STAGES.indexOf(status);
    const currentIdx = STAGES.indexOf(current);

    if (currentIdx === statusIdx) {
      return "bg-indigo-600 text-white font-bold ring-4 ring-indigo-100";
    }
    if (statusIdx < currentIdx) {
      return "bg-emerald-500 text-white font-medium";
    }
    return "bg-slate-100 text-slate-400 border border-slate-200";
  };

  return (
    <div 
      id={`matter-card-${matter.id}`}
      className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow duration-200 text-slate-800"
    >
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              {matter.id}
            </span>
            <span className="text-xs font-medium text-indigo-700 px-2 py-0.5 rounded bg-indigo-50">
              {matter.type}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border">
              {matter.company}
            </span>
          </div>
          <h3 className="text-lg font-bold font-display text-slate-900 mt-1.5 leading-snug">
            {matter.title}
          </h3>
        </div>

        <div className="text-right self-start sm:self-center">
          <span className="text-xs text-slate-400 block font-display uppercase tracking-wider">Litigation Exposure</span>
          <span className="text-lg font-bold text-slate-900 font-display flex items-center justify-end">
            <IndianRupee className="h-4 w-4 shrink-0 text-slate-500" />
            {matter.value.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mt-4 leading-relaxed font-sans">
        {matter.description}
      </p>

      {/* Corporate Metadata Bento Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 mt-5 p-4 bg-slate-50 rounded-lg text-xs leading-relaxed">
        <div className="flex items-start gap-2">
          <Briefcase className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
          <div>
            <span className="text-slate-400 block">Department Unit</span>
            <span className="font-semibold text-slate-700">{matter.department}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <User className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
          <div>
            <span className="text-slate-400 block">Opponency Litigant</span>
            <span className="font-semibold text-slate-700">{matter.opponentParty}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <User className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
          <div>
            <span className="text-slate-400 block">Advising External Counsel</span>
            <span className="font-semibold text-slate-700">{matter.externalCounsel}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
          <div>
            <span className="text-slate-400 block">Authorized Court Forum</span>
            <span className="font-semibold text-slate-700">{matter.courtOrAuthority}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
          <div>
            <span className="text-slate-400 block">Filing Authority Date</span>
            <span className="font-semibold text-slate-700">{matter.filingDate}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Activity className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
          <div>
            <span className="text-slate-400 block">Next Scheduled hearing</span>
            <span className="font-semibold text-slate-700 text-indigo-700">
              {matter.nextHearingDate || "None Scheduled"}
            </span>
          </div>
        </div>
      </div>

      {/* Case Stage Timeline Workflow Tracking */}
      <div className="mt-8">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Case Lifecycle Status Transition Checklist
        </h4>
        <div className="flex items-center justify-between overflow-x-auto py-2.5 px-1 gap-2 no-scrollbar">
          {STAGES.map((stg, index) => (
            <button
              key={stg}
              id={`transition-stage-${matter.id}-${stg}`}
              onClick={() => onUpdateStatus(matter.id, stg)}
              className="flex flex-col items-center flex-1 min-w-[70px] text-center focus:outline-none group cursor-pointer relative pb-2"
            >
              <motion.div
                layout
                animate={{
                  scale: matter.status === stg ? 1.15 : 1,
                  rotate: STAGES.indexOf(matter.status) > index ? 360 : 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 18
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors duration-300 ${getStageColor(
                  stg,
                  matter.status
                )}`}
              >
                {STAGES.indexOf(matter.status) > index ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>
              <span
                className={`text-[10px] mt-1.5 font-medium tracking-tight whitespace-nowrap ${
                  matter.status === stg
                    ? "text-indigo-600 font-bold"
                    : "text-slate-500 group-hover:text-slate-700"
                }`}
              >
                {stg}
              </span>

              {matter.status === stg && (
                <motion.div
                  layoutId={`active-stage-indicator-${matter.id}`}
                  className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Document links & Google Drive references */}
      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Linked Documents ({linkedDocs.length})
            </h4>
            <button
              id={`add-doc-trigger-${matter.id}`}
              onClick={() => onAddDocumentClick(matter.id)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5 cursor-pointer"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              Upload & Sync
            </button>
          </div>

          {linkedDocs.length === 0 ? (
            <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed text-center">
              No files archived yet. Click 'Upload & Sync' to connect PDFs or contract copy.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {linkedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <span className="block text-xs font-medium text-slate-700 truncate" title={doc.fileName}>
                      {doc.fileName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      GDrive File ID: <span className="font-mono text-slate-500">{doc.googleDriveFileId}</span>
                    </span>
                  </div>
                  <a
                    href={doc.googleDriveLink}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white shrink-0 shadow-2xs hover:shadow-2xs transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hearing Registry Calendar ({linkedHearings.length})
            </h4>
            <button
              id={`trigger-hearing-form-${matter.id}`}
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Schedule Event
            </button>
          </div>

          {showScheduleForm ? (
            <form onSubmit={handleSubmitHearing} className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase">Hearing Date</label>
                  <input
                    type="date"
                    required
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase">Authorized Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Calcutta HC"
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase">Preparation / Counsel Remarks</label>
                <input
                  type="text"
                  placeholder="Standing details or witness tasks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="text-[10px] bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded"
                >
                  Cancel
                </button>
                <button
                  id={`submit-hearing-${matter.id}`}
                  type="submit"
                  className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded font-medium"
                >
                  Submit
                </button>
              </div>
            </form>
          ) : linkedHearings.length === 0 ? (
            <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed text-center">
              No historical or upcoming hearings scheduled in docket.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {linkedHearings.map((hrg) => (
                <div
                  key={hrg.id}
                  className="p-2.5 bg-indigo-50/55 rounded-lg border border-indigo-100/40 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {hrg.hearingDate}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      hrg.status === "Scheduled" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"
                    }`}>
                      {hrg.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Forum: <span className="font-semibold">{hrg.court}</span>
                  </p>
                  {hrg.remarks && (
                    <p className="text-[11px] font-mono text-slate-500 italic mt-0.5">
                      "{hrg.remarks}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
