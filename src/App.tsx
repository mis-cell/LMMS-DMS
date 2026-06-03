import React, { useState, useEffect } from "react";
import { 
  Building2, 
  ShieldCheck, 
  FileLock, 
  Search, 
  Plus, 
  PlusCircle, 
  CheckCircle2, 
  X,
  ChevronRight,
  RefreshCw,
  Download,
  Scale,
  Bell,
  Calendar,
  Shield,
  Lightbulb,
  FileSpreadsheet,
  FileCheck,
  FileSignature,
  Archive,
  Receipt,
  UserCheck,
  Contact,
  ClipboardList,
  Bot,
  History,
  Settings,
  Lock,
  Eye,
  Send,
  Trash2,
  CalendarCheck,
  FileText,
  ShieldAlert
} from "lucide-react";

import { User, Matter, LegalDocument, LegalNotice, Hearing, AuditLog, CompanyType, MatterType, MatterStatus } from "./types";
import { handleClientSideFallback } from "./lib/client_api";

// Import custom modular components
import DashboardPanel from "./components/DashboardPanel";
import CalendarPanel from "./components/CalendarPanel";
import MattersPanel from "./components/MattersPanel";
import DocumentsPanel from "./components/DocumentsPanel";
import FinancePeoplePanel from "./components/FinancePeoplePanel";
import IntelligencePanel from "./components/IntelligencePanel";
import SystemPanel from "./components/SystemPanel";
import LegalAssistantChat from "./components/LegalAssistantChat";
import DocumentUploadModal from "./components/DocumentUploadModal";

// Interactive Company Color theme maps
const COMPANY_THEMES: Record<string, { primary: string; hover: string; bgLight: string; textDark: string; tag: string }> = {
  "Yajur": {
    primary: "#185FA5",
    hover: "hover:bg-[#185FA5]/10",
    bgLight: "bg-[#E6F1FB]",
    textDark: "text-[#0C447C]",
    tag: "bg-blue-50 text-blue-700 border-blue-200"
  },
  "Bally Jute": {
    primary: "#854F0B",
    hover: "hover:bg-[#854F0B]/10",
    bgLight: "bg-[#FAEEDA]",
    textDark: "text-[#854F0B]",
    tag: "bg-amber-50 text-amber-800 border-amber-200"
  },
  "Yashoda": {
    primary: "#3B6D11",
    hover: "hover:bg-[#3B6D11]/10",
    bgLight: "bg-[#EAF3DE]",
    textDark: "text-[#3B6D11]",
    tag: "bg-emerald-50 text-emerald-800 border-emerald-200"
  },
  "Group": {
    primary: "#6366f1",
    hover: "hover:bg-indigo-50",
    bgLight: "bg-indigo-50/50",
    textDark: "text-indigo-900",
    tag: "bg-indigo-50 text-indigo-700 border-indigo-100"
  }
};

export default function App() {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [effectiveCompany, setEffectiveCompany] = useState<string>("Yajur");

  // Global State database
  const [matters, setMatters] = useState<Matter[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [notices, setNotices] = useState<LegalNotice[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sysStatus, setSysStatus] = useState<any>(null);

  // Trigger reloading and sync triggers
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Inline simulation lists for dynamic states (Tasks and Invoices)
  const [tasks, setTasks] = useState<any[]>([
    { id: "TSK-001", company: "Yajur", title: "Review Standing Orders draft details", assignee: "Rahul Verma", priority: "High", dueDate: "2026-06-10", status: "In Progress" },
    { id: "TSK-002", company: "Bally Jute", title: "Audit ESI Contribution list", assignee: "Ananya Sen", priority: "Medium", dueDate: "2026-06-08", status: "To Do" },
    { id: "TSK-003", company: "Yashoda", title: "Submit ex-parte injunction pleadings Calcutta High Court", assignee: "Vikram Rao", priority: "High", dueDate: "2026-06-28", status: "Review" },
    { id: "TSK-004", company: "Yajur", title: "Verify GST ITC input claims FY23", assignee: "Amit Sharma", priority: "Low", dueDate: "2026-06-20", status: "Done" },
    { id: "TSK-005", company: "Yajur", title: "File Emergency Stay Order at Alipore Civil Court", assignee: "Rahul Verma", priority: "High", dueDate: "2026-06-05", status: "In Progress" }
  ]);

  const [invoices, setInvoices] = useState<any[]>([
    { id: "INV-2026-001", company: "Yajur", firm: "Khaitan & Co., Tax Division", matter: "MAT-Y-102", amount: 180000, date: "2026-05-15", dueDate: "2026-06-15", status: "Pending" },
    { id: "INV-2026-002", company: "Bally Jute", firm: "Advocate Sucharita Guha", matter: "MAT-B-201", amount: 120000, date: "2026-05-18", dueDate: "2026-06-18", status: "Paid" },
    { id: "INV-2026-003", company: "Yashoda", firm: "T. Prasat, Senior IP Counsel", matter: "MAT-S-302", amount: 250000, date: "2026-05-20", dueDate: "2026-06-20", status: "Pending" }
  ]);

  const [approvalsQueue, setApprovalsQueue] = useState<any[]>([
    { id: "APP-001", company: "Yajur", title: "Kolkata Sourcing Lease Deed Agreement", requester: "Amit Sharma", date: "2026-06-02", priority: "High", status: "Pending" },
    { id: "APP-002", company: "Bally Jute", title: "Union Settlement Mutual Accord", requester: "Sanjay Bose", date: "2026-06-01", priority: "Medium", status: "Pending" },
    { id: "APP-003", company: "Yashoda", title: "Rajarhat Site Mutation Certificate", requester: "Vikram Rao", date: "2026-05-30", priority: "High", status: "Approved" }
  ]);

  // Secure File Previewer & Cron Alert states
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<LegalDocument | null>(null);
  const [cronAlerts, setCronAlerts] = useState<any[]>([]);
  const [silencedAlertIds, setSilencedAlertIds] = useState<Set<string>>(new Set());

  // Form Modals State
  const [showNewMatterModal, setShowNewMatterModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [viewDetailMatter, setViewDetailMatter] = useState<Matter | null>(null);

  // Global Search
  const [globalSearchInput, setGlobalSearchInput] = useState("");
  const [matchedEntities, setMatchedEntities] = useState<any[]>([]);

  // Form Fields
  const [newMatterForm, setNewMatterForm] = useState({
    title: "",
    type: "Litigation" as MatterType,
    department: "",
    opponentParty: "",
    externalCounsel: "",
    courtOrAuthority: "",
    filingDate: "",
    description: "",
    value: 100000
  });

  const [newNoticeForm, setNewNoticeForm] = useState({
    subType: "Labour",
    senderOrRecipient: "",
    deadlineDate: "",
    description: "",
    legalTeamLead: ""
  });

  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    company: "Yajur" as User["company"],
    role: "Company Admin" as User["role"]
  });

  // Load Simulating Personas & Initialization
  useEffect(() => {
    async function loadUsers() {
      try {
        const initRes = await handleClientSideFallback("/api/init");
        const initData = await initRes.json();
        if (initData.users && initData.users.length > 0) {
          setUsersList(initData.users);
          // Default to Super Admin prosunmajhi or first item
          const superAdmin = initData.users.find((u: any) => u.role === "Super Admin") || initData.users[0];
          setActiveUser(superAdmin);
          
          // Default initial company view based on logged user
          setEffectiveCompany(superAdmin.company === "Group" ? "Yajur" : superAdmin.company);
        }
      } catch (err) {
        console.error("Init users failed", err);
      }
    }
    loadUsers();
  }, []);

  // Fetch Database State whenever refreshTrigger or activeUser switches!
  useEffect(() => {
    if (!activeUser) return;

    async function loadData() {
      setIsSyncing(true);
      try {
        // Core multi-tenant isolated api call
        const res = await handleClientSideFallback("/api/data", {
          headers: { "x-user-id": activeUser.id }
        });
        const data = await res.json();
        
        setMatters(data.matters || []);
        setDocuments(data.documents || []);
        setNotices(data.notices || []);
        setHearings(data.hearings || []);
        setAuditLogs(data.auditLogs || []);

        // Also update sys-status connection info
        const statusRes = await handleClientSideFallback("/api/sys-status");
        const statusData = await statusRes.json();
        setSysStatus(statusData);
      } catch (err) {
        console.error("Failed fetching dockets", err);
      } finally {
        setIsSyncing(false);
      }
    }
    loadData();
  }, [activeUser, refreshTrigger]);

  // Periodic cron simulation checking for tasks and notices expiring within 3 days.
  useEffect(() => {
    const runCronCheck = () => {
      const today = new Date("2026-06-03");
      const activeAlerts: any[] = [];
      const upcomingThreshold = 3 * 24 * 60 * 60 * 1050; // 3 days buffer

      // Check tasks
      tasks.forEach((tsk) => {
        if (!tsk.dueDate || tsk.status === "Done") return;
        const due = new Date(tsk.dueDate);
        const diff = due.getTime() - today.getTime();
        if (diff >= 0 && diff <= upcomingThreshold) {
          activeAlerts.push({
            id: tsk.id,
            company: tsk.company,
            title: tsk.title,
            type: "Task Deadline Imminent",
            dueDate: tsk.dueDate,
            daysLeft: Math.ceil(diff / (24 * 60 * 60 * 1000)),
            assignee: tsk.assignee
          });
        }
      });

      // Check notices
      notices.forEach((ntc) => {
        if (!ntc.deadlineDate || ntc.status === "Responded") return;
        const due = new Date(ntc.deadlineDate);
        const diff = due.getTime() - today.getTime();
        if (diff >= 0 && diff <= upcomingThreshold) {
          activeAlerts.push({
            id: ntc.id,
            company: ntc.company,
            title: ntc.description || "Inbound Compliance Action required",
            type: "Notice Filing Imminent",
            dueDate: ntc.deadlineDate,
            daysLeft: Math.ceil(diff / (24 * 60 * 60 * 1000)),
            assignee: ntc.legalTeamLead
          });
        }
      });

      if (activeAlerts.length > 0) {
        // Trigger visual alerts
        const unsilencedCount = activeAlerts.filter(act => !silencedAlertIds.has(act.id)).length;
        if (unsilencedCount > 0) {
          // Play warning chime sound dynamically in frontend
          try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);
            osc.frequency.setValueAtTime(587.33, context.currentTime); // D5 high tone
            gain.gain.setValueAtTime(0.04, context.currentTime);
            osc.start();
            osc.stop(context.currentTime + 0.15);
          } catch {}
          setCronAlerts(activeAlerts);
        } else {
          setCronAlerts([]);
        }
      } else {
        setCronAlerts([]);
      }
    };

    runCronCheck();
    const cronInterval = setInterval(runCronCheck, 15000);
    return () => clearInterval(cronInterval);
  }, [tasks, notices, silencedAlertIds]);

  // Adjust company view isolation if user toggles context
  const handleCompanySwitch = (co: string) => {
    // If user's role is not Super Admin and they choose a company they don't belong to, lock the view!
    if (activeUser && activeUser.role !== "Super Admin" && activeUser.company !== "Group" && activeUser.company !== co) {
      alert(`🔐 Access Blocked: Multi-Tenant Partition!\nRegistered User (${activeUser.name}) possesses credentials restricted purely to Yajur Industries, Bally Jute Co., or Yashoda individually.`);
      return;
    }
    setEffectiveCompany(co);
  };

  // Create virtual matter
  const handleCreateMatterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    try {
      const resp = await handleClientSideFallback("/api/matters", {
        method: "POST",
        headers: { "x-user-id": activeUser.id },
        body: JSON.stringify({
          ...newMatterForm,
          company: effectiveCompany // Bind to active isolated division profile!
        })
      });
      if (resp.ok) {
        setShowNewMatterModal(false);
        setRefreshTrigger(prev => prev + 1);
        setNewMatterForm({
          title: "",
          type: "Litigation",
          department: "",
          opponentParty: "",
          externalCounsel: "",
          courtOrAuthority: "",
          filingDate: "",
          description: "",
          value: 100000
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sync virtual documents
  const handleDocUploadCallback = async (payload: any) => {
    if (!activeUser) return;
    try {
      const resp = await handleClientSideFallback("/api/documents", {
        method: "POST",
        headers: { "x-user-id": activeUser.id },
        body: JSON.stringify({
          ...payload,
          targetCompany: effectiveCompany
        })
      });
      if (resp.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocEditCallback = async (docId: string, updatedFields: Partial<LegalDocument>) => {
    setIsSyncing(true);
    try {
      await handleClientSideFallback(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "x-user-id": activeUser?.id || "u-super" },
        body: JSON.stringify(updatedFields)
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to edit document details: ", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDocDeleteCallback = async (docId: string) => {
    setIsSyncing(true);
    try {
      await handleClientSideFallback(`/api/documents/${docId}`, {
        method: "DELETE",
        headers: { "x-user-id": activeUser?.id || "u-super" }
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to delete document: ", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await handleClientSideFallback("/api/users", {
        method: "POST",
        headers: { "x-user-id": activeUser?.id },
        body: JSON.stringify(newUserForm)
      });
      if (resp.ok) {
        setShowUserModal(false);
        const added = await resp.json();
        setUsersList(prev => [...prev, added]);
        setNewUserForm({ name: "", email: "", company: "Yajur", role: "Company Admin" });
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayInvoiceAction = async (id: string) => {
    alert("💸 Payment Disbursed: ₹" + invoices.find(i => i.id === id)?.amount.toLocaleString() + " successfully settled to external counsel.");
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "Paid" } : inv));
    // Create audit log
    await handleClientSideFallback("/api/audit-logs", {
      method: "POST",
      headers: { "x-user-id": activeUser?.id },
      body: JSON.stringify({
        action: "Invoice Settled",
        company: effectiveCompany,
        details: `Disbursed retainership payment for invoice ${id} directly mapping to division ledger.`
      })
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleApprovalsAction = async (id: string, decision: "Approved" | "Rejected") => {
    setApprovalsQueue(prev => prev.map(app => app.id === id ? { ...app, status: decision } : app));
    await handleClientSideFallback("/api/audit-logs", {
      method: "POST",
      headers: { "x-user-id": activeUser?.id },
      body: JSON.stringify({
        action: `Approval ${decision}`,
        company: effectiveCompany,
        details: `Contract review draft of ${approvalsQueue.find(a => a.id === id)?.title} was ${decision.toLowerCase()}.`
      })
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBulkStatusUpdate = async (ids: string[], newStatus: MatterStatus) => {
    setIsSyncing(true);
    try {
      const promises = ids.map(id => {
        return handleClientSideFallback(`/api/matters/${id}`, {
          method: "PATCH",
          headers: { "x-user-id": activeUser?.id || "u-super" },
          body: JSON.stringify({ status: newStatus })
        });
      });
      await Promise.all(promises);
      
      // Create a single consolidated audit log
      await handleClientSideFallback("/api/audit-logs", {
        method: "POST",
        headers: { "x-user-id": activeUser?.id || "u-super" },
        body: JSON.stringify({
          action: "Bulk Status Update",
          company: effectiveCompany,
          details: `Batch administrative transition of ${ids.length} legal matters to state: "${newStatus}".`
        })
      });
      
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Bulk status transition failed: ", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTaskProgressAction = (id: string, currentStatus: string) => {
    const lanes = ["To Do", "In Progress", "Review", "Done"];
    const nextIdx = (lanes.indexOf(currentStatus) + 1) % lanes.length;
    const nextStatus = lanes[nextIdx];
    
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
  };

  const triggerManualSeed = async () => {
    try {
      const resp = await handleClientSideFallback("/api/sys-status/seed", {
        method: "POST",
        headers: { "x-user-id": activeUser?.id }
      });
      if (resp.ok) {
        alert("✨ PostgreSQL Seeding Complete! Load initial matters, dockets, calendar schedules and simulator users.");
        setRefreshTrigger(prev => prev + 1);
      } else {
        const err = await resp.json();
        alert("SQL Schema Probe: " + err.error);
      }
    } catch (err: any) {
      alert("Error triggering seed: " + err.message);
    }
  };

  // Global search trigger
  const handleGlobalSearch = (txt: string) => {
    setGlobalSearchInput(txt);
    if (!txt.trim()) {
      setMatchedEntities([]);
      return;
    }

    // Match across matters, invoices, or dms files
    const matchedMatters = matters.filter(m => m.title.toLowerCase().includes(txt.toLowerCase()) || m.id.toLowerCase().includes(txt.toLowerCase()));
    const matchedDocs = documents.filter(d => d.fileName.toLowerCase().includes(txt.toLowerCase()));
    const matchedInvs = invoices.filter(i => i.firm.toLowerCase().includes(txt.toLowerCase()) || i.id.toLowerCase().includes(txt.toLowerCase()));

    const compiled = [
      ...matchedMatters.map(m => ({ label: `💼 Matter: ${m.title}`, ref: m, type: "matter" })),
      ...matchedDocs.map(d => ({ label: `📄 Google Drive File: ${d.fileName}`, ref: d, type: "doc" })),
      ...matchedInvs.map(i => ({ label: `💳 Billing Invoice: ${i.firm}`, ref: i, type: "invoice" }))
    ];
    setMatchedEntities(compiled);
  };

  const theme = COMPANY_THEMES[effectiveCompany] || COMPANY_THEMES["Yajur"];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-xs">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="w-64 bg-slate-900 text-slate-300 shrink-0 flex flex-col justify-between select-none">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-2.5">
            <div className="bg-indigo-600/10 p-2 rounded-xl border border-indigo-500/20">
              <Scale className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-[14px] tracking-tight text-white font-display uppercase tracking-widest leading-none">LRLMS Portal</h1>
              <span className="text-[10px] text-slate-500 mt-1 block">Risk Management DMS</span>
            </div>
          </div>

          {/* Company Selector Widget (Yajur, Bally Jute, Yashoda) */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2.5">
              Select Isolation context:
            </label>
            <div className="space-y-1.5">
              {[
                { key: "Yajur", label: "Yajur Industries", color: "#185FA5" },
                { key: "Bally Jute", label: "Bally Jute Co.", color: "#854F0B" },
                { key: "Yashoda", label: "Yashoda Enterprise", color: "#3B6D11" }
              ].map(co => {
                const isActive = effectiveCompany === co.key;
                return (
                  <button
                    key={co.key}
                    onClick={() => handleCompanySwitch(co.key)}
                    className={`w-full p-2.5 rounded-lg flex items-center gap-2 text-left text-xs font-semibold cursor-pointer transition ${
                      isActive 
                        ? "bg-slate-800 text-white border border-slate-700 shadow-sm" 
                        : "hover:bg-slate-800/50 text-slate-400"
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: co.color }} 
                    />
                    <span className="truncate">{co.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab lists grouped exactly like the index.html mockup */}
          <div className="p-3.5 space-y-4 overflow-y-auto max-h-[55vh] pr-1">
            
            {/* Overview Group */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block px-2.5 mb-1.5">Overview</span>
              <div className="space-y-0.5">
                {[
                  { id: "dashboard", label: "Dashboard Hub" },
                  { id: "calendar", label: "Judicial Calendar" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left truncate font-semibold block cursor-pointer text-xs ${
                      activeTab === t.id ? "bg-indigo-600 font-bold text-white shadow-xs" : "hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legal Matters Registers Group */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block px-2.5 mb-1.5">Legal Matters</span>
              <div className="space-y-0.5">
                {[
                  { id: "matters", label: "All Matters Directory" },
                  { id: "litigation", label: "Litigation docket" },
                  { id: "contracts", label: "Procure Contracts" },
                  { id: "compliance", label: "Compliance check" },
                  { id: "ip", label: "Intellectual Property" },
                  { id: "employment", label: "Labour Disputes" },
                  { id: "property", label: "Asset Leases" },
                  { id: "tax", label: "GST Appeals" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left truncate font-semibold block cursor-pointer text-xs ${
                      activeTab === t.id ? "bg-indigo-600 font-bold text-white shadow-xs" : "hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Library Group */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block px-2.5 mb-1.5">Documents DMS</span>
              <div className="space-y-0.5">
                {[
                  { id: "dms", label: "Google Drive DMS" },
                  { id: "templates", label: "Policy Templates" },
                  { id: "approvals", label: "Approvals queue" },
                  { id: "esign", label: "Digit E-sign links" },
                  { id: "archive", label: "Archives return" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left truncate font-semibold block cursor-pointer text-xs ${
                      activeTab === t.id ? "bg-indigo-600 font-bold text-white shadow-xs" : "hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Finance & People Group */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block px-2.5 mb-1.5">Finance & People</span>
              <div className="space-y-0.5">
                {[
                  { id: "invoices", label: "Retainer Invoices" },
                  { id: "counsels", label: "Counsels Directory" },
                  { id: "contacts", label: "Corporate Contacts" },
                  { id: "tasks", label: "Tasks Kanban" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left truncate font-semibold block cursor-pointer text-xs ${
                      activeTab === t.id ? "bg-indigo-600 font-bold text-white shadow-xs" : "hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Intelligence Hub Group */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block px-2.5 mb-1.5">Intelligence</span>
              <div className="space-y-0.5">
                {[
                  { id: "ai", label: "Gemini Legal co-counsel" },
                  { id: "reports", label: "Analytics Reports" },
                  { id: "audit", label: "Audit Trailing logs" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left truncate font-semibold block cursor-pointer text-xs ${
                      activeTab === t.id ? "bg-indigo-600 font-bold text-white shadow-xs" : "hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* System settings Group */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block px-2.5 mb-1.5">Platform Node</span>
              <div className="space-y-0.5">
                {[
                  { id: "settings", label: "System settings" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left truncate font-semibold block cursor-pointer text-xs ${
                      activeTab === t.id ? "bg-indigo-600 font-bold text-white shadow-xs" : "hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* User Switching simulation Footer row */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 font-sans text-xs flex flex-col gap-2">
          <div className="flex gap-2 items-center justify-between">
            <span className="text-[9.5px] text-slate-500 font-bold uppercase">Acting credentials:</span>
            {isSyncing && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
          </div>
          
          <select
            value={activeUser?.id || ""}
            onChange={e => {
              const matched = usersList.find(u => u.id === e.target.value);
              if (matched) {
                setActiveUser(matched);
                // Switch isolation scope to match profile company context!
                setEffectiveCompany(matched.company === "Group" ? "Yajur" : matched.company);
              }
            }}
            className="w-full text-[11px] font-semibold bg-slate-800 text-white px-2 py-2 rounded-lg outline-none cursor-pointer border border-slate-700"
          >
            {usersList.map(usr => (
              <option key={usr.id} value={usr.id}>
                🎭 {usr.name} ({usr.role} - {usr.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CORE WORKSPACE PANEL CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP BAR HEADER */}
        <div id="header" className="h-16 border-b border-slate-200/50 bg-white flex items-center justify-between px-6 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold font-display text-slate-805 text-slate-800">
              {activeTab === "dashboard" && "Enterprise Executive Hub"}
              {activeTab === "calendar" && "Trial Court dockets schedule"}
              {["matters", "litigation", "contracts", "compliance", "ip", "employment", "property", "tax"].includes(activeTab) && "Dockets Portfolio Listing"}
              {["dms", "templates", "approvals", "esign", "archive"].includes(activeTab) && "GDrive DMS Vault"}
              {["invoices", "counsels", "contacts", "tasks"].includes(activeTab) && "Billing, Task boards and Roster Directories"}
              {activeTab === "ai" && "Gemini Co-Counsel Suite"}
              {activeTab === "reports" && "Enterprise Analytical charts"}
              {activeTab === "audit" && "PostgreSQL Logs trace"}
              {activeTab === "settings" && "Config dashboard parameters"}
            </h2>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 animate-pulse mt-0.5 font-mono">|</span>
              <span className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase border font-mono ${theme.tag}`}>
                Isolated workspace: {effectiveCompany}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global search trigger */}
            <button 
              onClick={() => setShowSearchModal(true)}
              className="p-2 hover:bg-slate-50 border rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Search className="w-4 h-4" />
              <span>Search Database...</span>
            </button>

            {/* Quick action buttons */}
            <button
              onClick={() => setActiveTab("ai")}
              className="px-3 py-2 bg-slate-900 text-indigo-300 hover:bg-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 hover:shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Gemini Co-Counsel</span>
            </button>

            {/* User simulator modal triggers */}
            <button
              onClick={() => setShowUserModal(true)}
              className="p-2 border rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer text-xs font-semibold"
              title="Simulator user profile settings"
            >
              Add User profile
            </button>
          </div>
        </div>

        {/* WORKSPACE MIDDLE BODY PANEL */}
        <div id="workspace-viewport" className="flex-1 overflow-y-auto p-6 bg-slate-50/60 font-sans">
          
          {/* TAB PANELS MAPPING TO THE 25 VIEWS */}
          {activeTab === "dashboard" && (
            <DashboardPanel
              matters={matters}
              documents={documents}
              notices={notices}
              hearings={hearings}
              effectiveCompany={effectiveCompany}
              onTabChange={setActiveTab}
              theme={theme}
              onSelectDocument={(doc) => setSelectedDocForPreview(doc)}
            />
          )}

          {activeTab === "calendar" && (
            <CalendarPanel
              hearings={hearings}
              effectiveCompany={effectiveCompany}
              theme={theme}
            />
          )}

          {["matters", "litigation", "contracts", "compliance", "ip", "employment", "property", "tax"].includes(activeTab) && (
            <MattersPanel
              tab={activeTab}
              matters={matters}
              notices={notices}
              activeUser={activeUser}
              effectiveCompany={effectiveCompany}
              onViewMatterDetail={setViewDetailMatter}
              onInstantiateMatterClick={() => setShowNewMatterModal(true)}
              onLogNoticeClick={() => setShowNoticeModal(true)}
              onBulkStatusUpdate={handleBulkStatusUpdate}
              theme={theme}
            />
          )}

          {["dms", "templates", "approvals", "esign", "archive"].includes(activeTab) && (
            <DocumentsPanel
              tab={activeTab}
              documents={documents}
              matters={matters}
              effectiveCompany={effectiveCompany}
              approvals={approvalsQueue}
              onApprove={handleApprovalsAction}
              onTriggerSignRemind={(title) => alert(`✉️ Email Reminder Dispatched: Re-requested signatories to sign contract: "${title}"`)}
              onDocClick={(doc) => setSelectedDocForPreview(doc)}
              onUpload={handleDocUploadCallback}
              onEdit={handleDocEditCallback}
              onDelete={handleDocDeleteCallback}
              theme={theme}
            />
          )}

          {["invoices", "counsels", "contacts", "tasks"].includes(activeTab) && (
            <FinancePeoplePanel
              tab={activeTab}
              tasks={tasks}
              invoices={invoices}
              activeUser={activeUser}
              effectiveCompany={effectiveCompany}
              onPayInvoice={handlePayInvoiceAction}
              onTaskProgress={handleTaskProgressAction}
              onAddTaskClick={() => {
                const title = prompt("Enter task title:");
                if (title) {
                  setTasks(prev => [...prev, {
                    id: `TSK-00${prev.length + 1}`,
                    company: effectiveCompany,
                    title,
                    assignee: activeUser?.name || "Unassigned",
                    priority: "Medium",
                    dueDate: "2026-06-25",
                    status: "To Do"
                  }]);
                }
              }}
              onAddCounselClick={() => alert("Retainership details form launched.")}
              onAddContactClick={() => alert("Registering contact profile.")}
              onAddInvoiceClick={() => {
                const amount = prompt("Enter invoice amount (INR):", "150000");
                const firm = prompt("Enter firm/advocate name:", "Advocate Debasish Kar");
                if (amount && firm) {
                  setInvoices(prev => [...prev, {
                    id: `INV-2026-30${prev.length + 1}`,
                    company: effectiveCompany,
                    firm,
                    matter: "MAT-Y-101",
                    amount: Number(amount) || 150000,
                    date: "2026-06-03",
                    dueDate: "2026-07-03",
                    status: "Pending"
                  }]);
                }
              }}
            />
          )}

          {activeTab === "ai" && activeUser && (
            <LegalAssistantChat user={activeUser} />
          )}

          {["reports", "audit"].includes(activeTab) && (
            <IntelligencePanel
              tab={activeTab}
              auditLogs={auditLogs}
              onDownloadAuditLogsCSV={() => alert("Downloading audit_trail_dump.csv with authenticated secure checksums.")}
              activeUser={activeUser}
              effectiveCompany={effectiveCompany}
              matters={matters}
              invoices={invoices}
            />
          )}

          {activeTab === "settings" && (
            <SystemPanel
              sysStatus={sysStatus}
              showDevPanel={false}
              onOpenDevPanel={() => {}}
              onCloseDevPanel={() => {}}
              seedSuccessMsg=""
              isSeeding={false}
              onTriggerManualSeed={triggerManualSeed}
              activeUser={activeUser}
              onAddCompanyClick={() => alert("Please contact Super Admin context to update registered CINS.")}
              onShowDevPanelClick={() => setActiveTab("settings")}
              theme={theme}
            />
          )}

        </div>
      </div>

      {/* GLOBAL DISPUTES SEARCH OVERLAY MODAL */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/50 backdrop-blur-3xs p-4 select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-3xl border border-slate-100 overflow-hidden text-xs">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold font-semibold text-slate-800">Dynamic Multi-Tenant Search System</span>
              <button 
                onClick={() => {
                  setShowSearchModal(false);
                  setGlobalSearchInput("");
                  setMatchedEntities([]);
                }}
                className="text-slate-400 hover:text-slate-700 bg-slate-205 hover:bg-slate-200 p-1.5 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input form */}
            <div className="p-4">
              <input
                type="text"
                placeholder="Search cases, files, dockets and invoices matching clearance..."
                value={globalSearchInput}
                onChange={e => handleGlobalSearch(e.target.value)}
                className="w-full text-xs font-sans px-3.5 py-3 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none"
              />

              {/* Matches display cards */}
              <div className="mt-4 space-y-2 max-h-[290px] overflow-y-auto pr-1 font-sans">
                {matchedEntities.length === 0 ? (
                  <p className="text-center text-slate-400 italic py-6">
                    {globalSearchInput ? "No cleared files found matching query." : "Type keyword, ID or counsel to check files..."}
                  </p>
                ) : (
                  matchedEntities.map((ent, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (ent.type === "matter") {
                          setViewDetailMatter(ent.ref);
                        } else if (ent.type === "doc") {
                          // Switch tab directory to DMS
                          setActiveTab("dms");
                        } else {
                          setActiveTab("invoices");
                        }
                        setShowSearchModal(false);
                      }}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/10 cursor-pointer transition flex justify-between items-center"
                    >
                      <span className="font-semibold text-slate-850 leading-relaxed">{ent.label}</span>
                      <span className="text-[10px] font-mono bg-white border px-1.5 py-0.5 rounded">{ent.type.toUpperCase()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MATTERS VIEW LOG PORTFOLIO DETAILS MODAL */}
      {viewDetailMatter && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-3xs p-4 select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-3xl border border-slate-100 overflow-hidden text-xs">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-indigo-305 font-mono">Case File Registry detail</span>
                <h3 className="text-sm font-bold mt-1 text-white truncate">{viewDetailMatter.title}</h3>
              </div>
              <button 
                onClick={() => setViewDetailMatter(null)}
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Details list */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-slate-600 font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Matter ID Code</span>
                  <strong className="text-slate-800 font-bold block mt-1">{viewDetailMatter.id}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Assigned Division</span>
                  <strong className="text-slate-800 font-bold block mt-1">{viewDetailMatter.company} Industries</strong>
                </div>
              </div>

              <div className="space-y-2 border-b border-slate-100/60 pb-3">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Dispute Particulars Description</span>
                <p className="text-slate-650 leading-relaxed text-[11.5px] italic">
                  "{viewDetailMatter.description}"
                </p>
              </div>

              <div className="space-y-2 font-sans text-[11.5px] leading-relaxed">
                <div>Opposing Counsel: <strong className="text-slate-800 font-semibold">{viewDetailMatter.opponentParty}</strong></div>
                <div>Legal Advocate Assigned: <strong className="text-slate-800 font-semibold">{viewDetailMatter.externalCounsel}</strong></div>
                <div>Appealed Jurisdiction: <strong className="text-slate-805 text-slate-800 font-semibold">{viewDetailMatter.courtOrAuthority}</strong></div>
                <div>Logged date: <strong className="text-slate-800 font-semibold">{viewDetailMatter.filingDate}</strong></div>
                <div>Current Stage: <span className="px-2.5 py-0.5 rounded font-bold bg-amber-50 text-amber-700">{viewDetailMatter.status}</span></div>
                <div>Legal Spend / Exposure value: <strong className="text-indigo-600 font-bold">₹{viewDetailMatter.value.toLocaleString()} INR</strong></div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATE NEW MATTER FOLDERS MODAL */}
      {showNewMatterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/50 backdrop-blur-3xs p-4 font-sans select-none text-slate-800">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-3xl border border-slate-100 overflow-hidden text-xs">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-150 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-300 font-mono tracking-wider uppercase">Enterprise Legal Repository</span>
                <h3 className="text-sm font-bold mt-1 text-white">Instantiate New Legal Matter Folder</h3>
              </div>
              <button 
                onClick={() => setShowNewMatterModal(false)}
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Creation Form */}
            <form onSubmit={handleCreateMatterSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Matter Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Union dispute, Lease agreement..."
                    value={newMatterForm.title}
                    onChange={e => setNewMatterForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-xs font-sans px-3 py-2 border rounded-lg focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Classification Type</label>
                  <select
                    value={newMatterForm.type}
                    onChange={e => setNewMatterForm(prev => ({ ...prev, type: e.target.value as MatterType }))}
                    className="w-full text-xs bg-white border px-3 py-2 rounded-lg focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Litigation">Litigation</option>
                    <option value="Contract">Contract / Lease</option>
                    <option value="Labor Matter">Labor Matter</option>
                    <option value="Regulatory">Regulatory Compliance</option>
                    <option value="Compliance">Audits</option>
                    <option value="IP/Trademark">Intellectual Property</option>
                    <option value="Property">Property title</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Operating Department</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Sourcing, Finance, HR..."
                    value={newMatterForm.department}
                    onChange={e => setNewMatterForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full text-xs font-sans px-3 py-2 border rounded-lg focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Opponent Party</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Trade Union, CGST Commission"
                    value={newMatterForm.opponentParty}
                    onChange={e => setNewMatterForm(prev => ({ ...prev, opponentParty: e.target.value }))}
                    className="w-full text-xs font-sans px-3 py-2 border rounded-lg focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Corporate Counsel</label>
                  <input
                    type="text"
                    placeholder="E.g. Advocate Sucharita Guha"
                    value={newMatterForm.externalCounsel}
                    onChange={e => setNewMatterForm(prev => ({ ...prev, externalCounsel: e.target.value }))}
                    className="w-full text-xs font-sans px-3 py-2 border rounded-lg focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Appealed Authority / Tribunal</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Alipore Civil Court"
                    value={newMatterForm.courtOrAuthority}
                    onChange={e => setNewMatterForm(prev => ({ ...prev, courtOrAuthority: e.target.value }))}
                    className="w-full text-xs font-sans px-3 py-2 border rounded-lg focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Filing / Logged date</label>
                  <input
                    type="date"
                    required
                    value={newMatterForm.filingDate}
                    onChange={e => setNewMatterForm(prev => ({ ...prev, filingDate: e.target.value }))}
                    className="w-full text-xs font-sans px-3 py-2 border rounded-lg focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Exposure value (INR)</label>
                  <input
                    type="number"
                    required
                    value={newMatterForm.value}
                    onChange={e => setNewMatterForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                    className="w-full text-xs font-sans px-3 py-2 border rounded-lg focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Dispute Details & Summary</label>
                <textarea
                  required
                  placeholder="Detail case files background, legal threats, compensation demands, and core materials arguments..."
                  value={newMatterForm.description}
                  onChange={e => setNewMatterForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full text-xs p-3 bg-slate-50 border rounded-lg focus:bg-white focus:border-indigo-500 outline-none font-sans leading-relaxed"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewMatterModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer font-bold select-none"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer shadow-xs select-none"
                >
                  Deploy Matter
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CREATE NEW SIMULATING USER PORTAL MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/50 backdrop-blur-3xs p-4 select-none text-slate-800">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-3xl border border-slate-100 overflow-hidden text-xs">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-white">Create Simulator User profile</span>
              <button 
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white bg-slate-800 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUserSubmit} className="p-5 space-y-4 font-sans text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">User Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Rajan Sharma, Sunil Kar..."
                  value={newUserForm.name}
                  onChange={e => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Email coordinate</label>
                <input
                  type="email"
                  required
                  placeholder="r.sharma@yajur.com"
                  value={newUserForm.email}
                  onChange={e => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Portal clearance</label>
                  <select
                    value={newUserForm.company}
                    onChange={e => setNewUserForm(prev => ({ ...prev, company: e.target.value as any }))}
                    className="w-full bg-slate-50 border p-2 rounded cursor-pointer outline-none focus:border-indigo-400"
                  >
                    <option value="Yajur">Yajur Industries</option>
                    <option value="Bally Jute">Bally Jute Co.</option>
                    <option value="Yashoda">Yashoda Enterprise</option>
                    <option value="Group">Group HQ (All clearance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Role level Access</label>
                  <select
                    value={newUserForm.role}
                    onChange={e => setNewUserForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full bg-slate-50 border p-2 rounded cursor-pointer outline-none focus:border-indigo-400"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Company Admin">Company Admin</option>
                    <option value="Legal Head">Legal Head</option>
                    <option value="Lawyer">Lawyer</option>
                    <option value="Auditor">Super Auditor</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 cursor-pointer font-bold"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer font-bold"
                >
                  Register profile
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* SECURE GOOGLE DRIVE FILE PREVIEWER MODAL */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none text-slate-800 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col w-full max-w-5xl h-[85vh] overflow-hidden">
            
            {/* Securised GDrive Simulation Header */}
            <div className="flex justify-between items-center bg-slate-950 text-white px-5 py-3 border-b border-slate-800 font-sans">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded bg-blue-600/20 text-blue-400 font-bold text-xs"><FileText className="w-5 h-5" /></span>
                <div>
                  <h3 className="text-xs font-black truncate max-w-md text-slate-100 font-mono" title={selectedDocForPreview.fileName}>
                    {selectedDocForPreview.fileName}
                  </h3>
                  <span className="text-[9.5px] text-emerald-400 font-extrabold flex items-center gap-1 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" /> SECURE GOOGLE DRIVE ENCRYPTED VIEW
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-[10px] items-center gap-2 font-semibold">
                  <span className="text-slate-500">ZOOM:</span>
                  <span className="font-mono text-indigo-400">100% (Fit Window)</span>
                </div>
                <button 
                  onClick={() => setSelectedDocForPreview(null)}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-350 text-slate-400 p-2 rounded-full cursor-pointer transition"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* GDrive Simulation View Grid */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950">
              
              {/* Left Sandbox View (Manipulated legal copy manuscript) */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center gap-6 relative min-h-0 bg-slate-900 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                
                {/* Digitised Watermark Background overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none select-none overflow-hidden rotate-12">
                  <span className="text-[52px] font-black tracking-widest text-[#185FA5] text-center uppercase whitespace-pre">
                    LRLMS PORTAL - SECURE SANDBOX VIEWING<br />
                    LRLMS PORTAL - SECURE SANDBOX VIEWING<br />
                    LRLMS PORTAL - SECURE SANDBOX VIEWING
                  </span>
                </div>

                {/* Page 1 */}
                <div className="bg-white text-slate-850 text-slate-800 w-full max-w-[650px] shadow-lg rounded-md p-8 min-h-[550px] font-serif leading-relaxed text-xs border border-slate-200 relative select-text">
                  <div className="absolute top-4 right-4 text-[9.5px] font-mono text-slate-300 font-bold uppercase select-none">Page 1 of 2</div>
                  
                  {/* Page header */}
                  <div className="text-center pb-6 border-b border-slate-100 uppercase tracking-widest text-[10px] font-bold text-slate-400 select-none">
                    LEGAL RECORD MANAGEMENT STORAGE COPRORATE SYSTEM
                  </div>

                  <div className="mt-8 space-y-4">
                    <h2 className="text-center font-bold text-slate-950 text-sm mb-4 tracking-tight">MEMORANDUM OF UNDERSTANDING & AGREEMENT PROMPTUS</h2>
                    
                    <p className="indent-8">
                      This formal deed witnesseth that <strong>{selectedDocForPreview.parties?.join(" and ") || selectedDocForPreview.company}</strong> covenants and agrees under strict corporate guidelines relating to safe file storage and legal audits.
                    </p>

                    <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[10.5px] mt-6">Section I: Purpose & Definitions</h4>
                    <p className="indent-6">
                      The purpose of this instrument is to record the understandings, agreements, potential liabilities, and dispute exposure estimates currently evaluated. <strong>Risk Severity analysis of this filing has been automated through calibrated LRLMS filters</strong>.
                    </p>

                    <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[10.5px] mt-4">Section II: Risk and Vulnerabilities Audit Summary</h4>
                    <p className="indent-6 bg-slate-50 p-3 rounded border border-slate-100 font-sans text-[11px] text-slate-600 leading-normal">
                      <strong>AI Extraction OCR Ledger:</strong> {selectedDocForPreview.riskSummary || "Baseline metadata verification complete. No anomalies detected."}
                    </p>

                    <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[10.5px] mt-4">Section III: Non-Performance covenants</h4>
                    <p className="indent-6">
                      If either counterparty fails to provide satisfactory statutory performance in their respective jurisdiction (Yajur, Bally Jute or Yashoda), they will forfeit their standard dockets reserves and suffer priority indexing.
                    </p>
                  </div>
                </div>

                {/* Page 2 */}
                <div className="bg-white text-slate-850 text-slate-800 w-full max-w-[650px] shadow-lg rounded-md p-8 min-h-[250px] font-serif leading-relaxed text-xs border border-slate-200 relative select-text">
                  <div className="absolute top-4 right-4 text-[9.5px] font-mono text-slate-300 font-bold uppercase select-none">Page 2 of 2</div>
                  <div className="space-y-4 mt-8">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[10.5px]">Section IV: Execution Signatories</h4>
                    <p>In witness thereof, the corporate representatives execute this agreement in their true capacities.</p>
                    
                    <div className="grid grid-cols-2 gap-8 pt-8 text-[11px] font-sans">
                      <div>
                        <div className="border-b border-slate-350 border-slate-300 h-8 font-mono italic text-indigo-650 text-indigo-600">Prosun Majhi [Digitally Verified]</div>
                        <span className="block mt-1 font-bold text-slate-500 uppercase text-[9px]">Authorized Super Admin</span>
                        <span className="block text-[9.5px] text-slate-400">Timestamp: 2026-06-03 06:45:56 UTC</span>
                      </div>
                      <div>
                        <div className="border-b border-slate-350 border-slate-300 h-8 font-mono italic text-slate-400">Pending Execution</div>
                        <span className="block mt-1 font-bold text-slate-500 uppercase text-[9px]">{selectedDocForPreview.uploadedBy}</span>
                        <span className="block text-[9.5px] text-slate-400">Classification Category: {selectedDocForPreview.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Details Pane */}
              <div className="w-full md:w-80 bg-slate-950 p-5 border-t md:border-t-0 md:border-l border-slate-800 overflow-y-auto text-slate-300 space-y-5 font-sans">
                <span className="block text-[9.5px] font-black uppercase tracking-widest text-[#185FA5]">Filing Audit Metadata</span>
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Document Title</span>
                    <strong className="text-white block truncate mt-0.5" title={selectedDocForPreview.fileName}>{selectedDocForPreview.fileName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase font-bold">LRLMS System Unique Hash Code</span>
                    <code className="text-indigo-300 block font-mono text-[10.5px] bg-slate-900 py-1 px-1.5 rounded truncate mt-1">
                      SHA256_{selectedDocForPreview.googleDriveFileId || "SANDBOX_MOCK_DRIVE_HASH_ID"}
                    </code>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Uploaded By</span>
                      <strong className="text-slate-200 block truncate mt-0.5">{selectedDocForPreview.uploadedBy}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Uploaded Date</span>
                      <strong className="text-slate-200 block truncate mt-0.5">{new Date(selectedDocForPreview.uploadedOn).toLocaleDateString()}</strong>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Division Clearance</span>
                      <strong className="text-slate-200 block truncate mt-0.5">{selectedDocForPreview.company}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Document Version</span>
                      <strong className="text-slate-200 block truncate mt-0.5 font-mono">v{selectedDocForPreview.version}.0</strong>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Security Classification Status</span>
                    <span className="inline-block mt-1 font-mono text-[9px] font-bold bg-amber-950 text-amber-500 px-2 py-0.5 rounded border border-amber-900/40 uppercase tracking-widest">
                      RESTRICTED ARCHIVES
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-[11px] leading-relaxed">
                  <span className="block text-[9.5px] font-black uppercase text-rose-400 tracking-wider mb-1.5 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Google Drive Policy Warning
                  </span>
                  Raw downloading and printing acts for this filing have been <strong className="text-slate-100 font-semibold">withheld by your organisation's compliance administrator</strong>. Safe sandbox viewer is active under Multi-Tenant separation rules.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRON MONITOR SERVICE ALERT ALARM FLOATING STACK */}
      {cronAlerts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-45 space-y-3.5 w-96 font-sans max-h-[400px] overflow-y-auto">
          {cronAlerts.map((alert) => (
            <div 
              key={alert.id}
              className="bg-slate-900 text-white border-l-4 border-rose-500 rounded-lg shadow-2xl p-4 animate-in slide-in-from-bottom-6 duration-300 relative border border-slate-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="p-1 rounded bg-rose-500/10 text-rose-500"><Bell className="w-4 h-4 animate-bounce" /></span>
                  <span className="text-rose-505 text-rose-500 text-[10.5px] uppercase tracking-widest font-black">CRON WARNING SERVICE</span>
                </div>
                <button 
                  onClick={() => {
                    setSilencedAlertIds(prev => {
                      const updated = new Set(prev);
                      updated.add(alert.id);
                      return updated;
                    });
                  }}
                  className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
                  title="Close and Silence this alert warning"
                >
                  Dismiss &times;
                </button>
              </div>

              <div className="mt-3.5 space-y-1.5">
                <h5 className="text-slate-100 font-bold leading-normal text-xs font-mono">{alert.title}</h5>
                <p className="text-[10px] text-slate-400 font-medium">Clearance Tenant Context: <strong className="text-[#185FA5] text-indigo-300">{alert.company}</strong></p>
                
                <div className="flex items-center justify-between text-[10.5px] text-rose-405 text-rose-400 font-bold bg-rose-950/20 border border-rose-900/30 py-1 px-2 rounded-md mt-2">
                  <span>EXPIRING IN: {alert.daysLeft} DAYS</span>
                  <span className="font-mono">Deadline limits: {new Date(alert.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
