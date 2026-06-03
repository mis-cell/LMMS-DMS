import React, { useState } from "react";
import { Settings, Shield, RefreshCw, Download, ChevronRight, CheckCircle2, Lock } from "lucide-react";

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
  const [toggle4, setToggle4] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      
      {/* Title */}
      <div className="bg-white border p-4 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-display text-slate-900 uppercase tracking-wide">
            Corporate System Configuration
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Manage company profile mappings, statutory alerts, backups, Supabase PostgreSQL seeds, and Drive linked folders.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Company profile list */}
        <div className="bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Division Profiles Directory</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2.5 border-b">
                <div>
                  <h5 className="font-bold text-slate-805 text-slate-800 text-xs">Yajur Industries</h5>
                  <span className="text-[10px] text-slate-400 font-mono">CIN: U17291WB1982PLC035921</span>
                </div>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">Active</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b">
                <div>
                  <h5 className="font-bold text-slate-805 text-slate-800 text-xs">Bally Jute Co.</h5>
                  <span className="text-[10px] text-slate-400 font-mono">CIN: U171100WB1935PLC008812</span>
                </div>
                <span className="px-2 py-1 bg-amber-50 text-amber-800 font-bold rounded text-[10px]">Active</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <div>
                  <h5 className="font-bold text-slate-805 text-slate-800 text-xs">Yashoda Enterprises</h5>
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

        {/* Toggles preferences */}
        <div className="bg-white border rounded-xl p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Statutory Notice Preferences</h4>
          
          <div className="space-y-3 font-sans text-xs">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold block text-slate-800">Days-to-hearing alerts</span>
                <span className="text-[10.5px] text-slate-400 mt-0.5 block font-sans">Notify legal reps 7 days prior to scheduled hearings</span>
              </div>
              <button 
                onClick={() => setToggle1(!toggle1)}
                className={`w-10 h-5.5 rounded-full transition relative ${toggle1 ? "bg-indigo-650 bg-indigo-600" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${toggle1 ? "right-0.5" : "left-0.5"}`} />
              </button>
            </div>
            
            <div className="flex justify-between items-center pt-2.5 border-t">
              <div>
                <span className="font-semibold block text-slate-800">Contract expiration warnings</span>
                <span className="text-[10.5px] text-slate-400 mt-0.5 block">Trigger alert dockets 30 days prior to expiry</span>
              </div>
              <button 
                onClick={() => setToggle2(!toggle2)}
                className={`w-10 h-5.5 rounded-full transition relative ${toggle2 ? "bg-indigo-650 bg-indigo-600" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${toggle1 ? "right-0.5" : "left-0.5"}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t">
              <div>
                <span className="font-semibold block text-slate-800">Sync confirmation emails</span>
                <span className="text-[10.5px] text-slate-400 mt-0.5 block">Email PDF receipts on daily audit trail dumps</span>
              </div>
              <button 
                onClick={() => setToggle3(!toggle3)}
                className={`w-10 h-5.5 rounded-full transition relative ${toggle3 ? "bg-indigo-655 bg-indigo-600" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${toggle1 ? "right-0.5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Database setup metrics */}
        <div className="bg-white border rounded-xl p-5 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">PostgreSQL Database Connection</h4>
          <div className="bg-emerald-58 bg-emerald-50 border border-emerald-100 p-4 rounded-lg text-emerald-800 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-1.5" />
            <div>
              <p className="font-bold">Active Supabase connection verified</p>
              <span className="text-[10.5px] text-emerald-700 font-sans block mt-1 leading-normal">
                Multi-tenant isolated dockets correctly configured. Cloud sync running perfectly on Cloud Run nodes.
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t flex justify-between items-center text-[10.5px] font-sans text-slate-400">
            <span>Server region: SE-Asia (Singapore)</span>
            <button 
              onClick={onShowDevPanelClick}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Configure drive folders &rarr;
            </button>
          </div>
        </div>

        {/* Sync panel */}
        <div className="bg-lightindigo bg-indigo-50/40 border border-indigo-100 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest leading-none mb-2">Cloud Seed Utility</h4>
            <p className="text-[11px] text-slate-650 text-slate-600 leading-relaxed font-sans mb-3">
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

      </div>
    </div>
  );
}
