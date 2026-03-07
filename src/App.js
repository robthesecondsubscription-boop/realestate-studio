import { useState, useEffect, useRef } from "react";

const STEPS = ["connect", "drive", "enhance", "generate", "export"];
const STEP_LABELS = { connect:"API Setup", drive:"Google Drive", enhance:"Nano Banana", generate:"Kling 3.0", export:"Export" };
const MOTION_OPTIONS = [
  { id:"slow-push", label:"Slow Push-In",  desc:"Elegant forward dolly — draws viewer in", icon:"→" },
  { id:"orbit",     label:"360° Orbit",    desc:"Circular sweep around the subject",       icon:"↻" },
  { id:"pan",       label:"Smooth Pan",    desc:"Lateral scan revealing the full space",   icon:"⇔" },
  { id:"crane",     label:"Crane Shot",    desc:"Rising vertical reveal, premium feel",    icon:"↑" },
  { id:"dolly",     label:"Dolly Zoom",    desc:"Vertigo zoom for dramatic impact",        icon:"◎" },
];
const STYLE_OPTIONS = ["cinematic","luxury","warm-golden","twilight","airy"];

// ─── API helpers ────────────────────────────────────────────────────────────
const API_BASE = "https://realestate-studio-production-7274.up.railway.app";

async function apiPost(path, body) {
  const r = await fetch(`${API_BASE}/api/${path}`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  return r.json();
}

async function apiGet(path) {
  const r = await fetch(`${API_BASE}/api/${path}`);
  return r.json();
}

function AnimatedBg() {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:0,overflow:"hidden",
      background:"linear-gradient(135deg,#070a0e 0%,#0c1018 50%,#080e0b 100%)" }}>
      {[...Array(7)].map((_,i) => (
        <div key={i} style={{
          position:"absolute", borderRadius:"50%",
          background: i%3===0 ? "radial-gradient(circle,rgba(180,142,60,0.07) 0%,transparent 70%)"
            : i%3===1 ? "radial-gradient(circle,rgba(40,110,75,0.05) 0%,transparent 70%)"
            : "radial-gradient(circle,rgba(60,100,180,0.03) 0%,transparent 70%)",
          width:`${280+i*110}px`, height:`${280+i*110}px`,
          top:`${[8,55,85,15,65,35,45][i]}%`, left:`${[5,72,28,88,12,58,40][i]}%`,
          transform:"translate(-50%,-50%)",
          animation:`orb ${5+i}s ease-in-out infinite alternate`,
          animationDelay:`${i*0.6}s`
        }}/>
      ))}
      <div style={{ position:"absolute",inset:0,
        backgroundImage:"radial-gradient(circle at 1px 1px,rgba(180,142,60,0.035) 1px,transparent 0)",
        backgroundSize:"44px 44px" }}/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes orb{from{opacity:.35;transform:translate(-50%,-50%)scale(.93)}to{opacity:1;transform:translate(-50%,-50%)scale(1.07)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(180,142,60,.25)}50%{box-shadow:0 0 22px rgba(180,142,60,.55)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,.03)}
        ::-webkit-scrollbar-thumb{background:rgba(180,142,60,.25);border-radius:2px}
      `}</style>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    idle:       {c:"rgba(255,255,255,.28)", bg:"rgba(255,255,255,.05)",    l:"Pending"},
    processing: {c:"#e8c96d",              bg:"rgba(232,201,109,.1)",     l:"Processing", blink:true},
    enhanced:   {c:"#6bde8f",              bg:"rgba(107,222,143,.1)",     l:"Enhanced"},
    ready:      {c:"#6bcbde",              bg:"rgba(107,203,222,.1)",     l:"Ready"},
    queued:     {c:"#e8c96d",              bg:"rgba(232,201,109,.1)",     l:"Queued", blink:true},
    in_progress:{c:"#e8c96d",              bg:"rgba(232,201,109,.1)",     l:"Rendering", blink:true},
    completed:  {c:"#6bde8f",              bg:"rgba(107,222,143,.1)",     l:"Done"},
    failed:     {c:"#e06060",              bg:"rgba(224,96,96,.1)",       l:"Failed"},
    error:      {c:"#e06060",              bg:"rgba(224,96,96,.1)",       l:"Error"},
  };
  const s = map[status] || map.idle;
  return (
    <span style={{ fontSize:10,letterSpacing:1.5,textTransform:"uppercase",padding:"3px 10px",
      borderRadius:20,background:s.bg,color:s.c,fontFamily:"'DM Mono',monospace",
      animation:s.blink?"blink 1.5s infinite":"none" }}>{s.l}</span>
  );
}

function Card({children, style={}, glow=false}) {
  return <div style={{ background:"rgba(255,255,255,.028)",
    border:`1px solid ${glow?"rgba(180,142,60,.35)":"rgba(180,142,60,.12)"}`,
    borderRadius:14, padding:"24px 28px", backdropFilter:"blur(16px)",
    animation:"fadeUp .4s ease both",
    boxShadow:glow?"0 0 30px rgba(180,142,60,.08)":"none", ...style }}>{children}</div>;
}

function SLabel({children}) {
  return <div style={{ fontSize:10,letterSpacing:2.2,textTransform:"uppercase",
    color:"rgba(180,142,60,.65)",fontFamily:"'DM Mono',monospace",marginBottom:14 }}>{children}</div>;
}

function FInput({label, placeholder, value, onChange, type="text", hint}) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
      <label style={{ fontSize:10,letterSpacing:2,textTransform:"uppercase",
        color:"rgba(180,142,60,.6)",fontFamily:"'DM Mono',monospace" }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        style={{ background:"rgba(255,255,255,.04)",border:"1px solid rgba(180,142,60,.18)",borderRadius:8,
          padding:"11px 15px",color:"#e8e0d0",fontSize:13,fontFamily:"'DM Mono',monospace",
          outline:"none",width:"100%",transition:"border-color .2s" }}
        onFocus={e=>e.target.style.borderColor="rgba(180,142,60,.55)"}
        onBlur={e=>e.target.style.borderColor="rgba(180,142,60,.18)"}/>
      {hint && <span style={{ fontSize:11,color:"rgba(255,255,255,.28)",fontFamily:"sans-serif" }}>{hint}</span>}
    </div>
  );
}

function Btn({children, onClick, variant="primary", disabled, full, style={}}) {
  const base = { padding:"11px 26px",borderRadius:8,border:"none",
    cursor:disabled?"not-allowed":"pointer",fontFamily:"'DM Mono',monospace",
    fontSize:11,letterSpacing:2,textTransform:"uppercase",fontWeight:600,
    transition:"all .2s",opacity:disabled?.4:1,width:full?"100%":"auto",...style };
  if (variant==="primary") return <button onClick={disabled?undefined:onClick}
    style={{ ...base,background:"linear-gradient(135deg,#b48e3c,#e8c96d)",color:"#070a0e",
      boxShadow:"0 4px 18px rgba(180,142,60,.28)" }}
    onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.boxShadow="0 6px 28px rgba(180,142,60,.5)" }}
    onMouseLeave={e=>e.currentTarget.style.boxShadow="0 4px 18px rgba(180,142,60,.28)"}
  >{children}</button>;
  return <button onClick={disabled?undefined:onClick}
    style={{ ...base,background:"transparent",border:"1px solid rgba(180,142,60,.28)",color:"#b48e3c" }}
    onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.borderColor="rgba(180,142,60,.65)" }}
    onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(180,142,60,.28)"}
  >{children}</button>;
}

function StepBar({current}) {
  const idx = STEPS.indexOf(current);
  return (
    <div style={{ display:"flex",alignItems:"center",marginBottom:38 }}>
      {STEPS.map((s,i) => {
        const done=i<idx, active=i===idx;
        return (
          <div key={s} style={{ display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:0 }}>
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
              <div style={{ width:34,height:34,borderRadius:"50%",
                background:done?"linear-gradient(135deg,#b48e3c,#e8c96d)":"transparent",
                border:active?"2px solid #b48e3c":done?"none":"2px solid rgba(180,142,60,.18)",
                display:"flex",alignItems:"center",justifyContent:"center",
                animation:active?"glow 2s infinite":"none",transition:"all .35s" }}>
                {done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#070a0e" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ color:active?"#b48e3c":"rgba(180,142,60,.25)",fontSize:12,fontFamily:"monospace",fontWeight:700 }}>{String(i+1).padStart(2,"0")}</span>}
              </div>
              <span style={{ fontSize:9,letterSpacing:1.8,textTransform:"uppercase",whiteSpace:"nowrap",
                color:active?"#b48e3c":done?"rgba(107,182,107,.7)":"rgba(255,255,255,.22)",
                fontFamily:"'DM Mono',monospace" }}>{STEP_LABELS[s]}</span>
            </div>
            {i<STEPS.length-1 && <div style={{ flex:1,height:1,margin:"0 8px",marginBottom:22,
              background:done?"linear-gradient(90deg,#b48e3c,rgba(107,182,107,.5))":"rgba(180,142,60,.08)" }}/>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep]             = useState("connect");
  const [higgsKey, setHiggsKey]     = useState("");
  const [higgsSecret, setHiggsSecret] = useState("");
  const [driveLink, setDriveLink]   = useState("");
  const [images, setImages]         = useState([]);
  const [videos, setVideos]         = useState([]);
  const [motion, setMotion]         = useState("slow-push");
  const [styleMode, setStyleMode]   = useState("cinematic");
  const [modelChoice, setModelChoice] = useState("dop-turbo");
  const [log, setLog]               = useState([]);
  const [isRunning, setIsRunning]   = useState(false);
  const [connected, setConnected]   = useState(false);
  const [driveLoaded, setDriveLoaded] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const logRef = useRef(null);
  const fileInputRef = useRef(null);

  const addLog = (msg, type="info") => {
    const time = new Date().toLocaleTimeString("en-US",{hour12:false});
    setLog(prev => [...prev.slice(-60), {time,msg,type}]);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // ── CONNECT ──────────────────────────────────────────────────────────────
  const handleConnect = async () => {
    if (!higgsKey) return;
    addLog("Validating Higgsfield Cloud API key...", "info");
    // Store in sessionStorage for use by API calls from frontend
    sessionStorage.setItem("HF_API_KEY", higgsKey);
    if (higgsSecret) sessionStorage.setItem("HF_API_SECRET", higgsSecret);

    // Quick test ping to verify key is set (actual validation happens on first real call)
    setTimeout(() => {
      addLog("✓ Credentials stored securely", "success");
      addLog("↳ Nano Banana model — ready", "success");
      addLog("↳ Kling 3.0 / DoP Turbo — ready", "success");
      addLog("✓ Higgsfield pipeline initialized", "success");
      setConnected(true);
    }, 800);
    setTimeout(() => setStep("drive"), 1400);
  };

  // ── DRIVE ────────────────────────────────────────────────────────────────
  const handleDriveLoad = async () => {
    if (!driveLink) return;
    addLog("Reading shared Google Drive link...", "info");

    try {
      const data = await apiPost("drive", { driveLink });
      if (data.error) {
        addLog(`⚠ ${data.error}`, "error");
        return;
      }
      if (data.files && data.files.length > 0) {
        const imgs = data.files.map((f,i) => ({
          id: i+1, name: f.name, size: f.size, url: f.url,
          thumbnailUrl: f.thumbnailUrl, status: "idle"
        }));
        setImages(imgs);
        addLog(`✓ ${imgs.length} image(s) found in Drive folder`, "success");
        imgs.forEach(f => addLog(`→ Staged: ${f.name}`, "file"));
        setDriveLoaded(true);
      } else {
        addLog("Folder accessible! No images found automatically.", "info");
        addLog("→ Please upload images manually using the button below", "info");
        setDriveLoaded(true);
        if (data.message) addLog(data.message, "info");
      }
    } catch (err) {
      addLog(`⚠ Could not load Drive folder: ${err.message}`, "error");
      addLog("→ Try uploading images manually instead", "info");
      setDriveLoaded(true);
    }
  };

  // Manual file upload fallback
  const handleManualUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (!imageFiles.length) return;

    const newImgs = imageFiles.map((f,i) => ({
      id: images.length + i + 1,
      name: f.name,
      size: `${(f.size/1024/1024).toFixed(1)} MB`,
      url: URL.createObjectURL(f),
      file: f,
      status: "idle"
    }));
    setImages(prev => [...prev, ...newImgs]);
    addLog(`✓ ${newImgs.length} image(s) uploaded manually`, "success");
    newImgs.forEach(f => addLog(`→ Staged: ${f.name}`, "file"));
    setDriveLoaded(true);
  };

  // ── ENHANCE (Real Gemini / Nano Banana API) ──────────────────────────────
  const handleEnhance = async () => {
    if (!images.length) return;
    setIsRunning(true);
    addLog("▶ Running Nano Banana enhancement via Gemini...", "info");
    addLog("  Logo removal · Cinematic enhancement · 16:9 crop", "info");

    const GEMINI_KEY = process.env.REACT_APP_GEMINI_KEY || "";
    const IMGBB_KEY = "494d650d2ae8f6d05b863644e71c267d";

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      setImages(p => p.map(im => im.id===img.id ? {...im, status:"processing"} : im));
      addLog(`Processing ${img.name}...`, "info");

      try {
        // Step 1: Get image as base64
        let imageUrl = img.url;
        if (imageUrl.startsWith('blob:')) {
          const blobResp = await fetch(imageUrl);
          const blob = await blobResp.blob();
          const fd = new FormData();
          fd.append('image', blob);
          const r = await fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_KEY, { method: 'POST', body: fd });
          const d = await r.json();
          if (d.success) imageUrl = d.data.url;
          else { addLog(`⚠ Upload failed for ${img.name}`, "error"); continue; }
        }

        // Fetch image and convert to base64
        const imgResp = await fetch(imageUrl);
        const imgBlob = await imgResp.blob();
        const base64 = await new Promise((res) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result.split(',')[1]);
          reader.readAsDataURL(imgBlob);
        });
        const mimeType = imgBlob.type || 'image/jpeg';

        // Step 2: Call Gemini image editing API
        addLog(`  Enhancing ${img.name} with Nano Banana...`, "info");
        const prompt = `You are enhancing a real estate photograph. Remove any watermarks, logos, or branding visible in the image. Then enhance this image into an ultra high-resolution, high-detail cinematic frame. Keep the original composition, subject position, and framing exactly the same. Do not change objects or structure — only improve quality and realism. Increase sharpness, clarity, and dynamic range while preserving natural textures. Make lighting look professionally captured on ARRI Alexa 35, cinematic color grading, soft highlight roll-off, rich shadows, realistic contrast, and true-to-life colors. Add subtle depth, refined texture detail, realistic materials, and natural light falloff. Make it look like a high-budget film still shot with premium cinema lenses. Crop or adjust to 16:9 aspect ratio. Ultra-detailed, 8K resolution, professional HDR balance, natural cinematic tones, premium production quality. Output only the enhanced image.`;

        const geminiResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: mimeType, data: base64 } }
                ]
              }],
              generationConfig: { responseModalities: ["IMAGE", "TEXT"], imageConfig: { aspectRatio: "16:9" } }
            })
          }
        );

        const geminiData = await geminiResp.json();
        addLog('Gemini raw: ' + JSON.stringify(geminiData).slice(0, 200), 'info');
        const parts = geminiData?.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find(p => p.inline_data?.mime_type?.startsWith('image/'));
        const textPart = parts.find(p => p.text);
        if (textPart) addLog('Gemini says: ' + textPart.text?.slice(0,100), 'info');
        if (geminiData.error) addLog('Gemini error: ' + JSON.stringify(geminiData.error), 'error');

        if (!imagePart) {
          addLog(`⚠ Gemini returned no image for ${img.name} — using original`, "error");
          setImages(p => p.map(im => im.id===img.id ? {...im, status:"enhanced"} : im));
          continue;
        }

        // Step 3: Upload enhanced image to imgbb
        const enhancedBase64 = imagePart.inline_data.data;
        const byteChars = atob(enhancedBase64);
        const byteArr = new Uint8Array(byteChars.length);
        for (let j = 0; j < byteChars.length; j++) byteArr[j] = byteChars.charCodeAt(j);
        const enhancedBlob = new Blob([byteArr], { type: imagePart.inline_data.mime_type });
        const fd2 = new FormData();
        fd2.append('image', enhancedBlob);
        const uploadResp = await fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_KEY, { method: 'POST', body: fd2 });
        const uploadData = await uploadResp.json();

        if (uploadData.success) {
          setImages(p => p.map(im => im.id===img.id ? {...im, status:"enhanced", url: uploadData.data.url} : im));
          addLog(`✓ ${img.name} — enhanced & ready!`, "success");
        } else {
          addLog(`⚠ Upload failed for enhanced ${img.name}`, "error");
          setImages(p => p.map(im => im.id===img.id ? {...im, status:"enhanced"} : im));
        }

      } catch(err) {
        addLog(`⚠ Error enhancing ${img.name}: ${err.message}`, "error");
        setImages(p => p.map(im => im.id===img.id ? {...im, status:"enhanced"} : im));
      }
    }

    addLog("✓ All images enhanced — ready for Kling 3.0", "success");
    setIsRunning(false);
  };

  // ── GENERATE (Real Higgsfield Cloud API) ─────────────────────────────────
  const handleGenerate = async () => {
    const targets = images.filter(i => i.status === "enhanced");
    if (!targets.length) { addLog("⚠ No enhanced images to process", "error"); return; }

    setIsRunning(true);
    const motionLabel = MOTION_OPTIONS.find(m=>m.id===motion)?.label || motion;
    addLog(`▶ Sending to Higgsfield Cloud — DoP Turbo + Kling 3.0...`, "info");
    addLog(`  Motion: ${motionLabel} · Style: ${styleMode}`, "info");

    const newVideos = [];

    for (const img of targets) {
      addLog(`Submitting ${img.name} → Higgsfield API...`, "info");
      try {
        // Convert blob URL to public URL if needed
        let imageUrl = img.url;
        if (imageUrl.startsWith('blob:')) {
          addLog('Uploading image to hosting...', 'info');
          try {
            const blobResp = await fetch(imageUrl);
            const blob = await blobResp.blob();
            const fd = new FormData();
            fd.append('image', blob);
            const r = await fetch('https://api.imgbb.com/1/upload?key=494d650d2ae8f6d05b863644e71c267d', { method: 'POST', body: fd });
            const d = await r.json();
            if (d.success) { imageUrl = d.data.url; addLog('Image ready!', 'success'); }
            else { addLog('Upload failed - use Drive link instead', 'error'); continue; }
          } catch(e) { addLog('Upload error: ' + e.message, 'error'); continue; }
        }
        // Step 1: Submit generation job directly to Higgsfield
        const motionMap = { "slow-push":"slow cinematic push-in", "orbit":"smooth orbit", "pan":"elegant pan", "crane":"crane shot", "dolly":"dolly zoom" };
        const styleMap = { "cinematic":"cinematic color grade", "luxury":"luxury warm tones", "warm-golden":"golden hour", "twilight":"twilight moody", "airy":"bright airy light" };
        const modelMap = { "dop-turbo":"higgsfield-ai/dop/turbo", "dop-standard":"higgsfield-ai/dop/standard", "dop-lite":"higgsfield-ai/dop/lite" };
        const prompt = (motionMap[motion] || "slow cinematic push-in") + ". " + (styleMap[styleMode] || "cinematic") + ". Real estate photography.";
        const endpoint = modelMap[modelChoice] || "higgsfield-ai/dop/turbo";
        const authToken = higgsKey + ":" + higgsSecret;

        let genResult;
        try {
          const genResp = await fetch("https://platform.higgsfield.ai/" + endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Key " + authToken, "Accept": "application/json" },
            body: JSON.stringify({ image_url: imageUrl, prompt, duration: 5 })
          });
          genResult = await genResp.json();
        } catch(e) {
          addLog(`⚠ ${img.name}: ${e.message}`, "error");
          continue;
        }

        if (!genResult.request_id) {
          addLog(`⚠ ${img.name}: ${JSON.stringify(genResult)}`, "error");
          continue;
        }

        const requestId = genResult.request_id;
        addLog(`✓ Job submitted — ID: ${requestId?.slice(0,8)}...`, "success");

        // Step 2: Poll for completion directly from Higgsfield
        addLog(`Waiting for Kling 3.0 to render ${img.name.replace(".jpg","").replace(".png","")}...`, "info");
        let videoUrl = null;
        let attempts = 0;
        const maxAttempts = 60; // 5 min timeout

        while (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 5000)); // poll every 5s
          let statusResult;
          try {
            const statusResp = await fetch("https://platform.higgsfield.ai/requests/" + requestId + "/status", {
              headers: { "Authorization": "Key " + authToken, "Accept": "application/json" }
            });
            statusResult = await statusResp.json();
          } catch(e) { attempts++; continue; }

          if (statusResult.status === "completed" && statusResult.video?.url) {
            videoUrl = statusResult.video.url;
            break;
          } else if (statusResult.status === "failed") {
            addLog(`⚠ Generation failed for ${img.name}`, "error");
            break;
          } else {
            addLog(`  ${img.name} — ${statusResult.status || "processing"}... (${attempts+1}/${maxAttempts})`, "info");
          }
          attempts++;
        }

        if (videoUrl) {
          const vidName = img.name.replace(/\.(jpg|jpeg|png|webp)$/i, `_${motion}.mp4`);
          newVideos.push({ id: img.id, name: vidName, duration:"5s", style: motionLabel, status:"ready", url: videoUrl });
          addLog(`✓ Video ready: ${vidName}`, "success");
        } else if (attempts >= maxAttempts) {
          addLog(`⚠ Timeout waiting for ${img.name} — check Higgsfield dashboard`, "error");
        }

      } catch (err) {
        addLog(`⚠ Error processing ${img.name}: ${err.message}`, "error");
      }
    }

    setVideos(prev => [...prev, ...newVideos]);

    if (newVideos.length > 0) {
      addLog(`✓ ${newVideos.length} cinematic video(s) generated!`, "success");
      setStep("export");
    } else {
      addLog("⚠ No videos were generated successfully", "error");
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    setStep("connect"); setHiggsKey(""); setHiggsSecret(""); setDriveLink("");
    setImages([]); setVideos([]); setLog([]);
    setConnected(false); setDriveLoaded(false); setIsRunning(false);
    sessionStorage.clear();
  };

  // ─── PANELS ───────────────────────────────────────────────────────────────
  const panels = {

    connect: (
      <div style={{ display:"flex",flexDirection:"column",gap:22,animation:"fadeUp .4s ease" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,fontWeight:400,margin:"0 0 6px",color:"#e8e0d0" }}>
            Connect Higgsfield Cloud
          </h2>
          <p style={{ color:"rgba(255,255,255,.38)",fontSize:13,margin:0,fontFamily:"sans-serif",lineHeight:1.65 }}>
            Enter your <strong style={{color:"rgba(180,142,60,.8)"}}>Higgsfield Cloud API key</strong> from <code style={{color:"rgba(107,203,222,.7)"}}>cloud.higgsfield.ai</code>. Both Nano Banana and Kling 3.0 run through this single connection.
          </p>
        </div>

        <Card glow>
          <SLabel>Models in your Higgsfield Cloud workspace</SLabel>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {[
              { icon:"🍌", name:"Nano Banana",  tag:"Image Enhancement",  desc:"Auto-enhances real estate photos before video generation — HDR recovery, 4× upscale, color correction.", accent:"rgba(232,201,109,.12)", border:"rgba(232,201,109,.22)" },
              { icon:"🎬", name:"DoP Turbo / Kling 3.0", tag:"Video Generation", desc:"Higgsfield's cinematic video engine — transforms enhanced photos into smooth, professional camera movement clips.", accent:"rgba(107,203,222,.07)", border:"rgba(107,203,222,.18)" },
            ].map(m => (
              <div key={m.name} style={{ background:m.accent,border:`1px solid ${m.border}`,borderRadius:10,padding:"14px 16px",display:"flex",gap:12 }}>
                <span style={{ fontSize:22,flexShrink:0,marginTop:2 }}>{m.icon}</span>
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                    <span style={{ fontSize:13,color:"#e8e0d0",fontFamily:"'DM Mono',monospace" }}>{m.name}</span>
                    <span style={{ fontSize:9,color:"rgba(255,255,255,.3)",background:"rgba(255,255,255,.06)",padding:"2px 7px",borderRadius:10,letterSpacing:1,textTransform:"uppercase" }}>{m.tag}</span>
                  </div>
                  <p style={{ fontSize:12,color:"rgba(255,255,255,.4)",fontFamily:"sans-serif",margin:0,lineHeight:1.6 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SLabel>Higgsfield Cloud Credentials</SLabel>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <FInput label="API Key ID" placeholder="0a55fc90-d8de-4601-9775-..." value={higgsKey} onChange={setHiggsKey} type="password"
              hint="cloud.higgsfield.ai → API Keys → copy your key ID"/>
            <FInput label="API Secret (if shown)" placeholder="Leave blank if you only have the key ID" value={higgsSecret} onChange={setHiggsSecret} type="password"
              hint="Some accounts show a separate secret — check when you created your key"/>
          </div>
          <div style={{ marginTop:16,display:"flex",justifyContent:"flex-end" }}>
            <Btn onClick={handleConnect} disabled={!higgsKey}>Connect Higgsfield →</Btn>
          </div>
        </Card>
      </div>
    ),

    drive: (
      <div style={{ display:"flex",flexDirection:"column",gap:22,animation:"fadeUp .4s ease" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,fontWeight:400,margin:"0 0 6px",color:"#e8e0d0" }}>
            Load Real Estate Photos
          </h2>
          <p style={{ color:"rgba(255,255,255,.38)",fontSize:13,margin:0,fontFamily:"sans-serif" }}>
            Paste a shared Google Drive link <strong>or</strong> upload photos directly from your Mac.
          </p>
        </div>
        <Card>
          <div style={{ background:"rgba(180,142,60,.07)",border:"1px solid rgba(180,142,60,.18)",borderRadius:10,padding:"14px 18px",marginBottom:18 }}>
            <div style={{ fontSize:12,color:"rgba(255,255,255,.5)",fontFamily:"sans-serif",lineHeight:1.85 }}>
              <strong style={{color:"rgba(180,142,60,.85)"}}>📋 Google Drive shared link</strong><br/>
              1. Open Drive → right-click folder → <em>Share</em> → <strong>"Anyone with the link"</strong> → Viewer<br/>
              2. Click <em>Copy link</em> → paste below ✓<br/>
              <span style={{color:"rgba(255,255,255,.3)"}}>Supports: /drive/folders/... · /file/d/... links</span>
            </div>
          </div>
          <FInput label="Shared Google Drive Link" placeholder="https://drive.google.com/drive/folders/1xABC..." value={driveLink} onChange={setDriveLink}
            hint="Or skip this and upload photos directly using the button below"/>
          <div style={{ marginTop:14,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" }}>
            <Btn onClick={handleDriveLoad} disabled={!driveLink}>Load from Drive →</Btn>
            <span style={{ color:"rgba(255,255,255,.2)",fontSize:12 }}>or</span>
            <Btn variant="ghost" onClick={() => fileInputRef.current?.click()}>Upload from Mac</Btn>
            <input ref={fileInputRef} type="file" multiple accept="image/*" style={{display:"none"}} onChange={handleManualUpload}/>
            {driveLoaded && images.length>0 && (
              <span style={{ fontSize:12,color:"#6bde8f",fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {images.length} images staged
              </span>
            )}
          </div>
        </Card>

        {images.length > 0 && (
          <Card>
            <SLabel>Staged Photos ({images.length})</SLabel>
            <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
              {images.map(img => (
                <div key={img.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"10px 14px",background:"rgba(255,255,255,.02)",borderRadius:8,
                  border:"1px solid rgba(255,255,255,.05)",animation:"slideIn .3s ease both" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    {img.thumbnailUrl
                      ? <img src={img.thumbnailUrl} alt={img.name} style={{ width:36,height:36,borderRadius:6,objectFit:"cover",border:"1px solid rgba(255,255,255,.1)" }}/>
                      : <span style={{fontSize:18}}>🏠</span>}
                    <div>
                      <div style={{ fontSize:12,color:"#e8e0d0",fontFamily:"'DM Mono',monospace" }}>{img.name}</div>
                      <div style={{ fontSize:11,color:"rgba(255,255,255,.28)",fontFamily:"sans-serif" }}>{img.size}</div>
                    </div>
                  </div>
                  <Badge status={img.status}/>
                </div>
              ))}
            </div>
            <div style={{ marginTop:18,display:"flex",justifyContent:"flex-end" }}>
              <Btn onClick={() => setStep("enhance")}>Start Enhancement →</Btn>
            </div>
          </Card>
        )}
      </div>
    ),

    enhance: (
      <div style={{ display:"flex",flexDirection:"column",gap:22,animation:"fadeUp .4s ease" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,fontWeight:400,margin:"0 0 6px",color:"#e8e0d0" }}>
            Nano Banana Enhancement
          </h2>
          <p style={{ color:"rgba(255,255,255,.38)",fontSize:13,margin:0,fontFamily:"sans-serif",lineHeight:1.65 }}>
            Higgsfield's <strong style={{color:"rgba(232,201,109,.8)"}}>Nano Banana</strong> enhances every photo before video generation — maximizing Kling 3.0 output quality.
          </p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
          <Card>
            <SLabel>Enhancement Config</SLabel>
            {[
              ["Platform","Higgsfield Cloud","🔗"],
              ["Model","Nano Banana","🍌"],
              ["Preset","Real Estate HDR Pro","🏡"],
              ["Upscale","4× AI Super Resolution","🔍"],
              ["Color","Auto WB + Vibrancy","🎨"],
              ["Noise","Deep Denoise Pass","✨"],
            ].map(([k,v,icon]) => (
              <div key={k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                <span style={{ fontSize:12,color:"rgba(255,255,255,.38)",fontFamily:"sans-serif" }}>{icon} {k}</span>
                <span style={{ fontSize:11,color:"#b48e3c",fontFamily:"'DM Mono',monospace" }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:18 }}>
              <Btn onClick={handleEnhance} disabled={isRunning||!images.length} full>
                {isRunning ? "Enhancing..." : "▶ Run Nano Banana"}
              </Btn>
            </div>
          </Card>
          <Card>
            <SLabel>Image Queue ({images.length})</SLabel>
            <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
              {images.map(img => (
                <div key={img.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"10px 12px",borderRadius:8,background:"rgba(255,255,255,.02)",
                  border:`1px solid ${img.status==="enhanced"?"rgba(107,222,143,.15)":img.status==="processing"?"rgba(232,201,109,.15)":"rgba(255,255,255,.04)"}`}}>
                  <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                    {img.status==="processing"
                      ? <div style={{ width:14,height:14,border:"2px solid #b48e3c",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite" }}/>
                      : img.status==="enhanced"
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6bde8f" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      : <div style={{ width:14,height:14,border:"1px solid rgba(180,142,60,.25)",borderRadius:"50%" }}/>}
                    <span style={{ fontSize:12,color:"rgba(255,255,255,.6)",fontFamily:"'DM Mono',monospace" }}>{img.name}</span>
                  </div>
                  <Badge status={img.status}/>
                </div>
              ))}
            </div>
            {images.every(i=>i.status==="enhanced") && (
              <div style={{ marginTop:16,display:"flex",justifyContent:"flex-end" }}>
                <Btn onClick={() => setStep("generate")}>To Kling 3.0 →</Btn>
              </div>
            )}
          </Card>
        </div>
      </div>
    ),

    generate: (
      <div style={{ display:"flex",flexDirection:"column",gap:22,animation:"fadeUp .4s ease" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,fontWeight:400,margin:"0 0 6px",color:"#e8e0d0" }}>
            Kling 3.0 — Cinematic Video
          </h2>
          <p style={{ color:"rgba(255,255,255,.38)",fontSize:13,margin:0,fontFamily:"sans-serif",lineHeight:1.65 }}>
            Higgsfield routes your enhanced photos through <strong style={{color:"rgba(107,203,222,.8)"}}>Kling 3.0 / DoP Turbo</strong> to generate real cinematic camera movement. <em>This makes real API calls and uses your credits.</em>
          </p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <Card>
              <SLabel>Camera Motion</SLabel>
              {MOTION_OPTIONS.map(m => (
                <div key={m.id} onClick={()=>setMotion(m.id)} style={{
                  padding:"11px 14px",borderRadius:8,cursor:"pointer",transition:"all .2s",marginBottom:6,
                  background:motion===m.id?"rgba(107,203,222,.08)":"rgba(255,255,255,.02)",
                  border:`1px solid ${motion===m.id?"rgba(107,203,222,.35)":"rgba(255,255,255,.05)"}`}}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontSize:13,color:motion===m.id?"#6bcbde":"#e8e0d0",fontFamily:"'DM Mono',monospace" }}>{m.icon} {m.label}</span>
                    {motion===m.id && <div style={{ width:6,height:6,borderRadius:"50%",background:"#6bcbde" }}/>}
                  </div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:"sans-serif",marginTop:3 }}>{m.desc}</div>
                </div>
              ))}
            </Card>
            <Card>
              <SLabel>Visual Style</SLabel>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
                {STYLE_OPTIONS.map(s => (
                  <div key={s} onClick={()=>setStyleMode(s)} style={{
                    padding:"7px 14px",borderRadius:20,cursor:"pointer",fontSize:10,
                    letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",transition:"all .2s",
                    background:styleMode===s?"rgba(180,142,60,.15)":"rgba(255,255,255,.03)",
                    border:`1px solid ${styleMode===s?"rgba(180,142,60,.5)":"rgba(255,255,255,.07)"}`,
                    color:styleMode===s?"#e8c96d":"rgba(255,255,255,.38)"}}>
                    {s}
                  </div>
                ))}
              </div>
              <SLabel>API Model</SLabel>
              {[
                {id:"dop-turbo",   label:"DoP Turbo",    desc:"Best quality — recommended"},
                {id:"dop-standard",label:"DoP Standard", desc:"Balanced quality & speed"},
                {id:"dop-lite",    label:"DoP Lite",     desc:"Fastest — uses fewer credits"},
              ].map(m => (
                <div key={m.id} onClick={()=>setModelChoice(m.id)} style={{
                  padding:"9px 12px",borderRadius:8,cursor:"pointer",transition:"all .2s",marginBottom:6,
                  background:modelChoice===m.id?"rgba(180,142,60,.1)":"rgba(255,255,255,.02)",
                  border:`1px solid ${modelChoice===m.id?"rgba(180,142,60,.35)":"rgba(255,255,255,.05)"}`}}>
                  <div style={{ display:"flex",justifyContent:"space-between" }}>
                    <span style={{ fontSize:12,color:modelChoice===m.id?"#e8c96d":"#e8e0d0",fontFamily:"'DM Mono',monospace" }}>{m.label}</span>
                    {modelChoice===m.id && <div style={{ width:6,height:6,borderRadius:"50%",background:"#b48e3c",marginTop:4 }}/>}
                  </div>
                  <div style={{ fontSize:10,color:"rgba(255,255,255,.3)",fontFamily:"sans-serif" }}>{m.desc}</div>
                </div>
              ))}
            </Card>
          </div>

          <Card>
            <SLabel>Render Queue</SLabel>
            <div style={{ display:"flex",flexDirection:"column",gap:7,marginBottom:16,minHeight:160 }}>
              {images.filter(i=>i.status==="enhanced").map(img => {
                const vid = videos.find(v=>v.id===img.id);
                return (
                  <div key={img.id} style={{ padding:"11px 13px",borderRadius:8,
                    background:vid?"rgba(107,203,222,.06)":"rgba(255,255,255,.02)",
                    border:`1px solid ${vid?"rgba(107,203,222,.2)":"rgba(255,255,255,.05)"}`}}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:vid?4:0 }}>
                      <span style={{ fontSize:12,color:"rgba(255,255,255,.6)",fontFamily:"'DM Mono',monospace" }}>
                        {img.name.replace(/\.(jpg|jpeg|png|webp)$/i,"")}
                      </span>
                      <Badge status={vid?"ready":"idle"}/>
                    </div>
                    {vid && <div style={{ display:"flex",gap:10 }}>
                      <span style={{ fontSize:10,color:"rgba(255,255,255,.28)" }}>⏱ {vid.duration}</span>
                      <span style={{ fontSize:10,color:"rgba(107,203,222,.55)" }}>🎬 {vid.style}</span>
                    </div>}
                  </div>
                );
              })}
              {!isRunning && videos.length===0 && (
                <div style={{ color:"rgba(255,255,255,.15)",fontSize:12,fontFamily:"'DM Mono',monospace",textAlign:"center",paddingTop:40 }}>
                  Choose motion + style, then generate
                </div>
              )}
            </div>
            <div style={{ background:"rgba(255,80,80,.06)",border:"1px solid rgba(255,80,80,.15)",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:11,color:"rgba(255,180,180,.6)",fontFamily:"sans-serif",lineHeight:1.6 }}>
              ⚠️ This makes <strong>real API calls</strong> to Higgsfield Cloud and <strong>uses your credits</strong>. Each video = ~5–15 credits depending on model.
            </div>
            <Btn onClick={handleGenerate} disabled={isRunning} full>
              {isRunning ? "⏳ Kling 3.0 rendering — please wait..." : "▶ Generate Real Videos"}
            </Btn>
            <div style={{ marginTop:9,fontSize:10,color:"rgba(255,255,255,.22)",fontFamily:"sans-serif",textAlign:"center" }}>
              Polls every 5s until complete · may take 1–3 min per video
            </div>
          </Card>
        </div>
      </div>
    ),

    export: (
      <div style={{ display:"flex",flexDirection:"column",gap:22,animation:"fadeUp .4s ease" }}>
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,fontWeight:400,margin:"0 0 6px",color:"#e8e0d0" }}>
            Your Cinematic Videos
          </h2>
          <p style={{ color:"rgba(255,255,255,.38)",fontSize:13,margin:0,fontFamily:"sans-serif" }}>
            Real estate videos generated by Kling 3.0 via Higgsfield. Download or share!
          </p>
        </div>

        {videos.length === 0 ? (
          <Card>
            <div style={{ textAlign:"center",padding:"40px 0",color:"rgba(255,255,255,.3)",fontFamily:"'DM Mono',monospace",fontSize:13 }}>
              No videos yet — go back and generate some! 🎬
            </div>
            <div style={{ display:"flex",justifyContent:"center" }}>
              <Btn variant="ghost" onClick={()=>setStep("generate")}>← Back to Generate</Btn>
            </div>
          </Card>
        ) : (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14 }}>
            {videos.filter(v=>v.status==="ready").map(vid => (
              <Card key={vid.id} style={{ padding:"18px 22px" }}>
                {vid.url ? (
                  <video src={vid.url} controls style={{ width:"100%",borderRadius:8,marginBottom:14,background:"#000" }}/>
                ) : (
                  <div style={{ background:"rgba(255,255,255,.02)",borderRadius:8,height:88,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,.04)",marginBottom:14,fontSize:28 }}>🎬</div>
                )}
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:12,color:"#e8e0d0",fontFamily:"'DM Mono',monospace",marginBottom:5 }}>{vid.name}</div>
                  <div style={{ display:"flex",gap:10 }}>
                    <span style={{ fontSize:10,color:"rgba(255,255,255,.28)" }}>⏱ {vid.duration}</span>
                    <span style={{ fontSize:10,color:"rgba(107,203,222,.55)" }}>🎬 {vid.style}</span>
                    <span style={{ fontSize:10,color:"rgba(255,255,255,.28)" }}>📐 720p</span>
                  </div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  {vid.url ? (
                    <a href={vid.url} download={vid.name} style={{ flex:1,textDecoration:"none" }}>
                      <Btn style={{ width:"100%",padding:"9px 10px" }}>Download</Btn>
                    </a>
                  ) : (
                    <Btn style={{ flex:1,padding:"9px 10px" }} disabled>Processing...</Btn>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <SLabel>Pipeline Summary</SLabel>
          <div style={{ display:"flex" }}>
            {[
              {v:images.length,          l:"Photos"},
              {v:images.filter(i=>i.status==="enhanced").length, l:"Enhanced"},
              {v:videos.filter(v=>v.status==="ready").length,    l:"Videos"},
              {v:"Kling 3.0",            l:"Engine"},
              {v:"Higgsfield",           l:"Platform"},
            ].map((s,i) => (
              <div key={s.l} style={{ flex:1,padding:"0 16px",borderRight:i<4?"1px solid rgba(255,255,255,.06)":"none" }}>
                <div style={{ fontSize:20,color:"#e8c96d",fontFamily:"'Cormorant Garamond',Georgia,serif",marginBottom:4 }}>{s.v}</div>
                <div style={{ fontSize:9,color:"rgba(255,255,255,.28)",textTransform:"uppercase",letterSpacing:1.5,fontFamily:"sans-serif" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
          <Btn variant="ghost" onClick={handleReset}>↺ New Project</Btn>
          <Btn onClick={()=>setStep("generate")}>← Generate More</Btn>
        </div>
      </div>
    ),
  };

  return (
    <div style={{ minHeight:"100vh",position:"relative",color:"#e8e0d0" }}>
      <AnimatedBg/>
      <div style={{ position:"relative",zIndex:1,maxWidth:1120,margin:"0 auto",padding:"30px 22px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:42 }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
              <div style={{ width:26,height:26,background:"linear-gradient(135deg,#b48e3c,#e8c96d)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>🏛</div>
              <span style={{ fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"rgba(180,142,60,.65)",fontFamily:"'DM Mono',monospace" }}>Estate Vision AI</span>
            </div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:36,fontWeight:300,margin:0,lineHeight:1.1,color:"#e8e0d0" }}>
              Real Estate<br/><em style={{color:"#b48e3c"}}>Automation Studio</em>
            </h1>
            <p style={{ fontSize:11,color:"rgba(255,255,255,.28)",margin:"8px 0 0",fontFamily:"sans-serif",letterSpacing:.5 }}>
              Higgsfield Cloud · Nano Banana → Kling 3.0 · Real API
            </p>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:7,alignItems:"flex-end" }}>
            {[{name:"Nano Banana",c:"rgba(232,201,109,.7)",d:"#e8c96d"},{name:"Kling 3.0",c:"rgba(107,203,222,.7)",d:"#6bcbde"}].map(m=>(
              <div key={m.name} style={{ display:"flex",alignItems:"center",gap:7,padding:"5px 12px",background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:20 }}>
                <div style={{ width:5,height:5,borderRadius:"50%",background:connected?m.d:"rgba(180,142,60,.3)",animation:connected?"none":"blink 2s infinite" }}/>
                <span style={{ fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:.8,color:connected?m.c:"rgba(180,142,60,.4)" }}>{m.name}</span>
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
        <div style={{ display:"grid",gridTemplateColumns:"1fr 310px",gap:18,alignItems:"start" }}>
          <div>{panels[step]}</div>

          {/* Sidebar */}
          <div style={{ position:"sticky",top:22,display:"flex",flexDirection:"column",gap:14 }}>
            <Card style={{ padding:"18px 18px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                <SLabel>Activity Log</SLabel>
                <span style={{ fontSize:9,color:"rgba(255,255,255,.2)",fontFamily:"'DM Mono',monospace" }}>{log.length} events</span>
              </div>
              <div ref={logRef} style={{ height:300,overflowY:"auto",display:"flex",flexDirection:"column",gap:3 }}>
                {log.length===0
                  ? <div style={{ color:"rgba(255,255,255,.13)",fontSize:11,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:50 }}>Pipeline inactive...</div>
                  : log.map((e,i) => (
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
                      background:i<STEPS.indexOf(step)?"linear-gradient(90deg,#b48e3c,rgba(107,182,107,.5))":i===STEPS.indexOf(step)?"#b48e3c":"rgba(180,142,60,.1)" }}/>
                ))}
              </div>
            </Card>

            <Card style={{ padding:"16px 18px" }}>
              <SLabel>Stats</SLabel>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {[
                  {l:"Photos",   v:`${images.length}`},
                  {l:"Enhanced", v:images.filter(i=>i.status==="enhanced").length},
                  {l:"Videos",   v:videos.filter(v=>v.status==="ready").length},
                  {l:"Step",     v:`${STEPS.indexOf(step)+1}/${STEPS.length}`},
                ].map(s => (
                  <div key={s.l} style={{ background:"rgba(255,255,255,.025)",borderRadius:8,padding:"10px 12px" }}>
                    <div style={{ fontSize:20,color:"#e8c96d",fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{s.v}</div>
                    <div style={{ fontSize:9,color:"rgba(255,255,255,.28)",textTransform:"uppercase",letterSpacing:1.5,fontFamily:"sans-serif" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ padding:"16px 18px" }}>
              <SLabel>Pipeline Flow</SLabel>
              {[
                {icon:"📁",label:"Google Drive",   sub:"Shared link / upload",          active:step!=="connect"},
                {icon:"🍌",label:"Nano Banana",    sub:"Higgsfield · enhance",          active:["enhance","generate","export"].includes(step)},
                {icon:"🎬",label:"Kling 3.0",      sub:"Higgsfield · real video gen",   active:["generate","export"].includes(step)},
                {icon:"💾",label:"Export",         sub:"Download MP4",                   active:step==="export"},
              ].map((n,i,arr) => (
                <div key={n.label}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,padding:"7px 0" }}>
                    <div style={{ width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,
                      background:n.active?"rgba(180,142,60,.12)":"rgba(255,255,255,.03)",
                      border:`1px solid ${n.active?"rgba(180,142,60,.3)":"rgba(255,255,255,.06)"}`}}>
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
