import React, { useState } from "react";
import { 
  Receipt, 
  UserCheck, 
  Contact as ContactIcon, 
  ClipboardList, 
  Search, 
  Plus, 
  IndianRupee, 
  DollarSign, 
  ExternalLink, 
  ArrowUpRight, 
  Send, 
  Check 
} from "lucide-react";

interface FinancePeoplePanelProps {
  tab: string; // "invoices" | "counsels" | "contacts" | "tasks"
  tasks: any[];
  invoices: any[];
  activeUser: any;
  effectiveCompany: string;
  onPayInvoice: (id: string) => void;
  onTaskProgress: (id: string, currentStatus: string) => void;
  onAddTaskClick: () => void;
  onAddCounselClick: () => void;
  onAddContactClick: () => void;
  onAddInvoiceClick: () => void;
}

export default function FinancePeoplePanel({
  tab,
  tasks,
  invoices,
  activeUser,
  effectiveCompany,
  onPayInvoice,
  onTaskProgress,
  onAddTaskClick,
  onAddCounselClick,
  onAddContactClick,
  onAddInvoiceClick
}: FinancePeoplePanelProps) {
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");

  const companyInvoices = invoices.filter(i => effectiveCompany === "Group" || i.company === effectiveCompany);
  const companyTasks = tasks.filter(t => effectiveCompany === "Group" || t.company === effectiveCompany);

  const filteredInvoices = companyInvoices.filter(i => i.firm.toLowerCase().includes(invoiceSearch.toLowerCase()) || i.id.toLowerCase().includes(invoiceSearch.toLowerCase()));

  const counselsData = [
    { name: "Prashant Mukherjee", firm: "Mukherjee & Co., Kolkata", spec: "Litigation · Labour Law · Constitutional", companies: ["Yajur", "Bally Jute"], status: "Active", retainer: "₹50K/mo", rate: "₹12K/hr", initial: "PM" },
    { name: "Rajesh Sharma", firm: "R. Sharma & Associates", spec: "Corporate · Contracts · M&A", companies: ["Yajur", "Yashoda"], status: "Active", retainer: "₹40K/mo", rate: "₹10K/hr", initial: "RS" },
    { name: "Nandita Bose", firm: "N. Bose Legal LLP", spec: "Employment · POSH · Labour Tribunal", companies: ["Bally Jute", "Yashoda"], status: "Active", retainer: "₹30K/mo", rate: "₹9K/hr", initial: "NB" },
    { name: "Arun Prasad", firm: "IP Law Partners, Kolkata", spec: "IP · Patents · Trademarks · Copyright", companies: ["Yashoda", "Bally Jute"], status: "Active", retainer: "₹25K/mo", rate: "₹8K/hr", initial: "AP" },
    { name: "Subhash Das", firm: "S. Das Law Office", spec: "Tax · Compliance · GST · Finance", companies: ["Yajur", "Bally Jute", "Yashoda"], status: "Active", retainer: "₹35K/mo", rate: "₹9K/hr", initial: "SD" }
  ];

  const contactsData = [
    { name: "Prashant Mukherjee", role: "Senior Advocate", org: "Mukherjee & Co.", email: "pm@mukherjee.co.in", phone: "+91 98300 11122", type: "Counsel" },
    { name: "Anuj Mehta", role: "MD & CEO", org: "Yajur Industries", email: "amehta@yajur.in", phone: "+91 98200 44455", type: "Internal" },
    { name: "Ramesh Agarwal", role: "CFO", org: "Bally Jute Co.", email: "ragarwal@ballyjute.in", phone: "+91 98400 77788", type: "Internal" },
    { name: "Kavita Patel", role: "Legal Head", org: "Yashoda Enterprises", email: "kpatel@yashoda.in", phone: "+91 98500 99900", type: "Internal" },
    { name: "S. Biswas", role: "Registrar", org: "Calcutta High Court", email: "s.biswas@calcuttahc.gov.in", phone: "033-2234-5566", type: "Court" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title Bar Description */}
      <div className="bg-white border p-4 rounded-xl shadow-xs flex items-center justify-between flex-wrap gap-4 select-none">
        <div>
          <h3 className="text-sm font-bold font-display text-slate-900 uppercase tracking-wide">
            {tab === "invoices" && "Retainership Fees & Billing Ledgers"}
            {tab === "counsels" && "Retained External Counsels & Roster Firms"}
            {tab === "contacts" && "Multi-Tenant Corporate Legal Contacts Directory"}
            {tab === "tasks" && "Trial Tasks Management Board"}
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            {tab === "invoices" && "Disbursals sheets, hourly counsel invoices and tax billing logs."}
            {tab === "counsels" && "Professional retainers, hourly rates, spec profiles and active matters coverage."}
            {tab === "contacts" && "Telephone directories of board executives, external lawyers, and court registrars."}
            {tab === "tasks" && "On-click task progression board mapping workflow check stages."}
          </p>
        </div>

        {["Super Admin", "Company Admin", "Legal Head"].includes(activeUser?.role || "") && (
          <button
            onClick={() => {
              if (tab === "invoices") onAddInvoiceClick();
              if (tab === "counsels") onAddCounselClick();
              if (tab === "contacts") onAddContactClick();
              if (tab === "tasks") onAddTaskClick();
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>
              {tab === "invoices" && "Log Counsel Invoice"}
              {tab === "counsels" && "Retain Counsel"}
              {tab === "contacts" && "Add Contact"}
              {tab === "tasks" && "Create Task"}
            </span>
          </button>
        )}
      </div>

      {/* SUB-TABS RENDER CHANNELS */}
      {tab === "invoices" && (
        <div className="space-y-6">
          <div className="bg-white border p-4 rounded-xl shadow-xs flex flex-row items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search billing records..."
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg outline-none font-sans"
              />
            </div>
            
            <div className="text-xs text-slate-400 font-semibold font-sans">
              Total billing ledger entries: {filteredInvoices.length}
            </div>
          </div>

          <div className="bg-white border rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full min-w-[850px] text-xs font-sans text-slate-700">
              <thead className="bg-slate-50 border-b select-none font-bold text-slate-400">
                <tr className="text-left">
                  <th className="p-3.5 pl-5 uppercase text-[10px] tracking-wider">Invoice No.</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider">Firm / Counsel</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider">Target Company</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider">Matter Link</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider text-right">Invoice Sum</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider">Filing date</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider">Due date</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider">Status</th>
                  <th className="p-3.5 uppercase text-[10px] tracking-wider pr-5 text-right">Process Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-5 font-mono font-bold text-slate-450 text-slate-500">{inv.id}</td>
                    <td className="p-4 font-semibold text-slate-800">{inv.firm}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.company === "Yajur" ? "bg-blue-50 text-blue-700" : inv.company === "Bally Jute" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
                      }`}>
                        {inv.company}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-indigo-600 font-semibold">{inv.matter}</td>
                    <td className="p-4 text-right font-mono font-bold text-slate-905">₹{inv.amount.toLocaleString()}</td>
                    <td className="p-4 font-mono">{inv.date}</td>
                    <td className="p-4 font-mono text-rose-650 text-rose-600 font-semibold">{inv.dueDate}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        inv.status === "Paid" ? "bg-emerald-55 bg-emerald-50 text-emerald-700 border border-emerald-150" : inv.status === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-150" : "bg-rose-50 text-rose-750 text-rose-700 border border-rose-150"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 pr-5 text-right">
                      {inv.status !== "Paid" ? (
                        <button
                          onClick={() => onPayInvoice(inv.id)}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer transition select-none"
                        >
                          Clear Bill
                        </button>
                      ) : (
                        <span className="text-slate-400 font-sans italic text-[11px]">Paid & receipted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "counsels" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counselsData.map((co, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-350 hover:border-slate-300 transition duration-150">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center font-bold text-indigo-700 text-sm">
                    {co.initial}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 font-display">{co.name}</h4>
                    <span className="text-[10.5px] text-slate-400 font-medium block mt-0.5">{co.firm}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100/50 pt-3 text-[11.5px] leading-relaxed text-slate-500 font-sans">
                  Spec: <strong className="text-slate-700">{co.spec}</strong>
                  <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {co.companies.map(c => (
                      <span key={c} className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-50 border text-slate-500">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100/50 pt-3 flex justify-between items-center text-[10.5px]">
                <span>Retainer: <strong className="text-slate-805 text-slate-800">{co.retainer}</strong></span>
                <span>Rate: <strong className="text-indigo-600">{co.rate}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "contacts" && (
        <div className="bg-white border rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full min-w-[850px] text-xs font-sans text-slate-700">
            <thead className="bg-slate-50 border-b select-none font-bold text-slate-400">
              <tr className="text-left font-sans col-span-1 border-slate-150">
                <th className="p-3.5 pl-5 uppercase text-[10px] tracking-wider pl-5">Full Name Address</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Designation / Role</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Company affiliation</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Email address</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider">Cell coordinates</th>
                <th className="p-3.5 uppercase text-[10px] tracking-wider pr-5 text-right">Access Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contactsData.map((co, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-5 font-semibold text-slate-850 pl-5">{co.name}</td>
                  <td className="p-4 font-sans text-slate-500 font-medium">{co.role}</td>
                  <td className="p-4 text-slate-800 font-semibold">{co.org}</td>
                  <td className="p-4 font-mono select-all text-[11px] text-slate-500">{co.email}</td>
                  <td className="p-4 font-mono font-medium">{co.phone}</td>
                  <td className="p-4 pr-5 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      co.type === "Counsel" ? "bg-blue-50 text-blue-700" : co.type === "Internal" ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {co.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "tasks" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["To Do", "In Progress", "Review", "Done"].map(col => {
            const colTasks = companyTasks.filter(t => t.status === col);

            return (
              <div key={col} className="bg-slate-100/50 border border-slate-200/50 rounded-xl p-4 min-h-[440px] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white border border-slate-200/60 p-2.5 rounded-lg">
                    <span className="text-xs font-bold text-slate-800">{col}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">{colTasks.length}</span>
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {colTasks.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic text-center py-4 bg-white/40 rounded border border-dashed">
                        No tasks in column
                      </p>
                    ) : (
                      colTasks.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => onTaskProgress(t.id, col)}
                          className="bg-white border border-slate-100 rounded-xl p-3 shadow-3xs cursor-pointer hover:border-indigo-400 transition"
                        >
                          <h4 className="text-xs font-bold text-slate-800 leading-snug">{t.title}</h4>
                          <div className="mt-3 flex justify-between items-center text-[10px] font-medium text-slate-400">
                            <span>{t.assignee}</span>
                            <span className="font-mono text-slate-500 font-semibold">{t.dueDate}</span>
                          </div>
                          
                          <div className="mt-2.5 border-t border-slate-50 pt-2 flex items-center justify-between">
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                              t.priority === "High" ? "bg-rose-50 text-rose-700" : t.priority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                            }`}>
                              {t.priority}
                            </span>
                            
                            <span className="text-[9px] text-indigo-600 font-bold hover:underline">
                              Progress &rarr;
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
