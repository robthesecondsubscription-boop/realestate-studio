export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  const { id } = req.query;
  const HF_API_KEY = process.env.HF_API_KEY;
  const HF_API_SECRET = process.env.HF_API_SECRET;
  if (!HF_API_KEY) return res.status(500).json({ error: "API key not configured" });
  const authToken = HF_API_SECRET ? `${HF_API_KEY}:${HF_API_SECRET}` : HF_API_KEY;
  try {
    const response = await fetch(`https://cloud.higgsfield.ai/api/v1/requests/${id}`, { headers:{"Authorization":`Bearer ${authToken}`} });
    const data = await response.json();
    const videoUrl = data.output?.video_url || data.result?.videos?.[0]?.url || data.videos?.[0]?.url || null;
    return res.status(200).json({ requestId:id, status:data.status?.toLowerCase(), videoUrl, raw:data });
  } catch(err) { return res.status(500).json({ error:err.message }); }
}
