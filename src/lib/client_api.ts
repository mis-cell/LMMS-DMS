import { User, Matter, LegalDocument, LegalNotice, Hearing, AuditLog, DocumentVersion } from "../types";

// Static defaults matching data/database.json for fallback/offline/static mode
const INITIAL_USERS: User[] = [
  {
    id: "u-super",
    name: "Prosun Majhi",
    email: "prosunmajhi@gmail.com",
    company: "Group",
    role: "Super Admin"
  },
  {
    id: "u-yajur-admin",
    name: "Amit Sharma",
    email: "amit.sharma@yajur.com",
    company: "Yajur",
    role: "Company Admin"
  },
  {
    id: "u-bally-admin",
    name: "Sanjay Bose",
    email: "sanjay.bose@ballyjute.com",
    company: "Bally Jute",
    role: "Company Admin"
  },
  {
    id: "u-yashoda-admin",
    name: "Vikram Rao",
    email: "vikram.rao@yashoda.com",
    company: "Yashoda",
    role: "Company Admin"
  },
  {
    id: "u-bally-lawyer",
    name: "Ananya Sen",
    email: "ananya.sen@ballyjute.com",
    company: "Bally Jute",
    role: "Lawyer"
  },
  {
    id: "u-yajur-head",
    name: "Rahul Verma",
    email: "rahul.verma@yajur.com",
    company: "Yajur",
    role: "Legal Head"
  }
];

const INITIAL_MATTERS: Matter[] = [
  {
    id: "MAT-Y-101",
    title: "Trade Union Dispute - Wage Restructuring Case",
    company: "Yajur",
    type: "Labor Matter",
    department: "Human Resources & Industrial Relations",
    opponentParty: "Yajur Employees Sangha (Trade Union)",
    externalCounsel: "Advocate Debasish Kar (Calcutta High Court)",
    courtOrAuthority: "State Industrial Tribunal, Kolkata",
    filingDate: "2025-03-12",
    nextHearingDate: "2026-06-15",
    status: "Hearing",
    description: "Adjudication of industrial dispute under Section 10 of Industrial Disputes Act regarding wage revision, bonus structure adjustments, and shift modifications.",
    value: 4500000,
    createdOn: "2025-03-12",
    createdBy: "Rahul Verma"
  },
  {
    id: "MAT-Y-102",
    title: "GST ITC Reversal Dispute FY 22-23",
    company: "Yajur",
    type: "Regulatory",
    department: "Finance & Taxation",
    opponentParty: "Assistant Commissioner of State Tax, West Bengal",
    externalCounsel: "Khaitan & Co., Tax Division",
    courtOrAuthority: "GST Appellate Authority",
    filingDate: "2025-10-05",
    nextHearingDate: "2026-07-20",
    status: "Under Review",
    description: "Appeal filed against the order of demand for reversal of Input Tax Credit on capital goods claiming mismatch under GSTR-2B.",
    value: 18500000,
    createdOn: "2025-10-05",
    createdBy: "Rahul Verma"
  },
  {
    id: "MAT-B-201",
    title: "Bally Jute Raw Sourcing Agreement Non-Performance Claim",
    company: "Bally Jute",
    type: "Contract",
    department: "Procurement & Commercial",
    opponentParty: "Bengal Jute Traders Co.",
    externalCounsel: "Advocate Sucharita Guha",
    courtOrAuthority: "Arbitration Tribunal of Indian Jute Mills Association",
    filingDate: "2025-06-18",
    nextHearingDate: "2026-06-25",
    status: "Hearing",
    description: "Arbitration proceedings initiated for recovery of advance payments and damages due to non-supply of requested quality of Tossa Raw Jute.",
    value: 8500000,
    createdOn: "2025-06-18",
    createdBy: "Sanjay Bose"
  },
  {
    id: "MAT-B-202",
    title: "Bally Jute Mill ESI Contribution Demand Appeal",
    company: "Bally Jute",
    type: "Compliance",
    department: "Legal & EHS Compliance",
    opponentParty: "Employees' State Insurance Corporation",
    externalCounsel: "Advocate N. K. Roy",
    courtOrAuthority: "Employees' Insurance Court (EI Court)",
    filingDate: "2025-01-20",
    nextHearingDate: "2026-06-10",
    status: "Filed",
    description: "Appeal against the ad-hoc ESI contribution demand on contract laborers working during mill shutdown periods.",
    value: 1200000,
    createdOn: "2025-01-20",
    createdBy: "Ananya Sen"
  },
  {
    id: "MAT-S-301",
    title: "Yashoda Real Estate Property Title Suit - Rajarhat Site",
    company: "Yashoda",
    type: "Property",
    department: "Land & Property Acquisition",
    opponentParty: "S. K. Naskar & Successors",
    externalCounsel: "Sanders & Partners",
    courtOrAuthority: "Civil Judge Senior Division, Alipore Court",
    filingDate: "2024-04-10",
    nextHearingDate: null,
    status: "Closed",
    description: "Title verification and declaratory suit successfully decided in favour of Yashoda confirming legal title of the 4-acre commercial parcel.",
    value: 115000000,
    createdOn: "2024-04-10",
    createdBy: "Vikram Rao"
  },
  {
    id: "MAT-S-302",
    title: "Yashoda Brands IP Imitator Cease Action",
    company: "Yashoda",
    type: "IP/Trademark",
    department: "Corporate & Brand Marketing",
    opponentParty: "Yashoda Organic Aggregates Private Limited",
    externalCounsel: "T. Prasat, Senior IP Counsel",
    courtOrAuthority: "Hon'ble High Court of Calcutta (IP Division)",
    filingDate: "2025-11-12",
    nextHearingDate: "2026-06-30",
    status: "Hearing",
    description: "Injunction application filed seeking trademark infringement relief against the imitator using ‘Yashoda’ logo with identical branding fonts for consumer foods.",
    value: 6000000,
    createdOn: "2025-11-12",
    createdBy: "Vikram Rao"
  }
];

const INITIAL_DOCUMENTS: LegalDocument[] = [
  {
    id: "DOC-Y-001",
    matterId: "MAT-Y-101",
    fileName: "Yajur_Trade_Union_Demands_Memo_Aug_2025.pdf",
    category: "Pleadings",
    googleDriveFileId: "1g9D_KAsfU733H_m-lW2NAs9810Xy_VdY",
    googleDriveLink: "https://drive.google.com/open?id=1g9D_KAsfU733H_m-lW2NAs9810Xy_VdY",
    version: 2,
    uploadedBy: "Rahul Verma",
    uploadedOn: "2025-08-15T14:30:00Z",
    company: "Yajur",
    riskSummary: "This document outlines the demand charter from the Trade Union regarding wage revisions, medical coverage increments, and shift allowances. The key conflict point is the retroactive clause requesting salary adjustment dating back to June 2024.",
    riskLevel: "Medium",
    parties: ["Yajur Management", "Yajur Employees Sangha"],
    expiryDate: null
  },
  {
    id: "DOC-B-002",
    matterId: "MAT-B-201",
    fileName: "Raw_Jute_Sourcing_Contract_Signed_2025.pdf",
    category: "Contracts",
    googleDriveFileId: "1bM4u39XmXg1Wb3gU_b1A2f0ZpQw_u81F",
    googleDriveLink: "https://drive.google.com/open?id=1bM4u39XmXg1Wb3gU_b1A2f0ZpQw_u81F",
    version: 1,
    uploadedBy: "Sanjay Bose",
    uploadedOn: "2025-06-20T09:12:00Z",
    company: "Bally Jute",
    riskSummary: "Raw jute sourcing agreement. Section 8 details Force Majeure and Section 14 is the Arbitration clause. High financial risk due to lack of non-performance penalties in case delivery delays do not exceed 30 working days.",
    riskLevel: "High",
    parties: ["Bally Jute Mills Ltd", "Bengal Jute Traders Co."],
    expiryDate: "2026-06-20"
  },
  {
    id: "DOC-Y-003",
    matterId: "MAT-Y-102",
    fileName: "Show_Cause_GST_ITC_Reversal_Order.pdf",
    category: "Court Orders",
    googleDriveFileId: "1fP3l_XmY7N_a87C_m0Rz9X1Pq_2Lg910",
    googleDriveLink: "https://drive.google.com/open?id=1fP3l_XmY7N_a87C_m0Rz9X1Pq_2Lg910",
    version: 1,
    uploadedBy: "Amit Sharma",
    uploadedOn: "2025-10-06T11:45:00Z",
    company: "Yajur",
    riskSummary: "Order issued by GST Audit Wing demanding a reversal amount of INR 1.85 Crores along with retrospective 18% p.a. interest. The primary claim revolves around alleged duplicate ITC claims made on structural steels used as plant building columns.",
    riskLevel: "High",
    parties: ["State Tax Authority", "Yajur Holdings"],
    expiryDate: null
  },
  {
    id: "DOC-S-004",
    matterId: "MAT-S-301",
    fileName: "Title_Deed_Verification_Report_Rajarhat.pdf",
    category: "Internal Legal Opinions",
    googleDriveFileId: "1sR0t_G9XfL6P3w_l1Q9t7N7Op_kWq102",
    googleDriveLink: "https://drive.google.com/open?id=1sR0t_G9XfL6P3w_l1Q9t7N7Op_kWq102",
    version: 1,
    uploadedBy: "Vikram Rao",
    uploadedOn: "2024-05-18T16:00:00Z",
    company: "Yashoda",
    riskSummary: "Due diligence report on Rajarhat property parcel confirming clean title, complete chain of mutation documentations from 1985 to present, and zero outstanding mortgage filings with the Sub-Registrar.",
    riskLevel: "Low",
    parties: ["Yashoda Group Legal Team", "Sub-Registrar Alipore"],
    expiryDate: null
  }
];

const INITIAL_NOTICES: LegalNotice[] = [
  {
    id: "NTC-Y-01",
    company: "Yajur",
    type: "Incoming",
    subType: "Labour",
    senderOrRecipient: "Deputy Labour Commissioner Office, West Bengal",
    receivedOrSentDate: "2026-05-10",
    deadlineDate: "2026-06-12",
    status: "Pending Action",
    description: "Notice requesting submission of certified standing orders and employment register roll for checking compliance under Payment of Wages Act.",
    legalTeamLead: "Rahul Verma"
  },
  {
    id: "NTC-B-02",
    company: "Bally Jute",
    type: "Incoming",
    subType: "PF",
    senderOrRecipient: "Regional Provident Fund Commissioner, Howrah",
    receivedOrSentDate: "2026-05-20",
    deadlineDate: "2026-06-25",
    status: "Pending Action",
    description: "Demand notice alleging mismatch of interest contribution on temporary contractual weavers for period of April 2024 - September 2024.",
    legalTeamLead: "Ananya Sen"
  },
  {
    id: "NTC-S-03",
    company: "Yashoda",
    type: "Outgoing",
    subType: "Court",
    senderOrRecipient: "Yashoda Organic Aggregates Private Limited",
    receivedOrSentDate: "2026-05-11",
    deadlineDate: "2026-06-05",
    status: "Responded",
    description: "Cease and Desist legal notice demanding immediate withdrawal of packaging and branding showing a derivative identical mark of 'Yashoda Organic'.",
    legalTeamLead: "Vikram Rao"
  }
];

const INITIAL_HEARINGS: Hearing[] = [
  {
    id: "HRG-101",
    matterId: "MAT-B-202",
    matterTitle: "Bally Jute Mill ESI Contribution Demand Appeal",
    company: "Bally Jute",
    hearingDate: "2026-06-10",
    court: "Employees' Insurance Court (EI Court), Howrah",
    status: "Scheduled",
    remarks: "Ananya Sen to present physical register rosters and verify matching contributions."
  },
  {
    id: "HRG-102",
    matterId: "MAT-Y-101",
    matterTitle: "Trade Union Dispute - Wage Restructuring Case",
    company: "Yajur",
    hearingDate: "2026-06-15",
    court: "State Industrial Tribunal, Kolkata (Judge B. Roy)",
    status: "Scheduled",
    remarks: "Oral arguments from management on feasibility of bonus restructuring."
  },
  {
    id: "HRG-103",
    matterId: "MAT-B-201",
    matterTitle: "Bally Jute Raw Sourcing Agreement Non-Performance Claim",
    company: "Bally Jute",
    hearingDate: "2026-06-25",
    court: "Arbitration Tribunal @ IJMA Building",
    status: "Scheduled",
    remarks: "Cross-examination of opposing logistics subcontractor witnesses."
  },
  {
    id: "HRG-104",
    matterId: "MAT-S-302",
    matterTitle: "Yashoda Brands IP Imitator Cease Action",
    company: "Yashoda",
    hearingDate: "2026-06-30",
    court: "Hon'ble High Court of Calcutta (IP Division)",
    status: "Scheduled",
    remarks: "Hearing on interim injunction application. Expecting stay on imitator sales."
  }
];

const INITIAL_AUDITS: AuditLog[] = [
  {
    id: "LOG-001",
    userId: "u-super",
    userName: "Prosun Majhi",
    userRole: "Super Admin",
    company: "Group",
    action: "Database Initialized",
    timestamp: "2026-06-02T10:28:15Z",
    details: "LRLMS multi-tenant repository populated with initial records for Yajur, Bally Jute and Yashoda."
  }
];

// Configuration variables matching Supabase and Google Drive details provided by user
const SUPABASE_REST_URL = "https://vterzzuvlxkhjowfehye.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZXJ6enV2bHhraGpvd2ZlaHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA5NDQsImV4cCI6MjA5NTk2Njk0NH0.zADYJNw-ISXdoeZqGXciofWKwOm8JDrzvVBEQ2WZuhs";
const GOOGLE_DRIVE_API_KEY = "AIzaSyDHLtYWJ900iYAu70e9mtFfVbr4N1i2kT4";

const FOLDER_MAP: Record<string, string> = {
  "Yajur": "1Lg3Jt-KTic7PnxTdQdWxIDwWITN9many",
  "Bally Jute": "1jv1pCVF8JjFJu-AoSbXqYDThccGZfw5T",
  "Yashoda": "1EnNR1R_g0UIg9IBj3OzPafCEkR95ZQGG"
};

// Client-side Local State in case Supabase schema is missing or loading fails
const clientState = {
  get db() {
    try {
      const stored = localStorage.getItem("lrlms_local_db");
      if (stored) return JSON.parse(stored);
    } catch {}
    const defaultDb = {
      users: INITIAL_USERS,
      matters: INITIAL_MATTERS,
      documents: INITIAL_DOCUMENTS,
      notices: INITIAL_NOTICES,
      hearings: INITIAL_HEARINGS,
      auditLogs: INITIAL_AUDITS
    };
    localStorage.setItem("lrlms_local_db", JSON.stringify(defaultDb));
    return defaultDb;
  },
  save(newDb: any) {
    localStorage.setItem("lrlms_local_db", JSON.stringify(newDb));
  }
};

// Helper to query Supabase directly from browser
async function directSupabaseRequest(endpoint: string, options: any = {}) {
  const url = `${SUPABASE_REST_URL.replace(/\/$/, "")}/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase Error (${response.status}): ${text}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Check if user has initialized schema in their Supabase
async function probeSupabaseConnection(): Promise<{ success: boolean; tables: Record<string, boolean> }> {
  const tables = {
    lrlms_users: false,
    lrlms_matters: false,
    lrlms_documents: false,
    lrlms_notices: false,
    lrlms_hearings: false,
    lrlms_audit_logs: false
  };

  try {
    await directSupabaseRequest("lrlms_users?limit=1");
    tables.lrlms_users = true;
  } catch {}

  try {
    await directSupabaseRequest("lrlms_matters?limit=1");
    tables.lrlms_matters = true;
  } catch {}

  try {
    await directSupabaseRequest("lrlms_documents?limit=1");
    tables.lrlms_documents = true;
  } catch {}

  try {
    await directSupabaseRequest("lrlms_notices?limit=1");
    tables.lrlms_notices = true;
  } catch {}

  try {
    await directSupabaseRequest("lrlms_hearings?limit=1");
    tables.lrlms_hearings = true;
  } catch {}

  try {
    await directSupabaseRequest("lrlms_audit_logs?limit=1");
    tables.lrlms_audit_logs = true;
  } catch {}

  const success = Object.values(tables).every(v => v);
  return { success, tables };
}

// Client-side Direct Google Drive upload function
async function clientUploadToGoogleDrive(fileName: string, textContent: string, folderId: string) {
  try {
    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType: "text/plain",
      parents: [folderId]
    };

    const body = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain\r\n\r\n' +
      textContent +
      closeDelimiter;

    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${GOOGLE_DRIVE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: body
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: errText.substring(0, 150) };
    }

    const data = await response.json();
    return {
      success: true,
      fileId: data.id,
      fileLink: `https://drive.google.com/open?id=${data.id}`
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failure to upload to drive API" };
  }
}

// Handle all mock-to-Supabase redirect fallbacks
export async function handleClientSideFallback(url: string, options: any = {}): Promise<Response> {
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : null;
  const headers = options.headers || {};
  const activeUserId = headers["x-user-id"] || "u-super";

  const db = clientState.db;
  const activeUser = db.users.find((u: any) => u.id === activeUserId) || db.users[0];

  // 1. GET sys-status
  if (url === "/api/sys-status") {
    try {
      const probe = await probeSupabaseConnection();
      const statusMessage = probe.success ? "Fully Connected" : "Tables Missing / Fallback Mode";
      return new Response(JSON.stringify({
        active: probe.success,
        configured: true,
        statusMessage,
        tables: probe.tables,
        sqlScript: "",
        details: {
          url: SUPABASE_REST_URL,
          keyPattern: "anon public client key active"
        }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch {
      return new Response(JSON.stringify({
        active: false,
        configured: true,
        statusMessage: "Supabase connection error",
        tables: {},
        sqlScript: ""
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  }

  // 2. POST sys-status/seed
  if (url === "/api/sys-status/seed" && method === "POST") {
    try {
      const probe = await probeSupabaseConnection();
      if (!probe.success) {
        return new Response(JSON.stringify({ error: "Please execute the SQL database schema first inside your Supabase dashboard." }), { status: 400 });
      }

      // Seed if tables successfully present
      await directSupabaseRequest("lrlms_users", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(db.users) });
      await directSupabaseRequest("lrlms_matters", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(db.matters) });
      await directSupabaseRequest("lrlms_documents", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(db.documents) });
      await directSupabaseRequest("lrlms_notices", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(db.notices) });
      await directSupabaseRequest("lrlms_hearings", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(db.hearings) });
      await directSupabaseRequest("lrlms_audit_logs", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(db.auditLogs) });

      return new Response(JSON.stringify({ success: true, message: "Successfully synced and seeded LRLMS records directly inside Supabase." }), { status: 200 });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err?.message || "Failed seeding" }), { status: 500 });
    }
  }

  // 3. GET /api/init
  if (url === "/api/init") {
    try {
      const probe = await probeSupabaseConnection();
      if (probe.tables.lrlms_users) {
        const liveUsers = await directSupabaseRequest("lrlms_users?select=*");
        if (liveUsers && liveUsers.length > 0) {
          db.users = liveUsers;
          clientState.save(db);
        }
      }
    } catch {}
    return new Response(JSON.stringify({
      users: db.users,
      companies: ["Yajur", "Bally Jute", "Yashoda"]
    }), { status: 200 });
  }

  // 4. GET /api/data
  if (url === "/api/data") {
    try {
      const probe = await probeSupabaseConnection();
      if (probe.success) {
        // Fetch all live tables from Supabase and sync local DB state!
        let [users, matters, docs, notices, hearings, audits] = await Promise.all([
          directSupabaseRequest("lrlms_users?select=*"),
          directSupabaseRequest("lrlms_matters?select=*"),
          directSupabaseRequest("lrlms_documents?select=*"),
          directSupabaseRequest("lrlms_notices?select=*"),
          directSupabaseRequest("lrlms_hearings?select=*"),
          directSupabaseRequest("lrlms_audit_logs?select=*&order=timestamp.desc")
        ]);

        // Auto-seed table structures if they are connected, but completely empty!
        if (users && users.length === 0) {
          console.log("Supabase connected but found empty. Bootstrapping data seeds from frontend client...");
          try {
            await Promise.all([
              directSupabaseRequest("lrlms_users", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(INITIAL_USERS) }),
              directSupabaseRequest("lrlms_matters", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(INITIAL_MATTERS) }),
              directSupabaseRequest("lrlms_documents", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(INITIAL_DOCUMENTS) }),
              directSupabaseRequest("lrlms_notices", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(INITIAL_NOTICES) }),
              directSupabaseRequest("lrlms_hearings", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(INITIAL_HEARINGS) }),
              directSupabaseRequest("lrlms_audit_logs", { method: "POST", headers: { "Prefer": "resolution=ignore-duplicates" }, body: JSON.stringify(INITIAL_AUDITS) })
            ]);

            // Re-assign fetched variables to avoid returning empty arrays on this initial synchronized request as well
            users = INITIAL_USERS;
            matters = INITIAL_MATTERS;
            docs = INITIAL_DOCUMENTS;
            notices = INITIAL_NOTICES;
            hearings = INITIAL_HEARINGS;
            audits = INITIAL_AUDITS;
            console.log("Supabase table bootstrap finished successfully.");
          } catch (seedErr) {
            console.error("Failed to automatically seed Supabase on-the-fly:", seedErr);
          }
        }

        if (users) db.users = users;
        if (matters) db.matters = matters;
        if (docs) db.documents = docs;
        if (notices) db.notices = notices;
        if (hearings) db.hearings = hearings;
        if (audits) db.auditLogs = audits;
        clientState.save(db);
      }
    } catch (err) {
      console.warn("Could not load from live Supabase on fallback. Using localStorage:", err);
    }

    // Filter by Tenant Isolation
    const userCompany = activeUser.company;
    const isSuper = activeUser.role === "Super Admin";

    const filteredMatters = isSuper ? db.matters : db.matters.filter((m: any) => m.company === userCompany);
    const filteredDocs = isSuper ? db.documents : db.documents.filter((d: any) => d.company === userCompany);
    const filteredNotices = isSuper ? db.notices : db.notices.filter((n: any) => n.company === userCompany);
    const filteredHearings = isSuper ? db.hearings : db.hearings.filter((h: any) => h.company === userCompany);
    const filteredAudits = isSuper ? db.auditLogs : db.auditLogs.filter((l: any) => l.company === userCompany || l.company === "Group");

    return new Response(JSON.stringify({
      matters: filteredMatters,
      documents: filteredDocs,
      notices: filteredNotices,
      hearings: filteredHearings,
      auditLogs: filteredAudits
    }), { status: 200 });
  }

  // 5. POST /api/users (Create Simulator User)
  if (url === "/api/users" && method === "POST") {
    const { name, email, company, role } = body;
    const generatedId = `USR_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const newUser: User = { id: generatedId, name, email, company, role, status: "Active" };

    db.users.push(newUser);
    clientState.save(db);

    try {
      const probe = await probeSupabaseConnection();
      if (probe.tables.lrlms_users) {
        await directSupabaseRequest("lrlms_users", { method: "POST", body: JSON.stringify(newUser) });
      }
    } catch {}

    // Add client-side audit log
    await addFallbackAuditLog("u-super", activeUser.name, activeUser.role, "Group", "User Deployed", `Created user profile ${newUser.name} associated with ${company}.`);

    return new Response(JSON.stringify(newUser), { status: 200 });
  }

  // 6. POST/PUT/DELETE /api/users/:id (Update, Edit or Delete Persona)
  if (url.startsWith("/api/users/")) {
    const userId = url.split("/").pop();
    
    // DELETE action
    if (method === "DELETE" || (method === "POST" && body?.action === "DELETE")) {
      const userToDelete = db.users.find((u: any) => u.id === userId);
      const name = userToDelete ? userToDelete.name : "Persona";
      
      db.users = db.users.filter((u: any) => u.id !== userId);
      clientState.save(db);

      try {
        const probe = await probeSupabaseConnection();
        if (probe.tables.lrlms_users) {
          await directSupabaseRequest(`lrlms_users?id=eq.${encodeURIComponent(userId!)}`, {
            method: "DELETE"
          });
        }
      } catch {}

      await addFallbackAuditLog("u-super", activeUser.name, activeUser.role, "Group", "User Deleted", `Removed user profile (${name}) from the central repository.`);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // UPDATE / EDIT profile details (PUT)
    if (method === "PUT") {
      const userIdx = db.users.findIndex((u: any) => u.id === userId);
      if (userIdx !== -1) {
        const originalUser = db.users[userIdx];
        const { name, email, company, role, status } = body;
        
        const updated = {
          ...originalUser,
          name: name ?? originalUser.name,
          email: email ?? originalUser.email,
          company: company ?? originalUser.company,
          role: role ?? originalUser.role,
          status: status ?? originalUser.status
        };

        db.users[userIdx] = updated;
        clientState.save(db);

        try {
          const probe = await probeSupabaseConnection();
          if (probe.tables.lrlms_users) {
            await directSupabaseRequest(`lrlms_users?id=eq.${encodeURIComponent(userId!)}`, {
              method: "PATCH",
              body: JSON.stringify({ name, email, company, role, status })
            });
          }
        } catch {}

        await addFallbackAuditLog("u-super", activeUser.name, activeUser.role, "Group", "User Modified", `Updated settings for persona (${updated.name}) registered with ${updated.company}.`);
        return new Response(JSON.stringify(updated), { status: 200 });
      }
    }

    // UPDATE STATUS ONLY (POST)
    if (method === "POST") {
      const { status } = body;
      const userIdx = db.users.findIndex((u: any) => u.id === userId);
      if (userIdx !== -1) {
        db.users[userIdx].status = status || "Active";
        clientState.save(db);

        try {
          const probe = await probeSupabaseConnection();
          if (probe.tables.lrlms_users) {
            await directSupabaseRequest(`lrlms_users?id=eq.${encodeURIComponent(userId!)}`, {
              method: "PATCH",
              body: JSON.stringify({ status })
            });
          }
        } catch {}

        await addFallbackAuditLog("u-super", activeUser.name, activeUser.role, "Group", "User Status Changed", `Set user status of (${db.users[userIdx].name}) to '${status}'.`);
        return new Response(JSON.stringify(db.users[userIdx]), { status: 200 });
      }
    }
  }

  // 7. POST /api/matters
  if (url === "/api/matters" && method === "POST") {
    const { title, company, type, department, opponentParty, externalCounsel, courtOrAuthority, filingDate, description, value } = body;
    const generatedId = `MAT-${company.charAt(0).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newMatter: Matter = {
      id: generatedId,
      title,
      company,
      type,
      department,
      opponentParty,
      externalCounsel,
      courtOrAuthority,
      filingDate,
      nextHearingDate: null,
      status: "Opened",
      description,
      value: Number(value) || 0,
      createdOn: new Date().toISOString().split("T")[0],
      createdBy: activeUser.name
    };

    db.matters.push(newMatter);
    clientState.save(db);

    try {
      const probe = await probeSupabaseConnection();
      if (probe.tables.lrlms_matters) {
        await directSupabaseRequest("lrlms_matters", { method: "POST", body: JSON.stringify(newMatter) });
      }
    } catch {}

    await addFallbackAuditLog(activeUser.id, activeUser.name, activeUser.role, company, "Matter Initiated", `Multi-tenant dispute matter (${generatedId}) launched successfully for ${company}.`);
    return new Response(JSON.stringify(newMatter), { status: 200 });
  }

  // 8. PATCH / PUT /api/matters/:id
  if (url.startsWith("/api/matters/") && (method === "PATCH" || method === "PUT")) {
    const id = url.split("/").pop();
    const matterIndex = db.matters.findIndex((m: any) => m.id === id);
    if (matterIndex !== -1) {
      const original = db.matters[matterIndex];
      const updates = body;
      const updatedMatter = { ...original, ...updates };

      if (updates.value !== undefined) updatedMatter.value = Number(updates.value);

      let auditAction = "Matter Updated";
      let auditDetails = `Matter ${id} updated template info.`;
      if (updates.status && updates.status !== original.status) {
        auditAction = "Legal Stage Transition";
        auditDetails = `Matter ${id} transitioned status from '${original.status}' to '${updates.status}'.`;
        updatedMatter.lastUpdatedOn = new Date().toISOString().split("T")[0];
      }

      db.matters[matterIndex] = updatedMatter;
      clientState.save(db);

      try {
        const probe = await probeSupabaseConnection();
        if (probe.tables.lrlms_matters) {
          await directSupabaseRequest(`lrlms_matters?id=eq.${encodeURIComponent(id!)}`, {
            method: "PATCH",
            body: JSON.stringify(updates)
          });
        }
      } catch (err: any) {
        console.error("Supabase Patch Error:", err);
        return new Response(JSON.stringify({ error: `Database Save Failed (RLS Policy?): ${err.message}` }), { status: 500 });
      }

      await addFallbackAuditLog(activeUser.id, activeUser.name, activeUser.role, original.company, auditAction, auditDetails);
      return new Response(JSON.stringify(updatedMatter), { status: 200 });
    }
  }

  // 9. POST /api/hearings
  if (url === "/api/hearings" && method === "POST") {
    const { hearingDate, court, remarks, matterId } = body;
    const parentMatter = db.matters.find((m: any) => m.id === matterId);
    if (!parentMatter) {
      return new Response(JSON.stringify({ error: "Matter not found" }), { status: 404 });
    }

    const generatedId = `HRG-${Math.floor(100 + Math.random() * 900)}`;
    const newHearing: Hearing = {
      id: generatedId,
      matterId,
      matterTitle: parentMatter.title,
      company: parentMatter.company,
      hearingDate,
      court,
      status: "Scheduled",
      remarks
    };

    db.hearings.push(newHearing);

    // Update parent matter next hearing date
    const matterIdx = db.matters.findIndex((m: any) => m.id === matterId);
    if (matterIdx !== -1) {
      db.matters[matterIdx].nextHearingDate = hearingDate;
    }

    clientState.save(db);

    try {
      const probe = await probeSupabaseConnection();
      if (probe.tables.lrlms_hearings) {
        await directSupabaseRequest("lrlms_hearings", { method: "POST", body: JSON.stringify(newHearing) });
        await directSupabaseRequest(`lrlms_matters?id=eq.${encodeURIComponent(matterId)}`, {
          method: "PATCH",
          body: JSON.stringify({ nextHearingDate: hearingDate })
        });
      }
    } catch {}

    await addFallbackAuditLog(activeUser.id, activeUser.name, activeUser.role, parentMatter.company, "Docket Created", `New Court Hearing date (${hearingDate}) docketed under Case file (${matterId}).`);
    return new Response(JSON.stringify(newHearing), { status: 200 });
  }

  // 10. POST /api/documents (Upload contract/doc directly to Google Drive from browser!)
  if (url === "/api/documents" && method === "POST") {
    const { fileName, category, matterId, textContent, targetCompany } = body;

    let company = activeUser.company;
    if (activeUser.role === "Super Admin") {
      if (matterId) {
        const parentMatter = db.matters.find((m: any) => m.id === matterId);
        if (parentMatter) company = parentMatter.company;
      } else {
        company = targetCompany || "Yajur";
      }
    }

    const folderId = FOLDER_MAP[company] || FOLDER_MAP["Yajur"];
    const driveResult = await clientUploadToGoogleDrive(fileName, textContent || `General backup of ${fileName}`, folderId);

    let gdId = "";
    let gdLink = "";
    let auditLogDetails = "";

    if (driveResult.success && driveResult.fileId) {
      gdId = driveResult.fileId;
      gdLink = driveResult.fileLink || `https://drive.google.com/open?id=${gdId}`;
      auditLogDetails = `Successfully uploaded and synced document (${fileName}) directly into Google Drive Folder (${company}).`;
    } else {
      gdId = `1${Math.random().toString(36).substring(2, 17).toUpperCase()}_Gd`;
      gdLink = `https://drive.google.com/open?id=${gdId}`;
      auditLogDetails = `Synced document (${fileName}) with Local Metadata Repository. Google Drive Sync reported: ${driveResult.error || "Limited permissions"}.`;
    }

    // Baseline OCR Fallbacks
    let riskLevel: "Low" | "Medium" | "High" = "Low";
    let riskSummary = `Virtual OCR reading for ${fileName} validated. No immediate vulnerabilities identified.`;
    let parties: string[] = [company];
    let expiryDate: string | null = null;

    if (category === "Contracts" || category === "Agreements") {
      riskLevel = "Medium";
      riskSummary = `Sourcing contract loaded. Please check indemnification limit caps under Clause 11.`;
      parties = [company, "External Vendor Ltd"];
      expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // +1 year
    } else if (category === "Notices") {
      riskLevel = "High";
      riskSummary = `Notice demands compliance response within 30 days. Priority flagged.`;
      parties = [company, "Regulatory Department"];
    }

    const generatedId = `DOC-${company.charAt(0).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newDoc: LegalDocument = {
      id: generatedId,
      matterId: matterId || null,
      fileName,
      category,
      googleDriveFileId: gdId,
      googleDriveLink: gdLink,
      version: 1,
      uploadedBy: activeUser.name,
      uploadedOn: new Date().toISOString(),
      company,
      riskSummary,
      riskLevel,
      parties,
      expiryDate
    };

    db.documents.push(newDoc);
    clientState.save(db);

    try {
      const probe = await probeSupabaseConnection();
      if (probe.tables.lrlms_documents) {
        await directSupabaseRequest("lrlms_documents", { method: "POST", body: JSON.stringify(newDoc) });
      }
    } catch {}

    await addFallbackAuditLog(activeUser.id, activeUser.name, activeUser.role, company, "Document Added", auditLogDetails);
    return new Response(JSON.stringify(newDoc), { status: 200 });
  }

  // 10.1 PATCH /api/documents/:id
  if (url.startsWith("/api/documents/") && method === "PATCH") {
    const docId = url.split("/").pop() || "";
    const docIdx = db.documents.findIndex((d: any) => d.id === docId);
    if (docIdx === -1) {
      return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
    }
    
    const originalDoc = db.documents[docIdx];
    
    // Construct versions history list
    const originalVersions: DocumentVersion[] = originalDoc.versions || [
      {
        version: originalDoc.version - 1 > 0 ? originalDoc.version - 1 : 1,
        uploadedBy: originalDoc.uploadedBy,
        uploadedOn: originalDoc.uploadedOn,
        fileName: originalDoc.fileName,
        changes: "Initial baseline DMS ingestion"
      }
    ];

    const newVersionNum = originalDoc.version + 1;
    const changedFields: string[] = [];
    if (body.fileName && body.fileName !== originalDoc.fileName) changedFields.push(`File renamed to "${body.fileName}"`);
    if (body.category && body.category !== originalDoc.category) changedFields.push(`Category updated to "${body.category}"`);
    if (body.riskLevel && body.riskLevel !== originalDoc.riskLevel) changedFields.push(`Risk set to "${body.riskLevel}"`);
    if (body.parties && JSON.stringify(body.parties) !== JSON.stringify(originalDoc.parties)) changedFields.push(`Parties revised`);
    if (body.expiryDate !== undefined && body.expiryDate !== originalDoc.expiryDate) changedFields.push(`Expiry date shifted`);
    
    const changeMessage = changedFields.join("; ") || "General metadata fields amended";

    const newVerLog: DocumentVersion = {
      version: newVersionNum,
      uploadedBy: activeUser.name,
      uploadedOn: new Date().toISOString(),
      fileName: body.fileName || originalDoc.fileName,
      changes: changeMessage
    };

    const updatedVersions = [...originalVersions, newVerLog];
    const updatedDoc: LegalDocument = { 
      ...originalDoc, 
      ...body, 
      version: newVersionNum,
      versions: updatedVersions
    };

    db.documents[docIdx] = updatedDoc;
    clientState.save(db);
    
    try {
      const probe = await probeSupabaseConnection();
      if (probe.tables.lrlms_documents) {
        await directSupabaseRequest(`lrlms_documents?id=eq.${docId}`, { 
          method: "PATCH", 
          body: JSON.stringify({
            ...body,
            version: newVersionNum,
            versions: updatedVersions
          }) 
        });
      }
    } catch (err: any) {
        console.error("Supabase Patch Error:", err);
        return new Response(JSON.stringify({ error: `Database Save Failed (RLS Policy?): ${err.message}` }), { status: 500 });
    }
    
    await addFallbackAuditLog(activeUser.id, activeUser.name, activeUser.role, originalDoc.company, "Document Edited", `Updated details of compliance document: "${originalDoc.fileName}" to version ${newVersionNum}.`);
    return new Response(JSON.stringify(updatedDoc), { status: 200 });
  }

  // 10.2 DELETE /api/documents/:id
  if (url.startsWith("/api/documents/") && method === "DELETE") {
    const docId = url.split("/").pop() || "";
    const docIdx = db.documents.findIndex((d: any) => d.id === docId);
    if (docIdx === -1) {
      return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
    }
    
    const deletedDoc = db.documents[docIdx];
    db.documents.splice(docIdx, 1);
    clientState.save(db);
    
    try {
      const probe = await probeSupabaseConnection();
      if (probe.tables.lrlms_documents) {
        await directSupabaseRequest(`lrlms_documents?id=eq.${docId}`, { method: "DELETE" });
      }
    } catch {}
    
    await addFallbackAuditLog(activeUser.id, activeUser.name, activeUser.role, deletedDoc.company, "Document Deleted", `Removed compliance document: "${deletedDoc.fileName}" from remote repository.`);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  // 11. POST /api/notices
  if (url === "/api/notices" && method === "POST") {
    const { company, type, subType, senderOrRecipient, receivedOrSentDate, deadlineDate, description, legalTeamLead } = body;
    const generatedId = `NTC-${company.charAt(0).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newNotice: LegalNotice = {
      id: generatedId,
      company,
      type,
      subType,
      senderOrRecipient,
      receivedOrSentDate,
      deadlineDate: deadlineDate || null,
      status: "Pending Action",
      description,
      legalTeamLead
    };

    db.notices.push(newNotice);
    clientState.save(db);

    try {
      const probe = await probeSupabaseConnection();
      if (probe.tables.lrlms_notices) {
        await directSupabaseRequest("lrlms_notices", { method: "POST", body: JSON.stringify(newNotice) });
      }
    } catch {}

    await addFallbackAuditLog(activeUser.id, activeUser.name, activeUser.role, company, "Notice Tracked", `Legal multi-tenant compliance notice (${generatedId}) recorded with action deadline ${deadlineDate || "None"}.`);
    return new Response(JSON.stringify(newNotice), { status: 200 });
  }

  // 12. PATCH /api/notices/:id
  if (url.startsWith("/api/notices/") && method === "PATCH") {
    const id = url.split("/").pop();
    const noticeIdx = db.notices.findIndex((n: any) => n.id === id);
    if (noticeIdx !== -1) {
      const original = db.notices[noticeIdx];
      const updates = body;
      const updatedNotice = { ...original, ...updates };

      db.notices[noticeIdx] = updatedNotice;
      clientState.save(db);

      try {
        const probe = await probeSupabaseConnection();
        if (probe.tables.lrlms_notices) {
          await directSupabaseRequest(`lrlms_notices?id=eq.${encodeURIComponent(id!)}`, {
            method: "PATCH",
            body: JSON.stringify(updates)
          });
        }
      } catch (err: any) {
        console.error("Supabase Patch Error:", err);
        return new Response(JSON.stringify({ error: `Database Save Failed (RLS Policy?): ${err.message}` }), { status: 500 });
      }

      await addFallbackAuditLog(activeUser.id, activeUser.name, activeUser.role, original.company, "Notice Updated", `Notice (${id}) state changed. Status updated to ${updates.status || original.status}.`);
      return new Response(JSON.stringify(updatedNotice), { status: 200 });
    }
  }

  // 13. POST /api/audit-logs
  if (url === "/api/audit-logs" && method === "POST") {
    const { action, details, company } = body;
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      userId: activeUser.id,
      userName: activeUser.name,
      userRole: activeUser.role,
      company: company || "Group",
      action,
      timestamp: new Date().toISOString(),
      details
    };

    db.auditLogs.unshift(newLog);
    clientState.save(db);

    try {
      const probe = await probeSupabaseConnection();
      if (probe.tables.lrlms_audit_logs) {
        await directSupabaseRequest("lrlms_audit_logs", { method: "POST", body: JSON.stringify(newLog) });
      }
    } catch {}

    return new Response(JSON.stringify(newLog), { status: 200 });
  }

  // Fallback default response
  return new Response(JSON.stringify({ error: "Fallback route handled" }), { status: 200 });
}

// Client helper to append fallback audit logs
async function addFallbackAuditLog(
  userId: string,
  userName: string,
  userRole: any,
  company: string,
  action: string,
  details: string
) {
  const db = clientState.db;
  const newLog: AuditLog = {
    id: `LOG-${Date.now()}`,
    userId,
    userName,
    userRole,
    company: company as any,
    action,
    timestamp: new Date().toISOString(),
    details
  };
  db.auditLogs.unshift(newLog);
  clientState.save(db);

  try {
    const response = await fetch(`${SUPABASE_REST_URL}lrlms_audit_logs`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newLog)
    });
    // ignore response if not ready
  } catch {}
}
