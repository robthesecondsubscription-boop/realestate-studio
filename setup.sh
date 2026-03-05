#!/bin/bash
# Real Estate Studio — API Setup Script
# Run from inside ~/realestate-studio

echo "🏡 Setting up Real Estate Automation Studio..."

mkdir -p api/status

# ── api/generate.js ──────────────────────────────────────────────────────────
cat > api/generate.js << 'EOF'
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { imageUrl, motion, style, model } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "imageUrl is required" });

  const HF_API_KEY = process.env.HF_API_KEY;
  const HF_API_SECRET = process.env.HF_API_SECRET;
  if (!HF_API_KEY) return res.status(500).json({ error: "Higgsfield API key not configured" });

  const motionPrompts = {
    "slow-push": "slow cinematic push-in camera movement, luxury real estate, smooth dolly forward",
    "orbit":     "smooth 360 degree orbit around the property, cinematic real estate tour",
    "pan":       "elegant lateral pan revealing the space, professional real estate video",
    "crane":     "dramatic crane shot rising upward, luxury property reveal",
    "dolly":     "cinematic dolly zoom, dramatic real estate perspective",
  };
  const stylePrompts = {
    "cinematic":   "cinematic color grade, professional photography",
    "luxury":      "luxury real estate, premium feel, warm tones",
    "warm-golden": "golden hour lighting, warm tones, inviting atmosphere",
    "twilight":    "twilight blue hour, moody lighting, dramatic sky",
    "airy":        "bright airy interior, natural light, clean whites",
  };
  const modelMap = {
    "dop-turbo":    "higgsfield/dop/turbo/image-to-video",
    "dop-standard": "higgsfield/dop/standard/image-to-video",
    "dop-lite":     "higgsfield/dop/lite/image-to-video",
  };

  const prompt = `${motionPrompts[motion] || motionPrompts["slow-push"]}. ${stylePrompts[style] || stylePrompts["cinematic"]}. High-end real estate photography.`;
  const selectedModel = modelMap[model] || modelMap["dop-turbo"];
  const authToken = HF_API_SECRET ? `${HF_API_KEY}:${HF_API_SECRET}` : HF_API_KEY;

  try {
    const response = await fetch("https://cloud.higgsfield.ai/api/v1/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        arguments: {
          input_images: [imageUrl],
          prompt,
          duration: 5,
          resolution: "720p",
          aspect_ratio: "16:9",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Higgsfield error: ${response.status}`, details: errorText });
    }

    const data = await response.json();
    return res.status(200).json({ requestId: data.id || data.request_id, status: data.status || "queued" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
EOF

# ── api/status/[id].js ───────────────────────────────────────────────────────
cat > "api/status/[id].js" << 'EOF'
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Request ID is required" });

  const HF_API_KEY = process.env.HF_API_KEY;
  const HF_API_SECRET = process.env.HF_API_SECRET;
  if (!HF_API_KEY) return res.status(500).json({ error: "API key not configured" });

  const authToken = HF_API_SECRET ? `${HF_API_KEY}:${HF_API_SECRET}` : HF_API_KEY;

  try {
    const response = await fetch(`https://cloud.higgsfield.ai/api/v1/requests/${id}`, {
      headers: { "Authorization": `Bearer ${authToken}`, "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Status check failed: ${response.status}`, details: errorText });
    }

    const data = await response.json();
    const status = data.status?.toLowerCase();
    const videoUrl = data.output?.video_url || data.result?.videos?.[0]?.url || data.videos?.[0]?.url || null;

    return res.status(200).json({ requestId: id, status, videoUrl, raw: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
EOF

# ── api/drive.js ─────────────────────────────────────────────────────────────
cat > api/drive.js << 'EOF'
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { driveLink } = req.body;
  if (!driveLink) return res.status(400).json({ error: "driveLink is required" });

  try {
    const folderMatch = driveLink.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    const fileMatch   = driveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const openMatch   = driveLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    const folderId = folderMatch?.[1] || openMatch?.[1] || null;
    const fileId   = fileMatch?.[1] || null;

    if (!folderId && !fileId) {
      return res.status(400).json({ error: "Could not extract Drive ID from the link." });
    }

    if (fileId) {
      return res.status(200).json({
        files: [{
          id: fileId, name: `image_${fileId.slice(0,8)}.jpg`, size: "Unknown",
          url: `https://drive.google.com/uc?export=download&id=${fileId}`,
          thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
        }]
      });
    }

    const DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
    if (DRIVE_API_KEY) {
      const apiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+(mimeType='image/jpeg'+or+mimeType='image/png')&fields=files(id,name,size,thumbnailLink)&key=${DRIVE_API_KEY}`;
      const driveRes = await fetch(apiUrl);
      if (!driveRes.ok) throw new Error(`Drive API error: ${driveRes.status}`);
      const driveData = await driveRes.json();
      const files = (driveData.files || []).map(f => ({
        id: f.id, name: f.name,
        size: f.size ? `${(parseInt(f.size)/1024/1024).toFixed(1)} MB` : "Unknown",
        url: `https://drive.google.com/uc?export=download&id=${f.id}`,
        thumbnailUrl: f.thumbnailLink || `https://drive.google.com/thumbnail?id=${f.id}&sz=w400`,
      }));
      return res.status(200).json({ files, folderId });
    }

    return res.status(200).json({
      folderId, files: [],
      message: "Folder detected. Upload images manually or add GOOGLE_DRIVE_API_KEY to Vercel env vars.",
      folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
EOF

echo ""
echo "✅ API files created!"
echo ""
echo "Now run:"
echo "  git add -A"
echo "  git commit -m 'add real Higgsfield API backend'"
echo "  git push"
