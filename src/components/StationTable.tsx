import React from 'react';
import { 
  Bookmark, 
  Navigation, 
} from 'lucide-react';
import { YouBikeRawStation } from '../types';
import { 
  getStationStatus, 
  cleanStationName, 
  formatTime, 
  formatDistance, 
  getGoogleMapsUrl 
} from '../utils/youbike';

interface StationTableProps {
  stations: YouBikeRawStation[];
  favorites: Set<string>;
  onToggleFavorite: (sno: string) => void;
}

export const StationTable: React.FC<StationTableProps> = ({
  stations,
  favorites,
  onToggleFavorite,
}) => {
  return (
    <div className="card border-2 border-slate-200 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-black text-white">
            <tr>
              <th scope="col" style={{ width: '45px' }} className="text-center bg-black text-white">#</th>
              <th scope="col" style={{ minWidth: '180px' }} className="bg-black text-white">站點名稱</th>
              <th scope="col" style={{ width: '100px' }} className="bg-black text-white">行政區</th>
              <th scope="col" style={{ width: '110px' }} className="text-center bg-black text-white">狀態</th>
              <th scope="col" style={{ width: '100px' }} className="text-center bg-black text-white">可借車輛</th>
              <th scope="col" style={{ width: '100px' }} className="text-center bg-black text-white">可還空位</th>
              <th scope="col" style={{ minWidth: '220px' }} className="bg-black text-white">地址</th>
              <th scope="col" style={{ width: '160px' }} className="bg-black text-white">資料更新時間</th>
              <th scope="col" style={{ width: '110px' }} className="text-center bg-black text-white">操作</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((st) => {
              const status = getStationStatus(st);
              const { cleanName } = cleanStationName(st.sna);
              const isFav = favorites.has(st.sno);
              const mapUrl = getGoogleMapsUrl(st);
              const updateTimeFormatted = formatTime(st.srcUpdateTime, st.mday);
              const bikes = Number(st.available_rent_bikes) || 0;
              const returns = Number(st.available_return_bikes) || 0;
              const isStopped = status.type === 'STOPPED';

              return (
                <tr key={st.sno} className={isStopped ? 'bg-slate-100 text-slate-400 opacity-75' : ''}>
                  {/* Favorite & Index */}
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 text-decoration-none"
                      onClick={() => onToggleFavorite(st.sno)}
                      title={isFav ? '取消收藏' : '加入收藏'}
                    >
                      <Bookmark
                        size={16}
                        className={isFav ? 'text-yellow-500 fill-yellow-400' : 'text-slate-300'}
                        fill={isFav ? '#facc15' : 'none'}
                      />
                    </button>
                  </td>

                  {/* Station Name & Distance */}
                  <td>
                    <div className="fw-bold text-slate-900 d-flex align-items-center gap-1">
                      <span className="badge bg-yellow-400 text-black fw-bold me-1" style={{ fontSize: '0.68rem' }}>
                        2.0
                      </span>
                      <span>{cleanName}</span>
                    </div>
                    {st.distance !== undefined && st.distance !== Infinity && (
                      <div className="text-slate-500 small">
                        📍 距離約 {formatDistance(st.distance)}
                      </div>
                    )}
                  </td>

                  {/* District */}
                  <td>
                    <span className="badge bg-slate-100 text-slate-800 border border-slate-200 fw-semibold">
                      {st.sarea}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="text-center">
                    <span className={`badge ${status.badgeClass} rounded-pill px-2 py-1 fw-bold text-xs`}>
                      {status.label}
                    </span>
                  </td>

                  {/* Available Bikes */}
                  <td className="text-center">
                    <span
                      className={`fw-black fs-5 px-2 py-1 rounded-2 font-black ${
                        isStopped
                          ? 'text-slate-400 bg-slate-100'
                          : bikes === 0
                          ? 'text-red-600 bg-red-50'
                          : bikes < 5
                          ? 'text-orange-600 bg-orange-50'
                          : 'text-green-700 bg-green-50'
                      }`}
                    >
                      {isStopped ? '-' : bikes}
                    </span>
                  </td>

                  {/* Available Returns */}
                  <td className="text-center">
                    <span
                      className={`fw-black fs-5 px-2 py-1 rounded-2 font-black ${
                        isStopped ? 'text-slate-400 bg-slate-100' : returns === 0 ? 'text-red-600 bg-red-50' : 'text-slate-900 bg-slate-100'
                      }`}
                    >
                      {isStopped ? '-' : returns}
                    </span>
                  </td>

                  {/* Address */}
                  <td>
                    <div className="small text-slate-500 text-truncate" style={{ maxWidth: '280px' }} title={st.ar}>
                      {st.ar}
                    </div>
                  </td>

                  {/* Update Time */}
                  <td>
                    <div className="small text-slate-500 font-monospace">
                      {updateTimeFormatted}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="text-center">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-dark bg-black text-white d-inline-flex align-items-center gap-1 py-1 px-2 rounded-2"
                      title="地圖導航"
                    >
                      <Navigation size={12} />
                      <span className="text-xs fw-semibold">導航</span>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
