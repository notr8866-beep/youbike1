export default async function handler(req: any, res: any) {
  const YOUBIKE_API_URL =
    "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";

  try {
    const response = await fetch(YOUBIKE_API_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      throw new Error(`Open Data API 回應狀態: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format from Open Data: expected array");
    }

    // 取得所有行政區
    const districtsSet = new Set<string>();
    data.forEach((item: any) => {
      if (item.sarea) districtsSet.add(item.sarea);
    });

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

    // 快取 30 秒
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

    return res.status(200).json({
      success: true,
      totalCount: data.length,
      fetchedAt: Date.now(),
      fromCache: false,
      districts,
      stations: data,
    });
  } catch (error: any) {
    return res.status(502).json({
      success: false,
      message: "無法取得臺北市 YouBike 即時資料",
      error: error.message,
      totalCount: 0,
      stations: [],
      districts: [],
    });
  }
}
