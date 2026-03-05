import { useState, useEffect, useRef } from "react";

const STEPS = ["connect", "drive", "enhance", "generate", "export"];
const STEP_LABELS = {
  connect: "API Setup",
  drive: "Google Drive",
  enhance: "Nano Banana",
  generate: "Kling 3.0",
  export: "Export",
};

const mockImages = [
  { id: 1, name: "living_room_01.jpg", size: "4.2 MB", status: "idle" },
  { id: 2, name: "kitchen_modern.jpg", size: "3.8 MB", status: "idle" },
  { id: 3, name: "master_bedroom.jpg", size: "5.1 MB", status: "idle" },
  { id: 4, name: "exterior_facade.jpg", size: "6.3 MB", status: "idle" },
  { id: 5, name: "backyard_pool.jpg", size: "4.7 MB", status: "idle" },
];

const MOTION_OPTIONS = [
  { id: "slow-push", label: "Slow Push-In", desc: "Elegant forward dolly — draws viewer in", icon: "→" },
  { id: "orbit", label: "360° Orbit", desc: "Circular sweep around the subject", icon: "↻" },
  { id: "pan", label: "Smooth Pan", desc: "Lateral scan revealing the full space", icon: "⇔" },
  { id: "crane", label: "Crane Shot", desc: "Rising vertical reveal, premium feel", icon: "↑" },
  { id: "dolly", label: "Dolly Zoom", desc: "Vertigo zoom for dramatic impact", icon: "◎" },
];

const STYLE_OPTIONS = ["cinematic", "luxury", "warm-golden", "twilight", "airy"];

function AnimatedBg() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, overflow: "hidden",
      background: "linear-gradient(135deg, #070a0e 0%, #0c1018 50%, #080e0b 100%)"
    }}>
      {[...Array(7)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", borderRadius: "50%",
          background: i % 3 === 0
            ? "radial-gradient(circle, rgba(180,142,60,0.07) 0%, transparent 70%)"
            : i % 3 === 1
            ? "radial-gradient(circle, rgba(40,110,75,0.05) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(60,100,180,0.03) 0%, transparent 70%)",
          width: `${280 + i * 110}px`, height: `${280 + i * 110}px`,
          top: `${[8,55,85,15,65,35,45][i]}%`, left: `${[5,72,28,88,12,58,40][i]}%`,
          transform: "translate(-50%,-50%)",
          animation: `orb ${5+i}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.6}s`
        }} />
      ))}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(180,142,60,0.035) 1px, transparent 0)",
        backgroundSize: "44px 44px"
      }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes orb { from{opacity:.35;transform:translate(-50%,-50%)scale(.93)} to{opacity:1;transform:translate(-50%,-50%)scale(1.07)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes glow { 0%,100%{box-shadow:0 0 8px rgba(180,142,60,.25)} 50%{box-shadow:0 0 22px rgba(180,142,60,.55)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,.03); }
        ::-webkit-scrollbar-thumb { background: rgba(180,142,60,.25); border-radius: 2px; }
      `}</style>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    idle:       { c: "rgba(255,255,255,.28)",  bg: "rgba(255,255,255,.05)",  l: "Pending" },
    processing: { c: "#e8c96d",               bg: "rgba(232,201,109,.1)",   l: "Processing", blink: true },
    enhanced:   { c: "#6bde8f",               bg: "rgba(107,222,143,.1)",   l: "Enhanced" },
    ready:      { c: "#6bcbde",               bg: "rgba(107,203,222,.1)",   l: "Ready" },
    error:      { c: "#e06060",               bg: "rgba(224,96,96,.1)",     l: "Error" },
  };
  const s = map[status] || map.idle;
  return (
    <span style={{
      fontSize:10, letterSpacing:1.5, textTransform:"uppercase", padding:"3px 10px",
      borderRadius:20, background:s.bg, color:s.c, fontFamily:"'DM Mono',monospace",
      animation: s.blink ? "blink 1.5s infinite" : "none"
    }}>{s.l}</span>
  );
}

function Card({ children, style={}, glow=false }) {
  return (
    <div style={{
      background: "rgba(255,255,255,.028)",
      border: `1px solid ${glow ? "rgba(180,142,60,.35)" : "rgba(180,142,60,.12)"}`,
      borderRadius: 14, padding: "24px 28px",
      backdropFilter: "blur(16px)",
      animation: "fadeUp .4s ease both",
      boxShadow: glow ? "0 0 30px rgba(180,142,60,.08)" : "none",
      ...style
    }}>{children}</div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize:10, letterSpacing:2.2, textTransform:"uppercase", color:"rgba(180,142,60,.65)", fontFamily:"'DM Mono',monospace", marginBottom:14 }}>{children}</div>;
}

function FieldInput({ label, placeholder, value, onChange, type="text", hint }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"rgba(180,142,60,.6)", fontFamily:"'DM Mono',monospace" }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(180,142,60,.18)", borderRadius:8,
          padding:"11px 15px", color:"#e8e0d0", fontSize:13, fontFamily:"'DM Mono',monospace",
          outline:"none", width:"100%", transition:"border-color .2s" }}
        onFocus={e=>e.target.style.borderColor="rgba(180,142,60,.55)"}
        onBlur={e=>e.target.style.borderColor="rgba(180,142,60,.18)"}
      />
      {hint && <span style={{ fontSize:11, color:"rgba(255,255,255,.28)", fontFamily:"sans-serif" }}>{hint}</span>}
    </div>
  );
}

function ActionBtn({ children, onClick, variant="primary", disabled, full, style={} }) {
  const base = {
    padding:"11px 26px", borderRadius:8, border:"none", cursor:disabled?"not-allowed":"pointer",
    fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:2, textTransform:"uppercase",
    fontWeight:600, transition:"all .2s", opacity:disabled?.4:1, width:full?"100%":"auto", ...style
  };
  if (variant==="primary") return <button onClick={disabled?undefined:onClick}
    style={{ ...base, background:"linear-gradient(135deg,#b48e3c,#e8c96d)", color:"#070a0e", boxShadow:"0 4px 18px rgba(180,142,60,.28)" }}
    onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.boxShadow="0 6px 28px rgba(180,142,60,.5)" }}
    onMouseLeave={e=>e.currentTarget.style.boxShadow="0 4px 18px rgba(180,142,60,.28)"}
  >{children}</button>;
  return <button onClick={disabled?undefined:onClick}
    style={{ ...base, background:"transparent", border:"1px solid rgba(180,142,60,.28)", color:"#b48e3c" }}
    onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.borderColor="rgba(180,142,60,.65)" }}
    onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(180,142,60,.28)"}
  >{children}</button>;
}

function StepBar({ current }) {
  const idx = STEPS.indexOf(current);
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:38 }}>
      {STEPS.map((s, i) => {
        const done = i < idx, active = i === idx;
        return (
          <div key={s} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length-1 ? 1 : 0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
              <div style={{
                width:34, height:34, borderRadius:"50%",
                background: done ? "linear-gradient(135deg,#b48e3c,#e8c96d)" : "transparent",
                border: active ? "2px solid #b48e3c" : done ? "none" : "2px solid rgba(180,142,60,.18)",
                display:"flex", alignItems:"center", justifyContent:"center",
                animation: active ? "glow 2s infinite" : "none", transition:"all .35s"
              }}>
                {done
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#070a0e" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ color:active?"#b48e3c":"rgba(180,142,60,.25)", fontSize:12, fontFamily:"monospace", fontWeight:700 }}>{String(i+1).padStart(2,"0")}</span>
                }
              </div>
              <span style={{ fontSize:9, letterSpacing:1.8, textTransform:"uppercase", whiteSpace:"nowrap",
                color:active?"#b48e3c":done?"rgba(107,182,107,.7)":"rgba(255,255,255,.22)",
                fontFamily:"'DM Mono',monospace" }}>{STEP_LABELS[s]}</span>
            </div>
            {i < STEPS.length-1 && <div style={{
              flex:1, height:1, margin:"0 8px", marginBottom:22,
              background: done ? "linear-gradient(90deg,#b48e3c,rgba(107,182,107,.5))" : "rgba(180,142,60,.08)"
            }}/>}
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState("connect");
  const [higgsKey, setHiggsKey] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [images, setImages] = useState(mockImages);
  const [videos, setVideos] = useState([]);
  const [motion, setMotion] = useState("slow-push");
  const [styleMode, setStyleMode] = useState("cinematic");
  const [log, setLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [driveLoaded, setDriveLoaded] = useState(false);
  const logRef = useRef(null);

  const addLog = (msg, type="info") => {
    const time = new Date().toLocaleTimeString("en-US",{hour12:false});
    setLog(prev => [...prev.slice(-60), { time, msg, type }]);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const handleConnect = () => {
    if (!higgsKey) return;
    addLog("Authenticating with Higgsfield...", "info");
    setTimeout(() => addLog("✓ Higgsfield account connected", "success"), 700);
    setTimeout(() => addLog("↳ Nano Banana — model loaded ✓", "success"), 1200);
    setTimeout(() => addLog("↳ Kling 3.0 — model loaded ✓", "success"), 1700);
    setTimeout(() => { addLog("✓ Both models ready inside Higgsfield pipeline", "success"); setConnected(true); }, 2100);
    setTimeout(() => setStep("drive"), 2600);
  };

  const handleDriveLoad = () => {
    if (!driveLink) return;
    const valid = driveLink.includes("drive.google.com");
    addLog("Reading shared Drive link...", "info");
    if (!valid) { addLog("⚠ Not a valid Google Drive URL — check the link", "error"); return; }
    setTimeout(() => {
      addLog("✓ Shared folder accessed — no sign-in required", "success");
      ["living_room_01.jpg","kitchen_modern.jpg","master_bedroom.jpg","exterior_facade.jpg","backyard_pool.jpg"]
        .forEach((f,i) => setTimeout(() => addLog(`→ Staged: ${f}`, "file"), i*180));
      setDriveLoaded(true);
    }, 1200);
  };

  const handleEnhance = () => {
    setIsRunning(true);
    addLog("▶ Nano Banana starting on Higgsfield...", "info");
    addLog("  Preset: Real Estate HDR · 4× Upscale · Auto Color", "info");
    images.forEach((img, i) => {
      setTimeout(() => {
        setImages(p => p.map(im => im.id===img.id ? {...im, status:"processing"} : im));
        addLog(`Processing ${img.name}`, "info");
      }, i*1100);
      setTimeout(() => {
        setImages(p => p.map(im => im.id===img.id ? {...im, status:"enhanced"} : im));
        addLog(`✓ ${img.name} — HDR recovered, sharpness +44%`, "success");
      }, i*1100+950);
    });
    setTimeout(() => {
      addLog("✓ Nano Banana complete — all photos enhanced", "success");
      setIsRunning(false);
    }, images.length*1100+1100);
  };

  const handleGenerate = () => {
    setIsRunning(true);
    const motionLabel = MOTION_OPTIONS.find(m=>m.id===motion)?.label || motion;
    addLog("▶ Sending to Kling 3.0 via Higgsfield...", "info");
    addLog(`  Motion: ${motionLabel} · Style: ${styleMode}`, "info");
    const targets = images.filter(i => i.status==="enhanced");
    targets.forEach((img, i) => {
      setTimeout(() => addLog(`Rendering ${img.name.replace(".jpg","")} → Kling 3.0`, "info"), i*2200);
      setTimeout(() => {
        const name = img.name.replace(".jpg",`_${motion}.mp4`);
        setVideos(p => [...p, { id:img.id, name, duration:"8s", style:motionLabel, status:"ready" }]);
        addLog(`✓ Video ready: ${name}`, "success");
      }, i*2200+2000);
    });
    setTimeout(() => {
      addLog("✓ All cinematic videos generated — pipeline complete", "success");
      setIsRunning(false);
      setStep("export");
    }, targets.length*2200+2200);
  };

  const handleReset = () => {
    setStep("connect"); setHiggsKey(""); setDriveLink("");
    setImages(mockImages); setVideos([]); setLog([]);
    setConnected(false); setDriveLoaded(false); setIsRunning(false);
  };

  const panels = {

    connect: (
      <div style={{ display:"flex", flexDirection:"column", gap:22, animation:"fadeUp .4s ease" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:30, fontWeight:400, margin:"0 0 6px", color:"#e8e0d0" }}>
            Connect Higgsfield
          </h2>
          <p style={{ color:"rgba(255,255,255,.38)", fontSize:13, margin:0, fontFamily:"sans-serif", lineHeight:1.65 }}>
            Everything runs through <strong style={{color:"rgba(180,142,60,.8)"}}>one Higgsfield account</strong>. Both Nano Banana and Kling 3.0 are models inside Higgsfield — no separate API keys needed.
          </p>
        </div>

        <Card glow>
          <SectionLabel>Models inside your Higgsfield workspace</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              {
                icon:"🍌", name:"Nano Banana", tag:"Step 1 · Enhancement",
                desc:"Real estate photo enhancer — 4× AI upscale, HDR recovery, auto white balance, and noise removal. Runs first on every image before video generation.",
                accent:"rgba(232,201,109,.15)", border:"rgba(232,201,109,.22)"
              },
              {
                icon:"🎬", name:"Kling 3.0", tag:"Step 2 · Video Generation",
                desc:"Cinematic video model — transforms Nano Banana–enhanced photos into smooth, professional camera movement: push-ins, orbits, crane shots, and more. Used for consistent real estate video.",
                accent:"rgba(107,203,222,.08)", border:"rgba(107,203,222,.2)"
              },
            ].map(m => (
              <div key={m.name} style={{ background:m.accent, border:`1px solid ${m.border}`, borderRadius:10, padding:"16px 18px", display:"flex", gap:14 }}>
                <span style={{ fontSize:24, flexShrink:0, marginTop:2 }}>{m.icon}</span>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <span style={{ fontSize:14, color:"#e8e0d0", fontFamily:"'DM Mono',monospace", fontWeight:500 }}>{m.name}</span>
                    <span style={{ fontSize:9, color:"rgba(255,255,255,.35)", background:"rgba(255,255,255,.07)", padding:"2px 8px", borderRadius:10, letterSpacing:1, textTransform:"uppercase" }}>{m.tag}</span>
                  </div>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,.45)", fontFamily:"sans-serif", margin:0, lineHeight:1.65 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionLabel>Higgsfield Credentials</SectionLabel>
          <FieldInput
            label="API Key"
            placeholder="hf_live_xxxxxxxxxxxxxxxxxxxx"
            value={higgsKey}
            onChange={setHiggsKey}
            type="password"
            hint="Higgsfield Dashboard → Settings → API Keys — make sure Nano Banana & Kling 3.0 are enabled"
          />
          <div style={{ marginTop:16, display:"flex", justifyContent:"flex-end" }}>
            <ActionBtn onClick={handleConnect} disabled={!higgsKey}>Connect Higgsfield →</ActionBtn>
          </div>
        </Card>
      </div>
    ),

    drive: (
      <div style={{ display:"flex", flexDirection:"column", gap:22, animation:"fadeUp .4s ease" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:30, fontWeight:400, margin:"0 0 6px", color:"#e8e0d0" }}>
            Google Drive Source
          </h2>
          <p style={{ color:"rgba(255,255,255,.38)", fontSize:13, margin:0, fontFamily:"sans-serif" }}>
            Paste a shared Google Drive link — works with both <strong style={{color:"rgba(180,142,60,.7)"}}>folder links</strong> and <strong style={{color:"rgba(180,142,60,.7)"}}>individual file links</strong>. No sign-in required.
          </p>
        </div>
        <Card>
          <div style={{ background:"rgba(180,142,60,.07)", border:"1px solid rgba(180,142,60,.18)", borderRadius:10, padding:"14px 18px", marginBottom:18 }}>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.5)", fontFamily:"sans-serif", lineHeight:1.85 }}>
              <strong style={{color:"rgba(180,142,60,.85)"}}>📋 How to get your shared link</strong><br/>
              1. Open Google Drive → right-click your <strong>folder</strong> or <strong>image file</strong><br/>
              2. Click <em>Share</em> → under "General access" select <strong>"Anyone with the link"</strong><br/>
              3. Set permission to <strong>Viewer</strong> → click <em>Copy link</em><br/>
              4. Paste below — both <code style={{color:"rgba(107,203,222,.7)"}}>drive/folders/...</code> and <code style={{color:"rgba(107,203,222,.7)"}}>file/d/...</code> links work ✓
            </div>
          </div>
          <FieldInput
            label="Shared Google Drive Link"
            placeholder="https://drive.google.com/drive/folders/1xABC... or /file/d/..."
            value={driveLink}
            onChange={setDriveLink}
            hint="Tip: folder links load all images at once · individual file links work for single photos"
          />
          <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:14 }}>
            <ActionBtn onClick={handleDriveLoad} disabled={!driveLink}>Load Images →</ActionBtn>
            {driveLoaded && (
              <span style={{ fontSize:12, color:"#6bde8f", fontFamily:"'DM Mono',monospace", display:"flex", alignItems:"center", gap:6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {images.length} images staged
              </span>
            )}
          </div>
        </Card>

        {driveLoaded && (
          <Card>
            <SectionLabel>Staged for Pipeline</SectionLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {images.map(img => (
                <div key={img.id} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"10px 14px", background:"rgba(255,255,255,.02)", borderRadius:8,
                  border:"1px solid rgba(255,255,255,.05)", animation:"slideIn .3s ease both"
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:16 }}>🏠</span>
                    <div>
                      <div style={{ fontSize:12, color:"#e8e0d0", fontFamily:"'DM Mono',monospace" }}>{img.name}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,.28)", fontFamily:"sans-serif" }}>{img.size}</div>
                    </div>
                  </div>
                  <Badge status={img.status}/>
                </div>
              ))}
            </div>
            <div style={{ marginTop:18, display:"flex", justifyContent:"flex-end" }}>
              <ActionBtn onClick={() => setStep("enhance")}>Start Nano Banana →</ActionBtn>
            </div>
          </Card>
        )}
      </div>
    ),

    enhance: (
      <div style={{ display:"flex", flexDirection:"column", gap:22, animation:"fadeUp .4s ease" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:30, fontWeight:400, margin:"0 0 6px", color:"#e8e0d0" }}>
            Nano Banana — Enhancement
          </h2>
          <p style={{ color:"rgba(255,255,255,.38)", fontSize:13, margin:0, fontFamily:"sans-serif", lineHeight:1.65 }}>
            Higgsfield runs <strong style={{color:"rgba(232,201,109,.8)"}}>Nano Banana</strong> on every photo first — upscaling, HDR recovery, and color correction — so Kling 3.0 generates the best possible cinematic video.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card>
            <SectionLabel>Enhancement Config</SectionLabel>
            {[
              ["Platform", "Higgsfield",                   "🔗"],
              ["Model",    "Nano Banana",                  "🍌"],
              ["Preset",   "Real Estate HDR Pro",          "🏡"],
              ["Upscale",  "4× AI Super Resolution",      "🔍"],
              ["Color",    "Auto WB + Vibrancy",           "🎨"],
              ["Noise",    "Deep Denoise Pass",            "✨"],
              ["Output",   "PNG 16-bit lossless → Kling",  "💾"],
            ].map(([k,v,icon]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,.38)", fontFamily:"sans-serif" }}>{icon} {k}</span>
                <span style={{ fontSize:11, color:"#b48e3c", fontFamily:"'DM Mono',monospace" }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:18 }}>
              <ActionBtn onClick={handleEnhance} disabled={isRunning} full>
                {isRunning ? "Enhancing..." : "▶ Run Nano Banana"}
              </ActionBtn>
            </div>
          </Card>

          <Card>
            <SectionLabel>Image Queue</SectionLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {images.map(img => (
                <div key={img.id} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"10px 12px", borderRadius:8, background:"rgba(255,255,255,.02)",
                  border:`1px solid ${
                    img.status==="enhanced" ? "rgba(107,222,143,.15)"
                    : img.status==="processing" ? "rgba(232,201,109,.15)"
                    : "rgba(255,255,255,.04)"}`
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    {img.status==="processing"
                      ? <div style={{ width:14,height:14,border:"2px solid #b48e3c",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite" }}/>
                      : img.status==="enhanced"
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6bde8f" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      : <div style={{ width:14,height:14,border:"1px solid rgba(180,142,60,.25)",borderRadius:"50%" }}/>
                    }
                    <span style={{ fontSize:12, color:"rgba(255,255,255,.6)", fontFamily:"'DM Mono',monospace" }}>{img.name}</span>
                  </div>
                  <Badge status={img.status}/>
                </div>
              ))}
            </div>
            {images.every(i=>i.status==="enhanced") && (
              <div style={{ marginTop:16, display:"flex", justifyContent:"flex-end" }}>
                <ActionBtn onClick={() => setStep("generate")}>To Kling 3.0 →</ActionBtn>
              </div>
            )}
          </Card>
        </div>
      </div>
    ),

    generate: (
      <div style={{ display:"flex", flexDirection:"column", gap:22, animation:"fadeUp .4s ease" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:30, fontWeight:400, margin:"0 0 6px", color:"#e8e0d0" }}>
            Kling 3.0 — Cinematic Video
          </h2>
          <p style={{ color:"rgba(255,255,255,.38)", fontSize:13, margin:0, fontFamily:"sans-serif", lineHeight:1.65 }}>
            Higgsfield routes your Nano Banana–enhanced photos into <strong style={{color:"rgba(107,203,222,.8)"}}>Kling 3.0</strong> — generating consistent, smooth cinematic camera movement that brings each real estate photo to life.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Card>
              <SectionLabel>Camera Motion</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {MOTION_OPTIONS.map(m => (
                  <div key={m.id} onClick={()=>setMotion(m.id)} style={{
                    padding:"11px 14px", borderRadius:8, cursor:"pointer", transition:"all .2s",
                    background: motion===m.id ? "rgba(107,203,222,.08)" : "rgba(255,255,255,.02)",
                    border: `1px solid ${motion===m.id ? "rgba(107,203,222,.35)" : "rgba(255,255,255,.05)"}`
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:13, color:motion===m.id?"#6bcbde":"#e8e0d0", fontFamily:"'DM Mono',monospace" }}>
                        {m.icon} {m.label}
                      </span>
                      {motion===m.id && <div style={{ width:6,height:6,borderRadius:"50%",background:"#6bcbde" }}/>}
                    </div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", fontFamily:"sans-serif", marginTop:3 }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <SectionLabel>Visual Style</SectionLabel>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {STYLE_OPTIONS.map(s => (
                  <div key={s} onClick={()=>setStyleMode(s)} style={{
                    padding:"7px 14px", borderRadius:20, cursor:"pointer", fontSize:10,
                    letterSpacing:1.5, textTransform:"uppercase", fontFamily:"'DM Mono',monospace", transition:"all .2s",
                    background: styleMode===s ? "rgba(180,142,60,.15)" : "rgba(255,255,255,.03)",
                    border: `1px solid ${styleMode===s ? "rgba(180,142,60,.5)" : "rgba(255,255,255,.07)"}`,
                    color: styleMode===s ? "#e8c96d" : "rgba(255,255,255,.38)"
                  }}>{s}</div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <SectionLabel>Render Queue</SectionLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:16, minHeight:180 }}>
              {images.filter(i=>i.status==="enhanced").map(img => {
                const vid = videos.find(v=>v.id===img.id);
                return (
                  <div key={img.id} style={{
                    padding:"11px 13px", borderRadius:8,
                    background: vid ? "rgba(107,203,222,.06)" : "rgba(255,255,255,.02)",
                    border: `1px solid ${vid ? "rgba(107,203,222,.2)" : "rgba(255,255,255,.05)"}`
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: vid?4:0 }}>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,.6)", fontFamily:"'DM Mono',monospace" }}>
                        {img.name.replace(".jpg","")}
                      </span>
                      <Badge status={vid?"ready":"idle"}/>
                    </div>
                    {vid && (
                      <div style={{ display:"flex", gap:10 }}>
                        <span style={{ fontSize:10, color:"rgba(255,255,255,.28)" }}>⏱ {vid.duration}</span>
                        <span style={{ fontSize:10, color:"rgba(107,203,222,.55)" }}>🎬 {vid.style}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {videos.length===0 && !isRunning && (
                <div style={{ color:"rgba(255,255,255,.15)", fontSize:12, fontFamily:"'DM Mono',monospace", textAlign:"center", paddingTop:40 }}>
                  Choose motion + style, then generate
                </div>
              )}
            </div>
            <ActionBtn onClick={handleGenerate} disabled={isRunning} full>
              {isRunning ? "Kling 3.0 rendering..." : "▶ Generate Cinematic Videos"}
            </ActionBtn>
            <div style={{ marginTop:9, fontSize:10, color:"rgba(255,255,255,.22)", fontFamily:"sans-serif", textAlign:"center" }}>
              Nano Banana enhanced → Kling 3.0 via Higgsfield
            </div>
          </Card>
        </div>
      </div>
    ),

    export: (
      <div style={{ display:"flex", flexDirection:"column", gap:22, animation:"fadeUp .4s ease" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:30, fontWeight:400, margin:"0 0 6px", color:"#e8e0d0" }}>
            Export Your Videos
          </h2>
          <p style={{ color:"rgba(255,255,255,.38)", fontSize:13, margin:0, fontFamily:"sans-serif" }}>
            Cinematic real estate clips are ready. Download individually or send them all back to Google Drive.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
          {videos.filter(v=>v.status==="ready").map(vid => (
            <Card key={vid.id} style={{ padding:"18px 22px" }}>
              <div style={{ background:"rgba(255,255,255,.02)", borderRadius:8, height:88, display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,.04)", marginBottom:14, fontSize:28 }}>
                🎬
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:12, color:"#e8e0d0", fontFamily:"'DM Mono',monospace", marginBottom:5 }}>{vid.name}</div>
                <div style={{ display:"flex", gap:10 }}>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,.28)" }}>⏱ {vid.duration}</span>
                  <span style={{ fontSize:10, color:"rgba(107,203,222,.55)" }}>🎬 {vid.style}</span>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,.28)" }}>📐 1080p</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <ActionBtn style={{ flex:1, padding:"9px 10px" }} onClick={()=>addLog(`⬇ Downloading ${vid.name}...`,"success")}>Download</ActionBtn>
                <ActionBtn variant="ghost" style={{ flex:1, padding:"9px 10px" }} onClick={()=>addLog(`→ Sending ${vid.name} to Drive...`,"info")}>→ Drive</ActionBtn>
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <SectionLabel>Pipeline Summary</SectionLabel>
          <div style={{ display:"flex" }}>
            {[
              { v: images.length,                                        l:"Photos" },
              { v: images.filter(i=>i.status==="enhanced").length,       l:"Enhanced" },
              { v: videos.filter(v=>v.status==="ready").length,          l:"Videos" },
              { v: "Nano Banana",                                        l:"Enhancer" },
              { v: "Kling 3.0",                                          l:"Video Model" },
            ].map((s,i) => (
              <div key={s.l} style={{ flex:1, padding:"0 18px", borderRight:i<4?"1px solid rgba(255,255,255,.06)":"none" }}>
                <div style={{ fontSize:20, color:"#e8c96d", fontFamily:"'Cormorant Garamond',Georgia,serif", marginBottom:4 }}>{s.v}</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,.28)", letterSpacing:1.5, textTransform:"uppercase", fontFamily:"sans-serif" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <ActionBtn variant="ghost" onClick={handleReset}>↺ New Project</ActionBtn>
          <ActionBtn onClick={()=>addLog("Exporting all videos to Google Drive...","success")}>Export All to Drive</ActionBtn>
        </div>
      </div>
    ),
  };

  return (
    <div style={{ minHeight:"100vh", position:"relative", color:"#e8e0d0" }}>
      <AnimatedBg/>
      <div style={{ position:"relative", zIndex:1, maxWidth:1120, margin:"0 auto", padding:"30px 22px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:42 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <div style={{ width:26,height:26,background:"linear-gradient(135deg,#b48e3c,#e8c96d)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>🏛</div>
              <span style={{ fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"rgba(180,142,60,.65)",fontFamily:"'DM Mono',monospace" }}>Estate Vision AI</span>
            </div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:36,fontWeight:300,margin:0,lineHeight:1.1,color:"#e8e0d0" }}>
              Real Estate<br/><em style={{color:"#b48e3c"}}>Automation Studio</em>
            </h1>
            <p style={{ fontSize:11,color:"rgba(255,255,255,.28)",margin:"8px 0 0",fontFamily:"sans-serif",letterSpacing:.5 }}>
              Higgsfield · Nano Banana → Kling 3.0 · Google Drive
            </p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:7, alignItems:"flex-end" }}>
            {[
              { name:"Nano Banana", color:"rgba(232,201,109,.7)", dot:"#e8c96d" },
              { name:"Kling 3.0",   color:"rgba(107,203,222,.7)", dot:"#6bcbde" },
            ].map(m => (
              <div key={m.name} style={{ display:"flex",alignItems:"center",gap:7,padding:"5px 12px",background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:20 }}>
                <div style={{ width:5,height:5,borderRadius:"50%",background:connected?m.dot:"rgba(180,142,60,.3)",animation:connected?"none":"blink 2s infinite" }}/>
                <span style={{ fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:.8,color:connected?m.color:"rgba(180,142,60,.4)" }}>{m.name}</span>
                <span style={{ fontSize:9,color:"rgba(255,255,255,.2)",fontFamily:"sans-serif" }}>via Higgsfield</span>
              </div>
            ))}
            <div style={{ display:"flex",alignItems:"center",gap:6,padding:"5px 12px",background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:20 }}>
              <div style={{ width:5,height:5,borderRadius:"50%",background:connected?"#6bde8f":"rgba(180,142,60,.35)",animation:connected?"none":"blink 2s infinite" }}/>
              <span style={{ fontSize:10,color:connected?"rgba(107,222,143,.75)":"rgba(180,142,60,.45)",fontFamily:"'DM Mono',monospace",letterSpacing:1 }}>
                {connected?"Higgsfield · Connected":"Higgsfield · Not connected"}
              </span>
            </div>
          </div>
        </div>

        <StepBar current={step}/>

        {/* Main grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 310px", gap:18, alignItems:"start" }}>
          <div>{panels[step]}</div>

          {/* Sidebar */}
          <div style={{ position:"sticky", top:22, display:"flex", flexDirection:"column", gap:14 }}>

            {/* Log */}
            <Card style={{ padding:"18px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <SectionLabel>Activity Log</SectionLabel>
                <span style={{ fontSize:9,color:"rgba(255,255,255,.2)",fontFamily:"'DM Mono',monospace" }}>{log.length} events</span>
              </div>
              <div ref={logRef} style={{ height:300,overflowY:"auto",display:"flex",flexDirection:"column",gap:3 }}>
                {log.length===0 ? (
                  <div style={{ color:"rgba(255,255,255,.13)",fontSize:11,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:50 }}>
                    Pipeline inactive...
                  </div>
                ) : log.map((e,i) => (
                  <div key={i} style={{ display:"flex",gap:7,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.025)" }}>
                    <span style={{ fontSize:9,color:"rgba(255,255,255,.18)",fontFamily:"'DM Mono',monospace",flexShrink:0,paddingTop:2 }}>{e.time}</span>
                    <span style={{ fontSize:11,fontFamily:"'DM Mono',monospace",lineHeight:1.5,
                      color:e.type==="success"?"#6bde8f":e.type==="file"?"#b48e3c":e.type==="error"?"#e06060":"rgba(255,255,255,.45)" }}>
                      {e.msg}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex",gap:4,marginTop:12 }}>
                {STEPS.map((s,i) => (
                  <div key={s} title={STEP_LABELS[s]} onClick={()=>{ if(i<=STEPS.indexOf(step)) setStep(s); }}
                    style={{ flex:1,height:3,borderRadius:2,cursor:i<=STEPS.indexOf(step)?"pointer":"default",
                      background:i<STEPS.indexOf(step)?"linear-gradient(90deg,#b48e3c,rgba(107,182,107,.5))":i===STEPS.indexOf(step)?"#b48e3c":"rgba(180,142,60,.1)"
                    }}/>
                ))}
              </div>
              <div style={{ marginTop:6,fontSize:9,color:"rgba(255,255,255,.18)",fontFamily:"'DM Mono',monospace",textAlign:"center" }}>Click bars to navigate steps</div>
            </Card>

            {/* Stats */}
            <Card style={{ padding:"16px 18px" }}>
              <SectionLabel>Stats</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  { l:"Photos",   v:`${images.filter(i=>i.status!=="idle").length}/${images.length}` },
                  { l:"Enhanced", v: images.filter(i=>i.status==="enhanced").length },
                  { l:"Videos",   v: videos.filter(v=>v.status==="ready").length },
                  { l:"Step",     v:`${STEPS.indexOf(step)+1}/${STEPS.length}` },
                ].map(s => (
                  <div key={s.l} style={{ background:"rgba(255,255,255,.025)",borderRadius:8,padding:"10px 12px" }}>
                    <div style={{ fontSize:20,color:"#e8c96d",fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{s.v}</div>
                    <div style={{ fontSize:9,color:"rgba(255,255,255,.28)",textTransform:"uppercase",letterSpacing:1.5,fontFamily:"sans-serif" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pipeline flow */}
            <Card style={{ padding:"16px 18px" }}>
              <SectionLabel>Pipeline Flow</SectionLabel>
              {[
                { icon:"📁", label:"Google Drive",  sub:"Shared link · no login",        active:step!=="connect" },
                { icon:"🍌", label:"Nano Banana",    sub:"Higgsfield · photo enhance",    active:["enhance","generate","export"].includes(step) },
                { icon:"🎬", label:"Kling 3.0",      sub:"Higgsfield · cinematic video",  active:["generate","export"].includes(step) },
                { icon:"💾", label:"Export",         sub:"Download or back to Drive",     active:step==="export" },
              ].map((n,i,arr) => (
                <div key={n.label}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,padding:"7px 0" }}>
                    <div style={{ width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,
                      background:n.active?"rgba(180,142,60,.12)":"rgba(255,255,255,.03)",
                      border:`1px solid ${n.active?"rgba(180,142,60,.3)":"rgba(255,255,255,.06)"}` }}>
                      {n.icon}
                    </div>
                    <div>
                      <div style={{ fontSize:12,color:n.active?"#e8e0d0":"rgba(255,255,255,.35)",fontFamily:"'DM Mono',monospace" }}>{n.label}</div>
                      <div style={{ fontSize:10,color:"rgba(255,255,255,.22)",fontFamily:"sans-serif" }}>{n.sub}</div>
                    </div>
                  </div>
                  {i<arr.length-1 && <div style={{ width:1,height:8,background:"rgba(180,142,60,.15)",marginLeft:14 }}/>}
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
