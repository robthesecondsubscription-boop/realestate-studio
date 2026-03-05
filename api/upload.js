module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { imageBase64, mimeType } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "imageBase64 required" });
  const HF_API_KEY = process.env.HF_API_KEY;
  const HF_API_SECRET = process.env.HF_API_SECRET;
  const authToken = `${HF_API_KEY}:${HF_API_SECRET}`;
  try {
    const buffer = Buffer.from(imageBase64, 'base64');
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const formData = `--boundary\r\nContent-Disposition: form-data; name="file"; filename="image.${ext}"\r\nContent-Type: ${mimeType || 'image/jpeg'}\r\n\r\n`;
    const response = await fetch("https://platform.higgsfield.ai/files/upload", {
      method: "POST",
      headers: { "Authorization": `Key ${authToken}`, "Content-Type": `multipart/form-data; boundary=boundary` },
      body: Buffer.concat([Buffer.from(formData), buffer, Buffer.from('\r\n--boundary--')])
    });
    const text = await response.text();
    console.log("Upload response:", response.status, text);
    if (!response.ok) return res.status(response.status).json({ error: text });
    const data = JSON.parse(text);
    return res.status(200).json({ url: data.url });
  } catch(err) { return res.status(500).json({ error: err.message }); }
}
