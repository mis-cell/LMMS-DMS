import React from "react";
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
  Gavel
} from "lucide-react";
import { Matter, LegalDocument, LegalNotice, Hearing } from "../types";

interface DashboardPanelProps {
  matters: Matter[];
  documents: LegalDocument[];
  notices: LegalNotice[];
  hearings: Hearing[];
  effectiveCompany: string;
  onTabChange: (tab: string) => void;
  theme: any;
}

export default function DashboardPanel({
  matters,
  documents,
  notices,
  hearings,
  effectiveCompany,
  onTabChange,
  theme
}: DashboardPanelProps) {
  // Filter core items belonging to selected company
  const companyMatters = matters.filter(m => effectiveCompany === "Group" || m.company === effectiveCompany);
  const companyDocuments = documents.filter(d => effectiveCompany === "Group" || d.company === effectiveCompany);
  const companyNotices = notices.filter(n => effectiveCompany === "Group" || n.company === effectiveCompany);
  const companyHearings = hearings.filter(h => effectiveCompany === "Group" || h.company === effectiveCompany);

  // Computed live metrics
  const activeMattersCount = companyMatters.filter(m => m.status !== "Closed").length;
  const pendingApprovalsCount = companyDocuments.length > 0 ? Math.ceil(companyDocuments.length * 0.15) : 4;
  const upcomingHearingsCount = companyHearings.filter(h => h.status === "Scheduled").length;
  
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
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs hover:border-indigo-100 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Matters</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Briefcase className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display" style={{ color: theme.primary }}>{activeMattersCount}</h3>
            <span className="text-[11px] text-slate-400 block mt-1">↑ 3 initialized this month</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs hover:border-indigo-100 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pending Approvals</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display text-amber-600">{pendingApprovalsCount} Documents</h3>
            <span className="text-[11px] text-amber-600 font-semibold block mt-1">4 core files need signing</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs hover:border-indigo-100 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Upcoming Hearings</span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-650 text-red-600"><Gavel className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display text-red-650 text-red-600">{upcomingHearingsCount} Docket trials</h3>
            <span className="text-[11px] text-red-650 text-red-500 font-medium block mt-1">Next trial: 08 Jun 2026</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs hover:border-indigo-100 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Legal Spend Ledger</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-display text-emerald-600">₹{formattedExposureLakhs}</h3>
            <span className="text-[11px] text-slate-400 block mt-1">Isolated Corporate Trial Budget</span>
          </div>
        </div>
      </div>

      {/* Activities and Timelines section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activities widget */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold font-display text-slate-900 mb-4 uppercase tracking-wide text-xs">Recent Activity Stream</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">RS</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-850 font-medium font-sans">Contract amended — Bally Jute Supply Agreement</p>
                <span className="text-[10px] text-slate-400 font-sans">Rajan Sharma · 2 hours ago</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">PM</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-850 font-medium font-sans">New litigation registered — Labour Tribunal West Bengal</p>
                <span className="text-[10px] text-slate-400 font-sans">P. Mukherjee · Yesterday, 3:40 PM</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">AP</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-850 font-medium font-sans">Patent renewal reminder logs — Patent IN 312456</p>
                <span className="text-[10px] text-slate-400 font-sans">A. Prasad · 2 days ago</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">SK</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-850 font-medium font-sans">Counsel invoice approved — ₹1,80,000 disbursement ledger</p>
                <span className="text-[10px] text-slate-400 font-sans">S. Kumar · 3 days ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar deadlines widgets */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold font-display text-slate-900 mb-4 uppercase tracking-wide text-xs">Upcoming Hearings & Deadlines</h3>
          <div className="space-y-3.5">
            <div className="border-l-4 border-rose-500 pl-3">
              <h4 className="text-xs font-bold text-slate-900 leading-snug">Calcutta High Court — Written Objections filing</h4>
              <span className="text-[10.5px] text-slate-500 block mt-0.5">8 Days Remaining · <span className="font-semibold text-rose-600">Urgent</span></span>
            </div>
            <div className="border-l-4 border-amber-500 pl-3">
              <h4 className="text-xs font-bold text-slate-900 leading-snug">ESI / PF Monthly Compulsory Audit Challan submission</h4>
              <span className="text-[10.5px] text-slate-500 block mt-0.5">13 Days Remaining · <span className="font-semibold text-amber-600">Pending</span></span>
            </div>
            <div className="border-l-4 border-indigo-500 pl-3">
              <h4 className="text-xs font-bold text-slate-900 leading-snug">Warehouse Lease Agreement Renewal Kolkata Node</h4>
              <span className="text-[10.5px] text-slate-500 block mt-0.5">18 Days Remaining · <span className="font-semibold text-indigo-600">General</span></span>
            </div>
            <div className="border-l-4 border-emerald-500 pl-3">
              <h4 className="text-xs font-bold text-slate-900 leading-snug">Patent Renewal IPO submission — Advanced Sourcing process</h4>
              <span className="text-[10.5px] text-slate-500 block mt-0.5">30 Days Remaining · <span className="font-semibold text-emerald-600">IP</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Splits list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Allocation */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Matters by Allocation</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Contracts ({countContracts})</span>
                <span className="text-slate-400">77%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "77%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Litigation ({countLitigation})</span>
                <span className="text-slate-400">60%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-650 bg-red-600 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Compliance ({countCompliance})</span>
                <span className="text-slate-400">34%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "34%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>IP / Patents ({countIP})</span>
                <span className="text-slate-400">17%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-650 bg-purple-650 bg-purple-500 rounded-full" style={{ width: "17%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Company Group Splits */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Company Split</h3>
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#185FA5] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">Y</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Yajur Industries</span>
                  <span className="text-slate-500">26 Matters</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-[#185FA5] rounded-full" style={{ width: "55%" }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#854F0B] flex items-center justify-center font-bold text-xs shrink-0 border border-amber-100">B</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Bally Jute Co.</span>
                  <span className="text-slate-500">17 Matters</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-[#854F0B] rounded-full" style={{ width: "36%" }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#3B6D11] flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-100">Y</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Yashoda Enterprise</span>
                  <span className="text-slate-500">10 Matters</span>
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
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">DMS Repository</h3>
            <div className="font-sans text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Synced Documents</span>
                <span className="font-bold text-slate-800">1,284 entries</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Pending Approval</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">12 Files</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Archived Files</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">342 Files</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">GDrive Sync Link</span>
                <span className="text-indigo-600 font-bold">Secure Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
