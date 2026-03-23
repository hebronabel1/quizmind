import { useState, useRef } from "react";
import * as mammoth from "mammoth";

// ─── DATA ────────────────────────────────────────────────────────────────────
const TOPICS = {
Accounting:              ["Audit","Financial Accounting","Regulations","Tax","Other"],
Biology:                 ["Cell Biology","Ecology","Genetics","Physiology","Other"],
"Business & Management": ["Leadership","Operations","Organizational Behavior","Strategy","Other"],
Chemistry:               ["Biochemistry","Inorganic Chemistry","Organic Chemistry","Physical Chemistry","Other"],
Economics:               ["Behavioral Economics","International Economics","Macroeconomics","Microeconomics","Other"],
Finance:                 ["Corporate Finance","Investments","Personal Finance","Risk Management","Other"],
History:                 ["American History","Ancient History","Modern History","World History","Other"],
Law:                     ["Business Law","Constitutional Law","Contract Law","Criminal Law","Other"],
Marketing:               ["Brand Management","Consumer Behavior","Digital Marketing","Market Research","Other"],
Medical:                 ["Anatomy","Clinical Medicine","Pharmacology","Physiology","Other"],
Physics:                 ["Electromagnetism","Mechanics","Quantum Mechanics","Thermodynamics","Other"],
Psychology:              ["Abnormal Psychology","Cognitive Psychology","Developmental Psychology","Social Psychology","Other"],
"Real Estate":           ["Property Law","Property Valuation","Real Estate Finance","Real Estate Investment","Other"],
};

const DC = {
Easy:   { c:"#22c55e", bg:"rgba(34,197,94,0.1)",  b:"rgba(34,197,94,0.3)"  },
Medium: { c:"#f59e0b", bg:"rgba(245,158,11,0.1)", b:"rgba(245,158,11,0.3)" },
Hard:   { c:"#ef4444", bg:"rgba(239,68,68,0.1)",  b:"rgba(239,68,68,0.3)"  },
};

const TH = d => ({
bg:   d ? "#0d0d0d" : "#f6f4ef",
bg2:  d ? "#161616" : "#eceae4",
bg3:  d ? "#202020" : "#e0ddd5",
text: d ? "#ede9e4" : "#1a1714",
t2:   d ? "#777"   : "#666",
t3:   d ? "#444"   : "#aaa",
bdr:  d ? "#242424": "#dddad0",
bdr2: d ? "#363636": "#ccc9bc",
acc:  d ? "#2a2a2a": "#d8d5c8",
});

const GS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap'); *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;} body{overflow-x:hidden;} input[type=range]{-webkit-appearance:none;height:3px;border-radius:2px;cursor:pointer;outline:none;width:100%;} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;cursor:pointer;background:#ede9e4;border:2px solid #555;box-shadow:0 1px 4px rgba(0,0,0,0.35);transition:transform 0.15s;} input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.15);} input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;cursor:pointer;background:#ede9e4;border:2px solid #555;box-shadow:0 1px 4px rgba(0,0,0,0.35);} select,button{outline:none;} input[type=text]{outline:none;} ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#444;border-radius:2px;} @keyframes spin{to{transform:rotate(360deg);}} @keyframes rspin{to{transform:rotate(-360deg);}} @keyframes fadeUp{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}} @keyframes blink{0%,100%{opacity:0.4;}50%{opacity:1;}} @keyframes srcIn{from{opacity:0;transform:scaleY(0.85) translateY(8px);}to{opacity:1;transform:scaleY(1) translateY(0);}} @keyframes slideDown{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}} @media(max-width:640px){.qgrid{grid-template-columns:1fr !important;}.qsidebar{order:-1;}}`;

let citeIdSeq = 0;
const uid = () => ++citeIdSeq;

export default function QuizMind() {
const [dark, setDark] = useState(true);
const [screen, setScreen] = useState("gate");

// Access gate
const ACCESS_CODE = "QuizMind2026";
const [gateInput, setGateInput] = useState("");
const [gateErr, setGateErr] = useState("");

// Hardcoded API key removed — backend handles auth

// Primary inputs
const [iMode, setIMode] = useState("topic");
const [topic, setTopic] = useState("Accounting");
const [sub, setSub] = useState("Audit");
const [customSub, setCustomSub] = useState("");
const [diff, setDiff] = useState("Easy");
const [qCnt, setQCnt] = useState(20);
const [file, setFile] = useState(null);
const [fErr, setFErr] = useState("");
const [drag, setDrag] = useState(false);

// Cite section
const [citeOpen, setCiteOpen] = useState(false);
const [citeUrls, setCiteUrls] = useState([]);
const [citeFiles, setCiteFiles] = useState([]);
const [urlInput, setUrlInput] = useState("");
const [citeErr, setCiteErr] = useState("");
const [citeDrag, setCiteDrag] = useState(false);

// Loading
const [status, setStatus] = useState("");

// Capacity
const [capMax, setCapMax] = useState(50);
const [capCnt, setCapCnt] = useState(20);
const [extText, setExtText] = useState("");
const [fLabel, setFLabel] = useState("");

// Cannot-generate
const [pendingLabel, setPendingLabel] = useState("");
const [pendingCount, setPendingCount] = useState(20);

// Quiz
const [questions, setQuestions] = useState([]);
const [sources, setSources] = useState([]);
const [curQ, setCurQ] = useState(0);
const [answers, setAnswers] = useState([]);
const [subm, setSubm] = useState([]);
const [sel, setSel] = useState(null);
const [score, setScore] = useState(0);
const [srcOpen, setSrcOpen] = useState(false);

const fRef = useRef(null);
const citeFRef = useRef(null);
const T = TH(dark);
const dc = DC[diff];
const hasCite = citeUrls.length > 0 || citeFiles.length > 0;

// ── Style helpers ─────────────────────────────────────────────────────────
const selSt = (extra = {}) => ({
padding: "11px 36px 11px 14px", background: T.bg3, border: `1px solid ${T.bdr}`,
borderRadius: 9, color: T.text, fontFamily: "inherit", fontSize: 14, cursor: "pointer",
appearance: "none",
backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23888' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`,
backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", ...extra,
});

// ── File handling ─────────────────────────────────────────────────────────
const validateFile = (f, setErr) => {
const ext = f.name.split(".").pop().toLowerCase();
if (!["pdf","docx","pptx","txt"].includes(ext)) {
setErr("Unsupported file type. PDF, Word, PowerPoint, or TXT only."); return false;
}
if (f.size > 50 * 1024 * 1024) {
setErr("It looks like your file is too large. Try using a smaller file or compressing it on a third-party platform."); return false;
}
return true;
};

const onFile = f => {
setFErr("");
if (!f) return;
if (!validateFile(f, setFErr)) return;
setFile(f); setIMode("file");
};

const addCiteFile = f => {
setCiteErr("");
if (!f) return;
if (!validateFile(f, setCiteErr)) return;
setCiteFiles(prev => [...prev, { id: uid(), file: f }]);
};

const addCiteUrl = () => {
setCiteErr("");
const raw = urlInput.trim();
if (!raw) return;
let url = raw;
if (!/^https?:\/\//i.test(url)) url = "https://" + url;
try { new URL(url); } catch { setCiteErr("That doesn't look like a valid URL."); return; }
setCiteUrls(prev => [...prev, { id: uid(), url }]);
setUrlInput("");
};

// ── Text extraction ───────────────────────────────────────────────────────
const extractText = async f => {
const ext = f.name.split(".").pop().toLowerCase();
if (ext === "txt") return new Promise(res => { const r = new FileReader(); r.onload = e => res(e.target.result); r.readAsText(f); });
if (ext === "docx") { const buf = await f.arrayBuffer(); return (await mammoth.extractRawText({ arrayBuffer: buf })).value; }
if (ext === "pdf") {
if (!window.pdfjsLib) {
await new Promise(res => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"; s.onload = res; document.head.appendChild(s); });
window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}
const buf = await f.arrayBuffer();
const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
let txt = "";
for (let i = 1; i <= pdf.numPages; i++) { const p = await pdf.getPage(i); const c = await p.getTextContent(); txt += c.items.map(x => x.str).join(" ") + "\n"; }
return txt;
}
if (ext === "pptx") {
if (!window.JSZip) { await new Promise(res => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; s.onload = res; document.head.appendChild(s); }); }
const buf = await f.arrayBuffer();
const zip = await window.JSZip.loadAsync(buf);
let txt = "";
const slides = Object.keys(zip.files).filter(k => /ppt\/slides\/slide\d+\.xml$/.test(k)).sort();
for (const sl of slides) { const xml = await zip.files[sl].async("text"); txt += (xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || []).map(x => x.replace(/<[^>]+>/g, "")).join(" ") + "\n"; }
return txt;
}
return "";
};

const fetchUrl = async url => {
try {
const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
const data = await r.json();
const div = document.createElement("div");
div.innerHTML = data.contents || "";
div.querySelectorAll("script,style,nav,footer,header").forEach(el => el.remove());
return div.textContent || div.innerText || "";
} catch { return ""; }
};

const stripFrontMatter = txt => {
const lines = txt.split("\n");
const pats = [/^\s*$/,/copyright|\u00a9|\(c\)/i,/isbn[-\s]?\d/i,/all rights reserved/i,/published by|publisher/i,/printed in/i,/library of congress/i,/first edition|second edition|third edition/i,/^(author|editor|written by)/i,/^table of contents/i,/^\s*chapter\s+\d+\s*.{3,}/i,/\s.{4,}\s*\d+\s*$/,/^acknowledgements?$/i,/^preface$/i,/^(www\.|http)/i,/^\s*\d+\s*$/];
let start = 0, wc = 0;
for (let i = 0; i < Math.min(lines.length, 200); i++) {
const l = lines[i].trim();
if (!pats.some(p => p.test(l)) && l.length > 60) { wc += l.split(/\s+/).length; if (wc > 80) { start = i; break; } }
}
return lines.slice(start).join("\n");
};

const estMax = txt => Math.max(10, Math.min(50, Math.floor(txt.trim().split(/\s+/).length / 80)));

const extractCiteText = async () => {
const parts = [];
for (const { url } of citeUrls) {
setStatus(`Fetching ${url.replace(/^https?:\/\//,"").split("/")[0]}...`);
const t = await fetchUrl(url);
if (t.trim()) parts.push(t);
}
for (const { file: f } of citeFiles) {
setStatus(`Reading ${f.name}...`);
const t = await extractText(f);
if (t.trim()) parts.push(stripFrontMatter(t));
}
return parts.join("\n\n");
};

// ── API ───────────────────────────────────────────────────────────────────
const callAPI = async (prompt, maxTok = 8000) => {
const r = await fetch("https://quizmind-api.vercel.app/api/chat", {
method: "POST", headers: { "Content-Type": "application/json" },
body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTok, messages: [{ role: "user", content: prompt }] }),
});
return (await r.json()).content[0].text;
};

const parseJSON = txt => {
try { return JSON.parse(txt); }
catch { const m = txt.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); throw new Error("Parse fail"); }
};

const checkCompatibility = async (citeText, label) => {
setStatus("Checking source compatibility...");
const prompt = `Given the following source text, can you generate meaningful multiple-choice quiz questions about "${label}"? Answer only YES or NO.\n\n${citeText.substring(0, 3000)}`;
try { const res = await callAPI(prompt, 50); return res.trim().toUpperCase().startsWith("YES"); }
catch { return true; }
};

// ── Build quiz ────────────────────────────────────────────────────────────
const buildQuiz = async (content, label, count) => {
const diffDesc = { Easy: "basic recall and definitions — straightforward facts", Medium: "understanding and application — scenarios and relationships", Hard: "analysis, synthesis and evaluation — complex reasoning" }[diff];
setStatus("Building questions...");
const contentBlock = content
? `Base ALL questions ONLY on the educational subject matter in this content. Do NOT ask about the author, publisher, copyright year, ISBN, edition, table of contents, acknowledgements, or any other book metadata. Focus entirely on the concepts, facts, and ideas taught in the text:\n\n${content.substring(0, 7000)}`
: `Topic: ${label}. Use your knowledge of this subject.`;
const prompt = `Generate exactly ${count} multiple-choice quiz questions at ${diff} difficulty (${diffDesc}).\n${contentBlock}\nRequirements: 4 options each, correct_answer is 0-indexed integer, clear explanation 1-3 sentences, source is a real credible organization name only (no URLs, no made-up names).\nReturn ONLY JSON:\n{"questions":[{"id":1,"question":"...","options":["A","B","C","D"],"correct_answer":0,"explanation":"...","source":"Org Name"}]}`;
setStatus("Generating quiz...");
const txt = await callAPI(prompt);
setStatus("Finalizing...");
const qs = parseJSON(txt).questions.slice(0, count);
const uniqSrc = [...new Set(qs.map(q => q.source).filter(Boolean))];
setQuestions(qs); setSources(uniqSrc);
setAnswers(new Array(qs.length).fill(null)); setSubm(new Array(qs.length).fill(false));
setSel(null); setCurQ(0); setScore(0); setSrcOpen(false); setScreen("quiz");
};

// ── Begin ─────────────────────────────────────────────────────────────────
const begin = async () => {
setScreen("loading");
try {
if (iMode === "topic") {
const label = `${topic} — ${sub === "Other" ? (customSub.trim() || "Other") : sub}`;
setFLabel(label);
if (hasCite) {
const citeText = await extractCiteText();
if (!citeText.trim()) { await buildQuiz(null, label, qCnt); return; }
const ok = await checkCompatibility(citeText, label);
if (!ok) { setPendingLabel(label); setPendingCount(qCnt); setScreen("cannotGenerate"); return; }
await buildQuiz(citeText, label, qCnt);
} else {
setStatus(`Fetching sources for ${topic}...`);
await new Promise(r => setTimeout(r, 600));
await buildQuiz(null, label, qCnt);
}
} else {
setStatus("Reading your file...");
const rawTxt = await extractText(file);
setStatus("Analyzing content...");
const fileTxt = stripFrontMatter(rawTxt);
const fileMax = estMax(fileTxt);
setFLabel(file.name);
if (hasCite) {
const citeText = await extractCiteText();
if (fileMax >= qCnt) {
const blended = fileTxt.substring(0, 3500) + "\n\n" + citeText.substring(0, 3500);
await buildQuiz(blended, file.name, qCnt);
} else {
const dominant = citeText + "\n\n" + fileTxt.substring(0, 1500);
await buildQuiz(dominant, file.name, qCnt);
}
} else {
if (fileMax < qCnt) {
setCapMax(fileMax); setCapCnt(Math.min(fileMax, qCnt)); setExtText(fileTxt); setScreen("capacity"); return;
}
await buildQuiz(fileTxt, file.name, qCnt);
}
}
} catch (e) {
console.error(e);
setStatus("Something went wrong. Please try again.");
setTimeout(() => setScreen("home"), 2500);
}
};

const confirmCap = async () => { setScreen("loading"); await buildQuiz(extText, fLabel, capCnt); };
const continueWithoutCite = async () => { setScreen("loading"); setStatus("Generating from general knowledge..."); await buildQuiz(null, pendingLabel, pendingCount); };

// ── Quiz logic ────────────────────────────────────────────────────────────
const submitAns = () => {
if (sel === null) return;
const ns = [...subm]; ns[curQ] = true; setSubm(ns);
const na = [...answers]; na[curQ] = sel; setAnswers(na);
if (sel === questions[curQ].correct_answer) setScore(s => s + 1);
};

const goTo = i => { setCurQ(i); setSel(answers[i] !== null ? answers[i] : null); };

const doRetake = async () => {
setScreen("loading"); setStatus("Rephrasing questions...");
const prompt = `Rephrase each quiz question — same concept, different wording. Keep same correct_answer index.\nInput: ${JSON.stringify(questions.map((q, i) => ({ id: i, question: q.question, options: q.options, correct_answer: q.correct_answer })))}\nReturn ONLY JSON: {"questions":[{"id":0,"question":"...","options":["A","B","C","D"],"correct_answer":0}]}`;
try {
const p = parseJSON(await callAPI(prompt, 6000));
setQuestions(questions.map((q, i) => ({ ...q, question: p.questions[i]?.question || q.question, options: p.questions[i]?.options || q.options, correct_answer: p.questions[i]?.correct_answer ?? q.correct_answer })));
} catch {
setQuestions(questions.map(q => {
const opts = [...q.options]; const cor = opts[q.correct_answer];
for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
return { ...q, options: opts, correct_answer: opts.indexOf(cor) };
}));
}
setAnswers(new Array(questions.length).fill(null)); setSubm(new Array(questions.length).fill(false));
setSel(null); setCurQ(0); setScore(0); setSrcOpen(false); setScreen("quiz");
};

const resetHome = () => { setScreen("home"); setFile(null); setFErr(""); setIMode("topic"); setCiteUrls([]); setCiteFiles([]); setUrlInput(""); setCiteErr(""); setCiteOpen(false); setCustomSub(""); setSub(TOPICS[topic][0]); };

const q = questions[curQ];
const isS = subm[curQ];
const totS = subm.filter(Boolean).length;

const optStyle = i => ({
cursor: isS ? "default" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "flex-start", gap: 12,
padding: "13px 15px", borderRadius: 10,
border: `1.5px solid ${isS ? i === q.correct_answer ? "#22c55e" : i === answers[curQ] && i !== q.correct_answer ? "#ef4444" : T.bdr : sel === i ? dc.b : T.bdr}`,
background: isS ? i === q.correct_answer ? "rgba(34,197,94,0.1)" : i === answers[curQ] && i !== q.correct_answer ? "rgba(239,68,68,0.1)" : T.bg3 : sel === i ? dc.bg : T.bg3,
textAlign: "left", transition: "all 0.2s", color: T.text, width: "100%",
});

const letStyle = i => ({
width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
background: isS && i === q.correct_answer ? "#22c55e" : isS && i === answers[curQ] && i !== q.correct_answer ? "#ef4444" : T.bg,
border: `1px solid ${isS && (i === q.correct_answer || (i === answers[curQ] && i !== q.correct_answer)) ? "transparent" : T.bdr2}`,
color: isS && (i === q.correct_answer || (i === answers[curQ] && i !== q.correct_answer)) ? "#fff" : T.t2,
});

// ── Cite panel ────────────────────────────────────────────────────────────
const CitePanel = () => (
<div style={{ marginTop: 20 }}>
<button onClick={() => setCiteOpen(o => !o)} style={{
width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
padding: "10px 14px", borderRadius: citeOpen ? "9px 9px 0 0" : 9,
background: citeOpen ? T.acc : T.bg3,
border: `1px solid ${citeOpen ? T.bdr2 : T.bdr}`,
borderBottom: citeOpen ? `1px solid ${T.bdr}` : undefined,
cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
}}>
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
<span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Cite Sources</span>
<span style={{ fontSize: 11, color: T.t3 }}>(Optional)</span>
{hasCite && (
<span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: dc.bg, color: dc.c, border: `1px solid ${dc.b}` }}>
{citeUrls.length + citeFiles.length}
</span>
)}
</div>
<span style={{ fontSize: 11, color: T.t3, display: "inline-block", transition: "transform 0.25s", transform: citeOpen ? "rotate(180deg)" : "none" }}>▼</span>
</button>

  {citeOpen && (
    <div style={{ border: `1px solid ${T.bdr2}`, borderTop: "none", borderRadius: "0 0 9px 9px", padding: 16, background: T.bg2, animation: "slideDown 0.2s ease" }}>

      {/* URL row */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: T.t2, marginBottom: 8 }}>Add URL</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addCiteUrl()}
            placeholder="https://example.com/article"
            style={{ flex: 1, padding: "9px 12px", borderRadius: 7, fontSize: 13, border: `1px solid ${T.bdr2}`, background: T.bg3, color: T.text, fontFamily: "inherit" }} />
          <button onClick={addCiteUrl} style={{ padding: "9px 16px", borderRadius: 7, border: "none", background: T.text, color: T.bg, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Add</button>
        </div>
      </div>

      {/* URL list */}
      {citeUrls.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {citeUrls.map(({ id, url }) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: T.bg3, borderRadius: 6, marginBottom: 5, border: `1px solid ${T.bdr}` }}>
              <span style={{ fontSize: 13 }}>🔗</span>
              <span style={{ flex: 1, fontSize: 12, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
              <button onClick={() => setCiteUrls(p => p.filter(u => u.id !== id))} style={{ background: "none", border: "none", color: T.t3, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* File drop */}
      <div style={{ marginBottom: citeFiles.length > 0 ? 10 : 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: T.t2, marginBottom: 8 }}>Add Files</div>
        <input ref={citeFRef} type="file" accept=".pdf,.docx,.pptx,.txt" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) addCiteFile(e.target.files[0]); e.target.value = ""; }} />
        <div
          onDragOver={e => { e.preventDefault(); setCiteDrag(true); }}
          onDragLeave={() => setCiteDrag(false)}
          onDrop={e => { e.preventDefault(); setCiteDrag(false); Array.from(e.dataTransfer.files).forEach(addCiteFile); }}
          onClick={() => citeFRef.current?.click()}
          style={{ border: `1.5px dashed ${citeDrag ? T.t2 : T.bdr2}`, borderRadius: 8, padding: "14px 16px", textAlign: "center", cursor: "pointer", background: citeDrag ? T.bg3 : "transparent", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}
        >
          <span style={{ fontSize: 18 }}>📂</span>
          <span style={{ fontSize: 12, color: T.t2 }}>Drop files or click to browse</span>
          <span style={{ fontSize: 11, color: T.t3 }}>PDF, Word, PPT, TXT — 50MB each</span>
        </div>
      </div>

      {/* Cite file list */}
      {citeFiles.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {citeFiles.map(({ id, file: f }) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: T.bg3, borderRadius: 6, marginBottom: 5, border: `1px solid ${T.bdr}` }}>
              <span style={{ fontSize: 13 }}>📄</span>
              <span style={{ flex: 1, fontSize: 12, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              <button onClick={() => setCiteFiles(p => p.filter(cf => cf.id !== id))} style={{ background: "none", border: "none", color: T.t3, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {citeErr && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>{citeErr}</p>}
    </div>
  )}
</div>
);

// ─────────────────────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────────────────────
return (
<div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'DM Sans', system-ui, sans-serif", WebkitFontSmoothing: "antialiased", transition: "background 0.3s" }}>
<style>{GS}</style>

  {/* ── GATE ──────────────────────────────────────────────────────────── */}
  {screen === "gate" && (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 40, fontWeight: 300, letterSpacing: "-0.5px", marginBottom: 10 }}>QuizMind</h1>
        <p style={{ fontSize: 15, color: T.t2 }}>Enter access code to continue</p>
      </div>
      <div style={{ width: "100%", maxWidth: 380, background: T.bg2, border: `1px solid ${T.bdr}`, borderRadius: 18, padding: 32 }}>
        <input
          type="password"
          value={gateInput}
          onChange={e => { setGateInput(e.target.value); setGateErr(""); }}
          onKeyDown={e => { if (e.key === "Enter") { if (gateInput === ACCESS_CODE) setScreen("home"); else setGateErr("Incorrect code."); } }}
          placeholder="Access code"
          style={{ width: "100%", padding: "13px 14px", borderRadius: 9, fontSize: 15, border: `1px solid ${gateErr ? "#ef4444" : T.bdr2}`, background: T.bg3, color: T.text, fontFamily: "inherit", marginBottom: 12 }}
        />
        <button onClick={() => { if (gateInput === ACCESS_CODE) setScreen("home"); else setGateErr("Incorrect code."); }} style={{ width: "100%", padding: "13px 24px", background: T.text, color: T.bg, border: "none", borderRadius: 9, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Enter</button>
        {gateErr && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 10, textAlign: "center" }}>{gateErr}</p>}
      </div>
    </div>
  )}

  {/* ── HOME ──────────────────────────────────────────────────────────── */}
  {screen === "home" && (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 40, fontWeight: 300, letterSpacing: "-0.5px", marginBottom: 10 }}>QuizMind</h1>
        <p style={{ fontSize: 15, color: T.t2 }}>What will you master today?</p>
      </div>

      <div style={{ width: "100%", maxWidth: 540, background: T.bg2, border: `1px solid ${T.bdr}`, borderRadius: 18, padding: 32 }}>

        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 4, background: T.bg3, borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {[["topic","📚 Topic"],["file","📄 Upload File"]].map(([m, lbl]) => (
            <button key={m} onClick={() => setIMode(m)} style={{
              flex: 1, padding: "8px 16px", borderRadius: 7, fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer",
              border: iMode === m ? `1px solid ${T.bdr2}` : "1px solid transparent",
              background: iMode === m ? T.bg : "transparent",
              color: iMode === m ? T.text : T.t2, transition: "all 0.2s",
            }}>{lbl}</button>
          ))}
        </div>

        {/* Topic inputs */}
        {iMode === "topic" && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: T.t2, display: "block", marginBottom: 7 }}>Topic</label>
              <select value={topic} onChange={e => { setTopic(e.target.value); setSub(TOPICS[e.target.value][0]); setCustomSub(""); }} style={{ ...selSt(), width: "100%" }}>
                {Object.keys(TOPICS).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: T.t2, display: "block", marginBottom: 7 }}>Subtopic</label>
              {sub !== "Other" ? (
                <select value={sub} onChange={e => { setSub(e.target.value); setCustomSub(""); }} style={{ ...selSt(), width: "100%" }}>
                  {(TOPICS[topic] || []).map(s => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={customSub}
                    onChange={e => setCustomSub(e.target.value)}
                    placeholder="Enter your own subtopic..."
                    autoFocus
                    style={{ flex: 1, padding: "11px 13px", borderRadius: 9, fontSize: 14, border: `1px solid ${T.bdr2}`, background: T.bg3, color: T.text, fontFamily: "inherit" }}
                  />
                  <button onClick={() => { setSub(TOPICS[topic][0]); setCustomSub(""); }} style={{ padding: "11px 13px", borderRadius: 9, border: `1px solid ${T.bdr2}`, background: T.bg3, color: T.t2, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>✕</button>
                </div>
              )}
              {sub !== "Other" && (
                <button onClick={() => setSub("Other")} style={{ marginTop: 7, fontSize: 12, color: T.t2, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                  + Enter a custom subtopic
                </button>
              )}
            </div>
          </>
        )}

        {/* File input */}
        {iMode === "file" && (
          <div>
            <input ref={fRef} type="file" accept=".pdf,.docx,.pptx,.txt" style={{ display: "none" }} onChange={e => onFile(e.target.files[0])} />
            {!file ? (
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
                onClick={() => fRef.current?.click()}
                style={{ border: `1.5px dashed ${drag ? T.t2 : T.bdr2}`, borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: drag ? T.bg3 : "transparent", transition: "all 0.2s" }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                <div style={{ fontSize: 14, color: T.t2, marginBottom: 4 }}>Drop your file here</div>
                <div style={{ fontSize: 12, color: T.t3, marginBottom: 14 }}>PDF, Word, PowerPoint, or TXT — max 50MB</div>
                <button onClick={e => { e.stopPropagation(); fRef.current?.click(); }} style={{ padding: "7px 18px", background: T.bg3, border: `1px solid ${T.bdr2}`, borderRadius: 6, color: T.text, fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>Browse Files</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.bg3, borderRadius: 9, border: `1px solid ${T.bdr}` }}>
                <span style={{ fontSize: 18 }}>📄</span>
                <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                <button onClick={() => { setFile(null); setIMode("topic"); setFErr(""); }} style={{ background: "none", border: "none", color: T.t2, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
              </div>
            )}
            {fErr && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8, lineHeight: 1.55, textAlign: "center" }}>{fErr}</p>}
          </div>
        )}

        {/* Cite panel */}
        <CitePanel />

        {/* Slider */}
        <div style={{ marginTop: 24 }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: T.t2, display: "block", marginBottom: 6 }}>Questions</label>
          <div style={{ textAlign: "center", fontSize: 26, fontWeight: 500, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{qCnt}</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.t3, marginBottom: 5 }}><span>Min.</span><span>Max.</span></div>
          <input type="range" min={10} max={50} value={qCnt} onChange={e => setQCnt(Number(e.target.value))} style={{ background: T.bdr2, accentColor: T.text }} />
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <select value={diff} onChange={e => setDiff(e.target.value)} style={{ ...selSt({ flex: 1 }) }}>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
          <button onClick={begin} style={{ flex: 2, padding: "13px 24px", background: T.text, color: T.bg, border: "none", borderRadius: 9, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Let's Begin →</button>
        </div>
      </div>
    </div>
  )}

  {/* ── LOADING ───────────────────────────────────────────────────────── */}
  {screen === "loading" && (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
      <div style={{ position: "relative", width: 56, height: 56 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: T.text, animation: "spin 0.9s linear infinite" }} />
        <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "2px solid transparent", borderTopColor: T.t2, animation: "rspin 1.3s linear infinite" }} />
      </div>
      <p style={{ fontSize: 15, color: T.t2, animation: "blink 1.6s ease-in-out infinite" }}>{status}</p>
    </div>
  )}

  {/* ── CAPACITY ──────────────────────────────────────────────────────── */}
  {screen === "capacity" && (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 480, background: T.bg2, border: `1px solid ${T.bdr}`, borderRadius: 18, padding: 36, textAlign: "center" }}>
        <p style={{ fontSize: 16, lineHeight: 1.75, marginBottom: 10 }}>
          This file only has enough content for up to <strong>{capMax}</strong> questions.
        </p>
        <p style={{ fontSize: 13, color: T.t2, lineHeight: 1.65, marginBottom: 28 }}>
          You can decrease the number of questions, or go back and add a source in the Cite section to supplement your file.
        </p>
        <div style={{ textAlign: "center", fontSize: 26, fontWeight: 500, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>{capCnt}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.t3, marginBottom: 5 }}><span>Min.</span><span>Max.</span></div>
        <input type="range" min={10} max={capMax} value={capCnt} onChange={e => setCapCnt(Number(e.target.value))}
          style={{ background: T.bdr2, accentColor: capCnt === capMax ? "#ef4444" : T.text, boxShadow: capCnt === capMax ? "0 0 8px rgba(239,68,68,0.3)" : "none", borderRadius: 2, transition: "box-shadow 0.2s" }} />
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={() => setScreen("home")} style={{ flex: 1, padding: 13, borderRadius: 9, background: "transparent", border: `1.5px solid ${T.bdr2}`, color: T.text, fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>← Go Back</button>
          <button onClick={confirmCap} style={{ flex: 2, padding: 13, background: T.text, color: T.bg, border: "none", borderRadius: 9, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Continue</button>
        </div>
      </div>
    </div>
  )}

  {/* ── CANNOT GENERATE ───────────────────────────────────────────────── */}
  {screen === "cannotGenerate" && (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 480, background: T.bg2, border: `1px solid ${T.bdr}`, borderRadius: 18, padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 20 }}>⚠️</div>
        <p style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 12 }}>
          Questions cannot be generated based on the topic or sub-topic.
        </p>
        <p style={{ fontSize: 13, color: T.t2, lineHeight: 1.7, marginBottom: 32 }}>
          I can pull information from other sources. Would you like to continue?
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setScreen("home")} style={{ flex: 1, padding: 13, borderRadius: 10, background: "transparent", border: `1.5px solid ${T.bdr2}`, color: T.text, fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>← Go Back</button>
          <button onClick={continueWithoutCite} style={{ flex: 1, padding: 13, borderRadius: 10, background: T.text, border: "none", color: T.bg, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Continue</button>
        </div>
      </div>
    </div>
  )}

  {/* ── QUIZ ──────────────────────────────────────────────────────────── */}
  {screen === "quiz" && q && (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${T.bdr}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: T.t2 }}>{fLabel}</span>
          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, background: dc.bg, color: dc.c, border: `1px solid ${dc.b}` }}>{diff}</span>
        </div>
        <span style={{ fontSize: 13, color: T.t2 }}>Score: <strong style={{ color: T.text }}>{score}</strong> / {questions.length}</span>
      </div>

      <div className="qgrid" style={{ display: "grid", gridTemplateColumns: "1fr 185px", gap: 18, maxWidth: 840, margin: "0 auto", padding: 22 }}>
        <div style={{ background: T.bg2, border: `1px solid ${T.bdr}`, borderRadius: 16, padding: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: T.t2, marginBottom: 14 }}>Question {curQ + 1} of {questions.length}</div>
          <p style={{ fontSize: 17, lineHeight: 1.65, marginBottom: 22 }}>{q.question}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => !isS && setSel(i)} style={optStyle(i)}>
                <span style={letStyle(i)}>{["A","B","C","D"][i]}</span>
                <span style={{ fontSize: 14, lineHeight: 1.55 }}>{opt}</span>
              </button>
            ))}
          </div>

          {isS && (
            <div style={{ padding: "14px 16px", background: T.bg3, borderLeft: `3px solid ${answers[curQ] === q.correct_answer ? "#22c55e" : "#ef4444"}`, borderRadius: "0 8px 8px 0", marginBottom: 20, animation: "fadeUp 0.3s ease" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: answers[curQ] === q.correct_answer ? "#22c55e" : "#ef4444", marginBottom: 6 }}>{answers[curQ] === q.correct_answer ? "✓ Correct" : "✗ Incorrect"}</p>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 5 }}>{q.explanation}</p>
              <p style={{ fontSize: 12, color: T.t2 }}>Source: {q.source}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => goTo(curQ - 1)} disabled={curQ === 0} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${T.bdr2}`, background: T.bg3, color: T.text, fontFamily: "inherit", fontSize: 13, cursor: curQ === 0 ? "default" : "pointer", opacity: curQ === 0 ? 0.3 : 1, transition: "opacity 0.2s" }}>← Prev</button>
            {!isS ? (
              <button onClick={submitAns} disabled={sel === null} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", background: sel === null ? T.bg3 : T.text, color: sel === null ? T.t3 : T.bg, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: sel === null ? "default" : "pointer", transition: "all 0.2s" }}>Submit Answer</button>
            ) : (
              <div style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: `1px solid ${T.bdr}`, color: T.t2, fontFamily: "inherit", fontSize: 13, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>✓ Submitted</div>
            )}
            {curQ < questions.length - 1 ? (
              <button onClick={() => goTo(curQ + 1)} style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${T.bdr2}`, background: T.bg3, color: T.text, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>Next →</button>
            ) : (
              <button onClick={() => setScreen("results")} disabled={totS < questions.length} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: totS < questions.length ? T.bg3 : dc.c, color: totS < questions.length ? T.t3 : "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: totS < questions.length ? "default" : "pointer", transition: "all 0.2s" }}>Finish</button>
            )}
          </div>
        </div>

        <div className="qsidebar" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: T.bg2, border: `1px solid ${T.bdr}`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: T.t3, marginBottom: 11 }}>Progress</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5 }}>
              {questions.map((_, i) => {
                let bg = T.bg3, bdr = T.bdr, clr = T.t3;
                if (i === curQ) { bdr = T.text; clr = T.text; }
                else if (subm[i]) {
                  if (answers[i] === questions[i].correct_answer) { bg = "#22c55e"; bdr = "#22c55e"; clr = "#fff"; }
                  else { bg = "#ef4444"; bdr = "#ef4444"; clr = "#fff"; }
                } else if (answers[i] !== null) { bdr = T.t2; clr = T.t2; }
                return <button key={i} onClick={() => goTo(i)} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer", background: bg, border: `1.5px solid ${bdr}`, color: clr, fontFamily: "inherit", transition: "all 0.15s" }}>{i + 1}</button>;
              })}
            </div>
          </div>
        </div>
      </div>

      {sources.length > 0 && (
        <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 100 }}>
          {srcOpen && (
            <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, background: T.bg2, border: `1px solid ${T.bdr2}`, borderRadius: 12, padding: "14px 16px", minWidth: 210, animation: "srcIn 0.25s ease", transformOrigin: "bottom left" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: T.t3, marginBottom: 10 }}>Sources</div>
              {sources.map((s, i) => <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: i < sources.length - 1 ? `1px solid ${T.bdr}` : "none" }}>{s}</div>)}
            </div>
          )}
          <button onClick={() => setSrcOpen(!srcOpen)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: T.bg2, border: `1px solid ${T.bdr2}`, borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: T.t2, transition: "all 0.2s" }}>
            Sources <span style={{ fontSize: 9, display: "inline-block", transition: "transform 0.3s", transform: srcOpen ? "rotate(180deg)" : "none" }}>▲</span>
          </button>
        </div>
      )}
    </div>
  )}

  {/* ── RESULTS ───────────────────────────────────────────────────────── */}
  {screen === "results" && (() => {
    const pct = Math.round((score / questions.length) * 100);
    const msg = pct >= 90 ? "Outstanding — you've mastered this." : pct >= 75 ? "Great work. Keep pushing." : pct >= 60 ? "Solid effort. Review the gaps." : "Keep studying — progress takes time.";
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 500, background: T.bg2, border: `1px solid ${T.bdr}`, borderRadius: 20, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 80, fontWeight: 300, lineHeight: 1, marginBottom: 8 }}>{score}</div>
          <div style={{ fontSize: 18, color: T.t2, marginBottom: 10 }}>{pct}% — {questions.length} questions</div>
          <p style={{ fontSize: 14, color: T.t2, lineHeight: 1.65, marginBottom: 32 }}>{msg}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 32 }}>
            {[["Correct", score, "#22c55e"], ["Incorrect", questions.length - score, "#ef4444"], ["Accuracy", `${pct}%`, T.text]].map(([lbl, val, clr]) => (
              <div key={lbl} style={{ background: T.bg3, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", color: T.t3, marginBottom: 6 }}>{lbl}</div>
                <div style={{ fontSize: 24, fontWeight: 500, color: clr }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={resetHome} style={{ flex: 1, padding: 13, borderRadius: 10, background: "transparent", border: `1.5px solid ${T.bdr2}`, color: T.text, fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>New Quiz</button>
            <button onClick={doRetake} style={{ flex: 1, padding: 13, borderRadius: 10, background: T.text, border: "none", color: T.bg, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Retake →</button>
          </div>
        </div>
      </div>
    );
  })()}

  <button onClick={() => setDark(d => !d)} style={{ position: "fixed", bottom: 24, right: 24, width: 42, height: 42, borderRadius: "50%", background: T.bg3, border: `1px solid ${T.bdr2}`, cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, transition: "all 0.2s" }}>
    {dark ? "☀️" : "🌙"}
  </button>
</div>
);
}
