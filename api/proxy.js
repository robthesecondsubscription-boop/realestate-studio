module.exports = async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).end();
  try {
    const r = await fetch(`https://drive.google.com/uc?export=download&id=${id}`, { redirect: "follow" });
    const buf = await r.arrayBuffer();
    res.setHeader("Content-Type", r.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buf));
  } catch(e) { res.status(500).end(); }
}
