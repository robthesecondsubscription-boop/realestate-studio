module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const imageUrl = req.body.imageUrl;
  const motion = req.body.motion;
  const style = req.body.style;
  const model = req.body.model;
  if (!imageUrl) return res.status(400).json({ error: "imageUrl is required" });
  const authToken = process.env.HF_API_KEY + ":" + process.env.HF_API_SECRET;
  const motionMap = { "slow-push":"slow cinematic push-in", "orbit":"smooth orbit", "pan":"elegant pan", "crane":"crane shot", "dolly":"dolly zoom" };
  const styleMap = { "cinematic":"cinematic color grade", "luxury":"luxury warm tones", "warm-golden":"golden hour", "twilight":"twilight moody", "airy":"bright airy light" };
  const modelMap = { "dop-turbo":"higgsfield-ai/dop/turbo", "dop-standard":"higgsfield-ai/dop/standard", "dop-lite":"higgsfield-ai/dop/lite" };
  const prompt = (motionMap[motion] || "slow cinematic push-in") + ". " + (styleMap[style] || "cinematic") + ". Real estate photography.";
  const endpoint = modelMap[model] || "higgsfield-ai/dop/turbo";
  console.log("imageUrl:", imageUrl, "endpoint:", endpoint);
  try {
    const pingRes = await fetch("https://platform.higgsfield.ai/", { method: "GET" });
    console.log("Ping status:", pingRes.status);
  } catch(e) { console.log("Ping failed:", e.message); }
  try {
    const response = await fetch("https://platform.higgsfield.ai/" + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Key " + authToken, "Accept": "application/json", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      body: JSON.stringify({ image_url: imageUrl, prompt: prompt, duration: 5 })
    });
    const text = await response.text();
    console.log("HF:", response.status, text);
    if (!response.ok) return res.status(response.status).json({ error: "Higgsfield error", details: text });
    const data = JSON.parse(text);
    return res.status(200).json({ requestId: data.request_id, status: data.status || "queued" });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}