import { Shield, Calendar, AlertTriangle, FileText, IndianRupee } from "lucide-react";
import { Matter, LegalDocument, LegalNotice, Hearing } from "../types";

interface MetricCardsProps {
  matters: Matter[];
  documents: LegalDocument[];
  notices: LegalNotice[];
  hearings: Hearing[];
}

export default function MetricCards({ matters, documents, notices, hearings }: MetricCardsProps) {
  const activeMatters = matters.filter((m) => m.status !== "Closed").length;
  
  // Total legal exposure / contract value in INR
  const totalExposure = matters.reduce((sum, m) => sum + (m.status !== "Closed" ? m.value : 0), 0);
  
  const upcomingHearings = hearings.filter((h) => h.status === "Scheduled").length;
  
  const pendingNotices = notices.filter((n) => n.status === "Pending Action").length;
  
  const expiringContracts = documents.filter(
    (d) => d.category === "Contracts" && d.riskLevel === "High"
  ).length;

  // Format INR nicely
  const formatINR = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} Lac`;
    }
    return `₹${value.toLocaleString()}`;
  };

  const cards = [
    {
      id: "metric-active",
      title: "Active Legal Matters",
      value: activeMatters,
      subtext: `${matters.filter(m => m.status === "Closed").length} Resolved Matters`,
      icon: Shield,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      id: "metric-exposure",
      title: "Litigation Exposure",
      value: formatINR(totalExposure),
      subtext: "In-Progress Risk Appraisal",
      icon: IndianRupee,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      id: "metric-hearings",
      title: "Upcoming Hearings",
      value: upcomingHearings,
      subtext: "Calcutta HC & Tribunals",
      icon: Calendar,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      id: "metric-notices",
      title: "Pending Notices",
      value: pendingNotices,
      subtext: "GST, PF & Labour Audits",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      id: "metric-contracts",
      title: "High-Risk Agreements",
      value: expiringContracts,
      subtext: "Need Renewals or Audit",
      icon: FileText,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg border ${card.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
                {card.value}
              </h4>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-sans">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
