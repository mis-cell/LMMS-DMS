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
  "expiryDate" TEXT,
  "isWatermarked" BOOLEAN DEFAULT false,
  "esignStatus" TEXT DEFAULT 'Draft',
  "esignCompletedOn" TEXT,
  "retentionPolicyYrs" INTEGER DEFAULT 7
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

-- 7. Create Invoices Table (Zoho Invoice Integration with SGST/CGST)
CREATE TABLE IF NOT EXISTS lrlms_invoices (
  "id" TEXT PRIMARY KEY,
  "company" TEXT NOT NULL,
  "firm" TEXT NOT NULL,
  "matter" TEXT,
  "amount" NUMERIC NOT NULL,
  "cgst" NUMERIC NOT NULL DEFAULT 0,
  "sgst" NUMERIC NOT NULL DEFAULT 0,
  "date" TEXT NOT NULL,
  "dueDate" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Pending'
);

-- 8. Create Standard Contract Clauses Table (Zoho Contract CLM Integration)
CREATE TABLE IF NOT EXISTS lrlms_clauses (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "parties" TEXT NOT NULL,
  "indemnity" TEXT NOT NULL,
  "termination" TEXT NOT NULL,
  "jurisdiction" TEXT NOT NULL
);

-- 9. Create LDAP/Keycloak Configuration Table (SSO Settings)
CREATE TABLE IF NOT EXISTS lrlms_sso_config (
  "id" TEXT PRIMARY KEY,
  "provider" TEXT NOT NULL, -- 'Keycloak' or 'LDAP/AD'
  "serverUrl" TEXT NOT NULL,
  "realmOrDomain" TEXT NOT NULL,
  "clientId" TEXT,
  "clientSecret" TEXT,
  "mfaRequired" BOOLEAN DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'Disabled'
);

-- 10. Create Document Access Logs Table (Security Records)
CREATE TABLE IF NOT EXISTS lrlms_document_access_logs (
  "id" TEXT PRIMARY KEY,
  "documentId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "action" TEXT NOT NULL, -- 'Read Document', 'Edit Metadata', 'Download Document', 'E-Signed'
  "ipAddress" TEXT NOT NULL,
  "timestamp" TEXT NOT NULL
);

-- Ensure correct Row Level Security (RLS) permissions
ALTER TABLE lrlms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_sso_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrlms_document_access_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous public access policies
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

CREATE POLICY "Allow public select invoices" ON lrlms_invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert invoices" ON lrlms_invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update invoices" ON lrlms_invoices FOR UPDATE USING (true);

CREATE POLICY "Allow public select clauses" ON lrlms_clauses FOR SELECT USING (true);
CREATE POLICY "Allow public insert clauses" ON lrlms_clauses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update clauses" ON lrlms_clauses FOR UPDATE USING (true);

CREATE POLICY "Allow public select sso" ON lrlms_sso_config FOR SELECT USING (true);
CREATE POLICY "Allow public insert sso" ON lrlms_sso_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update sso" ON lrlms_sso_config FOR UPDATE USING (true);

CREATE POLICY "Allow public select doc_access" ON lrlms_document_access_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert doc_access" ON lrlms_document_access_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update doc_access" ON lrlms_document_access_logs FOR UPDATE USING (true);
