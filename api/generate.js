export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { imageUrl, motion, style, model } = req.body;
  const HF_API_KEY = process.env.HF_API_KEY;
  const HF_API_SECRET = process.env.HF_API_SECRET;
  if (!HF_API_KEY) return res.status(500).json({ error: "API key not configured" });
  const motionPrompts = { "slow-push":"slow cinematic push-in, luxury real estate","orbit":"smooth 360 orbit","pan":"elegant lateral pan","crane":"dramatic crane shot","dolly":"cinematic dolly zoom" };
  const stylePrompts = { "cinematic":"cinematic color grade","luxury":"luxury real estate warm tones","warm-golden":"golden hour lighting","twilight":"twilight blue hour moody","airy":"bright airy natural light" };
  const modelMap = { "dop-turbo":"higgsfield/dop/turbo/image-to-video","dop-standard":"higgsfield/dop/standard/image-to-video","dop-lite":"higgsfield/dop/lite/image-to-video" };
  const prompt = `${motionPrompts[motion]||motionPrompts["slow-push"]}. ${stylePrompts[style]||"cinematic"}. High-end real estate.`;
  const authToken = HF_API_SECRET ? `${HF_API_KEY}:${HF_API_SECRET}` : HF_API_KEY;
  try {
    const response = await fetch("https://cloud.higgsfield.ai/api/v1/requests", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${authToken}`}, body:JSON.stringify({ model:modelMap[model]||modelMap["dop-turbo"], arguments:{ input_images:[imageUrl], prompt, duration:5, resolution:"720p" }}) });
    const data = await response.json();
    return res.status(200).json({ requestId:data.id||data.request_id, status:data.status||"queued" });
  } catch(err) { return res.status(500).json({ error:err.message }); }
}
