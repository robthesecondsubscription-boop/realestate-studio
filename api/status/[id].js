module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const { id } = req.query;
  const HF_API_KEY = process.env.HF_API_KEY;
  const HF_API_SECRET = process.env.HF_API_SECRET;
  const authToken = `${HF_API_KEY}:${HF_API_SECRET}`;
  try {
    const response = await fetch(`https://platform.higgsfield.ai/requests/${id}/status`, {
      headers: { "Authorization":`Key ${authToken}`, "Accept":"application/json" }
    });
    const data = await response.json();
    console.log("Status response:", JSON.stringify(data));
    return res.status(200).json({
      requestId: data.request_id,
      status: data.status,
      videoUrl: data.video?.url || null
    });
  } catch(err) { return res.status(500).json({ error: err.message }); }
}
