import React, { useState, useEffect } from "react";
import { 
  Building2, 
  ShieldCheck, 
  FileLock, 
  Folders, 
  Search, 
  IndianRupee, 
  AlertTriangle, 
  Users, 
  CalendarDays, 
  Gavel, 
  FileText, 
  Layers, 
  Sparkles, 
  Clock, 
  Plus, 
  Check, 
  Briefcase, 
  CheckCircle2, 
  X,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Download,
  DollarSign
} from "lucide-react";
import { 
  User, 
  CompanyType, 
  UserRole,
  Matter, 
  LegalDocument, 
  LegalNotice, 
  Hearing, 
  AuditLog, 
  MatterStatus, 
  DocCategory,
  NoticeStatus
} from "./types";
import MetricCards from "./components/MetricCards";
import MatterCard from "./components/MatterCard";
import DocumentUploadModal from "./components/DocumentUploadModal";
import LegalAssistantChat from "./components/LegalAssistantChat";
import { handleClientSideFallback } from "./lib/client_api";

// Resilient API Request Wrapper for fallback direct Supabase client sync
async function apiRequest(url: string, options: any = {}): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (res.status === 404 && url.startsWith("/api/")) {
      return await handleClientSideFallback(url, options);
    }
    return res;
  } catch (err) {
    if (url.startsWith("/api/")) {
      console.warn("Backend server not responding. Falling back to secure serverless client-side engine.", err);
      return await handleClientSideFallback(url, options);
    }
    throw err;
  }
}

export default function App() {
  // Database States
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [notices, setNotices] = useState<LegalNotice[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // UI Filters / Tab states
  const [selectedTab, setSelectedTab] = useState<"dashboard" | "matters" | "documents" | "notices" | "ai" | "users">("dashboard");
  const [matterSearch, setMatterSearch] = useState("");
  const [matterStatusFilter, setMatterStatusFilter] = useState<string>("All Statuses");
  const [matterTypeFilter, setMatterTypeFilter] = useState<string>("All Types");
  const [matterHighlightFilter, setMatterHighlightFilter] = useState<string>("All Matters");

  // User Administration states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [usrName, setUsrName] = useState("");
  const [usrEmail, setUsrEmail] = useState("");
  const [usrCompany, setUsrCompany] = useState<CompanyType | "Group">("Yajur");
  const [usrRole, setUsrRole] = useState<UserRole>("Lawyer");
  const [usrStatus, setUsrStatus] = useState<"Active" | "Inactive">("Active");
  const [userSearchText, setUserSearchText] = useState("");

  // Form toggles
  const [showCreateMatter, setShowCreateMatter] = useState(false);
  const [showCreateNotice, setShowCreateNotice] = useState(false);

  // New Matter Form States
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Litigation");
  const [newDept, setNewDept] = useState("Corporate Legal");
  const [newOpponent, setNewOpponent] = useState("");
  const [newCounsel, setNewCounsel] = useState("");
  const [newCourt, setNewCourt] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTargetCompany, setNewTargetCompany] = useState<CompanyType>("Yajur");

  // New Notice Form States
  const [noticeType, setNoticeType] = useState<"Incoming" | "Outgoing">("Incoming");
  const [noticeSubType, setNoticeSubType] = useState<"GST" | "PF" | "ESI" | "Labour" | "Court" | "Other">("GST");
  const [noticeSender, setNoticeSender] = useState("");
  const [noticeDeadline, setNoticeDeadline] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [noticeLead, setNoticeLead] = useState("");
  const [noticeTargetCompany, setNoticeTargetCompany] = useState<CompanyType>("Yajur");

  // Link upload helper
  const [linkedMatterFromDialog, setLinkedMatterFromDialog] = useState<string | null>(null);

  // Supabase Developer configuration States
  const [sysStatus, setSysStatus] = useState<any>(null);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  async function fetchSysStatus() {
    try {
      const res = await apiRequest("/api/sys-status");
      const data = await res.json();
      setSysStatus(data);
    } catch (err) {
      console.error("Failed to fetch system connection status info:", err);
    }
  }

  // Handle calling manual setup seed
  async function triggerManualSeed() {
    setIsSeeding(true);
    setSeedSuccessMsg("");
    try {
      const res = await apiRequest("/api/sys-status/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedSuccessMsg(data.message);
        await fetchSysStatus();
        await triggerManualRefresh();
      } else {
        alert(data.error || "Seed operation failed.");
      }
    } catch (err: any) {
      alert("Error seeding: " + err?.message);
    } finally {
      setIsSeeding(false);
    }
  }

  // Trigger loading initialization
  useEffect(() => {
    async function loadInit() {
      try {
        const res = await apiRequest("/api/init");
        const data = await res.json();
        setUsers(data.users);
        
        // Default to Prosun Majhi (Super Admin) if found, otherwise first user
        const adminUser = data.users.find((u: any) => u.email === "prosunmajhi@gmail.com") || data.users[0];
        setActiveUser(adminUser);

        await fetchSysStatus();
      } catch (err) {
        console.error("LRLMS Init error:", err);
      }
    }
    loadInit();
  }, []);

  // Fetch tenant-isolated database whenever active user switches!
  useEffect(() => {
    if (!activeUser) return;
    
    async function fetchIsolatedData() {
      try {
        const res = await apiRequest("/api/data", {
          headers: {
            "x-user-id": activeUser.id
          }
        });
        const data = await res.json();
        setMatters(data.matters);
        setDocuments(data.documents);
        setNotices(data.notices);
        setHearings(data.hearings);
        setAuditLogs(data.auditLogs);
      } catch (err) {
        console.error("Failed to sync isolated data context:", err);
      }
    }
    fetchIsolatedData();
  }, [activeUser]);

  // Handle re-triggering full panel refresh
  const triggerManualRefresh = async () => {
    if (!activeUser) return;
    try {
      const res = await apiRequest("/api/data", {
        headers: {
          "x-user-id": activeUser.id
        }
      });
      const data = await res.json();
      setMatters(data.matters);
      setDocuments(data.documents);
      setNotices(data.notices);
      setHearings(data.hearings);
      setAuditLogs(data.auditLogs);
    } catch (err) {
      console.error(err);
    }
  };

  // Create New Matter Handler
  const handleCreateMatterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await apiRequest("/api/matters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUser?.id || ""
        },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          company: activeUser?.role === "Super Admin" ? newTargetCompany : undefined,
          department: newDept,
          opponentParty: newOpponent,
          externalCounsel: newCounsel,
          courtOrAuthority: newCourt,
          value: Number(newValue) || 0,
          description: newDesc
        })
      });

      if (res.ok) {
        // Safe refresh
        await triggerManualRefresh();
        // Clear Form
        setNewTitle("");
        setNewOpponent("");
        setNewCounsel("");
        setNewCourt("");
        setNewValue("");
        setNewDesc("");
        setShowCreateMatter(false);
      }
    } catch (err) {
      console.error("Action creating matter failed:", err);
    }
  };

  // Stage Transition Handler (from interactive component checks)
  const handleUpdateMatterStage = async (id: string, nextStatus: MatterStatus) => {
    try {
      const res = await apiRequest(`/api/matters/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUser?.id || ""
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        await triggerManualRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Schedule court hearing on matter
  const handleScheduleHearing = async (matterId: string, hearingDate: string, court: string, remarks: string) => {
    try {
      const res = await apiRequest("/api/hearings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUser?.id || ""
        },
        body: JSON.stringify({ matterId, hearingDate, court, remarks })
      });

      if (res.ok) {
        await triggerManualRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upload file Syncing handler (integrates Gemini processing with GDrive save)
  const handleUploadDocument = async (payload: {
    fileName: string;
    category: DocCategory;
    matterId: string | null;
    textContent: string;
  }) => {
    try {
      const res = await apiRequest("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUser?.id || ""
        },
        body: JSON.stringify({
          ...payload,
          targetCompany: activeUser?.role === "Super Admin" ? newTargetCompany : undefined
        })
      });

      if (res.ok) {
        await triggerManualRefresh();
        setLinkedMatterFromDialog(null);
      } else {
        throw new Error("File sync error on virtual cloud ledger.");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Log compliance Notice
  const handleCreateNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeSender.trim()) return;

    try {
      const res = await apiRequest("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUser?.id || ""
        },
        body: JSON.stringify({
          type: noticeType,
          subType: noticeSubType,
          senderOrRecipient: noticeSender,
          deadlineDate: noticeDeadline || null,
          description: noticeDesc,
          legalTeamLead: noticeLead,
          company: activeUser?.role === "Super Admin" ? noticeTargetCompany : undefined
        })
      });

      if (res.ok) {
        await triggerManualRefresh();
        setNoticeSender("");
        setNoticeDeadline("");
        setNoticeDesc("");
        setNoticeLead("");
        setShowCreateNotice(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Notice Status
  const handleUpdateNoticeStatus = async (id: string, current: string) => {
    let nextStatus: NoticeStatus = "Pending Action";
    if (current === "Pending Action") nextStatus = "Responded";
    else if (current === "Responded") nextStatus = "Resolved";
    else nextStatus = "Pending Action";

    try {
      const res = await apiRequest(`/api/notices/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUser?.id || ""
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        await triggerManualRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit creator or updater of User Account
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usrName.trim() || !usrEmail.trim()) {
      alert("Name and Email are required");
      return;
    }

    try {
      const isEdit = !!editingUser;
      const url = isEdit ? `/api/users/${editingUser.id}` : "/api/users";
      const method = isEdit ? "PUT" : "POST";

      const bodyData = {
        name: usrName,
        email: usrEmail,
        company: usrCompany,
        role: usrRole,
        status: usrStatus
      };

      const res = await apiRequest(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUser?.id || ""
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        // Refresh users list
        const initRes = await apiRequest("/api/init");
        if (initRes.ok) {
          const initData = await initRes.json();
          setUsers(initData.users);
          
          // If editing activeUser, update local reference
          if (editingUser && activeUser && editingUser.id === activeUser.id) {
            const updatedMe = initData.users.find((u: User) => u.id === activeUser.id);
            if (updatedMe) setActiveUser(updatedMe);
          }
        }
        await triggerManualRefresh();
        
        // Reset states
        setUsrName("");
        setUsrEmail("");
        setUsrCompany("Yajur");
        setUsrRole("Lawyer");
        setUsrStatus("Active");
        setEditingUser(null);
        setShowUserModal(false);
      } else {
        const errText = await res.json();
        alert(errText.error || "Failed to submit user settings.");
      }
    } catch (err: any) {
      console.error("User save failed:", err);
      alert("Error: " + err?.message);
    }
  };

  // Delete simulator user
  const handleDeleteUser = async (userId: string) => {
    if (activeUser?.id === userId) {
      alert("You cannot delete the active simulator persona you are currently logged in as!");
      return;
    }
    if (!confirm("Are you sure you want to remove this user from the simulator database?")) {
      return;
    }

    try {
      const res = await apiRequest(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": activeUser?.id || ""
        }
      });

      if (res.ok) {
        const initRes = await apiRequest("/api/init");
        if (initRes.ok) {
          const initData = await initRes.json();
          setUsers(initData.users);
        }
        await triggerManualRefresh();
      } else {
        const errText = await res.json();
        alert(errText.error || "Failed deleting user");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err?.message);
    }
  };

  // Quick switch and linked tab routing from interactive widgets
  const openUploadForMatter = (matterId: string) => {
    setLinkedMatterFromDialog(matterId);
    setSelectedTab("documents");
  };

  // Frontend utility: checks if a trial schedule date is within 7 days of the reference date 2026-06-02
  const isWithin7Days = (hearingDateStr: string): boolean => {
    if (!hearingDateStr) return false;
    try {
      const today = new Date("2026-06-02");
      const targetDate = new Date(hearingDateStr);
      const timeDiff = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      // Returns true if date is within next 7 days (including today)
      return diffDays >= 0 && diffDays <= 7;
    } catch {
      return false;
    }
  };

  // Frontend utility: checks if a template date is within 14 days of June 2, 2026
  const isWithin14Days = (hearingDateStr: string | null | undefined): boolean => {
    if (!hearingDateStr) return false;
    try {
      const today = new Date("2026-06-02");
      const targetDate = new Date(hearingDateStr);
      const timeDiff = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return diffDays >= 0 && diffDays <= 14;
    } catch {
      return false;
    }
  };

  // Download Audit logs stream as a formatted CSV file
  const handleDownloadAuditLogsCSV = () => {
    if (!["Auditor", "Super Admin"].includes(activeUser?.role || "")) {
      alert("Access Denied: Only Auditor or Super Admin accounts can download secure logs.");
      return;
    }

    const headers = ["ID", "User ID", "User Name", "User Role", "Portal Clearance", "Action Category", "Filing Timestamp", "Audit Particulars"];
    const rows = auditLogs.map(log => [
      log.id,
      log.userId,
      log.userName,
      log.userRole,
      log.company,
      log.action,
      log.timestamp,
      `"${log.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `LRLMS_Immutable_Audits_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Search filtered matters matching user parameters and highlight directives
  const filteredMatters = matters.filter((m) => {
    const matchesSearch = 
      m.id.toLowerCase().includes(matterSearch.toLowerCase()) ||
      m.title.toLowerCase().includes(matterSearch.toLowerCase()) ||
      m.opponentParty.toLowerCase().includes(matterSearch.toLowerCase()) ||
      m.courtOrAuthority.toLowerCase().includes(matterSearch.toLowerCase()) ||
      m.externalCounsel.toLowerCase().includes(matterSearch.toLowerCase()) ||
      m.description.toLowerCase().includes(matterSearch.toLowerCase());

    const matchesStatus = matterStatusFilter === "All Statuses" || m.status === matterStatusFilter;
    const matchesType = matterTypeFilter === "All Types" || m.type === matterTypeFilter;

    let matchesHighlight = true;
    if (matterHighlightFilter === "Approaching Hearing") {
      // Approaching Next Hearing within 14 days of reference template
      matchesHighlight = m.nextHearingDate ? isWithin14Days(m.nextHearingDate) : false;
    } else if (matterHighlightFilter === "High Value Exposure") {
      // High value exposure check: value filter >= 50 Lakhs (5.0 Million)
      matchesHighlight = m.value >= 5000000;
    }

    return matchesSearch && matchesStatus && matchesType && matchesHighlight;
  });

  // Calculate sum counts for pie visualization inside dashboard
  const activeLitigations = matters.filter(m => m.type === "Litigation" && m.status !== "Closed").length;
  const activeContracts = matters.filter(m => m.type === "Contract" && m.status !== "Closed").length;
  const activeLabor = matters.filter(m => m.type === "Labor Matter" && m.status !== "Closed").length;
  const activeOther = matters.filter(m => !["Litigation", "Contract", "Labor Matter"].includes(m.type) && m.status !== "Closed").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      
      {/* Upper Navigation & Multi-Tenant Clearance bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 p-2 rounded-xl shadow-inner border border-indigo-400/30">
              <Folders className="h-5 w-5 text-indigo-50" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight font-display flex items-center gap-1.5 leading-none">
                <span>LRLMS</span>
                <span className="text-[10px] uppercase font-mono text-indigo-400 bg-indigo-900/60 border border-indigo-400/30 px-1.5 py-0.5 rounded leading-none">
                  V3.5 Platform
                </span>
              </h1>
              <span className="text-[10.5px] text-slate-400 block mt-0.5">
                Corporate Litigation & Document Repository
              </span>
            </div>
          </div>

          {/* User/Company Isolation Select Dropdown */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-850/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs text-slate-300 font-medium font-sans">Active Persona Clearance:</span>
            </div>
            
            <select
              id="user-persona-simulator"
              value={activeUser?.id || ""}
              onChange={(e) => {
                const sel = users.find(u => u.id === e.target.value);
                if (sel) {
                  setActiveUser(sel);
                  setSelectedTab("dashboard");
                }
              }}
              className="text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-600 text-white rounded px-2.5 py-1.5 max-w-[210px] outline-none cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role} - {u.company})
                </option>
              ))}
            </select>

            {/* Sync connection check badge */}
            <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[10px] px-2 py-1 rounded font-mono font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SECURED ISOLATION
            </div>

            {/* Supabase PostgreSQL Interactive setup Monitor widget */}
            {sysStatus && (
              <button
                id="open-supabase-setup-panel"
                onClick={() => setShowDevPanel(true)}
                className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded font-mono font-bold tracking-wide transition cursor-pointer border ${
                  sysStatus.active 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 animate-pulse"
                }`}
                title={sysStatus.active ? "Supabase PostgreSQL Connected. Click to inspect schemas & maps." : "Supabase tables not configured yet. Click to view configuration script."}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${sysStatus.active ? "bg-emerald-500" : "bg-amber-500 animate-ping"}`} />
                <span>{sysStatus.active ? "SUPABASE ENCRYPTED" : "SUPABASE SETUP PENDING"}</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Corporate Dashboard Tab controls */}
      <div className="bg-slate-900/95 text-slate-300 shrink-0">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 py-1 px-1">
            <button
              id="navigation-tab-dashboard"
              onClick={() => setSelectedTab("dashboard")}
              className={`px-3 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTab === "dashboard"
                  ? "bg-indigo-600 text-white font-bold"
                  : "hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Executive Dashboard
            </button>
            <button
              id="navigation-tab-matters"
              onClick={() => setSelectedTab("matters")}
              className={`px-3 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTab === "matters"
                  ? "bg-indigo-600 text-white font-bold"
                  : "hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              Matter Directory ({matters.length})
            </button>
            <button
              id="navigation-tab-documents"
              onClick={() => {
                setLinkedMatterFromDialog(null);
                setSelectedTab("documents");
              }}
              className={`px-3 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTab === "documents"
                  ? "bg-indigo-600 text-white font-bold"
                  : "hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <FileLock className="h-3.5 w-3.5" />
              GDrive Synced Repository
            </button>
            <button
              id="navigation-tab-notices"
              onClick={() => setSelectedTab("notices")}
              className={`px-3 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTab === "notices"
                  ? "bg-indigo-600 text-white font-bold"
                  : "hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Regulatory notices ({notices.length})
            </button>
            <button
              id="navigation-tab-ai"
              onClick={() => setSelectedTab("ai")}
              className={`px-3 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTab === "ai"
                  ? "bg-indigo-600 text-white font-bold bg-indigo-600/10"
                  : "hover:text-indigo-400 hover:bg-indigo-950/20"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              AI Counselor workspace
            </button>
            <button
              id="navigation-tab-users"
              onClick={() => setSelectedTab("users")}
              className={`px-3 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTab === "users"
                  ? "bg-indigo-600 text-white font-bold"
                  : "hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              Users & Portal Acceses ({users.length})
            </button>
          </nav>

          <button 
            id="force-app-state-reload"
            onClick={triggerManualRefresh}
            className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-medium font-sans px-2.5 py-1 rounded hover:bg-slate-800/70 cursor-pointer"
            title="Force synchronization with PostgreSQL schema and GDrive API records"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync DB</span>
          </button>
        </div>
      </div>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* Tenant clearance indicator banner */}
        <div className="bg-white border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-xl text-indigo-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Currently viewing isolated tenant portal mapping:</p>
              <h2 className="text-base font-bold font-display text-slate-800">
                {activeUser?.company === "Group" 
                  ? "Yajur, Bally Jute and Yashoda Enterprise Group" 
                  : `${activeUser?.company} Corporate Division`
                }
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium bg-indigo-50/50 border border-indigo-100 px-3 py-1.5 rounded-lg text-indigo-800">
            <ShieldCheck className="h-4 w-4" />
            <span>Scope Cleared for: <strong>{activeUser?.role}</strong></span>
          </div>
        </div>

        {/* METRIC KPI TILES */}
        <MetricCards 
          matters={matters}
          documents={documents}
          notices={notices}
          hearings={hearings}
        />

        {/* ==================== TAB 1: EXECUTIVE DASHBOARD ==================== */}
        {selectedTab === "dashboard" && (
          <div className="space-y-6">
            {/* High-Priority Red Visual Badge & Alert Banner */}
            {hearings.some(h => h.status === "Scheduled" && isWithin7Days(h.hearingDate)) && (
              <div id="dashboard-high-priority-alert" className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span id="high-priority-badge" className="text-[9.5px] bg-rose-600 text-white font-extrabold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider leading-none">
                        High-Priority
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-none">Urgent Hearing Docket Deadline</h4>
                    </div>
                    <p className="text-[11px] text-rose-800 mt-1 font-medium">
                      Judicial proceedings are scheduled to take place within the next 7 days. Prepare complete counsel briefs and documents immediately.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <span className="text-[10px] font-bold px-2 py-1 bg-white border border-rose-200 rounded-lg text-rose-700 font-mono shadow-3xs uppercase">
                    {hearings.filter(h => h.status === "Scheduled" && isWithin7Days(h.hearingDate)).length} Case(s) Pending
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left bento area - Graphical charts and upcoming calendars */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* SVG Flex Widgets: Case Breakdowns & Exposure distributions */}
              <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
                <h3 className="text-sm font-bold font-display text-slate-900 mb-5 flex items-center justify-between">
                  <span>Litigation Exposure & Active Matter Allocation</span>
                  <span className="text-[10px] text-slate-400 font-normal">Updated: Live Sync</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Visual SVG chart - Active cases allocation */}
                  <div className="border border-slate-50 rounded-lg p-4 bg-slate-50/30 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] block text-slate-400 font-bold uppercase tracking-wider">Active Portfolio Breakup</span>
                      <div className="mt-4 flex items-center gap-4 justify-around">
                        {/* Custom visual ring chart widget in SVG */}
                        <div className="relative w-28 h-28 shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                            {/* Segment 1: Litigations */}
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#6366f1" strokeWidth="3" 
                              strokeDasharray={`${(activeLitigations/matters.length || 0)*100} ${100 - (activeLitigations/matters.length || 0)*100}`}
                              strokeDashoffset="0" />
                            {/* Segment 2: Contracts */}
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" 
                              strokeDasharray={`${(activeContracts/matters.length || 0)*100} ${100 - (activeContracts/matters.length || 0)*100}`}
                              strokeDashoffset={`-${(activeLitigations/matters.length || 0)*100}`} />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-bold font-display leading-none">{matters.length}</span>
                            <span className="text-[8px] text-slate-400 uppercase mt-0.5">Total</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></span>
                            <span>Litigation ({activeLitigations})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span>
                            <span>Contracts ({activeContracts})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span>
                            <span>Labor disputes ({activeLabor})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-slate-400 rounded-sm"></span>
                            <span>Other ({activeOther})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual SVG chart - Exposure value across tenants */}
                  <div className="border border-slate-50 rounded-lg p-4 bg-slate-50/30">
                    <span className="text-[11px] block text-slate-400 font-bold uppercase tracking-wider">Litigation Exposure Allocation</span>
                    
                    <div className="mt-4 space-y-4">
                      {["Yajur", "Bally Jute", "Yashoda"].map((comp) => {
                        const compMatters = matters.filter(m => m.company === comp && m.status !== "Closed");
                        const compExposure = compMatters.reduce((sum, m) => sum + m.value, 0);
                        const totalAll = matters.reduce((sum, m) => sum + m.value, 0) || 1;
                        const pctComp = Math.min(100, (compExposure / totalAll) * 100);

                        return (
                          <div key={comp} className="space-y-1 text-xs">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-slate-700">{comp} corporate</span>
                              <span className="text-slate-900 font-mono">₹{(compExposure / 10000000).toFixed(2)} Cr</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  comp === "Yajur" ? "bg-indigo-600" : comp === "Bally Jute" ? "bg-amber-500" : "bg-emerald-600"
                                }`}
                                style={{ width: `${pctComp}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* Hearing Dockets Calendar panel */}
              <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-1.5">
                    <CalendarDays className="h-4.5 w-4.5 text-indigo-600" />
                    Trial Registry Calendar - Next 30 Days
                  </h3>
                  <button 
                    onClick={() => setSelectedTab("matters")}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                  >
                    Manage Docket
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                  {hearings.filter(h => h.status === "Scheduled").length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-6 rounded-lg text-center border border-dashed">
                      No trial proceedings scheduled in the immediate calendar.
                    </p>
                  ) : (
                    hearings
                      .filter(h => h.status === "Scheduled")
                      .map((hrg) => {
                        const isUpcomingUrgent = isWithin7Days(hrg.hearingDate);
                        const dateParts = hrg.hearingDate.split("-");
                        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                        const monthIdx = dateParts[1] ? parseInt(dateParts[1], 10) - 1 : 5;
                        const monthLabel = monthNames[monthIdx] || "JUN";
                        const dayNum = dateParts[2] || "01";

                        return (
                          <div key={hrg.id} className={`py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 first:pt-0 last:pb-0 ${
                            isUpcomingUrgent ? "bg-rose-50/50 p-2 rounded-lg border border-rose-200/50 mt-1 first:mt-0" : ""
                          }`}>
                            <div className="flex items-start gap-3">
                              <div className={`h-11 w-11 shrink-0 rounded-lg border flex flex-col items-center justify-center text-[10px] leading-tight ${
                                isUpcomingUrgent 
                                  ? "bg-rose-500 text-white border-rose-600 font-bold ring-2 ring-rose-200" 
                                  : "bg-indigo-50 border-indigo-100 text-indigo-700 font-medium"
                              }`}>
                                <span className="text-[8.5px] uppercase font-mono tracking-wider leading-none mt-0.5">{monthLabel}</span>
                                <span className="text-sm font-extrabold font-display leading-none mt-1">{dayNum}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{hrg.matterTitle}</h4>
                                  {isUpcomingUrgent && (
                                    <span className="text-[8.5px] font-mono tracking-wider bg-rose-600 text-white font-extrabold px-1.5 py-0.5 rounded leading-none flex items-center justify-center gap-0.5 uppercase mb-0.5 animate-pulse">
                                      Within 7 Days
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-0.5 flex items-center gap-1">
                                  <span className="font-semibold text-indigo-700">{hrg.court}</span>
                                  <span>•</span>
                                  <span className="italic">Case Ref: {hrg.matterId}</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-left sm:text-right">
                              <span className={`text-[10.5px] font-mono border px-2 py-0.5 rounded font-bold uppercase ${
                                isUpcomingUrgent 
                                  ? "bg-rose-100 text-rose-800 border-rose-200/50" 
                                  : "bg-indigo-50 text-indigo-800 border-indigo-100/50"
                              }`}>
                                {hrg.company}
                              </span>
                              <span className="block text-[11px] text-slate-500 italic mt-1 max-w-[190px] truncate" title={hrg.remarks}>
                                "{hrg.remarks}"
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

            </div>

            {/* Right column - Audit Logs and rapid compliance trackers */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Compliance quick list */}
              <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
                    Regulatory Alert Warnings
                  </h3>
                  <button 
                    onClick={() => setSelectedTab("notices")}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {notices.filter(n => n.status === "Pending Action").length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-lg text-center border border-dashed">
                      All audit and regulatory warnings answered. No pending action!
                    </p>
                  ) : (
                    notices
                      .filter(n => n.status === "Pending Action")
                      .map((ntc) => (
                        <div key={ntc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-bold bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 rounded uppercase">
                              {ntc.subType} Notice
                            </span>
                            <span className="text-[10px] text-rose-700 font-bold font-mono">
                              Due: {ntc.deadlineDate || "Immediate"}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 mt-2 font-display truncate">
                            {ntc.senderOrRecipient}
                          </h4>
                          <p className="text-[10.5px] text-slate-550 mt-1 line-clamp-2 leading-relaxed">
                            {ntc.description}
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                            <span className="text-[9.5px] text-slate-400">Company: <strong>{ntc.company}</strong></span>
                            <button
                              id={`respond-notice-btn-${ntc.id}`}
                              onClick={() => handleUpdateNoticeStatus(ntc.id, ntc.status)}
                              className="text-[9.5px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              File Draft Response &rarr;
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Secure Systems Audit log stream */}
              <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-1.5 leading-none">
                    <Clock className="h-4.5 w-4.5 text-slate-700 font-medium" />
                    Secure Immutable Audits
                  </h3>
                  {["Auditor", "Super Admin"].includes(activeUser?.role || "") && (
                    <button
                      id="export-audit-csv-btn"
                      onClick={handleDownloadAuditLogsCSV}
                      className="text-[10px] bg-slate-50 hover:bg-slate-100 border text-slate-700 px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer font-sans font-bold shadow-2xs"
                      title="Download full immutable audit trail as a CSV file"
                    >
                      <Download className="h-3 w-3 text-indigo-600" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border-l-2 border-indigo-500 pl-3 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-900">
                          {log.action}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        {log.details}
                      </p>
                      <span className="text-[9px] block text-slate-400">
                        By: <span className="font-semibold">{log.userName} ({log.userRole})</span> • {log.company}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
          </div>
        )}

        {/* ==================== TAB 2: MATTER MASTER LIST ==================== */}
        {selectedTab === "matters" && (
          <div className="space-y-6">
            
            {/* Quick Action Highlight Filters */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 inline-block bg-indigo-500 rounded" />
                <div>
                  <span className="text-xs font-bold text-slate-100 block font-display leading-none">Smart Focus Highlighters</span>
                  <span className="text-[10.5px] text-slate-400 block mt-1 font-sans">Filter database immediately by upcoming docket schedules or peak litigation exposures.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap font-sans">
                <button
                  id="highlight-all"
                  onClick={() => setMatterHighlightFilter("All Matters")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 border ${
                    matterHighlightFilter === "All Matters"
                      ? "bg-indigo-600 text-white border-indigo-650 shadow-2xs"
                      : "bg-slate-800 text-slate-350 hover:bg-slate-700/50 border-slate-700 hover:text-white"
                  }`}
                >
                  All Active ({matters.length})
                </button>
                <button
                  id="highlight-approaching"
                  onClick={() => setMatterHighlightFilter("Approaching Hearing")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 border ${
                    matterHighlightFilter === "Approaching Hearing"
                      ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                      : "bg-slate-800 text-slate-350 hover:text-white border-slate-700 hover:border-rose-500/30"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  Approaching Next Hearing (&le; 14 Days) ({matters.filter(m => m.nextHearingDate && isWithin14Days(m.nextHearingDate)).length})
                </button>
                <button
                  id="highlight-high-value"
                  onClick={() => setMatterHighlightFilter("High Value Exposure")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 border ${
                    matterHighlightFilter === "High Value Exposure"
                      ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                      : "bg-slate-800 text-slate-350 hover:text-white border-slate-700 hover:border-amber-500/30"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  High Litigation Exposure &ge; 50L ({matters.filter(m => m.value >= 5000000).length})
                </button>
              </div>
            </div>

            {/* Filter controls bar */}
            <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Left filter inputs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {/* Search Box */}
                <div className="relative w-full sm:w-64">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by case, lawyer, details..."
                    value={matterSearch}
                    onChange={(e) => setMatterSearch(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-2.5 outline-none font-sans"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={matterStatusFilter}
                  onChange={(e) => setMatterStatusFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none cursor-pointer"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Opened">Opened</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Filed">Filed</option>
                  <option value="Hearing">Hearing</option>
                  <option value="Settlement">Settlement</option>
                  <option value="Closed">Closed</option>
                </select>

                {/* Type Filter */}
                <select
                  value={matterTypeFilter}
                  onChange={(e) => setMatterTypeFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none cursor-pointer"
                >
                  <option value="All Types">All Matter Types</option>
                  <option value="Litigation">Litigation</option>
                  <option value="Contract">Contract</option>
                  <option value="Labor Matter">Labor Matter</option>
                  <option value="Regulatory">Regulatory</option>
                  <option value="Compliance">Compliance</option>
                  <option value="IP/Trademark">IP/Trademark</option>
                  <option value="Property">Property</option>
                </select>
              </div>

              {/* Right creation triggers */}
              {["Super Admin", "Company Admin", "Legal Head"].includes(activeUser?.role || "") && (
                <button
                  id="open-matter-creation-modal"
                  onClick={() => setShowCreateMatter(true)}
                  className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Instantiate New Matter
                </button>
              )}
            </div>

            {/* Inline popup form for Creating Matter */}
            {showCreateMatter && (
              <div className="bg-white border-2 border-indigo-100 rounded-xl p-6 shadow-md relative animate-fade-in text-slate-800">
                <button 
                  onClick={() => setShowCreateMatter(false)}
                  className="absolute right-4 top-4 hover:bg-slate-100 p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
                <h3 className="text-base font-bold font-display text-slate-900 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  Initialize Corporate Legal Matter
                </h3>
                <p className="text-xs text-slate-500 mb-4 font-sans">
                  Instantiate a legal proceeding, audit case, trademark defense or land verification index.
                </p>

                <form onSubmit={handleCreateMatterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Matter Folder Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. GST Appeal for Credit Disputes"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Classification Type</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-white outline-none focus:border-indigo-400 cursor-pointer"
                      >
                        <option value="Litigation">Litigation Proceedings</option>
                        <option value="Contract">Sourcing/Commercial Contract</option>
                        <option value="Labor Matter">Labor / Worker disputes</option>
                        <option value="Regulatory">GST / Statutory Appeals</option>
                        <option value="Compliance">PF / Compliance notices</option>
                        <option value="IP/Trademark">Trademark & Brand Infringements</option>
                        <option value="Property">Real Estate Title validation</option>
                      </select>
                    </div>

                    {activeUser?.role === "Super Admin" ? (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Company Tenant</label>
                        <select
                          value={newTargetCompany}
                          onChange={(e) => setNewTargetCompany(e.target.value as CompanyType)}
                          className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-white outline-none focus:border-indigo-400 cursor-pointer"
                        >
                          <option value="Yajur">Yajur Industrial Group</option>
                          <option value="Bally Jute">Bally Jute Corp</option>
                          <option value="Yashoda">Yashoda Real Estate</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Company Tenant</label>
                        <input
                          type="text"
                          disabled
                          value={activeUser?.company}
                          className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Internal department</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Finance & Taxation"
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opposing Entity</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. State excise department"
                        value={newOpponent}
                        onChange={(e) => setNewOpponent(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned Counsel</label>
                      <input
                        type="text"
                        placeholder="Name of external lawyer representing"
                        value={newCounsel}
                        onChange={(e) => setNewCounsel(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Authorized Court Form</label>
                      <input
                        type="text"
                        placeholder="e.g. Calcutta High Court"
                        value={newCourt}
                        onChange={(e) => setNewCourt(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Litigation Exposure (INR)</label>
                      <input
                        type="number"
                        required
                        placeholder="value in rupees"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Particular Description & Context</label>
                      <input
                        type="text"
                        placeholder="Detailed specifics of default claims or contractual considerations"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateMatter(false)}
                      className="text-xs font-semibold hover:bg-slate-100 border px-3.5 py-2 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="save-new-matter-btn"
                      type="submit"
                      className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg cursor-pointer"
                    >
                      Authenticate and Register
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Matter Cards List Grid */}
            <div className="space-y-6">
              {filteredMatters.length === 0 ? (
                <div className="bg-white border rounded-xl p-12 text-center text-slate-400 shadow-3xs">
                  <Briefcase className="h-10 w-10 text-slate-350 mx-auto mb-2" />
                  <p className="text-sm font-bold font-display text-slate-800">No clearance matters found matching filters.</p>
                  <p className="text-xs text-slate-400 mt-1">Please modify your search criteria or register a new matter.</p>
                </div>
              ) : (
                filteredMatters.map((matter) => (
                  <MatterCard
                    key={matter.id}
                    matter={matter}
                    documents={documents}
                    hearings={hearings}
                    onUpdateStatus={handleUpdateMatterStage}
                    onScheduleHearing={handleScheduleHearing}
                    onAddDocumentClick={openUploadForMatter}
                  />
                ))
              )}
            </div>

          </div>
        )}

        {/* ==================== TAB 3: DIGITAL DOCUMENT REPOSITORY ==================== */}
        {selectedTab === "documents" && (
          <DocumentUploadModal
            onUpload={handleUploadDocument}
            matters={matters}
            documents={documents}
            currentCompany={activeUser?.company === "Group" ? "Group HQ" : (activeUser?.company || "Yajur")}
          />
        )}

        {/* ==================== TAB 4: COMPLIANCE & NOTICE CENTER ==================== */}
        {selectedTab === "notices" && (
          <div className="space-y-6">
            
            {/* Upper Action Panel */}
            <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900">
                  Regulatory & Compliance Audit Controller
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Active statutory audits, GST revaluations and PF demands.
                </p>
              </div>

              {["Super Admin", "Company Admin", "Legal Head"].includes(activeUser?.role || "") && (
                <button
                  id="open-notice-creation-modal"
                  onClick={() => setShowCreateNotice(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Log New Notice
                </button>
              )}
            </div>

            {/* In-view notice registration form */}
            {showCreateNotice && (
              <div className="bg-white border-2 border-indigo-100 p-6 rounded-xl shadow-md text-slate-800 animate-fade-in relative">
                <button 
                  onClick={() => setShowCreateNotice(false)}
                  className="absolute right-4 top-4 hover:bg-slate-100 p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
                <h3 className="text-sm font-bold font-display text-slate-900 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                  Log Incoming/Outgoing Legal Notice Form
                </h3>
                <p className="text-xs text-slate-500 mb-4 font-sans">
                  Record communications with GST, Provident Fund, Labour Commissioners, or competitor trademark offices.
                </p>

                <form onSubmit={handleCreateNoticeSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notice Direction</label>
                      <select
                        value={noticeType}
                        onChange={(e) => setNoticeType(e.target.value as "Incoming" | "Outgoing")}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-white cursor-pointer"
                      >
                        <option value="Incoming">Incoming Notice (Received)</option>
                        <option value="Outgoing">Outgoing Notice (Sent)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notice Subcategory</label>
                      <select
                        value={noticeSubType}
                        onChange={(e) => setNoticeSubType(e.target.value as any)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-white cursor-pointer"
                      >
                        <option value="GST">GST Taxation Notice</option>
                        <option value="PF">EPF/Provident Fund Audit</option>
                        <option value="ESI">ESI Health Contribution Mismatch</option>
                        <option value="Labour">Labour Commissioner Standing Orders</option>
                        <option value="Court">Formal Court Summon / Warrant</option>
                        <option value="Other">Other Regulatory/IP Notice</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opposing Entity / Sender</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Deputy Commissioner Howrah Office"
                        value={noticeSender}
                        onChange={(e) => setNoticeSender(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Compliance Deadline</label>
                      <input
                        type="date"
                        required
                        value={noticeDeadline}
                        onChange={(e) => setNoticeDeadline(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notice Context Summary</label>
                      <input
                        type="text"
                        placeholder="Particular highlights requested, monetary limits, or default dates details"
                        value={noticeDesc}
                        onChange={(e) => setNoticeDesc(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Advocate Lead</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Verma"
                        value={noticeLead}
                        onChange={(e) => setNoticeLead(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                  </div>

                  {activeUser?.role === "Super Admin" && (
                    <div className="max-w-xs">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Tenant</label>
                      <select
                        value={noticeTargetCompany}
                        onChange={(e) => setNoticeTargetCompany(e.target.value as CompanyType)}
                        className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-white cursor-pointer"
                      >
                        <option value="Yajur">Yajur Industrial Group</option>
                        <option value="Bally Jute">Bally Jute Corp</option>
                        <option value="Yashoda">Yashoda Real Estate</option>
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCreateNotice(false)}
                      className="text-xs font-semibold hover:bg-slate-100 border px-3.5 py-2 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="save-new-notice-btn"
                      type="submit"
                      className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg cursor-pointer"
                    >
                      Log, Index and Save
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notice Ledger Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notices.length === 0 ? (
                <div className="col-span-full bg-white border rounded-xl p-12 text-center text-slate-400">
                  <AlertTriangle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold font-display text-slate-800">No statutory audit warnings reported for current clearance.</p>
                </div>
              ) : (
                notices.map((ntc) => (
                  <div
                    key={ntc.id}
                    className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {ntc.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            ntc.type === "Incoming" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-teal-50 text-teal-700 border border-teal-100"
                          }`}>
                            {ntc.type}
                          </span>
                          <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                            {ntc.company}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono text-slate-400">Classification: **{ntc.subType}**</span>
                      <h4 className="text-base font-bold font-display text-slate-900 mt-1 leading-snug">
                        {ntc.senderOrRecipient}
                      </h4>
                      <p className="text-xs text-slate-600 mt-2.5 font-sans leading-relaxed">
                        {ntc.description}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Limit Deadline:</span>
                        <span className="font-bold text-rose-700 font-mono">
                          {ntc.deadlineDate || "Immediate Verification"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Assigned Counsel:</span>
                        <span className="font-semibold text-slate-700">{ntc.legalTeamLead}</span>
                      </div>

                      {/* Interactive Stage Transition for Notices in Ledger */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[11.5px] font-bold px-2.5 py-1 rounded-full ${
                          ntc.status === "Pending Action" ? "bg-rose-100 text-rose-800" :
                          ntc.status === "Responded" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          • Status: {ntc.status}
                        </span>

                        <button
                          id={`action-notice-${ntc.id}`}
                          onClick={() => handleUpdateNoticeStatus(ntc.id, ntc.status)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          Change Phase &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ==================== TAB 6: USERS & PORTAL ACCESS MATRICES ==================== */}
        {selectedTab === "users" && (
          <div className="space-y-6">
            
            {/* Main Header card */}
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                  <span className="p-1 px-2.5 rounded bg-indigo-500 text-white font-mono text-xs">Simulators</span>
                  Simulator User Administration Directory
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  Manage simulated enterprise accounts, adjust access roles, toggle Active statuses, and define multi-tenant portal routing mappings.
                </p>
              </div>

              <button
                id="add-new-simulator-user-btn"
                onClick={() => {
                  setEditingUser(null);
                  setUsrName("");
                  setUsrEmail("");
                  setUsrCompany("Yajur");
                  setUsrRole("Lawyer");
                  setUsrStatus("Active");
                  setShowUserModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer select-none"
              >
                <Plus className="h-4 w-4" />
                <span>Add Simulated Account</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Directory Column */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Search Bar */}
                <div className="bg-white border border-slate-150 rounded-xl p-4 shadow-xs flex items-center gap-3">
                  <Search className="h-4 w-4 text-slate-400 font-sans" />
                  <input
                    id="search-simulator-users-input-box"
                    type="text"
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    placeholder="Search users by Name, Email, Role, or Organization..."
                    className="flex-1 bg-transparent border-none text-xs text-slate-700 placeholder-slate-400 outline-none font-sans"
                  />
                  {userSearchText && (
                    <button
                      onClick={() => setUserSearchText("")}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer font-sans"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Users List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.filter(u => {
                    const search = userSearchText.toLowerCase();
                    return (
                      u.name.toLowerCase().includes(search) ||
                      u.email.toLowerCase().includes(search) ||
                      u.role.toLowerCase().includes(search) ||
                      u.company.toLowerCase().includes(search)
                    );
                  }).map(u => {
                    const hasAccessToYajur = u.company === "Group" || u.company === "Yajur";
                    const hasAccessToBally = u.company === "Group" || u.company === "Bally Jute";
                    const hasAccessToYashoda = u.company === "Group" || u.company === "Yashoda";
                    const isActive = u.status !== "Inactive";

                    return (
                      <div 
                        key={u.id}
                        id={`user-sim-card-${u.id}`}
                        className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition relative overflow-hidden ${
                          activeUser?.id === u.id ? "border-indigo-500 ring-2 ring-indigo-50" : "border-slate-150"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 block tracking-wider uppercase font-bold leading-none">
                                ID: {u.id}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug font-sans">
                                {u.name}
                              </h4>
                              <span className="text-xs text-slate-505 select-all font-mono">
                                {u.email}
                              </span>
                            </div>

                            {/* Status Badge */}
                            <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold font-mono tracking-wide ${
                              isActive 
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                                : "bg-red-50 text-red-600 border border-red-200/50"
                            }`}>
                              {isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </div>

                          {/* Role and Company Metadata */}
                          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs font-sans">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-bold font-mono">Simulated Role</span>
                              <span className="font-semibold text-slate-700 block mt-0.5">{u.role}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-bold font-mono font-sans font-medium">Clearance Portal</span>
                              <span className="font-semibold text-slate-700 block mt-0.5 select-none text-xs">
                                {u.company === "Group" ? "Enterprise Group" : `${u.company} Portal`}
                              </span>
                            </div>
                          </div>

                          {/* Visual Portal Mappings Indicators */}
                          <div className="mt-4 pt-4 border-t border-slate-100 font-sans">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold font-mono mb-2">Portal Access Authorization</span>
                            <div className="flex items-center gap-1.5 flex-wrap font-sans">
                              <span className={`text-[10px] px-2 py-1 rounded font-semibold flex items-center gap-1 ${
                                hasAccessToYajur 
                                  ? "bg-slate-900 text-white font-bold" 
                                  : "bg-slate-100 text-slate-400 line-through"
                              }`}>
                                <Building2 className="h-3 w-3" />
                                Yajur
                              </span>
                              <span className={`text-[10px] px-2 py-1 rounded font-semibold flex items-center gap-1 ${
                                hasAccessToBally 
                                  ? "bg-slate-900 text-white font-bold" 
                                  : "bg-slate-100 text-slate-400 line-through"
                              }`}>
                                <Building2 className="h-3 w-3" />
                                Bally Jute
                              </span>
                              <span className={`text-[10px] px-2 py-1 rounded font-semibold flex items-center gap-1 ${
                                hasAccessToYashoda 
                                  ? "bg-slate-900 text-white font-bold" 
                                  : "bg-slate-100 text-slate-400 line-through"
                              }`}>
                                <Building2 className="h-3 w-3" />
                                Yashoda
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Direct simulator login trigger / settings row */}
                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-sans">
                          {activeUser?.id === u.id ? (
                            <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded">
                              <ShieldCheck className="h-4 w-4 text-indigo-505" />
                              Active clearance
                            </span>
                          ) : (
                            <button
                              id={`simulate-login-btn-${u.id}`}
                              onClick={() => {
                                setActiveUser(u);
                                setSelectedTab("dashboard");
                              }}
                              className="text-xs text-indigo-650 hover:text-indigo-805 text-indigo-600 font-bold hover:bg-slate-50 p-1.5 px-3 rounded-lg border border-indigo-100 transition cursor-pointer select-none"
                            >
                              Simulate Login
                            </button>
                          )}

                          <div className="flex items-center gap-1.5 leading-none">
                            <button
                              id={`edit-user-btn-${u.id}`}
                              onClick={() => {
                                setEditingUser(u);
                                setUsrName(u.name);
                                setUsrEmail(u.email);
                                setUsrCompany(u.company);
                                setUsrRole(u.role);
                                setUsrStatus(u.status || "Active");
                                setShowUserModal(true);
                              }}
                              className="text-xs hover:bg-slate-50 text-slate-600 hover:text-slate-900 p-1.5 rounded font-semibold transition cursor-pointer select-none"
                            >
                              Edit Settings
                            </button>
                            <button
                              id={`delete-user-btn-${u.id}`}
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-xs text-red-500 hover:bg-red-50 p-1.5 rounded font-semibold transition cursor-pointer select-none"
                              title="Delete from local simulation database"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Portal access Matrix information panel col */}
              <div className="space-y-6">
                
                {/* Visual access explanation card */}
                <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-mono font-bold text-indigo-400 tracking-wider uppercase">
                    Interactive Multi-Tenant Access Matrix
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    LRLMS enforces secure data segregation on every API payload resolution check. Each simulated user restricts visual query results strictly to their portal clearance.
                  </p>

                  <div className="space-y-3.5 pt-2">
                    <div className="bg-slate-850/60 p-3.5 rounded-lg border border-slate-800 flex items-start gap-3">
                      <div className="p-1 px-1.5 bg-indigo-500/10 border border-indigo-400/30 text-indigo-400 rounded text-[9.5px] font-mono uppercase font-bold shrink-0 mt-0.5">
                        Group
                      </div>
                      <div className="font-sans">
                        <span className="text-xs font-bold block text-white leading-none">Super Admin & Group Roles</span>
                        <span className="text-[11px] text-slate-400 block mt-1.5 leading-relaxed font-sans">
                          Global multi-tenant clearance. Can view aggregates across Yajur, Bally Jute, and Yashoda Portals. Can toggle simulations.
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-850/60 p-3.5 rounded-lg border border-slate-800 flex items-start gap-3">
                      <div className="p-1 px-1.5 bg-yellow-500/10 border border-yellow-400/30 text-yellow-400 rounded text-[9.5px] font-mono uppercase font-bold shrink-0 mt-0.5">
                        Admin
                      </div>
                      <div className="font-sans font-medium">
                        <span className="text-xs font-bold block text-white leading-none">Company Administrator</span>
                        <span className="text-[11px] text-slate-400 block mt-1.5 leading-relaxed">
                          Unrestricted writing and workflow configuration permissions isolated strictly to resources belonging to their assigned Portal.
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-850/60 p-3.5 rounded-lg border border-slate-800 flex items-start gap-3">
                      <div className="p-1 px-1.5 bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 rounded text-[9.5px] font-mono uppercase font-bold shrink-0 mt-0.5 font-sans">
                        Legal
                      </div>
                      <div className="font-sans font-medium">
                        <span className="text-xs font-bold block text-white leading-none font-sans">Workflow Roles (Lawyer / Head)</span>
                        <span className="text-[11px] text-slate-400 block mt-1.5 leading-relaxed font-sans">
                          Permitted to log incoming notices, schedule hearings, and upload active legal briefs directly into Google Drive synced storage.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit and access parameters log matrix card */}
                <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-xs space-y-4 font-sans">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Clearance Logs
                  </h4>
                  <p className="text-xs text-slate-505 leading-relaxed font-sans">
                    The active simulated persona governs resource query scope. Below are the last 4 audit security records reflecting access actions.
                  </p>
                  
                  <div className="space-y-3.5 font-sans">
                    {auditLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="border-l-2 border-indigo-400 pl-3.5 text-xs font-sans">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-850">{log.userName} ({log.userRole})</span>
                          <span className="font-mono text-slate-400">{log.timestamp.split("T")[1]?.slice(0, 5) || "Live"}</span>
                        </div>
                        <span className="text-slate-600 text-[11.5px] block mt-1 leading-snug">{log.details}</span>
                        <span className="font-mono text-[9px] block text-slate-400 mt-1 uppercase">scope: {log.company} Portal</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Simulated User Settings overlay Dialog */}
            {showUserModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
                    <h3 className="text-sm font-bold font-display leading-none">
                      {editingUser ? "Edit Simulator Account Setup" : "Add Simulated Persona"}
                    </h3>
                    <button 
                      onClick={() => setShowUserModal(false)}
                      className="text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <form onSubmit={handleUserSubmit} className="p-6 space-y-4 font-sans text-xs">
                    <div>
                      <label className="text-xs text-slate-600 block font-bold uppercase tracking-wide">Account Name</label>
                      <input 
                        id="user-form-name-input"
                        type="text" 
                        required
                        value={usrName}
                        onChange={(e) => setUsrName(e.target.value)}
                        placeholder="e.g. Yash Vardhan Pathak"
                        className="w-full mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans outline-none focus:border-indigo-500 focus:bg-white text-slate-850"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 block font-bold uppercase tracking-wide">Account Email / Username</label>
                      <input 
                        id="user-form-email-input"
                        type="email" 
                        required
                        value={usrEmail}
                        onChange={(e) => setUsrEmail(e.target.value)}
                        placeholder="e.g. yashpathak@corporate.com"
                        className="w-full mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans outline-none focus:border-indigo-500 focus:bg-white text-slate-850"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-600 block font-bold uppercase tracking-wide">Active Role</label>
                        <select
                          id="user-form-role-select"
                          value={usrRole}
                          onChange={(e) => setUsrRole(e.target.value as any)}
                          className="w-full mt-1.5 p-2 bg-slate-50 border border-slate-250 rounded-lg text-xs outline-none"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Company Admin">Company Admin</option>
                          <option value="Legal Head">Legal Head</option>
                          <option value="Manager">Manager</option>
                          <option value="Lawyer">Lawyer</option>
                          <option value="Viewer">Viewer</option>
                          <option value="Auditor">Auditor</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-600 block font-bold uppercase tracking-wide">Status</label>
                        <select
                          id="user-form-status-select"
                          value={usrStatus}
                          onChange={(e) => setUsrStatus(e.target.value as any)}
                          className="w-full mt-1.5 p-2 bg-slate-50 border border-slate-250 rounded-lg text-xs outline-none"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 block font-bold uppercase tracking-wide text-xs">Corporate Portal Assignment</label>
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-none font-sans">
                        Governs data isolation logic parameters.
                      </span>
                      <select
                        id="user-form-company-select"
                        value={usrCompany}
                        onChange={(e) => setUsrCompany(e.target.value as any)}
                        className="w-full mt-1.5 p-2 bg-slate-50 border border-slate-250 rounded-lg text-xs outline-none"
                      >
                        <option value="Yajur">Yajur Corporate Division</option>
                        <option value="Bally Jute">Bally Jute Industry Division</option>
                        <option value="Yashoda">Yashoda Healthcare Division</option>
                        <option value="Group">Global Enterprise Group HQ (All Portals)</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-sans">
                      <button 
                        type="button"
                        onClick={() => setShowUserModal(false)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition cursor-pointer select-none"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition cursor-pointer select-none"
                      >
                        {editingUser ? "Save Settings" : "Instantiate Persona"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== TAB 5: AI CLIENT LEGAL COUNSEL WORKSPACE ==================== */}
        {selectedTab === "ai" && (
          <LegalAssistantChat user={activeUser || users[0]} />
        )}

      </main>

      {/* Beautiful drawer flyout setup panel */}
      {showDevPanel && sysStatus && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/40 backdrop-blur-xs font-sans">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between text-slate-800 animate-in slide-in-from-right duration-250">
            
            {/* Drawer Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold font-display leading-none flex items-center gap-2">
                    Supabase & Google Drive Setup Monitor
                  </h3>
                  <span className="text-[10.5px] text-slate-400 block mt-1 leading-none">
                    LRLMS Multi-Tenant Synchronization Management
                  </span>
                </div>
              </div>
              <button 
                onClick={() => { setShowDevPanel(false); setSeedSuccessMsg(""); }}
                className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Conn status bar */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                sysStatus.active 
                  ? "bg-emerald-50/60 border-emerald-100 text-emerald-900" 
                  : "bg-amber-50/60 border-amber-100 text-amber-900"
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${sysStatus.active ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-ping"}`} />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide">
                    Database State: {sysStatus.active ? "Operational (Supabase PostgreSQL)" : "Tables Missing / Fallback Mode"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {sysStatus.statusMessage}
                  </p>
                </div>
              </div>

              {/* GDrive setup parameters card */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
                  Google Drive Folder Mappings & API Nodes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sysStatus.gdrive.folders.map((f: any) => (
                    <div key={f.name} className="bg-white p-3.5 rounded-lg border border-slate-100 shadow-xs flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-900 leading-none">{f.name} tenant</span>
                      <span className="text-[10px] font-mono text-slate-400 mt-2 block break-all">ID: {f.id}</span>
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-indigo-600 font-bold leading-none select-all cursor-pointer">
                        <span>Drive Linked</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[10.5px] text-slate-500 font-mono flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-slate-100 uppercase">
                  <span className="font-bold text-indigo-700">Credential API Key:</span>
                  <span>{sysStatus.gdrive.keyPrefix}</span>
                </div>
              </div>

              {/* SQL setup scripts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Supabase PostgreSQL Schema generation Script (DDL)
                  </h4>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(sysStatus.sqlScript);
                      alert("Successfully copied SQL DDL Script! Execute this script inside your Supabase dashboard's SQL Editor to instantiate schemas.");
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Copy Script</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  LRLMS V3.5 features fully isolated relational structures. Execute this script inside your **Supabase Dashboard SQL editor** to activate multi-tenant cloud storage:
                </p>
                <div className="relative">
                  <pre className="text-[10.5px] font-mono bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 max-h-[220px] overflow-y-auto overflow-x-auto whitespace-pre">
                    {sysStatus.sqlScript}
                  </pre>
                </div>
              </div>

              {/* Seeding tools buttons */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                  Seeding & Synchronization Utilities
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Once your Supabase schema tables are defined, click below to bulk synchronized and seed original enterprise accounts, matters, notices, hearings and historic logs directly into your PostgreSQL database.
                </p>
                
                {seedSuccessMsg ? (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3.5 rounded-lg font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    <span>{seedSuccessMsg}</span>
                  </div>
                ) : (
                  <button
                    onClick={triggerManualSeed}
                    disabled={isSeeding}
                    className={`w-full py-2.5 px-4 text-xs font-bold rounded-lg text-white transition flex items-center justify-center gap-2 cursor-pointer ${
                      isSeeding ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700 active:scale-98"
                    }`}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSeeding ? "animate-spin" : ""}`} />
                    <span>{isSeeding ? "Synchronizing Cloud ledgers..." : "Seed & Sync Supabase DB"}</span>
                  </button>
                )}
              </div>

            </div>

            {/* Close Button */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => { setShowDevPanel(false); setSeedSuccessMsg(""); }}
                className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg cursor-pointer transition active:scale-98"
              >
                Close Setup Monitor
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Corporate footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-5 border-t border-slate-800 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1 font-sans">
          <p>© 2026 LRLMS - Legal Repository & Litigation Management System. Indian Corporate Conglomerate Node.</p>
          <p className="text-[11px] text-slate-500">
            Multi-Tenant isolated security protocol validated. Active session mapping verified for Yajur, Bally Jute and Yashoda.
          </p>
        </div>
      </footer>

    </div>
  );
}
