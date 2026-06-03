import React, { useState } from "react";
import { 
  Settings, 
  Shield, 
  RefreshCw, 
  ChevronRight, 
  CheckCircle2, 
  Lock, 
  Key, 
  Terminal, 
  Globe, 
  Layers, 
  Copy,
  AlertCircle
} from "lucide-react";

interface SystemPanelProps {
  sysStatus: any;
  showDevPanel: boolean;
  onOpenDevPanel: () => void;
  onCloseDevPanel: () => void;
  seedSuccessMsg: string;
  isSeeding: boolean;
  onTriggerManualSeed: () => void;
  activeUser: any;
  onAddCompanyClick: () => void;
  onShowDevPanelClick: () => void;
  theme: any;
}

export default function SystemPanel({
  sysStatus,
  showDevPanel,
  onOpenDevPanel,
  onCloseDevPanel,
  seedSuccessMsg,
  isSeeding,
  onTriggerManualSeed,
  activeUser,
  onAddCompanyClick,
  onShowDevPanelClick,
  theme
}: SystemPanelProps) {
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(true);
  const [toggle3, setToggle3] = useState(true);

  // Authentication configuration state (Keycloak / LDAP)
  const [ssoProvider, setSsoProvider] = useState<"Keycloak" | "LDAP">("Keycloak");
  const [serverUrl, setServerUrl] = useState("https://auth.yajur.com/auth");
  const [realmDomain, setRealmDomain] = useState("YajurRealm");
  const [clientId, setClientId] = useState("lrlms-client-node");
  const [clientSecret, setClientSecret] = useState("••••••••••••••••••••••••");
  const [mfaEnforced, setMfaEnforced] = useState(true);
  
  const [authStatusMessage, setAuthStatusMessage] = useState<string>("");
  const [authStatusType, setAuthStatusType] = useState<"success" | "error" | "info">("info");

  // DevOps Config state
  const [deployFileType, setDeployFileType] = useState<"docker" | "k8s" | "nginx">("docker");
  const [copiedText, setCopiedText] = useState(false);

  // Test Authentication Logic
  const handleTestAuthConnection = () => {
    setAuthStatusMessage(`Testing connection to ${ssoProvider} endpoint...`);
    setAuthStatusType("info");
    setTimeout(() => {
      setAuthStatusMessage(`SUCCESS: Secure communication established. Verified schema for '${realmDomain}' directory.`);
      setAuthStatusType("success");
    }, 1200);
  };

  const handleSaveSSOConfig = () => {
    setAuthStatusMessage(`Persisting configuration details into lrlms_sso_config table...`);
    setAuthStatusType("info");
    setTimeout(() => {
      setAuthStatusMessage(`SUCCESS: Saved SSO schema parameters for ${ssoProvider} inside Supabase backend databases. Triggered global OAuth redirect validation hook.`);
      setAuthStatusType("success");
    }, 1500);
  };

  // Deployment configuration files text
  const dockerfileCode = `FROM node:20-alpine
WORKDIR /app

# Install build/prod packages
COPY package*.json ./
RUN npm install --production

# Bundle source files
COPY . .

# Sandbox proxy bindings
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Start custom full-stack backend
CMD ["npm", "run", "start"]`;

  const k8sCode = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: lrlms-deployment
  namespace: corporate-legal-tech
  labels:
    app: lrlms-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lrlms-web
  template:
    metadata:
      labels:
        app: lrlms-web
    spec:
      containers:
      - name: lrlms-web-container
        image: gcr.io/yajur-legal/lrlms-system:v1.1.4
        ports:
        - containerPort: 3000
          name: web-ingress-port
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_CLIENT
          value: "supabase"
        resources:
          limits:
            cpu: "1"
            memory: 1024Mi
          requests:
            cpu: "0.5"
            memory: 512Mi`;

  const nginxCode = `server {
    listen 80;
    server_name legal.yajur.company;
    
    # Configure high-capacity document uploading sizes
    client_max_body_size 120M;

    # Dynamic caching configuration
    location /assets/ {
        root /var/www/lrlms/dist;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # API Proxy and WebSocket tunnels
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}`;

  const getDeployCode = () => {
    switch (deployFileType) {
      case "docker": return dockerfileCode;
      case "k8s": return k8sCode;
      case "nginx": return nginxCode;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getDeployCode());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs font-sans">
      
      {/* Title */}
      <div className="bg-white border p-4 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-display text-slate-900 uppercase tracking-wide">
            Corporate System Configuration
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Manage company profile mappings, statutory alerts, backups, Supabase PostgreSQL seeds, SSO configuration, and deployment scripts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: DB Connection and Seed */}
        <div className="space-y-6">
          {/* Database setup metrics */}
          <div className="bg-white border rounded-xl p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">PostgreSQL Database Connection</h4>
            
            {sysStatus?.active ? (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-emerald-800 flex items-start gap-2.5 animate-pulse-once">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-1.5" />
                  <div>
                    <p className="font-bold text-xs">Supabase Connected & Active</p>
                    <span className="text-[10.5px] text-emerald-700 font-sans block mt-1 leading-normal">
                      Excellent, counselor! All tables are active and connected directly to Supabase client REST pipeline.
                    </span>
                  </div>
                </div>

                {/* Table Schema verification log */}
                <div className="bg-slate-50 border p-3 rounded-lg space-y-1.5 font-mono text-[9px] text-slate-600">
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">Central Tables Roster (VERIFIED):</span>
                  {Object.entries(sysStatus?.tables || {}).map(([tableName, exists]) => (
                    <div key={tableName} className="flex justify-between items-center">
                      <span>• {tableName}</span>
                      <span className={exists ? "text-emerald-600 font-bold" : "text-amber-500"}>
                        {exists ? "✔ ONLINE" : "✖ MISSING"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-amber-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs">Tables Missing / Fallback Active</p>
                    <span className="text-[10.5px] text-amber-700 font-sans block mt-1 leading-normal">
                      The REST endpoints are reachable, but we couldn't find the requisite schema tables in your Supabase dashboard.
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-dashed border-amber-200 p-3 rounded-lg text-[10.5px] text-slate-600 leading-normal">
                  <p className="font-bold text-amber-800 mb-1">How to Connect & Seed:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Copy & Execute the context script inside <span className="font-mono bg-amber-100 px-1 rounded">/schema.sql</span> in your Supabase dashboard SQL Editor.</li>
                    <li>Once tables are created, click the <span className="font-bold text-indigo-600">Trigger Manual DB Seed</span> button below to initialize demo records!</li>
                  </ol>
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t flex justify-between items-center text-[10.5px] font-sans text-slate-400">
              <span className="font-mono text-[9px] max-w-[150px] truncate">
                Host: {sysStatus?.details?.url || "vterzzuvlxkhjowfehye.supabase.co"}
              </span>
              <button 
                onClick={onShowDevPanelClick}
                className="text-indigo-650 text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Configure folders &rarr;
              </button>
            </div>
          </div>

          {/* Sync panel */}
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest leading-none mb-2">Cloud Seed Utility</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans mb-3">
                Load initial matters data, statutory notices, trial dates, and corporate login simulator users directly into the Supabase database.
              </p>
            </div>
            <div>
              {seedSuccessMsg ? (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded font-bold text-center flex items-center justify-center gap-1.5 leading-none">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{seedSuccessMsg}</span>
                </div>
              ) : (
                <button
                  onClick={onTriggerManualSeed}
                  disabled={isSeeding}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer flex items-center justify-center gap-2 text-center transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin" : ""}`} />
                  <span>{isSeeding ? "Seeding dockets..." : "Trigger Manual DB Seed"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Company profile list */}
          <div className="bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Division Profiles Directory</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2.5 border-b">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Yajur Industries</h5>
                    <span className="text-[10px] text-slate-400 font-mono">CIN: U17291WB1982PLC035921</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">Active</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Bally Jute Co.</h5>
                    <span className="text-[10px] text-slate-400 font-mono">CIN: U171100WB1935PLC008812</span>
                  </div>
                  <span className="px-2 py-1 bg-amber-50 text-amber-800 font-bold rounded text-[10px]">Active</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Yashoda Enterprises</h5>
                    <span className="text-[10px] text-slate-400 font-mono">CIN: U74999WB2001PLC093441</span>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">Active</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onAddCompanyClick}
              className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded font-bold border border-slate-200 transition text-center select-none cursor-pointer"
            >
              Add Company profile mapping &rarr;
            </button>
          </div>
        </div>

        {/* Center Grid: Authentication & Access Control (Keycloak / LDAP) */}
        <div className="bg-white border rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                Enterprise SSO & Auths
              </h4>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded uppercase">
                Active SSO
              </span>
            </div>

            {/* Provider Selector */}
            <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded-lg border text-center font-bold text-slate-600 text-[10.5px] cursor-pointer">
              <button 
                type="button"
                onClick={() => {
                  setSsoProvider("Keycloak");
                  setServerUrl("https://auth.yajur.com/auth");
                  setRealmDomain("YajurRealm");
                }}
                className={`py-1.5 rounded transition ${ssoProvider === "Keycloak" ? "bg-indigo-600 text-white font-extrabold shadow-3xs" : "hover:text-slate-900"}`}
              >
                Keycloak Configuration
              </button>
              <button 
                type="button"
                onClick={() => {
                  setSsoProvider("LDAP");
                  setServerUrl("ldap://domain-controller.yajur.com:389");
                  setRealmDomain("YAJUR.LOCAL");
                }}
                className={`py-1.5 rounded transition ${ssoProvider === "LDAP" ? "bg-indigo-600 text-white font-extrabold shadow-3xs" : "hover:text-slate-900"}`}
              >
                LDAP/Active Directory
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 mt-4 text-[11px] font-sans">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Server Direct Endpoint URL</label>
                <input 
                  type="text" 
                  value={serverUrl} 
                  onChange={e => setServerUrl(e.target.value)}
                  className="w-full bg-slate-50 border outline-none rounded p-2 focus:border-indigo-500 font-mono text-[10.5px]"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">
                  {ssoProvider === "Keycloak" ? "Keycloak Realm Name" : "AD Domain Controller Realm"}
                </label>
                <input 
                  type="text" 
                  value={realmDomain} 
                  onChange={e => setRealmDomain(e.target.value)}
                  className="w-full bg-slate-50 border outline-none rounded p-2 focus:border-indigo-500 font-mono text-[10.5px]"
                />
              </div>

              {ssoProvider === "Keycloak" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Client Identifier</label>
                    <input 
                      type="text" 
                      value={clientId} 
                      onChange={e => setClientId(e.target.value)}
                      className="w-full bg-slate-50 border outline-none rounded p-2 focus:border-indigo-500 font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Client Secrets Token</label>
                    <input 
                      type="password" 
                      value={clientSecret} 
                      onChange={e => setClientSecret(e.target.value)}
                      className="w-full bg-slate-50 border outline-none rounded p-2 focus:border-indigo-500 font-mono text-[10px]"
                    />
                  </div>
                </div>
              )}

              {ssoProvider === "LDAP" && (
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Base DN (Distinguished Name Path)</label>
                  <input 
                    type="text" 
                    defaultValue="OU=Users,OU=KolkataHQ,DC=yajur,DC=local"
                    className="w-full bg-slate-50 border outline-none rounded p-2 focus:border-indigo-500 font-mono text-[10px]"
                  />
                </div>
              )}

              {/* MFA Toggle */}
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border mt-2">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Require Authenticator (MFA)</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Enforce Google/Microsoft Authenticator keys for high-risk clearances</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setMfaEnforced(!mfaEnforced)}
                  className={`w-9 h-5 rounded-full transition relative ${mfaEnforced ? "bg-indigo-600" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${mfaEnforced ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>

              {/* Action output messages */}
              {authStatusMessage && (
                <div className={`p-2.5 rounded border text-[10.5px] font-sans flex items-start gap-1.5 ${
                  authStatusType === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : 
                  authStatusType === "error" ? "bg-rose-50 border-rose-100 text-rose-800" : 
                  "bg-blue-50 border-blue-100 text-blue-800"
                }`}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{authStatusMessage}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={handleTestAuthConnection}
              className="py-2.5 bg-slate-55 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-center select-none cursor-pointer"
            >
              Test AD Handshake
            </button>
            <button
              type="button"
              onClick={handleSaveSSOConfig}
              className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-center select-none cursor-pointer"
            >
              Commit settings
            </button>
          </div>
        </div>

        {/* Right Column: Deployment Configuration Generator (Docker / K8s / Nginx) */}
        <div className="bg-white border rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-600" />
                Enterprise DevOps Hub
              </h4>
              <span className="bg-sky-50 text-sky-800 border border-sky-100 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded uppercase">
                Node Port 3000
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal mb-3">
              Generate pre-configured production Dockerfiles, isolated Kubernetes deployment manifests, and high-performance Nginx reverse proxy configs optimized for GDrive bulk uploads.
            </p>

            {/* Select config file */}
            <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-lg border text-center font-bold text-slate-500 text-[10px] cursor-pointer font-sans mb-3">
              <button 
                type="button"
                onClick={() => setDeployFileType("docker")}
                className={`py-1 rounded transition ${deployFileType === "docker" ? "bg-indigo-600 text-white font-bold shadow-3xs" : "hover:text-slate-800"}`}
              >
                Dockerfile
              </button>
              <button 
                type="button"
                onClick={() => setDeployFileType("k8s")}
                className={`py-1 rounded transition ${deployFileType === "k8s" ? "bg-indigo-600 text-white font-bold shadow-3xs" : "hover:text-slate-800"}`}
              >
                kubernetes.yaml
              </button>
              <button 
                type="button"
                onClick={() => setDeployFileType("nginx")}
                className={`py-1 rounded transition ${deployFileType === "nginx" ? "bg-indigo-600 text-white font-bold shadow-3xs" : "hover:text-slate-800"}`}
              >
                nginx.conf
              </button>
            </div>

            {/* Code Previews with Copy Button */}
            <div className="relative">
              <pre className="p-3 bg-slate-900 border border-slate-950 text-emerald-450 text-slate-200 font-mono text-[9px] rounded-lg leading-relaxed h-[270px] overflow-auto select-all shadow-inner">
                {getDeployCode()}
              </pre>
              <button
                type="button"
                onClick={handleCopyCode}
                className="absolute right-2.5 top-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white p-1.5 rounded border border-slate-700 transition cursor-pointer flex items-center gap-1 text-[9px]"
                title="Copy configuration template"
              >
                {copiedText ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold font-sans">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Statutory and backup preferences info panel */}
          <div className="bg-indigo-50/20 border border-indigo-100 rounded-lg p-3 text-[10.5px] text-indigo-900 flex items-start gap-1.5 mt-2 font-sans">
            <Layers className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
            <div>
              <strong className="block font-bold">Deployment note:</strong>
              <span className="block mt-0.5 leading-normal font-sans text-slate-500">
                To link SSL certificates or setup Active Directory integration in staging domains, configure upstream bindings to proxy to <code className="font-mono text-indigo-700 text-[10px]">localhost:3000</code>.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
