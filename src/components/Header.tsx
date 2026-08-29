import React from 'react';
import { RefreshCw, MapPin, Bookmark, Bike, Clock, Sparkles } from 'lucide-react';

interface HeaderProps {
  totalStations: number;
  lastUpdatedText: string;
  isLoading: boolean;
  onRefresh: () => void;
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
  isLocating: boolean;
  favoriteCount: number;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  autoRefreshSeconds: number;
}

export const Header: React.FC<HeaderProps> = ({
  totalStations,
  lastUpdatedText,
  isLoading,
  onRefresh,
  userLocation,
  onRequestLocation,
  isLocating,
  favoriteCount,
  onlyFavorites,
  onToggleOnlyFavorites,
  autoRefreshSeconds,
}) => {
  return (
    <header className="vibrant-header text-slate-900 py-3 shadow-md sticky-top z-3">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Logo & Main App Title */}
          <div className="d-flex align-items-center gap-3">
            <div className="vibrant-logo-circle shadow-sm flex-shrink-0">
              <span className="text-yellow-400 fw-bold fs-4">U</span>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h1 className="h4 mb-0 fw-black text-black tracking-tight font-black" style={{ fontWeight: 900 }}>
                  臺北市 YouBike 即時查詢
                </h1>
                <span className="badge rounded-pill bg-black text-yellow-400 fw-bold px-2 py-1" style={{ fontSize: '0.72rem' }}>
                  2.0 Open Data
                </span>
              </div>
              <p className="text-slate-800 small mb-0 fw-medium opacity-90 d-none d-sm-block">
                臺北市交通局官方即時開放資料 · 每 30 秒自動更新
              </p>
            </div>
          </div>

          {/* Right-side Live Status & Quick Action Buttons */}
          <div className="d-flex align-items-center flex-wrap gap-2">
            {/* Live update status bubble */}
            <div className="d-none d-md-flex align-items-center gap-2 bg-white bg-opacity-70 px-3 py-1 rounded-pill border border-warning-subtle text-slate-900 small fw-semibold shadow-xs">
              <span className="vibrant-live-dot"></span>
              <span>
                系統更新：{lastUpdatedText || '載入中...'}
              </span>
              <span className="badge bg-black text-yellow-400 rounded-pill px-2">
                {autoRefreshSeconds}s
              </span>
            </div>

            {/* GPS Location Button */}
            <button
              type="button"
              className={`btn btn-sm ${
                userLocation
                  ? 'btn-dark text-yellow-400 fw-bold border-black'
                  : 'btn-outline-dark bg-white bg-opacity-40'
              } d-inline-flex align-items-center gap-1 rounded-pill px-3 shadow-xs`}
              onClick={onRequestLocation}
              disabled={isLocating}
              title={userLocation ? '已取得 GPS 定位，按距離排序' : '取得目前位置'}
            >
              <MapPin size={15} className={isLocating ? 'spinner-grow spinner-grow-sm' : ''} />
              <span className="d-none d-sm-inline fw-semibold">
                {isLocating ? '定位中...' : userLocation ? '已定位鄰近站' : '依目前位置找站'}
              </span>
              <span className="d-sm-none fw-semibold">{userLocation ? '已定位' : '定位'}</span>
            </button>

            {/* Favorites Filter Button */}
            <button
              type="button"
              className={`btn btn-sm ${
                onlyFavorites ? 'btn-black bg-black text-yellow-400 fw-bold' : 'btn-outline-dark bg-white bg-opacity-40'
              } d-inline-flex align-items-center gap-1 rounded-pill px-3 shadow-xs`}
              onClick={onToggleOnlyFavorites}
              title="只顯示常用收藏站點"
            >
              <Bookmark size={15} fill={onlyFavorites ? '#facc15' : 'none'} />
              <span className="fw-semibold">常用站點</span>
              {favoriteCount > 0 && (
                <span className={`badge rounded-pill ${onlyFavorites ? 'bg-yellow-400 text-black' : 'bg-black text-yellow-400'} ms-1`}>
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              className="btn btn-sm btn-dark bg-black text-white fw-bold d-inline-flex align-items-center gap-1 rounded-pill px-3 shadow-sm hover-dark"
              onClick={onRefresh}
              disabled={isLoading}
              title="立即強制同步資料"
            >
              <RefreshCw size={14} className={isLoading ? 'rotate-animation' : ''} />
              <span className="d-none d-sm-inline">{isLoading ? '同步中...' : '立即查詢'}</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary status row */}
        <div className="d-flex d-md-none justify-content-between align-items-center mt-2 pt-2 border-top border-dark border-opacity-10 small text-slate-900 fw-medium">
          <div className="d-flex align-items-center gap-1">
            <span className="vibrant-live-dot"></span>
            <span>更新：{lastUpdatedText || '載入中...'}</span>
          </div>
          <div>
            全區共 <strong>{totalStations}</strong> 個站點
          </div>
        </div>
      </div>
    </header>
  );
};
