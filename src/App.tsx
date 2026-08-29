import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Bike, 
  AlertCircle, 
  ExternalLink, 
} from 'lucide-react';
import { YouBikeRawStation, FilterState, ApiResponse } from './types';
import { Header } from './components/Header';
import { SearchFilters } from './components/SearchFilters';
import { SummaryStats } from './components/SummaryStats';
import { StationCard } from './components/StationCard';
import { StationTable } from './components/StationTable';
import { calculateDistance, getStationStatus } from './utils/youbike';

const AUTO_REFRESH_INTERVAL = 30; // seconds

export default function App() {
  const [stations, setStations] = useState<YouBikeRawStation[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<number>(AUTO_REFRESH_INTERVAL);

  // User location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('youbike_favs_v2');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // View mode
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    district: 'ALL',
    keyword: '',
    minAvailableBikes: 0,
    maxDisplayCount: 50,
    statusFilter: 'ALL',
    sortBy: 'default',
    onlyFavorites: false,
  });

  // Save favorites to localStorage
  const toggleFavorite = useCallback((sno: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(sno)) {
        next.delete(sno);
      } else {
        next.add(sno);
      }
      try {
        localStorage.setItem('youbike_favs_v2', JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error('Failed to save favorites to localStorage', e);
      }
      return next;
    });
  }, []);

  // Fetch data from Node.js / Vercel backend (/api/youbike) with automatic direct Open Data fallback
  const fetchData = useCallback(async (force = false) => {
    try {
      if (stations.length === 0) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setErrorMessage(null);

      const url = force ? '/api/youbike?force=true' : '/api/youbike';
      let res: Response | null = null;
      let usedFallback = false;

      try {
        res = await fetch(url);
      } catch (networkErr) {
        console.warn('Backend /api/youbike unreachable, trying direct Open Data fallback...', networkErr);
      }
      
      // If backend returned 404 or failed, fallback directly to Taipei Open Data blob
      if (!res || !res.ok) {
        usedFallback = true;
        console.info('Backend returned non-200 or 404, fetching directly from Taipei Open Data...');
        const OPEN_DATA_URL = 'https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json';
        res = await fetch(OPEN_DATA_URL, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(`開放資料伺服器回應異常 (${res.status})`);
        }

        const rawStations: YouBikeRawStation[] = await res.json();
        if (!Array.isArray(rawStations) || rawStations.length === 0) {
          throw new Error('未取得任何站點資料');
        }

        // 計算行政區
        const districtsSet = new Set<string>();
        rawStations.forEach((st) => {
          if (st.sarea) districtsSet.add(st.sarea);
        });

        const districtOrder = [
          '中正區', '大同區', '中山區', '松山區', '大安區', '萬華區',
          '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區',
          '臺大公館校區'
        ];

        const sortedDistricts = Array.from(districtsSet).sort((a, b) => {
          const idxA = districtOrder.indexOf(a);
          const idxB = districtOrder.indexOf(b);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b, 'zh-Hant');
        });

        setStations(rawStations);
        setDistricts(sortedDistricts);
        setLastFetchedAt(Date.now());
        setAutoRefreshCountdown(AUTO_REFRESH_INTERVAL);
        return;
      }

      const data: ApiResponse = await res.json();
      if (!data.success && (!data.stations || data.stations.length === 0)) {
        throw new Error(data.message || '無法取得 YouBike 資料');
      }

      setStations(data.stations || []);
      if (data.districts && data.districts.length > 0) {
        setDistricts(data.districts);
      }
      setLastFetchedAt(data.fetchedAt || Date.now());
      setAutoRefreshCountdown(AUTO_REFRESH_INTERVAL);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMessage(err.message || '連線至伺服器失敗，請檢查網路或稍後再試。');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [stations.length]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchData();
          return AUTO_REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchData]);

  // Handle GPS location request
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('您的瀏覽器不支援定位功能。');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
        setFilters((f) => ({ ...f, sortBy: 'distance' }));
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsLocating(false);
        alert('無法取得您的位置資訊，請確認已授權瀏覽器定位權限。');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Filter updates
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      district: 'ALL',
      keyword: '',
      minAvailableBikes: 0,
      maxDisplayCount: 50,
      statusFilter: 'ALL',
      sortBy: userLocation ? 'distance' : 'default',
      onlyFavorites: false,
    });
  }, [userLocation]);

  // Process & filter stations
  const processedStations = useMemo(() => {
    let result = stations;

    // Attach distances if user location is known
    if (userLocation) {
      result = result.map((st) => ({
        ...st,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          Number(st.latitude),
          Number(st.longitude)
        ),
      }));
    }

    // 1. District filter
    if (filters.district && filters.district !== 'ALL') {
      result = result.filter((st) => st.sarea === filters.district);
    }

    // 2. Keyword filter (站名或地址)
    const kw = filters.keyword.trim().toLowerCase();
    if (kw) {
      result = result.filter(
        (st) =>
          st.sna.toLowerCase().includes(kw) ||
          st.ar.toLowerCase().includes(kw) ||
          st.sarea.toLowerCase().includes(kw) ||
          (st.snaen && st.snaen.toLowerCase().includes(kw))
      );
    }

    // 3. Minimum available bikes filter (最低可借車輛數)
    if (filters.minAvailableBikes > 0) {
      result = result.filter(
        (st) => Number(st.available_rent_bikes) >= filters.minAvailableBikes
      );
    }

    // 4. Status filter
    if (filters.statusFilter && filters.statusFilter !== 'ALL') {
      result = result.filter((st) => {
        const status = getStationStatus(st);
        return status.type === filters.statusFilter;
      });
    }

    // 5. Only Favorites filter
    if (filters.onlyFavorites) {
      result = result.filter((st) => favorites.has(st.sno));
    }

    // 6. Sorting
    result = [...result];
    switch (filters.sortBy) {
      case 'distance':
        result.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        break;
      case 'bikes_desc':
        result.sort((a, b) => Number(b.available_rent_bikes) - Number(a.available_rent_bikes));
        break;
      case 'bikes_asc':
        result.sort((a, b) => Number(a.available_rent_bikes) - Number(b.available_rent_bikes));
        break;
      case 'return_desc':
        result.sort((a, b) => Number(b.available_return_bikes) - Number(a.available_return_bikes));
        break;
      case 'name_asc':
        result.sort((a, b) => a.sna.localeCompare(b.sna, 'zh-Hant'));
        break;
      default:
        break;
    }

    return result;
  }, [stations, userLocation, filters, favorites]);

  // Slice results according to maxDisplayCount (0 means unlimited)
  const displayedStations = useMemo(() => {
    if (filters.maxDisplayCount && filters.maxDisplayCount > 0) {
      return processedStations.slice(0, filters.maxDisplayCount);
    }
    return processedStations;
  }, [processedStations, filters.maxDisplayCount]);

  // Formatted last updated text
  const lastUpdatedText = useMemo(() => {
    if (!lastFetchedAt) return '';
    const date = new Date(lastFetchedAt);
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  }, [lastFetchedAt]);

  return (
    <div className="min-vh-100 d-flex flex-column bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <Header
        totalStations={stations.length}
        lastUpdatedText={lastUpdatedText}
        isLoading={isRefreshing || isLoading}
        onRefresh={() => fetchData(true)}
        userLocation={userLocation}
        onRequestLocation={handleRequestLocation}
        isLocating={isLocating}
        favoriteCount={favorites.size}
        onlyFavorites={filters.onlyFavorites}
        onToggleOnlyFavorites={() =>
          setFilters((f) => ({ ...f, onlyFavorites: !f.onlyFavorites }))
        }
        autoRefreshSeconds={autoRefreshCountdown}
      />

      {/* Main Content Area */}
      <main className="container-fluid px-3 px-lg-4 py-4 flex-grow-1">
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="alert alert-danger border-2 border-red-500 rounded-3 d-flex align-items-center justify-content-between shadow-sm mb-4" role="alert">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <div>
                <strong>資料取得異常：</strong> {errorMessage}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-dark bg-black text-white fw-bold px-3"
              onClick={() => fetchData(true)}
            >
              重新整理
            </button>
          </div>
        )}

        {/* Real-time Summary Stats Bar */}
        {!isLoading && stations.length > 0 && (
          <SummaryStats
            stations={processedStations}
            allStationsCount={stations.length}
          />
        )}

        {/* Filter Controls Bar */}
        <SearchFilters
          filters={filters}
          districts={districts}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          totalFilteredCount={processedStations.length}
          totalRawCount={stations.length}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          hasLocation={!!userLocation}
        />

        {/* Results Header Bar */}
        {!isLoading && displayedStations.length > 0 && (
          <div className="d-flex align-items-center justify-content-between mb-3 px-1">
            <h2 className="h6 fw-bold mb-0 text-slate-900 d-flex align-items-center">
              <span className="d-inline-block rounded-pill bg-yellow-400 me-2" style={{ width: 6, height: 20 }}></span>
              站點搜尋結果 (已顯示 {displayedStations.length} 站)
            </h2>
            <span className="text-xs text-slate-400 font-monospace">
              最後同步：{lastUpdatedText}
            </span>
          </div>
        )}

        {/* Content View: Loading, Empty, Cards, or Table */}
        {isLoading ? (
          <div className="text-center py-5 my-5">
            <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">載入中...</span>
            </div>
            <h2 className="h5 fw-bold text-slate-900 mt-3">正在載入臺北市 YouBike 2.0 即時資料...</h2>
            <p className="text-slate-500 small">已連線至臺北市政府 Open Data 伺服器</p>
          </div>
        ) : displayedStations.length === 0 ? (
          <div className="bg-white rounded-4 shadow-sm p-5 text-center my-4 border-2 border-slate-200">
            <div className="text-slate-300 mb-3">
              <Bike size={54} />
            </div>
            <h2 className="h5 fw-bold text-slate-900 mb-2">查無符合條件的 YouBike 站點</h2>
            <p className="text-slate-500 small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
              請嘗試放寬搜尋關鍵字、選擇其他行政區，或調降「最低可借車輛數」門檻。
            </p>
            <button
              type="button"
              className="btn btn-dark bg-black text-white fw-bold px-4 py-2 rounded-3 shadow-sm"
              onClick={handleResetFilters}
            >
              清除所有篩選條件
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="row g-3">
            {displayedStations.map((station) => (
              <StationCard
                key={station.sno}
                station={station}
                isFavorite={favorites.has(station.sno)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <StationTable
            stations={displayedStations}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* Pagination Notice when truncated */}
        {!isLoading &&
          filters.maxDisplayCount > 0 &&
          processedStations.length > filters.maxDisplayCount && (
            <div className="text-center py-4 mt-3">
              <div className="card bg-white border-2 border-slate-200 shadow-sm p-3 d-inline-block rounded-4">
                <span className="text-slate-600 small me-3">
                  目前已顯示前 <strong>{displayedStations.length}</strong> 筆，尚有{' '}
                  <strong>{processedStations.length - displayedStations.length}</strong> 個符合站點
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-dark bg-black text-white fw-bold rounded-3 px-3 py-1"
                  onClick={() => handleFilterChange({ maxDisplayCount: 0 })}
                >
                  載入全部站點 ({processedStations.length})
                </button>
              </div>
            </div>
          )}
      </main>

      {/* Footer in Vibrant Theme Slate-900 Style */}
      <footer className="bg-slate-900 text-slate-400 px-3 px-lg-4 py-3 mt-auto border-top border-slate-800">
        <div className="container-fluid px-0 d-flex flex-wrap justify-content-between align-items-center gap-3 text-xs">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-white">臺北市 YouBike 即時查詢</span>
            <span>·</span>
            <span>資料來源：臺北市政府 Open Data (YouBike 2.0 即時資訊)</span>
          </div>

          {/* Color Legend Indicators */}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="d-flex align-items-center">
              <span className="d-inline-block rounded-circle bg-green-500 me-1" style={{ width: 8, height: 8 }}></span>
              <span className="text-slate-300">充足 (&ge;5)</span>
            </span>
            <span className="d-flex align-items-center">
              <span className="d-inline-block rounded-circle bg-orange-400 me-1" style={{ width: 8, height: 8 }}></span>
              <span className="text-slate-300">偏少 (&lt;5)</span>
            </span>
            <span className="d-flex align-items-center">
              <span className="d-inline-block rounded-circle bg-red-500 me-1" style={{ width: 8, height: 8 }}></span>
              <span className="text-slate-300">無車 (0)</span>
            </span>
            <span className="d-flex align-items-center">
              <span className="d-inline-block rounded-circle bg-slate-500 me-1" style={{ width: 8, height: 8 }}></span>
              <span className="text-slate-300">停運</span>
            </span>
            <a
              href="https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white text-decoration-none d-inline-flex align-items-center gap-1 ms-2"
            >
              <span>JSON 原始資料</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
