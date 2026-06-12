import { useState, useRef, useEffect, useCallback } from "react";

// ECHS Official Logo SVG (Central Organisation shield badge)
const ECHSLogo = ({ size = 32 }) => (
  <img
    src="/echs-logo.png"
    width={size}
    height={size}
    alt="ECHS Logo"
    style={{ borderRadius: "50%", objectFit: "cover", background: "white" }}
    onError={e => {
      e.target.style.display = "none";
      e.target.nextSibling.style.display = "flex";
    }}
  />
);

// Fallback shield icon if image fails
const ECHSShield = ({ size = 32, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);


const SAMPLE_QA = [
  { keywords: ["non-empanelled", "emergency", "non empanelled"], answer: "Yes. In emergencies, treatment may be taken in a non-empanelled hospital. The hospital must notify the nearest ECHS Polyclinic within 48 hours. Reimbursement will be at CGHS rates applicable to that city, and original bills must be submitted.", source: "ECHS Policy Manual", page: 10, confidence: 0.92 },
  { keywords: ["referral", "specialist", "refer"], answer: "Referral to a specialist or empanelled hospital is issued by the Medical Officer at your ECHS Polyclinic. The referral is valid for 30 days and must specify the specialist type and diagnosis. Emergency referrals can be self-initiated but must be regularised within 72 hours.", source: "ECHS Referral Guidelines", page: 4, confidence: 0.89 },
  { keywords: ["dependent", "family", "beneficiary", "who is eligible"], answer: "Dependents eligible for ECHS benefits include: spouse, unmarried daughters (no age limit if dependent), sons up to age 25 (or until employment, whichever is earlier), and dependent parents residing with the veteran. Widows of ex-servicemen are also entitled to full ECHS benefits.", source: "Beneficiary Handbook", page: 2, confidence: 0.9 },
  { keywords: ["reimbursement", "claim", "bill", "payment"], answer: "Reimbursement claims must be submitted within 6 months of treatment. Required documents: original bills, prescriptions, discharge summary, and a completed ECHS claim form. Claims above ₹5 lakhs require prior approval. Claims are processed within 45 days of submission.", source: "ECHS Circular 2023/14", page: 1, confidence: 0.88 },
  { keywords: ["polyclinic", "nearest", "location", "address"], answer: "To locate your nearest ECHS Polyclinic, you may contact the Station Headquarters of your district or call the ECHS Central Organisation at 011-26175470. A full list of polyclinics is also maintained on the ECHS portal at echs.gov.in.", source: "ECHS Policy Manual", page: 7, confidence: 0.82 },
  { keywords: ["medicine", "drugs", "pharmacy", "prescription"], answer: "Medicines prescribed by the MO at the ECHS Polyclinic are provided free of charge from the polyclinic pharmacy. If a prescribed medicine is unavailable at the polyclinic, the beneficiary may purchase it from a licensed pharmacy and claim reimbursement with original bills and the MO's prescription.", source: "Beneficiary Handbook", page: 14, confidence: 0.91 },
  { keywords: ["card", "smart card", "id", "lost"], answer: "In case of loss of ECHS Smart Card, report to the nearest ECHS Polyclinic immediately. A duplicate card can be issued on payment of ₹100. An affidavit of loss and a passport-sized photograph are required. The duplicate card is issued within 15 working days.", source: "ECHS Circular 2022/08", page: 3, confidence: 0.87 },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "as", label: "অসমীয়া" },
  { code: "bn", label: "বাংলা" },
  { code: "bodo", label: "बड़ो" },
];

const WELCOME_MESSAGES = {
  en: "Namaste! I am your ECHS AI Assistant. I can answer questions about ECHS policies, referrals, benefits, and more. How can I help you today?",
  hi: "नमस्ते! मैं आपका ECHS AI सहायक हूँ। मैं ECHS नीतियों, रेफरल, लाभ और अन्य विषयों पर आपके प्रश्नों का उत्तर दे सकता हूँ। मैं आपकी कैसे सहायता कर सकता हूँ?",
  bn: "নমস্কার! আমি আপনার ECHS AI সহকারী। আমি ECHS নীতি, রেফারেল, সুবিধা এবং অন্যান্য বিষয়ে আপনার প্রশ্নের উত্তর দিতে পারি। আমি কীভাবে সাহায্য করতে পারি?",
  as: "নমস্কাৰ! মই আপোনাৰ ECHS AI সহায়ক। মই ECHS নীতি, ৰেফাৰেল, সুবিধা আৰু অন্যান্য বিষয়ত আপোনাৰ প্ৰশ্নৰ উত্তৰ দিব পাৰোঁ। মই কেনেকৈ সহায় কৰিব পাৰোঁ?",
  bodo: "नमस्कार! आं ECHS AI सहायाक। आं ECHS निति, रेफारेल आरो सुबुंनि गोनांथि फोरखौ फोसावनो हायो।"
};

const UI_TEXT = {
  en: { askQuestion: "Ask a Question", findHospitals: "Find Hospitals", placeholder: "Ask your question about ECHS policies..." },
  hi: { askQuestion: "प्रश्न पूछें", findHospitals: "अस्पताल खोजें", placeholder: "ECHS नीति के बारे में प्रश्न पूछें..." },
  bn: { askQuestion: "প্রশ্ন করুন", findHospitals: "হাসপাতাল খুঁজুন", placeholder: "ECHS নীতি সম্পর্কে প্রশ্ন করুন..." },
  as: { askQuestion: "প্ৰশ্ন সোধক", findHospitals: "হাসপাতাল বিচাৰক", placeholder: "ECHS নীতি সম্পৰ্কে প্ৰশ্ন সোধক..." },
  bodo: { askQuestion: "सोंनाय खालाम", findHospitals: "हस्पिटाल नागिरना", placeholder: "ECHS नितिनि सोंनाय खालाम..." }
};

// FIX 3: "All" only in filter dropdown, never in the toggle list used for saving hospitals
const SPECIALTIES_FILTER = ["All", "Cardiology", "Dialysis", "Nephrology", "Oncology", "Orthopedics", "Neurology", "Ophthalmology", "General Medicine", "General Surgery", "ENT", "Gynecology"];
const SPECIALTIES_INPUT  = ["Cardiology", "Dialysis", "Nephrology", "Oncology", "Orthopedics", "Neurology", "Ophthalmology", "General Medicine", "General Surgery", "ENT", "Gynecology"];

const DOCUMENT_CATEGORIES = ["beneficiary", "clinical", "finance", "governance", "infrastructure", "pharmacy", "policy"];

// Dark mode palette
const D = {
  bg: "#0D0D0D",
  bgCard: "#161616",
  bgSecondary: "#1C1C1C",
  bgInput: "#111111",
  border: "#2A2A2A",
  borderLight: "#222222",
  text: "#E8E8E8",
  textSecondary: "#888888",
  green: "#1D9E75",
  greenDark: "#30509F",
  greenBg: "rgba(29,158,117,0.10)",
  greenBorder: "rgba(29,158,117,0.28)",
  amber: "#D97706",
  amberBg: "rgba(217,119,6,0.10)",
  amberBorder: "rgba(217,119,6,0.28)",
};

function findAnswer(question) {
  const q = question.toLowerCase();
  for (const item of SAMPLE_QA) {
    if (item.keywords.some(k => q.includes(k))) return item;
  }
  return null;
}

// Pure filter function — no state, no side effects
function filterHospitals(hospitals, query, specialty) {
  const q = query.toLowerCase();
  return hospitals.filter(h => {
    const matchLocation = !q || h.city.toLowerCase().includes(q) || h.state.toLowerCase().includes(q) || h.name.toLowerCase().includes(q);
    const matchSpecialty = !specialty || specialty === "All" || (h.specialties || []).includes(specialty);
    return matchLocation && matchSpecialty;
  });
}

const TagBadge = ({ text }) => (
  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: D.bgSecondary, border: `0.5px solid ${D.border}`, color: D.textSecondary, display: "inline-block", margin: "2px 2px" }}>
    {text}
  </span>
);

const SourceCard = ({ source, page, confidence }) => (
  <div
    style={{
      marginTop: 12,
      padding: "8px 12px",
      borderRadius: 8,
      background: D.bgSecondary,
      border: `0.5px solid ${D.greenBorder}`,
      fontSize: 12
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: D.green, flexShrink: 0, display: "inline-block" }}></span>
      <span style={{ color: D.textSecondary, fontWeight: 500 }}>Source</span>
      <span style={{ marginLeft: "auto", color: D.green, fontWeight: 500 }}>Verified</span>
    </div>
    <div style={{ color: D.text, fontWeight: 600 }}>{source?.document || "ECHS Document"}</div>
    <div style={{ color: D.textSecondary, marginTop: 2 }}>
      Category: {(source?.category || "Policy").charAt(0).toUpperCase() + (source?.category || "Policy").slice(1)}
    </div>
    <div style={{ color: D.textSecondary, marginTop: 2 }}>Page {source?.page || page}</div>
  </div>
);

const ChatBubble = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: 16, gap: 4 }}>
      {!isUser && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", overflow: "hidden", background: "#1a1a2e", border: `1px solid ${D.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <img
              src="/echs-logo.png"
              width={24}
              height={24}
              alt="ECHS"
              style={{ objectFit: "cover" }}
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
          <span style={{ fontSize: 11, color: D.textSecondary, fontWeight: 500 }}>ECHS Assistant</span>
        </div>
      )}
      <div style={{
        maxWidth: "80%",
        padding: "10px 14px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
        background: isUser ? "#30509F" : D.bgCard,
        border: isUser ? "none" : `0.5px solid ${D.border}`,
        color: isUser ? "white" : D.text,
        fontSize: 14,
        lineHeight: 1.6,
      }}>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{msg.content}</div>
        {msg.refusal && (
          <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: D.amberBg, border: `0.5px solid ${D.amberBorder}`, fontSize: 12, color: D.amber }}>
            Please consult your nearest ECHS Polyclinic for guidance on this matter.
          </div>
        )}
        {msg.sources?.map((source, idx) => (<SourceCard key={idx} source={source} />))}
      </div>
    </div>
  );
};

function BeneficiaryChat({ lang }) {
  const [messages, setMessages] = useState([
    { id: 0, role: "assistant", content: WELCOME_MESSAGES[lang] || WELCOME_MESSAGES.en }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setMessages(current => {
      if (current.length === 1 && current[0].role === "assistant") {
        return [{ ...current[0], content: WELCOME_MESSAGES[lang] || WELCOME_MESSAGES.en }];
      }
      return current;
    });
  }, [lang]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const askClaude = async (question) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, language: lang })
      });
      const data = await response.json();
      console.log(data.sources);
      setMessages(m => [...m, { id: Date.now(), role: "assistant", content: data.answer, sources: data.sources, confidence: data.confidence, refusal: false }]);
    } catch (error) {
      console.error(error);
      setMessages(m => [...m, { id: Date.now(), role: "assistant", content: "Unable to connect to ECHS backend.", refusal: true }]);
    }
    setLoading(false);
  };

  const send = () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setMessages(m => [...m, { id: Date.now(), role: "user", content: q }]);
    setInput("");
    askClaude(q);
  };

  const startVoice = () => {
    console.log("MIC CLICKED");
    console.log(window.SpeechRecognition);
    console.log(window.webkitSpeechRecognition);
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser. Please use Chrome or Microsoft Edge.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    const speechLang = { en: "en-IN", hi: "hi-IN", bn: "bn-IN", as: "as-IN", bodo: "hi-IN" };
    recognition.lang = speechLang[lang] || "en-IN";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => { setInput(e.results[0][0].transcript.trim()); };
    recognitionRef.current = recognition;
    recognition.onerror = (event) => { console.error(event.error); setListening(false); alert("Voice recognition error: " + event.error); };
    recognition.start();
  };

  const QUESTION_SUGGESTIONS = {
    en: ["Can I take treatment in a non-empanelled hospital?", "Who are my eligible dependents?", "How do I claim reimbursement?", "What documents do I need for a referral?"],
    hi: ["क्या मैं गैर-एम्पैनल्ड अस्पताल में उपचार करा सकता हूँ?", "मेरे पात्र आश्रित कौन हैं?", "मैं प्रतिपूर्ति का दावा कैसे करूँ?", "रेफरल के लिए किन दस्तावेज़ों की आवश्यकता है?"],
    bn: ["আমি কি নন-এমপ্যানেলড হাসপাতালে চিকিৎসা নিতে পারি?", "আমার যোগ্য নির্ভরশীল কারা?", "আমি কীভাবে রিইম্বার্সমেন্ট দাবি করব?", "রেফারেলের জন্য কী কী নথি প্রয়োজন?"],
    as: ["মই নন-এম্পেনেল্ড হাস্পতালত চিকিৎসা ল'ব পাৰোঁনে?", "মোৰ যোগ্য নিৰ্ভৰশীল কোন?", "মই কেনেকৈ প্ৰতিপূৰণ দাবী কৰিম?", "ৰেফারেলৰ বাবে কি কি নথি লাগে?"],
    bodo: ["आं नन-एम्पानेल्ड हस्पिटालआव दानो मोननो हायो नामा?", "आंनि गोनांथि निर्भरखौनो मा?", "आं रिइम्बर्समेण्टखौ मानि दाबि खालामनो हायो?", "रेफारेलनि थाखाय मा मा डकुमेन्ट लागोन?"]
  };

  const suggestions = QUESTION_SUGGESTIONS[lang] || QUESTION_SUGGESTIONS.en;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: D.bg }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column" }}>
        {messages.map(m => <ChatBubble key={m.id} msg={m} />)}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: D.textSecondary, fontSize: 13, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: D.green, display: "inline-block", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }}></span>)}
            </div>
            Searching ECHS documents...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {messages.length === 1 && (
        <div style={{ padding: "0 16px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 20, border: `0.5px solid ${D.border}`, background: D.bgSecondary, color: D.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>
              {s}
            </button>
          ))}
        </div>
      )}
      <div style={{ padding: "8px 12px 12px", borderTop: `0.5px solid ${D.border}`, background: D.bg }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={UI_TEXT[lang]?.placeholder || "Ask your question about ECHS policies..."}
            rows={2}
            style={{ flex: 1, resize: "none", fontSize: 14, padding: "8px 10px", borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.bgInput, color: D.text, fontFamily: "inherit", lineHeight: 1.5 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button
              onClick={startVoice}
              title={listening ? "Listening..." : "Voice input"}
              style={{ width: 36, height: 36, borderRadius: "50%", border: `0.5px solid ${listening ? D.greenDark : D.border}`, background: listening ? D.greenBg : D.bgSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: listening ? D.green : D.textSecondary, transition: "all 0.2s ease" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={listening ? "#91D8F8" : D.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1v11" />
                <rect x="8" y="1" width="8" height="14" rx="4" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <path d="M12 19v4" />
                <path d="M8 23h8" />
              </svg>
            </button>
            {listening && (
              <div style={{ color: "#91D8F8", fontSize: 11, textAlign: "center" }}>Listening...</div>
            )}
            <button onClick={send} disabled={!input.trim() || loading} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: input.trim() && !loading ? D.greenDark : D.bgSecondary, cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !loading ? "white" : D.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,80%,100% { opacity:.3; transform:scale(0.8) } 40% { opacity:1; transform:scale(1) } } textarea::placeholder { color: ${D.textSecondary}; } textarea:focus { outline: none; border-color: ${D.green} !important; } input::placeholder { color: ${D.textSecondary}; } input:focus { outline: none; border-color: ${D.green} !important; }`}</style>
    </div>
  );
}

function HospitalSearch() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/admin/hospitals")
      .then(r => r.json())
      .then(data => setHospitals(data))
      .catch(() => setHospitals([]));
  }, []);

  // FIX 2: derive results inline — no useEffect, no infinite loop
  const results = filterHospitals(hospitals, query, specialty);

  return (
    <div style={{ padding: 16, background: D.bg }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by city, hospital name..."
          style={{ flex: 1, minWidth: 160, fontSize: 14, padding: "8px 12px", borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.bgInput, color: D.text, fontFamily: "inherit" }}
        />
        {/* FIX 3: use SPECIALTIES_FILTER (includes "All") for the dropdown */}
        <select
          value={specialty}
          onChange={e => setSpecialty(e.target.value)}
          style={{ fontSize: 14, padding: "8px 10px", borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.bgInput, color: D.text, fontFamily: "inherit" }}
        >
          {SPECIALTIES_FILTER.map(s => <option key={s} style={{ background: D.bgCard, color: D.text }}>{s}</option>)}
        </select>
        <button
          onClick={() => {}}
          style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: D.greenDark, color: "white", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
        >
          Search
        </button>
      </div>
      <div style={{ fontSize: 12, color: D.textSecondary, marginBottom: 12 }}>{results.length} hospital{results.length !== 1 ? "s" : ""} found</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* FIX UX: separate empty-DB message from no-results message */}
        {hospitals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: D.textSecondary, fontSize: 14 }}>No hospitals added yet. Add hospitals in the admin panel.</div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: D.textSecondary, fontSize: 14 }}>No hospitals match your search. Try a different city or specialty.</div>
        ) : results.map(h => (
          <div key={h.id} style={{ background: D.bgCard, border: `0.5px solid ${D.border}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontWeight: 500, fontSize: 14, color: D.text }}>{h.name}</div>
            </div>
            <div style={{ fontSize: 12, color: D.textSecondary, marginBottom: 8 }}>📍 {h.city}, {h.state}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {(h.specialties || []).map(s => <TagBadge key={s} text={s} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// FIX 1: corrected JSX structure — all elements are inside the card div,
// error and login button are no longer orphaned outside it
function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = () => {
    if (password === "ECHSadmin") {
      sessionStorage.setItem("admin_auth", "true");
      onSuccess();
    } else {
      setError("Invalid password");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
      <div style={{ width: 320, background: D.bgCard, padding: 24, paddingTop: 30, borderRadius: 12, border: `1px solid ${D.border}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h3 style={{ color: D.text, marginTop: 0, marginBottom: 15, textAlign: "center" }}>Admin Login</h3>
        <div style={{ width: "100%", maxWidth: 280, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
              style={{ flex: 1, padding: 10, background: D.bgInput, color: D.text, border: `0.5px solid ${D.border}`, borderRadius: 8, fontFamily: "inherit" }}
            />
            <button
              onClick={() => setShowPassword(s => !s)}
              title={showPassword ? "Hide password" : "Show password"}
              style={{ padding: "8px 10px", borderRadius: 8, border: `0.5px solid ${D.border}`, background: "transparent", color: D.textSecondary, cursor: "pointer", fontFamily: "inherit" }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {error && (
          <div style={{ color: "#ff6666", marginTop: 8, textAlign: "center" }}>{error}</div>
        )}
        <button
          onClick={login}
          style={{ width: 140, margin: "16px auto 0", display: "block", padding: "8px 12px", borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.greenDark, color: "white", cursor: "pointer", fontFamily: "inherit" }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

function AdminPanel() {
  const [uploaded, setUploaded] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [category, setCategory] = useState(DOCUMENT_CATEGORIES[0]);
  const [dragOver, setDragOver] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalCity, setHospitalCity] = useState("");
  const [hospitalState, setHospitalState] = useState("");
  // FIX 3: default to empty array — "All" can never be saved as a specialty
  const [hospitalSpecialties, setHospitalSpecialties] = useState([]);
  const [message, setMessage] = useState("");
  const [rebuilding, setRebuilding] = useState(false);

  const refreshDocuments = useCallback(async () => {
    const docs = await fetch("http://localhost:8000/admin/documents");
    setUploaded(await docs.json());
  }, []);

  const refreshHospitals = useCallback(async () => {
    const res = await fetch("http://localhost:8000/admin/hospitals");
    setHospitals(await res.json());
  }, []);

  useEffect(() => {
    refreshDocuments();
    refreshHospitals();
  }, [refreshDocuments, refreshHospitals]);

  const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    await fetch("http://localhost:8000/admin/upload", { method: "POST", body: formData });
    await refreshDocuments();
  };

  const addHospital = async () => {
    if (!hospitalName.trim() || !hospitalCity.trim() || !hospitalState.trim()) {
      setMessage("Please fill all hospital fields.");
      return;
    }
    if (hospitalSpecialties.length === 0) {
      setMessage("Please select at least one specialty.");
      return;
    }
    await fetch("http://localhost:8000/admin/add_hospital", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: hospitalName.trim(),
        city: hospitalCity.trim(),
        state: hospitalState.trim(),
        specialties: hospitalSpecialties   // always real specialties, never ["All"]
      })
    });
    setHospitalName("");
    setHospitalCity("");
    setHospitalState("");
    setHospitalSpecialties([]);
    setMessage("Hospital saved.");
    await refreshHospitals();
  };

  const removeDocument = async (category, filename) => {
    await fetch(`http://localhost:8000/admin/documents?category=${encodeURIComponent(category)}&filename=${encodeURIComponent(filename)}`, { method: "DELETE" });
    await refreshDocuments();
    alert("Document deleted.\nPlease rebuild the database.");
  };

  const removeHospital = async (id) => {
    await fetch(`http://localhost:8000/admin/hospitals/${id}`, { method: "DELETE" });
    await refreshHospitals();
  };

  const handleRebuild = async () => {
    try {
      setRebuilding(true);
      const response = await fetch("http://localhost:8000/admin/rebuild", { method: "POST" });
      const data = await response.json();
      alert(`Database rebuilt.\nChunks: ${data.chunks}`);
    } catch (error) {
      alert("Database rebuild failed.");
      console.error(error);
    } finally {
      setRebuilding(false);
    }
  };

  // FIX 3: toggles only real specialties — "All" is not in SPECIALTIES_INPUT
  const toggleSpecialty = (value) => {
    setHospitalSpecialties(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
    );
  };

  return (
    <div style={{ padding: 16, background: D.bg }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button
          onClick={() => { sessionStorage.removeItem("admin_auth"); window.location.reload(); }}
          style={{ padding: "6px 10px", borderRadius: 8, border: `0.5px solid ${D.border}`, background: "transparent", color: D.textSecondary, cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
      <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: D.text }}>Upload Document</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ fontSize: 14, padding: "8px 10px", borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.bgInput, color: D.text, fontFamily: "inherit" }}>
              {DOCUMENT_CATEGORIES.map(c => <option key={c} value={c} style={{ background: D.bgCard, color: D.text }}>{c}</option>)}
            </select>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadDocument(f); }}
                style={{ border: `1.5px dashed ${dragOver ? D.green : D.border}`, borderRadius: 12, padding: "24px 16px", textAlign: "center", background: dragOver ? D.greenBg : "transparent", transition: "all 0.2s" }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>📤</div>
                <div style={{ fontSize: 13, color: D.textSecondary, marginBottom: 4 }}>Drag & drop PDF here, or click to browse</div>
                <input type="file" accept=".pdf,.xlsx" style={{ display: "none" }} id="fileupload" onChange={e => { if (e.target.files[0]) uploadDocument(e.target.files[0]); }} />
                <label htmlFor="fileupload" style={{ fontSize: 12, cursor: "pointer", color: D.green, textDecoration: "underline" }}>Choose file</label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500, color: D.text }}>Add Hospital</div>
          <div style={{ display: "grid", gap: 10 }}>
            <input value={hospitalName} onChange={e => setHospitalName(e.target.value)} placeholder="Hospital name" style={{ width: "100%", padding: 10, borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.bgInput, color: D.text, fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input value={hospitalCity} onChange={e => setHospitalCity(e.target.value)} placeholder="City" style={{ flex: 1, minWidth: 140, padding: 10, borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.bgInput, color: D.text, fontFamily: "inherit" }} />
              <input value={hospitalState} onChange={e => setHospitalState(e.target.value)} placeholder="State" style={{ flex: 1, minWidth: 140, padding: 10, borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.bgInput, color: D.text, fontFamily: "inherit" }} />
            </div>
            {/* FIX 3: use SPECIALTIES_INPUT — no "All" option in the toggle list */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 10, borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.bgSecondary }}>
              {SPECIALTIES_INPUT.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 20,
                    border: `0.5px solid ${hospitalSpecialties.includes(s) ? D.green : D.border}`,
                    background: hospitalSpecialties.includes(s) ? D.greenBg : "transparent",
                    color: hospitalSpecialties.includes(s) ? D.green : D.textSecondary,
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "inherit"
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <button onClick={addHospital} style={{ width: 140, padding: "10px 12px", borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.greenDark, color: "white", cursor: "pointer", fontFamily: "inherit" }}>Save Hospital</button>
            {message && <div style={{ color: D.textSecondary, fontSize: 13 }}>{message}</div>}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 500, color: D.text, marginBottom: 10 }}>Knowledge Base</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {uploaded.map((doc, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: D.bgCard, border: `0.5px solid ${D.border}`, borderRadius: 8 }}>
            <div style={{ fontSize: 20 }}>📄</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: D.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</div>
              <div style={{ fontSize: 11, color: D.textSecondary }}>{doc.category} · {doc.date} · {doc.size}</div>
            </div>
            <button
              onClick={() => removeDocument(doc.category, doc.name)}
              style={{ padding: "6px 10px", borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.bgSecondary, color: D.textSecondary, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <button
          onClick={handleRebuild}
          disabled={rebuilding}
          style={{ width: 180, padding: "10px 12px", borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.greenDark, color: "white", cursor: rebuilding ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          {rebuilding ? "Rebuilding..." : "Rebuild Database"}
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 10, fontSize: 13, fontWeight: 500, color: D.text }}>Hospitals</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {hospitals.length === 0 ? (
            <div style={{ padding: "14px 12px", borderRadius: 8, background: D.bgCard, color: D.textSecondary }}>No hospitals added yet.</div>
          ) : hospitals.map(h => (
            <div key={h.id} style={{ background: D.bgCard, border: `0.5px solid ${D.border}`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: D.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: D.textSecondary }}>{h.city}, {h.state}</div>
                </div>
                <button
                  onClick={() => removeHospital(h.id)}
                  style={{ padding: "6px 10px", borderRadius: 8, border: `0.5px solid ${D.border}`, background: D.bgSecondary, color: D.textSecondary, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}
                >
                  Remove
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(h.specialties || []).map(s => <TagBadge key={`${h.id}-${s}`} text={s} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ECHSApp() {
  const [adminAuthenticated, setAdminAuthenticated] = useState(
    sessionStorage.getItem("admin_auth") === "true"
  );
  const [tab, setTab] = useState("chat");
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [lang, setLang] = useState("en");
  const [view, setView] = useState("beneficiary");

  if (!selectedLanguage) {
    return (
      <div style={{ minHeight: "100vh", background: D.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: "min(100%, 420px)", background: D.bgCard, padding: 24, borderRadius: 16, border: `1px solid ${D.border}` }}>
          <h2 style={{ color: D.text, marginTop: 0, marginBottom: 20 }}>Select Language</h2>
          {LANGUAGES.map(language => (
            <button
              key={language.code}
              onClick={() => { setSelectedLanguage(language.code); setLang(language.code); }}
              style={{ width: "100%", marginBottom: 10, padding: 12, borderRadius: 8, border: `1px solid ${D.border}`, background: D.bgSecondary, color: D.text, cursor: "pointer" }}
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const tabs = view === "beneficiary"
    ? [
        { id: "chat", label: UI_TEXT[lang]?.askQuestion || "Ask a Question", icon: "💬" },
        { id: "hospitals", label: UI_TEXT[lang]?.findHospitals || "Find Hospitals", icon: "🏥" }
      ]
    : [{ id: "admin", label: "Admin Panel", icon: "⚙️" }];

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", width: "min(100%, 680px)", margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100vh", background: D.bg }}>
      {/* Header */}
      <div style={{ background: "#0a1628", color: "white", padding: "12px 16px", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid #1e3a5f` }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.2)" }}>
          <img
            src="/echs-logo.png"
            width={42}
            height={42}
            alt="ECHS Central Organisation"
            style={{ objectFit: "cover" }}
            onError={e => {
              e.target.style.display = "none";
              const fb = document.createElement("div");
              fb.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
              e.target.parentNode.appendChild(fb.firstChild);
            }}
          />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>ECHS AI Assistant</div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>Ex-Servicemen Contributory Health Scheme</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "0.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "white", fontFamily: "inherit", cursor: "pointer" }}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code} style={{ color: "black", background: "white" }}>{l.label}</option>)}
          </select>
          <button
            onClick={() => { setView(v => v === "beneficiary" ? "admin" : "beneficiary"); setTab(view === "beneficiary" ? "admin" : "chat"); }}
            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "0.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "white", cursor: "pointer", fontFamily: "inherit" }}
          >
            {view === "beneficiary" ? "Admin" : "← Back"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `0.5px solid ${D.border}`, background: D.bgCard }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 0", fontSize: 13, border: "none", borderBottom: tab === t.id ? `2px solid ${D.green}` : "2px solid transparent", background: "transparent", color: tab === t.id ? D.green : D.textSecondary, cursor: "pointer", fontFamily: "inherit", fontWeight: tab === t.id ? 500 : 400, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingTop: 16, background: D.bg, borderRadius: "0 0 12px 12px", border: `0.5px solid ${D.border}`, borderTop: "none", overflow: "hidden" }}>
        <div style={{ display: tab === "chat" ? "block" : "none", height: "100%" }}>
          <BeneficiaryChat lang={lang} />
        </div>
        <div style={{ display: tab === "hospitals" ? "block" : "none", height: "100%" }}>
          <HospitalSearch />
        </div>
        <div style={{ display: tab === "admin" ? "block" : "none", height: "100%" }}>
          {adminAuthenticated ? (
            <AdminPanel />
          ) : (
            <AdminLogin onSuccess={() => setAdminAuthenticated(true)} />
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: D.textSecondary, padding: "8px 0", opacity: 0.6 }}>
        Answers are based on official ECHS documents only. Always verify with your nearest Polyclinic.
      </div>
    </div>
  );
}