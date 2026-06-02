import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, HelpCircle, User, ShieldAlert, Cpu, Gavel, CalendarDays } from "lucide-react";
import { User as AuthUser } from "../types";

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface LegalAssistantChatProps {
  user: AuthUser;
}

const PRESET_PROMPTS = [
  "Compare raw jute supplier disputes in Bally Jute and Yajur",
  "Find contracts expiring soon in Yashoda",
  "Determine the next trial dates and hearing calendar matching my clearance",
  "Are there outstanding labour audit notices?"
];

export default function LegalAssistantChat({ user }: LegalAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingState, setTypingState] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial friendly greeting
    setMessages([
      {
        id: "msg-greet",
        sender: "bot",
        text: `### Welcome, Counselor ${user.name} 

I am your **LRLMS Legal Assistant**, powered by Gemini. I have read the active portfolios, Google Drive index records, and hearing calendar matching **${user.company}** credentials.

How can I assist you in your litigation risk management today?
- *Ask about contract clauses and liabilities*
- *Draft responses or summarize notices*
- *Search case files using natural language query phrases*`,
        timestamp: new Date()
      }
    ]);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Typing statuses simulation
    const statuses = [
      "Securing tenant access token...",
      "Reading Virtual GDrive metadata links...",
      "Parsing legal matters & tribunals scheduled states...",
      "Generating legal opinion using Gemini 3.5 Flash..."
    ];
    let statusIdx = 0;
    setTypingState(statuses[0]);
    const statusInterval = setInterval(() => {
      statusIdx++;
      if (statusIdx < statuses.length) {
        setTypingState(statuses[statusIdx]);
      }
    }, 1200);

    try {
      // Map previous messages to prompt history
      const historyPayload = messages.slice(-8).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      let apiReply = "";
      try {
        const res = await fetch("/api/ai/assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.id
          },
          body: JSON.stringify({
            message: textToSend,
            chatHistory: historyPayload
          })
        });

        if (res.ok) {
          const data = await res.json();
          apiReply = data.reply || "No feedback received from the server workspace.";
        } else {
          // If 404 or backend server is not reachable, throw to trigger high-fidelity fallback helper
          throw new Error("HTTP Status " + res.status);
        }
      } catch (innerErr) {
        // High fidelity client-side response matcher for static GitHub Pages and offline modes
        apiReply = getClientAISmartResponse(textToSend, user);
      }

      clearInterval(statusInterval);

      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: apiReply,
        timestamp: new Date()
      }]);
    } catch (err: any) {
      clearInterval(statusInterval);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: "bot",
        text: `### Connection Interruption\n\nI was unable to invoke the LRLMS server: ${err?.message || "Communication failure"}. Please confirm the server container is actively listening.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Static smart client-side conversational AI matcher
  const getClientAISmartResponse = (prompt: string, currentUser: AuthUser): string => {
    const q = prompt.toLowerCase();
    
    if (q.includes("jute") || q.includes("compare") || q.includes("dispute")) {
      return `### Comparison of Jute Sourcing & Union Disputes
  
  Here is an assessment of active liabilities across the companies matching your profile:
  
  - **Bally Jute Mills (MAT-B-201)**: Arbitrating non-performance against *Bengal Jute Traders Co.* for advance raw sourcing contracts. Financial liability/Asset recovery target: **INR 85,00,000**. Legal Stage: *Hearing Scheduled for June 25, 2026*.
  - **Yajur Group (MAT-Y-101)**: Industrial conflict case over retro wage increments filed by the Employees Trade Union. Exposure: **INR 45,00,000**. Legal Stage: *Scheduled for oral arguments on June 15, 2026*.
  
  **Co-Counsel Assessment**: Real-time litigation value for Jute sourcing exceeds direct labor wage restructuring by 88%. Prioritize amicable arbitration settlements under IJMA guidelines to prevent further milling downtime.`;
    }

    if (q.includes("expiring") || q.includes("expiry") || q.includes("contract")) {
      return `### Sourcing Commitments & Expiring Files
  
  - **Raw Jute Sourcing Pact (DOC-B-002)**: Active supplier agreement with *Bengal Jute Traders Co.* is expiring on **June 20, 2026**. Since litigation is ongoing on non-performance, early alternative suppliers must be vetted immediately to maintain raw fiber pipeline supply.
  - **Yajur Trade Union Sourcing Case (DOC-Y-001)**: Adjustment demands related to contract adjustments. Periodic review required for retroactive wage provisions.
  - **Yashoda Sourcing Contract / Property deed (MAT-S-301)**: Regulatory compliance checks on Rajarhat site require clearance confirmation.
  
  Let me know if you would like me to draft a notice template for supplier transition!`;
    }

    if (q.includes("hearing") || q.includes("trial") || q.includes("date") || q.includes("calendar")) {
      return `### Multi-Tenant Hearing Schedule
  
  The upcoming docket roster shows the following schedules matching **${currentUser.company}** credentials:
  
  - **June 10, 2026**: *Bally Jute Mill ESI Appeal* (Employees' Insurance Court, Howrah)
  - **June 15, 2026**: *Trade Union wage revision arguments* (State Industrial Tribunal, Kolkata)
  - **June 25, 2026**: *Raw Jute Sourcing Agreement arbitration cross-examination* (IJMA Building)
  - **June 30, 2026**: *Yashoda Brands IP mock-imitation injunction suit* (Calcutta High Court)
  
  *Task Assignment:* Ensure local counsels for the corresponding companies carry physical registers and verified receipts of contribution.`;
    }

    if (q.includes("notice") || q.includes("labour") || q.includes("pf") || q.includes("compliance")) {
      return `### Active Statutory Audits & Notices
  
  A scanning of legal notices registers identified the following pending files:
  
  1. **Yajur (NTC-Y-01 - Labour)**: Received from *Deputy Labour Commissioner, WB* demanding certified standing orders. Deadline: **June 12, 2026**.
  2. **Bally Jute (NTC-B-02 - Provident Fund)**: Regional Provident Fund Commissioner (Howrah) PF contribution mismatch claims. Deadline: **June 25, 2026**.
  3. **Yashoda Group (NTC-S-03 - intellectual Property)**: Cease and desist notice sent to *Yashoda Organic Aggregates*. Deadline expired. High Court injunction suit currently filed.
  
  *Urgent recommendation:* Draft a compliance cover letter response for Yajur (**NTC-Y-01**) prior to the June 12th deadline.`;
    }

    return `### LRLMS AI Insight Hub (Client-Side Mode)
  
  Hello counselor, I can analyze the full legal status for **${currentUser.company === "Group" ? "Yajur, Bally Jute and Yashoda" : currentUser.company}** portfolios.
  
  You can ask me questions about:
  1. *Multi-tenant company dispute comparisons* (e.g., "compare disputes in bally and yajur")
  2. *Upcoming court hearings* (e.g., "show upcoming hearing dates")
  3. *Unresolved compliance notices* (e.g., "outline active labour notices")
  4. *Active agreements or contract liabilities* (e.g., "which contracts have high risk?")
  
  How can I support your legal preparation files today?`;
  };

  // Convert simple markdown-like text to nice HTML on the fly or render gracefully
  const renderMarkdownText = (text: string) => {
    // Basic formatting helper for markdown titles and lists
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-bold text-slate-900 mt-3 mb-1.5 font-display">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-base font-bold text-indigo-900 mt-4 mb-2 font-display">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("- ")) {
        return <p key={idx} className="text-xs text-slate-700 ml-4 mb-1 list-item list-disc font-sans leading-relaxed">{line.replace("- ", "")}</p>;
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2"></div>;
      }
      // Simple inline bold mapping
      const boldRegex = /\*\*(.*?)\*\*/g;
      const italicRegex = /_(.*?)_/g;
      
      let formattedText: React.ReactNode = line;
      // Convert **bold** to JSX safely if found
      if (line.includes("**") || line.includes("_")) {
        const parts = line.split(/(\*\*.*?\*\*|_.*?_)/g);
        formattedText = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("_") && part.endsWith("_")) {
            return <em key={pIdx} className="italic text-slate-600">{part.slice(1, -1)}</em>;
          }
          return part;
        });
      }
      return <p key={idx} className="text-xs text-slate-700 leading-relaxed mb-1 font-sans">{formattedText}</p>;
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden h-[580px] flex flex-col text-slate-800">
      
      {/* Workspace Panel Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/30">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display tracking-tight flex items-center gap-1.5">
              Gemini Legal Co-Counsel
            </h3>
            <span className="text-[10px] text-indigo-200 block font-mono">
              Active clearance tenant isolation: {user.company === "Group" ? "All Conglomerates (Super Access)" : user.company}
            </span>
          </div>
        </div>
        <div className="text-[10px] bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          Gemini 3.5 Flash
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar block */}
            <div className={`p-2 rounded-lg shrink-0 h-8 w-8 flex items-center justify-center ${
              msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-slate-900 text-indigo-300"
            }`}>
              {msg.sender === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Cpu className="h-4 w-4" />
              )}
            </div>

            {/* Message bubble */}
            <div className={`p-4 rounded-xl shadow-2xs border ${
              msg.sender === "user" 
                ? "bg-indigo-600 border-indigo-700 text-white" 
                : "bg-white border-slate-100 text-slate-800"
            }`}>
              {msg.sender === "user" ? (
                <p className="text-xs font-sans leading-relaxed">{msg.text}</p>
              ) : (
                <div className="space-y-1">
                  {renderMarkdownText(msg.text)}
                </div>
              )}
              <span className={`text-[9px] block mt-2 text-right ${
                msg.sender === "user" ? "text-indigo-200" : "text-slate-400"
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="p-2 rounded-lg bg-slate-900 text-indigo-300 shrink-0 h-8 w-8 flex items-center justify-center">
              <Cpu className="h-4 w-4 animate-pulse" />
            </div>
            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-2xs text-slate-500">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest animate-pulse font-mono block">
                  {typingState}
                </span>
              </div>
              <div className="flex gap-1.5 items-center justify-start h-3 py-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset interactive triggers */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <label className="text-[10px] text-slate-400 block font-bold uppercase mb-1.5 flex items-center gap-1">
          <HelpCircle className="h-3 w-3 text-slate-400" />
          Frequent Inquiry Actions
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              id={`preset-prompt-${prompt.replace(/\s+/g, '-').slice(0, 30)}`}
              onClick={() => handleSend(prompt)}
              className="text-[10px] bg-slate-50 hover:bg-indigo-50 border border-slate-100/90 hover:border-indigo-100 text-slate-600 hover:text-indigo-700 px-2.5 py-1.5 rounded-lg text-left transition-all truncate max-w-full cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="p-3 border-t border-slate-100 bg-slate-50/50 flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask Counselor (e.g. 'Show labuor disputes in Bally Jute' or 'Summarize high exposure matters')..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 text-xs rounded-lg px-3 py-2.5 outline-none font-sans"
        />
        <button
          id="send-chat-message-btn"
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg p-2.5 transition-colors shrink-0 cursor-pointer flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
