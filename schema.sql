-- ======================================================
-- LRLMS DATABASE SCHEMAS (SUPABASE POSTGRESQL MULTI-TENANT)
-- Copy and execute inside your Supabase Dashboard SQL Editor
-- ======================================================

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

-- Ensure correct Row Level Security (RLS) permissions
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
