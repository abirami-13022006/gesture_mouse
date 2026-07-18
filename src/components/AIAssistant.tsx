import React, { useState, useRef, useEffect } from "react";
import { Language } from "../types";
import { Bot, Send, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface AIAssistantProps {
  language: Language;
}

export default function AIAssistant({ language }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Namaste! 🌍 I am your EcoShield AI Environmental Assistant. I can explain river pollution, illegal waste burning, solid waste dumping, guide you on how to submit complaints, or answer other environmental awareness questions in your selected language. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt presets for easy clicking
  const prompts = {
    English: [
      "Explain the dangers of river chemical foam.",
      "What are the toxic side effects of illegal plastic waste burning?",
      "How does EcoShield AI generate coordinates for complaints?",
      "What preventive measures can we take against open dump yards?"
    ],
    Tamil: [
      "ஆற்று இரசாயன நுரையின் ஆபத்துகளை விளக்கவும்.",
      "திடக்கழிவு கொட்டப்படும் இடங்களில் இருந்து பரவும் நச்சுகள் என்னென்ன?",
      "ஆஃப்லைனில் எப்படிப் புகாரளிப்பது?",
      "சுற்றுச்சூழல் அபாயக் குறியீடு என்றால் என்ன?"
    ],
    Hindi: [
      "नदियों में होने वाले झाग के खतरे बताएं।",
      "कचरा जलाने से स्वास्थ्य पर क्या प्रभाव पड़ता है?",
      "इकोशील्ड एआई शिकायतें कैसे दर्ज करता है?",
      "कूड़े के खुले ढेरों को रोकने के क्या उपाय हैं?"
    ],
    Telugu: [
      "నదులలో కెమికల్ ఫోమ్ వచ్చే ప్రమాదాలు వివరించండి.",
      "ప్లాస్టిక్ వ్యర్థాల దహనం వల్ల కలిగే నష్టాలు ఏమిటి?",
      "పర్యావరణ ప్రమాద సూచిక ఎలా పనిచేస్తుంది?"
    ],
    Kannada: [
      "ನದಿ ಮಾಲಿನ್ಯದ ದುಷ್ಪರಿಣಾಮಗಳನ್ನು ತಿಳಿಸಿ.",
      "ಕಸ ಸುಡುವುದನ್ನು ತಡೆಯಲು ನಾವು ಯಾವ ಕ್ರಮಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಬಹುದು?",
      "EcoShield AI ದೂರು ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?"
    ],
    Malayalam: [
      "നദീ മലിനീകരണത്തിന്റെ ഗുരുതരമായ പ്രശ്നങ്ങൾ എന്തൊക്കെയാണ്?",
      "മാലിന്യം കത്തിക്കുന്നത് വഴി ഉണ്ടാകുന്ന വായു മലിനീകരണം വിവരിക്കുക."
    ],
    Bengali: [
      "নদী দূষণ প্রতিরোধের উপায়গুলি কী কী?",
      "বর্জ্য পোড়ানোর ফলে বাতাসের ক্ষতি কীভাবে হয়?"
    ],
    Gujarati: [
      "નદી પ્રદૂષણથી થતી ગંભીર અસરો સમજાવો.",
      "પ્લાસ્ટિક કચરો બાળવાથી શું નુકસાન થાય છે?"
    ],
    Marathi: [
      "नदी प्रदूषणाचे धोके स्पष्ट करा.",
      "कचरा जाळण्यामुळे हवेची गुणवत्ता कशी खराब होते?"
    ],
    Punjabi: [
      "ਨਦੀਆਂ ਵਿੱਚ ਕੈਮੀਕਲ ਪ੍ਰਦੂਸ਼ਣ ਦੇ ਨੁਕਸਾਨ ਦੱਸੋ।",
      "ਕੂੜਾ ਸਾੜਨ ਦੇ ਖਤਰਨਾਕ ਸਾਈਡ ਇਫੈਕਟ ਕੀ ਹਨ?"
    ]
  };

  const activePrompts = prompts[language] || prompts["English"];

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          language: language,
          history: messages.slice(-6) // Send last 6 messages context
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setMessages(prev => [...prev, { role: "assistant", text: data.text }]);
      } else {
        throw new Error(data.error || "Failed to fetch response");
      }
    } catch (err) {
      console.error("Failed to chat with AI", err);
      // Fallback fallback response already handled on the server.
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: `Apologies, I encountered a temporary network delay connecting to the server. Please verify your GEMINI_API_KEY settings or try resending.

Fallback Guidelines for ${language}:
1. Select 'AI Detector' tab on bottom navigation.
2. Choose your hazard category (River, Burning, Solid waste).
3. Upload or click photo to auto-generate complaint with GPS telemetry instantly.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[550px] md:h-[620px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      
      {/* Sidebar: Suggested prompts list */}
      <div className="md:col-span-4 p-5 bg-slate-50 dark:bg-slate-800/20 border-r border-slate-150 dark:border-slate-800 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500 rounded-lg text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
              Suggested Interrogations
            </h4>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Click on any predefined environmental question to query the Gemini-3.5 model in the preferred language.
          </p>

          <div className="space-y-2 pt-2">
            {activePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(p)}
                className="w-full text-left p-2.5 bg-white dark:bg-slate-900 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 border border-slate-200 dark:border-slate-800/80 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 transition duration-200 hover:border-indigo-300"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-[10px] text-slate-500 dark:text-slate-400 leading-normal flex items-start gap-1.5 font-semibold">
          <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          Powered by Gemini 3.5 Flash Model for precise environmental diagnostics.
        </div>
      </div>

      {/* Main chat viewport */}
      <div className="md:col-span-8 flex flex-col justify-between h-full relative overflow-hidden bg-white dark:bg-slate-900">
        
        {/* Chat history messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => {
            const isBot = m.role === "assistant";
            return (
              <div key={idx} className={`flex gap-3.5 items-start ${isBot ? "" : "flex-row-reverse"}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border font-extrabold text-sm ${isBot ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}>
                  {isBot ? <Bot className="w-4 h-4" /> : "ME"}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[80%] shadow-sm border whitespace-pre-wrap ${isBot ? "bg-slate-50 border-slate-100 text-slate-800 dark:bg-slate-800/30 dark:border-slate-800/60 dark:text-slate-200" : "bg-indigo-600 border-indigo-500 text-white"}`}>
                  {m.text}
                </div>

              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-center gap-2 text-slate-400 font-bold text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                Gemini is composing environmental guidelines...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 items-center bg-white dark:bg-slate-900"
        >
          <input
            type="text"
            placeholder="Ask anything about environmental hazards, reports, or regulations..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white font-bold rounded-xl transition duration-200 shrink-0 shadow-sm"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>

      </div>

    </div>
  );
}
