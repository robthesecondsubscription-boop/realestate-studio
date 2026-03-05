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
  const motionPrompts = { "slow-push":"slow cinematic push-in, luxury real estate","orbit":"smooth 360 orbit","pan":"elegant lateral pan","crane":"dramatic crane shot","dolly":"cinematic dolly zoom" };
  const stylePrompts = { "cinematic":"cinematic color grade","luxury":"luxury real estate warm tones","warm-golden":"golden hour lighting","twilight":"twilight blue hour moody","airy":"bright airy natural light" };
  const modelMap = { "dop-turbo":"dop-turbo","dop-standard":"dop-standard","dop-lite":"dop-lite" };
  const prompt = `${motionPrompts[motion]||motionPrompts["slow-push"]}. ${stylePrompts[style]||"cinematic"}. High-end real estate photography.`;
  const authToken = `${HF_API_KEY}:${HF_API_SECRET}`;
  try {
    const response = await fetch("https://cloud.higgsfield.ai/v1/image2video/dop", {
      method: "POST",
      headers: { "Content-Type":"application/json", "Authorization":`Key ${authToken}` },
      body: JSON.stringify({ model: modelMap[model]||"dop-turbo", prompt, input_images:[{ type:"image_url", image_url: imageUrl }] })
    });
    const text = await response.text();
    console.log("Higgsfield response:", response.status, text);
    if (!response.ok) return res.status(response.status).json({ error:`Higgsfield error: ${response.status}`, details: text });
    const data = JSON.parse(text);
    return res.status(200).json({ requestId: data.request_id || data.id, status: data.status || "queued" });
  } catch(err) { return res.status(500).json({ error: err.message }); }
}
