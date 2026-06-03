export type CompanyType = "Yajur" | "Bally Jute" | "Yashoda";

export type UserRole = "Super Admin" | "Company Admin" | "Legal Head" | "Manager" | "Lawyer" | "Viewer" | "Auditor";

export interface User {
  id: string;
  name: string;
  email: string;
  company: CompanyType | "Group"; // Group admin can access all, otherwise isolated
  role: UserRole;
  status?: "Active" | "Inactive";
}

export type MatterType = 
  | "Litigation" 
  | "Contract" 
  | "Labor Matter" 
  | "Regulatory" 
  | "Compliance" 
  | "IP/Trademark" 
  | "Property";

export type MatterStatus = "Opened" | "Under Review" | "Filed" | "Hearing" | "Settlement" | "Closed";

export interface Matter {
  id: string;
  title: string;
  company: CompanyType;
  type: MatterType;
  department: string;
  opponentParty: string;
  externalCounsel: string;
  courtOrAuthority: string;
  filingDate: string;
  nextHearingDate: string | null;
  status: MatterStatus;
  description: string;
  value: number; // Legal exposure or contract value in INR
  createdOn: string;
  createdBy: string;
  lastUpdatedOn?: string; // Track status updates for stagnancy
}

export type DocCategory = 
  | "Contracts" 
  | "Court Orders" 
  | "Pleadings" 
  | "Notices" 
  | "Agreements" 
  | "Compliance Documents" 
  | "Licenses" 
  | "Certificates" 
  | "Intellectual Property Records" 
  | "Internal Legal Opinions";

export interface DocumentVersion {
  version: number;
  uploadedBy: string;
  uploadedOn: string;
  fileName: string;
  changes?: string;
}

export interface LegalDocument {
  id: string;
  matterId: string | null; // Null if general document, or linked to Matter
  fileName: string;
  category: DocCategory;
  googleDriveFileId: string;
  googleDriveLink: string;
  version: number;
  uploadedBy: string;
  uploadedOn: string;
  company: CompanyType;
  riskSummary: string | null; // Extracted via AI
  riskLevel: "Low" | "Medium" | "High" | null; // Extracted via AI
  parties: string[]; // Extracted via AI
  expiryDate: string | null; // For contracts
  textContent?: string; // Optional full transcript or legal text content
  versions?: DocumentVersion[]; // DMS traceability version history list
}

export type NoticeType = "Incoming" | "Outgoing";
export type NoticeSubType = "GST" | "PF" | "ESI" | "Labour" | "Court" | "Other";
export type NoticeStatus = "Pending Action" | "Responded" | "Resolved";

export interface LegalNotice {
  id: string;
  company: CompanyType;
  type: NoticeType;
  subType: NoticeSubType;
  senderOrRecipient: string;
  receivedOrSentDate: string;
  deadlineDate: string | null;
  status: NoticeStatus;
  description: string;
  legalTeamLead: string;
}

export interface Hearing {
  id: string;
  matterId: string;
  matterTitle: string;
  company: CompanyType;
  hearingDate: string;
  court: string;
  status: "Scheduled" | "Adjourned" | "Completed";
  remarks: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  company: CompanyType | "Group";
  action: string;
  timestamp: string;
  details: string;
}

export interface DatabaseState {
  users: User[];
  matters: Matter[];
  documents: LegalDocument[];
  notices: LegalNotice[];
  hearings: Hearing[];
  auditLogs: AuditLog[];
}
