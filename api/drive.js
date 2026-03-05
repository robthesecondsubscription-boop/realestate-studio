module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { driveLink } = req.body;
  if (!driveLink) return res.status(400).json({ error: "driveLink is required" });
  try {
    const folderMatch = driveLink.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    const fileMatch = driveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const openMatch = driveLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const folderId = folderMatch?.[1] || openMatch?.[1] || null;
    const fileId = fileMatch?.[1] || null;
    if (!folderId && !fileId) return res.status(400).json({ error: "Could not extract Drive ID." });
    if (fileId) return res.status(200).json({ files:[{ id:fileId, name:`image_${fileId.slice(0,8)}.jpg`, size:"Unknown", url:`https://drive.google.com/uc?export=download&id=${fileId}`, thumbnailUrl:`https://drive.google.com/thumbnail?id=${fileId}&sz=w400` }] });
    return res.status(200).json({ folderId, files:[], message:"Upload images manually or add GOOGLE_DRIVE_API_KEY to Vercel.", folderUrl:`https://drive.google.com/drive/folders/${folderId}` });
  } catch(err) { return res.status(500).json({ error:err.message }); }
}
