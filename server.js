const http = require("node:http");

const GITHUB_REPO = "minter/mxvoice-electron";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const PORT = process.env.PORT || 3000;

let cache = { data: null, timestamp: 0 };

async function getLatestRelease() {
  if (cache.data && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  const headers = { "User-Agent": "mxvoice-download" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
    { headers }
  );

  if (!res.ok) {
    throw new Error(`GitHub API returned ${res.status}`);
  }

  const release = await res.json();
  cache = { data: release, timestamp: Date.now() };
  return release;
}

function findAsset(release, extension) {
  return release.assets.find(
    (a) => a.name.endsWith(`.${extension}`) && !a.name.endsWith(".blockmap")
  );
}

const server = http.createServer(async (req, res) => {
  const path = req.url.split("?")[0];

  const platformMap = {
    "/download/dmg": "dmg",
    "/download/mac": "dmg",
    "/download/exe": "exe",
    "/download/windows": "exe",
  };

  const extension = platformMap[path];

  if (!extension) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  try {
    const release = await getLatestRelease();
    const asset = findAsset(release, extension);

    if (!asset) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`No ${extension} asset found in latest release`);
      return;
    }

    res.writeHead(302, { Location: asset.browser_download_url });
    res.end();
  } catch (err) {
    console.error("Error fetching release:", err.message);
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Error fetching latest release");
  }
});

server.listen(PORT, () => {
  console.log(`mxvoice-download listening on port ${PORT}`);
});
