import React, { useState } from 'react';
import { 
  Bike, 
  ParkingCircle, 
  MapPin, 
  Clock, 
  Bookmark, 
  Navigation, 
  Copy, 
  Check,
  ExternalLink 
} from 'lucide-react';
import { YouBikeRawStation } from '../types';
import { 
  getStationStatus, 
  cleanStationName, 
  formatTime, 
  formatDistance, 
  getGoogleMapsUrl 
} from '../utils/youbike';

interface StationCardProps {
  station: YouBikeRawStation;
  isFavorite: boolean;
  onToggleFavorite: (sno: string) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const status = getStationStatus(station);
  const { cleanName, version } = cleanStationName(station.sna);
  const updateTimeFormatted = formatTime(station.srcUpdateTime, station.mday);
  const mapUrl = getGoogleMapsUrl(station);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`臺北市 ${station.sarea} ${station.ar} (${cleanName})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bikes = Number(station.available_rent_bikes) || 0;
  const returns = Number(station.available_return_bikes) || 0;
  const total = Number(station.total) || (bikes + returns) || 1;
  const bikePercent = Math.min(100, Math.max(0, Math.round((bikes / total) * 100)));

  const isStopped = status.type === 'STOPPED';

  return (
    <div className="col-12 col-md-6 col-xl-4">
      <div
        className={`card vibrant-card h-100 shadow-sm ${status.borderClass} ${
          isStopped ? 'bg-slate-100 grayscale opacity-90' : 'bg-white'
        }`}
      >
        {/* Top-Right Corner Status Banner */}
        <div className={`status-corner-ribbon ${status.badgeClass} shadow-xs`}>
          {status.label}
        </div>

        {/* Card Header Content */}
        <div className="p-3 pb-2 pe-5">
          <div className="d-flex align-items-center gap-1 flex-wrap mb-1">
            {/* District Tag */}
            <span className="badge bg-black text-white fw-bold px-2 py-1" style={{ fontSize: '0.72rem' }}>
              {station.sarea}
            </span>

            {/* Version Tag */}
            <span className="badge bg-yellow-400 text-black fw-bold px-2 py-1" style={{ fontSize: '0.72rem' }}>
              YB {version}
            </span>

            {/* Distance badge if GPS located */}
            {station.distance !== undefined && station.distance !== Infinity && (
              <span className="badge bg-slate-100 text-slate-700 border border-slate-200 fw-semibold" style={{ fontSize: '0.72rem' }}>
                📍 {formatDistance(station.distance)}
              </span>
            )}
          </div>

          {/* Station Name */}
          <div className="d-flex align-items-center justify-content-between">
            <h3 className="h6 mb-0 fw-bold text-slate-900 text-truncate" title={station.sna} style={{ fontSize: '1.08rem' }}>
              {cleanName}
            </h3>
            {/* Favorite Bookmark Button */}
            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none p-1 text-slate-400 hover:text-yellow-500 flex-shrink-0"
              onClick={() => onToggleFavorite(station.sno)}
              title={isFavorite ? '取消收藏' : '加入常用站點'}
            >
              <Bookmark
                size={18}
                className={isFavorite ? 'text-yellow-500 fill-yellow-400' : 'text-slate-400'}
                fill={isFavorite ? '#facc15' : 'none'}
              />
            </button>
          </div>

          {/* Address */}
          <p className="text-xs text-slate-500 mb-0 text-truncate-2 mt-1" title={station.ar}>
            {station.ar || '臺北市'}
          </p>
        </div>

        {/* Card Body: Metric Stat Boxes */}
        <div className="p-3 pt-2 flex-grow-1 d-flex flex-column justify-content-between">
          <div className="row g-2 mb-3">
            {/* Available Rent Bikes Box */}
            <div className="col-6">
              <div className="metric-stat-box text-center h-100 d-flex flex-col justify-content-center">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
                  可借車輛
                </div>
                <div
                  className={`metric-number-bold ${
                    isStopped
                      ? 'text-slate-400'
                      : bikes === 0
                      ? 'text-red-600'
                      : bikes < 5
                      ? 'text-orange-600'
                      : 'text-slate-900'
                  }`}
                >
                  {isStopped ? '-' : bikes}
                </div>
                <div className="text-xs fw-semibold opacity-75 mt-1" style={{ fontSize: '0.72rem' }}>
                  {isStopped ? '暫停服務' : bikes === 0 ? '無車可用' : bikes < 5 ? '車輛偏少' : '車輛充足'}
                </div>
              </div>
            </div>

            {/* Available Return Docks Box */}
            <div className="col-6">
              <div className="metric-stat-box text-center h-100 d-flex flex-col justify-content-center">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
                  可還空位
                </div>
                <div className="metric-number-bold text-slate-900">
                  {isStopped ? '-' : returns}
                </div>
                <div className="text-xs fw-semibold opacity-75 text-slate-500 mt-1" style={{ fontSize: '0.72rem' }}>
                  {isStopped ? '暫停服務' : returns === 0 ? '無位可還' : `總格位 ${station.total || (bikes + returns)}`}
                </div>
              </div>
            </div>
          </div>

          {/* Availability Progress Indicator */}
          {!isStopped && (
            <div className="mb-2">
              <div className="progress bg-slate-100 rounded-pill overflow-hidden" style={{ height: 6 }}>
                <div
                  className={`progress-bar rounded-pill ${
                    bikes === 0 ? 'bg-red-500' : bikes < 5 ? 'bg-orange-400' : 'bg-green-500'
                  }`}
                  role="progressbar"
                  style={{ width: `${bikePercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Time & Sno */}
          <div className="d-flex align-items-center justify-content-between text-slate-400 text-xs pt-2 border-top border-slate-100 mt-auto">
            <span className="d-flex align-items-center gap-1">
              <Clock size={12} />
              更新：{updateTimeFormatted}
            </span>
            <span className="font-monospace text-slate-400">#{station.sno.slice(-4)}</span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="bg-slate-50 border-top border-slate-100 py-2 px-3">
          <div className="d-flex align-items-center justify-content-between gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary border-slate-200 text-slate-600 bg-white d-flex align-items-center gap-1 py-1 px-2 rounded-2"
              style={{ fontSize: '0.78rem' }}
              onClick={handleCopyAddress}
            >
              {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              <span>{copied ? '已複製' : '複製地址'}</span>
            </button>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-dark bg-black text-white fw-semibold d-flex align-items-center gap-1 py-1 px-3 rounded-2"
              style={{ fontSize: '0.78rem' }}
              title="在 Google 地圖開啟並導航"
            >
              <Navigation size={12} />
              <span>導航路線</span>
              <ExternalLink size={10} className="opacity-75" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
