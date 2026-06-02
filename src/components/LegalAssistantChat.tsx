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

      const data = await res.json();
      clearInterval(statusInterval);

      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || "No feedback received from the server workspace.",
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
