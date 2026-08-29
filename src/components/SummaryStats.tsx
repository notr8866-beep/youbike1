import React from 'react';
import { Bike, ParkingCircle, CheckCircle2, AlertTriangle, AlertCircle, Slash } from 'lucide-react';
import { YouBikeRawStation } from '../types';
import { getStationStatus } from '../utils/youbike';

interface SummaryStatsProps {
  stations: YouBikeRawStation[];
  allStationsCount: number;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ stations, allStationsCount }) => {
  // Compute aggregated stats
  let totalBikes = 0;
  let totalReturn = 0;
  let sufficientCount = 0;
  let lowCount = 0;
  let noBikesCount = 0;
  let stoppedCount = 0;

  for (const st of stations) {
    const bikes = Number(st.available_rent_bikes) || 0;
    const returns = Number(st.available_return_bikes) || 0;
    totalBikes += bikes;
    totalReturn += returns;

    const status = getStationStatus(st);
    if (status.type === 'STOPPED') stoppedCount++;
    else if (status.type === 'NO_BIKES') noBikesCount++;
    else if (status.type === 'LOW_BIKES') lowCount++;
    else sufficientCount++;
  }

  return (
    <div className="row g-2 g-md-3 mb-4">
      {/* Total Stations / Matching */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card border-2 border-slate-200 shadow-sm rounded-4 h-100 bg-white">
          <div className="card-body p-3">
            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">符合站點</div>
            <div className="d-flex align-items-baseline gap-1">
              <span className="fs-3 font-black fw-bold text-slate-900">{stations.length}</span>
              <span className="text-slate-400 text-xs fw-semibold">/ {allStationsCount}</span>
            </div>
            <div className="progress mt-2 bg-slate-100 rounded-pill" style={{ height: 5 }}>
              <div
                className="progress-bar bg-yellow-400 rounded-pill"
                role="progressbar"
                style={{ width: `${allStationsCount > 0 ? (stations.length / allStationsCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Bikes Total */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card border-2 border-yellow-300 shadow-sm rounded-4 h-100 bg-white">
          <div className="card-body p-3">
            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1 d-flex align-items-center gap-1">
              <Bike size={13} className="text-yellow-600" />
              <span>總可借車輛</span>
            </div>
            <div className="fs-3 font-black fw-bold text-slate-900">{totalBikes.toLocaleString()}</div>
            <div className="text-slate-400 text-xs mt-1">目前總車輛</div>
          </div>
        </div>
      </div>

      {/* Available Return Slots Total */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card border-2 border-slate-200 shadow-sm rounded-4 h-100 bg-white">
          <div className="card-body p-3">
            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1 d-flex align-items-center gap-1">
              <ParkingCircle size={13} className="text-slate-600" />
              <span>可還空位</span>
            </div>
            <div className="fs-3 font-black fw-bold text-slate-900">{totalReturn.toLocaleString()}</div>
            <div className="text-slate-400 text-xs mt-1">目前總空位</div>
          </div>
        </div>
      </div>

      {/* Sufficient (Green) */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card border-2 border-green-500 shadow-sm rounded-4 h-100 bg-white">
          <div className="card-body p-3">
            <div className="text-green-600 text-xs uppercase font-bold tracking-wider mb-1 d-flex align-items-center gap-1">
              <CheckCircle2 size={13} />
              <span>車輛充足</span>
            </div>
            <div className="fs-3 font-black fw-bold text-green-600">{sufficientCount}</div>
            <div className="text-slate-400 text-xs mt-1">可借 ≥ 5 台</div>
          </div>
        </div>
      </div>

      {/* Low Bikes (Orange/Yellow) */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card border-2 border-orange-400 shadow-sm rounded-4 h-100 bg-white">
          <div className="card-body p-3">
            <div className="text-orange-600 text-xs uppercase font-bold tracking-wider mb-1 d-flex align-items-center gap-1">
              <AlertTriangle size={13} />
              <span>車輛偏少</span>
            </div>
            <div className="fs-3 font-black fw-bold text-orange-600">{lowCount}</div>
            <div className="text-slate-400 text-xs mt-1">可借 1 ~ 4 台</div>
          </div>
        </div>
      </div>

      {/* No Bikes / Stopped (Red/Slate) */}
      <div className="col-6 col-md-4 col-lg-2">
        <div className="card border-2 border-red-500 shadow-sm rounded-4 h-100 bg-white">
          <div className="card-body p-3">
            <div className="text-red-600 text-xs uppercase font-bold tracking-wider mb-1 d-flex align-items-center gap-1">
              <AlertCircle size={13} />
              <span>無車 / 停運</span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 font-black fw-bold text-red-600">{noBikesCount}</span>
              {stoppedCount > 0 && (
                <span className="text-slate-400 text-xs">({stoppedCount} 停運)</span>
              )}
            </div>
            <div className="text-slate-400 text-xs mt-1">無車或暫停營運</div>
          </div>
        </div>
      </div>
    </div>
  );
};
