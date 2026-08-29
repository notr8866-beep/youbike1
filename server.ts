import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// YouBike 2.0 Open Data URL
const YOUBIKE_API_URL = "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";

interface CacheState {
  data: any[];
  fetchedAt: number;
  lastUpdateTime: string;
}

let cache: CacheState | null = null;
const CACHE_TTL_MS = 20 * 1000; // 20 seconds cache
let fetchingPromise: Promise<any[]> | null = null;

async function fetchYouBikeData(): Promise<{ data: any[]; fromCache: boolean; fetchedAt: number }> {
  const now = Date.now();

  // If cache is fresh, return cached data
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return { data: cache.data, fromCache: true, fetchedAt: cache.fetchedAt };
  }

  // Prevent multiple simultaneous requests to upstream Open Data API
  if (!fetchingPromise) {
    fetchingPromise = (async () => {
      try {
        const response = await fetch(YOUBIKE_API_URL, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
          },
          signal: AbortSignal.timeout(12000), // 12s timeout
        });

        if (!response.ok) {
          throw new Error(`Open Data API returned status: ${response.status} ${response.statusText}`);
        }

        const rawData = await response.json();
        if (!Array.isArray(rawData)) {
          throw new Error("Invalid response format from Open Data: expected array");
        }

        // Update in-memory cache
        cache = {
          data: rawData,
          fetchedAt: Date.now(),
          lastUpdateTime: new Date().toISOString(),
        };

        return rawData;
      } catch (err: any) {
        console.error("Error fetching YouBike Open Data:", err.message);
        // If we have stale cache, fall back to it
        if (cache && cache.data) {
          console.warn("Using stale cache due to fetch error");
          return cache.data;
        }
        throw err;
      } finally {
        fetchingPromise = null;
      }
    })();
  }

  const data = await fetchingPromise;
  return {
    data,
    fromCache: false,
    fetchedAt: cache ? cache.fetchedAt : Date.now(),
  };
}

// API Routes
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main YouBike Open Data API endpoint
app.get("/api/youbike", async (req, res) => {
  try {
    const force = req.query.force === "true";
    if (force) {
      cache = null; // Invalidate cache if user explicitly requested force refresh
    }

    const { data, fromCache, fetchedAt } = await fetchYouBikeData();

    // Extract unique districts
    const districtsSet = new Set<string>();
    for (const item of data) {
      if (item.sarea) {
        districtsSet.add(item.sarea);
      }
    }

    // Sort districts in standard Taipei order
    const districtOrder = [
      "中正區", "大同區", "中山區", "松山區", "大安區", "萬華區",
      "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區",
      "臺大公館校區"
    ];
    const districts = Array.from(districtsSet).sort((a, b) => {
      const idxA = districtOrder.indexOf(a);
      const idxB = districtOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b, "zh-Hant");
    });

    res.json({
      success: true,
      totalCount: data.length,
      fetchedAt,
      fromCache,
      districts,
      stations: data,
    });
  } catch (error: any) {
    res.status(502).json({
      success: false,
      message: "無法取得臺北市 YouBike 即時資料，請稍後再試。",
      error: error.message,
      totalCount: 0,
      stations: [],
      districts: [],
    });
  }
});

// Vite middleware and static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`臺北市 YouBike 即時查詢伺服器運行於 http://0.0.0.0:${PORT}`);
  });
}

startServer();
