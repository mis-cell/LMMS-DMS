import { 
  User, 
  Matter, 
  LegalDocument, 
  LegalNotice, 
  Hearing, 
  AuditLog, 
  DatabaseState,
  CompanyType,
  UserRole
} from "./src/types";

// Loaded from environment variables or secure defaults supplied by the user
const SUPABASE_URL = process.env.SUPABASE_REST_URL || "https://vterzzuvlxkhjowfehye.supabase.co/rest/v1/";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZXJ6enV2bHhraGpvd2ZlaHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA5NDQsImV4cCI6MjA5NTk2Njk0NH0.zADYJNw-ISXdoeZqGXciofWKwOm8JDrzvVBEQ2WZuhs";

export function isSupabaseConfigured(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_KEY;
}

// Custom request helper to query Supabase REST API
async function supabaseRequest(endpoint: string, options: any = {}) {
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Supabase error [Status ${response.status}]: ${errText || response.statusText}`);
  }

  // Handle No Content / representing responses
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

// Check database schema connection
export async function testSupabaseConnection(): Promise<{ success: boolean; details: string; tables: Record<string, boolean> }> {
  const tables = {
    lrlms_users: false,
    lrlms_matters: false,
    lrlms_documents: false,
    lrlms_notices: false,
    lrlms_hearings: false,
    lrlms_audit_logs: false,
  };

  try {
    // Probe each table to see if it exists
    await supabaseRequest("lrlms_users?limit=1");
    tables.lrlms_users = true;
  } catch {}

  try {
    await supabaseRequest("lrlms_matters?limit=1");
    tables.lrlms_matters = true;
  } catch {}

  try {
    await supabaseRequest("lrlms_documents?limit=1");
    tables.lrlms_documents = true;
  } catch {}

  try {
    await supabaseRequest("lrlms_notices?limit=1");
    tables.lrlms_notices = true;
  } catch {}

  try {
    await supabaseRequest("lrlms_hearings?limit=1");
    tables.lrlms_hearings = true;
  } catch {}

  try {
    await supabaseRequest("lrlms_audit_logs?limit=1");
    tables.lrlms_audit_logs = true;
  } catch {}

  const someWorking = Object.values(tables).some(v => v);
  if (!someWorking) {
    return {
      success: false,
      details: "Could not reach custom LRLMS schema tables. Please execute the SQL initialization script.",
      tables
    };
  }

  const allWorking = Object.values(tables).every(v => v);
  return {
    success: allWorking,
    details: allWorking ? "Fully Connected with PostgreSQL" : "Connected (Some configuration tables missing)",
    tables
  };
}

// Map database entities directly to Supabase tables
export async function getSupabaseUsers(): Promise<User[]> {
  try {
    return await supabaseRequest("lrlms_users?select=*");
  } catch {
    return [];
  }
}

export async function getSupabaseMatters(): Promise<Matter[]> {
  try {
    return await supabaseRequest("lrlms_matters?select=*");
  } catch {
    return [];
  }
}

export async function getSupabaseDocuments(): Promise<LegalDocument[]> {
  try {
    return await supabaseRequest("lrlms_documents?select=*");
  } catch {
    return [];
  }
}

export async function getSupabaseNotices(): Promise<LegalNotice[]> {
  try {
    return await supabaseRequest("lrlms_notices?select=*");
  } catch {
    return [];
  }
}

export async function getSupabaseHearings(): Promise<Hearing[]> {
  try {
    return await supabaseRequest("lrlms_hearings?select=*");
  } catch {
    return [];
  }
}

export async function getSupabaseAuditLogs(): Promise<AuditLog[]> {
  try {
    return await supabaseRequest("lrlms_audit_logs?select=*&order=timestamp.desc");
  } catch {
    return [];
  }
}

// Bulk seed helpers inside Supabase PostgreSQL schema
export async function seedUsers(users: User[]) {
  try {
    await supabaseRequest("lrlms_users", {
      method: "POST",
      headers: { "Prefer": "resolution=ignore-duplicates" },
      body: JSON.stringify(users)
    });
  } catch (err) {
    console.warn("Failed seeding users:", err);
  }
}

export async function seedMatters(matters: Matter[]) {
  try {
    await supabaseRequest("lrlms_matters", {
      method: "POST",
      headers: { "Prefer": "resolution=ignore-duplicates" },
      body: JSON.stringify(matters)
    });
  } catch (err) {
    console.warn("Failed seeding matters:", err);
  }
}

export async function seedDocuments(docs: LegalDocument[]) {
  try {
    await supabaseRequest("lrlms_documents", {
      method: "POST",
      headers: { "Prefer": "resolution=ignore-duplicates" },
      body: JSON.stringify(docs)
    });
  } catch (err) {
    console.warn("Failed seeding documents:", err);
  }
}

export async function seedNotices(notices: LegalNotice[]) {
  try {
    await supabaseRequest("lrlms_notices", {
      method: "POST",
      headers: { "Prefer": "resolution=ignore-duplicates" },
      body: JSON.stringify(notices)
    });
  } catch (err) {
    console.warn("Failed seeding notices:", err);
  }
}

export async function seedHearings(hearings: Hearing[]) {
  try {
    await supabaseRequest("lrlms_hearings", {
      method: "POST",
      headers: { "Prefer": "resolution=ignore-duplicates" },
      body: JSON.stringify(hearings)
    });
  } catch (err) {
    console.warn("Failed seeding hearings:", err);
  }
}

export async function seedAuditLogs(logs: AuditLog[]) {
  try {
    await supabaseRequest("lrlms_audit_logs", {
      method: "POST",
      headers: { "Prefer": "resolution=ignore-duplicates" },
      body: JSON.stringify(logs)
    });
  } catch (err) {
    console.warn("Failed seeding audit logs:", err);
  }
}

// Write Operations with clean REST mappings
export async function saveSupabaseUser(user: User): Promise<boolean> {
  try {
    await supabaseRequest("lrlms_users", {
      method: "POST",
      body: JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
        status: user.status || "Active"
      })
    });
    return true;
  } catch (err) {
    console.error("Supabase user insert failed:", err);
    return false;
  }
}

export async function updateSupabaseUser(id: string, updates: Partial<User>): Promise<boolean> {
  try {
    await supabaseRequest(`lrlms_users?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
    return true;
  } catch (err) {
    console.error("Supabase user edit failed:", err);
    return false;
  }
}

export async function deleteSupabaseUser(id: string): Promise<boolean> {
  try {
    await supabaseRequest(`lrlms_users?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    return true;
  } catch (err) {
    console.error("Supabase user deletion failed:", err);
    return false;
  }
}

export async function saveSupabaseMatter(matter: Matter): Promise<boolean> {
  try {
    await supabaseRequest("lrlms_matters", {
      method: "POST",
      body: JSON.stringify(matter)
    });
    return true;
  } catch (err) {
    console.error("Supabase matter insert failed:", err);
    return false;
  }
}

export async function updateSupabaseMatter(id: string, updates: Partial<Matter>): Promise<boolean> {
  try {
    await supabaseRequest(`lrlms_matters?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
    return true;
  } catch (err) {
    console.error("Supabase matter edit failed:", err);
    return false;
  }
}

export async function saveSupabaseDocument(doc: LegalDocument): Promise<boolean> {
  try {
    await supabaseRequest("lrlms_documents", {
      method: "POST",
      body: JSON.stringify(doc)
    });
    return true;
  } catch (err) {
    console.error("Supabase document insert failed:", err);
    return false;
  }
}

export async function saveSupabaseNotice(notice: LegalNotice): Promise<boolean> {
  try {
    await supabaseRequest("lrlms_notices", {
      method: "POST",
      body: JSON.stringify(notice)
    });
    return true;
  } catch (err) {
    console.error("Supabase notice insert failed:", err);
    return false;
  }
}

export async function updateSupabaseNotice(id: string, updates: Partial<LegalNotice>): Promise<boolean> {
  try {
    await supabaseRequest(`lrlms_notices?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
    return true;
  } catch (err) {
    console.error("Supabase notice edit failed:", err);
    return false;
  }
}

export async function saveSupabaseHearing(hearing: Hearing): Promise<boolean> {
  try {
    await supabaseRequest("lrlms_hearings", {
      method: "POST",
      body: JSON.stringify(hearing)
    });
    return true;
  } catch (err) {
    console.error("Supabase hearing insert failed:", err);
    return false;
  }
}

export async function updateSupabaseHearing(id: string, updates: Partial<Hearing>): Promise<boolean> {
  try {
    await supabaseRequest(`lrlms_hearings?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
    return true;
  } catch (err) {
    console.error("Supabase hearing status edit failed:", err);
    return false;
  }
}

export async function saveSupabaseAuditLog(log: AuditLog): Promise<boolean> {
  try {
    await supabaseRequest("lrlms_audit_logs", {
      method: "POST",
      body: JSON.stringify(log)
    });
    return true;
  } catch (err) {
    console.error("Supabase audit log insert failed:", err);
    return false;
  }
}

// Generate schema generation script for user copy-paste inside the frontend dashboard
export function getSupabaseSQLScript(): string {
  return `-- ==========================================
-- LRLMS DATABASE SCHEMAS (SUPABASE POSTGRESQL)
-- Copy and execute inside your Supabase SQL Editor
-- ==========================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS lrlms_users (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Active'
);

-- 2. Create Matters Table
CREATE TABLE IF NOT EXISTS lrlms_matters (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "opponentParty" TEXT NOT NULL,
  "externalCounsel" TEXT NOT NULL,
  "courtOrAuthority" TEXT NOT NULL,
  "filingDate" TEXT NOT NULL,
  "nextHearingDate" TEXT,
  "status" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "value" NUMERIC NOT NULL,
  "createdOn" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);

-- 3. Create Documents Table
CREATE TABLE IF NOT EXISTS lrlms_documents (
  "id" TEXT PRIMARY KEY,
  "matterId" TEXT,
  "fileName" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "googleDriveFileId" TEXT NOT NULL,
  "googleDriveLink" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "uploadedOn" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "riskSummary" TEXT,
  "riskLevel" TEXT,
  "parties" TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  "expiryDate" TEXT
);

-- 4. Create Notices Table
CREATE TABLE IF NOT EXISTS lrlms_notices (
  "id" TEXT PRIMARY KEY,
  "company" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "subType" TEXT NOT NULL,
  "senderOrRecipient" TEXT NOT NULL,
  "receivedOrSentDate" TEXT NOT NULL,
  "deadlineDate" TEXT,
  "status" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "legalTeamLead" TEXT NOT NULL
);

-- 5. Create Hearings Table
CREATE TABLE IF NOT EXISTS lrlms_hearings (
  "id" TEXT PRIMARY KEY,
  "matterId" TEXT NOT NULL,
  "matterTitle" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "hearingDate" TEXT NOT NULL,
  "court" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "remarks" TEXT NOT NULL
);

-- 6. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS lrlms_audit_logs (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "userRole" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "timestamp" TEXT NOT NULL,
  "details" TEXT NOT NULL
);

-- Ensure correct permissions
ALTER TABLE lrlms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous public access profiles
CREATE POLICY "Allow public select" ON lrlms_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON lrlms_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON lrlms_users FOR UPDATE USING (true);

CREATE POLICY "Allow public select matters" ON lrlms_matters FOR SELECT USING (true);
CREATE POLICY "Allow public insert matters" ON lrlms_matters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update matters" ON lrlms_matters FOR UPDATE USING (true);

CREATE POLICY "Allow public select documents" ON lrlms_documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert documents" ON lrlms_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update documents" ON lrlms_documents FOR UPDATE USING (true);

CREATE POLICY "Allow public select notices" ON lrlms_notices FOR SELECT USING (true);
CREATE POLICY "Allow public insert notices" ON lrlms_notices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update notices" ON lrlms_notices FOR UPDATE USING (true);

CREATE POLICY "Allow public select hearings" ON lrlms_hearings FOR SELECT USING (true);
CREATE POLICY "Allow public insert hearings" ON lrlms_hearings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update hearings" ON lrlms_hearings FOR UPDATE USING (true);

CREATE POLICY "Allow public select audits" ON lrlms_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert audits" ON lrlms_audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update audits" ON lrlms_audit_logs FOR UPDATE USING (true);
`;
}
