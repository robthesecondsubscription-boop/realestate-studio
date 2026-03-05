module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { imageUrl, motion, style, model } = req.body;
  if (!imageUrl) return res.status(400).json({ error: "imageUrl is required" });
  const HF_API_KEY = process.env.HF_API_KEY;
  const HF_API_SECRET = process.env.HF_API_SECRET;
  if (!HF_API_KEY) return res.status(500).json({ error: "API key not configured" });
  const authToken = `${HF_API_KEY}:${HF_API_SECRET}`;
  const motionPrompts = { "slow-push":"slow cinematic push-in dolly forward","orbit":"smooth 360 orbit around subject","pan":"elegant lateral camera pan","crane":"dramatic crane shot rising up","dolly":"cinematic dolly zoom" };
  const stylePrompts = { "cinematic":"cinematic color grade","luxury":"luxury warm tones","warm-golden":"golden hour lighting","twilight":"twilight blue hour moody","airy":"bright airy natural light" };
  const modelMap = { "dop-turbo":"higgsfield-ai/dop/turbo","dop-standard":"higgsfield-ai/dop/standard","dop-lite":"higgsfield-ai/dop/lite" };
  const prompt = `${motionPrompts[motion]||motionPrompts["slow-push"]}. ${stylePrompts[style]||"cinematic"}. High-end real estate photography.`;
  const endpoint = modelMap[model] || "higgsfield-ai/dop/turbo";
  console.log("Received imageUrl:", imageUrl);
  try {
    const response = await fetch(`https://platform.higgsfield.ai/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type":"application/json", "Authorization":`Key ${authToken}`, "Accept":"application/json" },
      body: JSON.stringify({ image_url: imageUrl, prompt, duration: 5 })
    });
    const text = await response.text();
    console.log("HF_STATUS:", response.status, "HF_BODY:", text.substring(0,300));
    if (!response.ok) return res.status(response.status).json({ error:`Higgsfield error: ${response.status}`, details: text });
    const data = JSON.parse(text);
    return res.status(200).json({ requestId: data.request_id, status: data.status || "queued" });
  } catch(err) { return res.status(500).json({ error: err.message }); }
}
