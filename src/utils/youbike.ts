import { YouBikeRawStation, StationStatusInfo, StationStatusType } from '../types';

/**
 * 依據規則判定站點狀態：
 * 1. act 不等於 1：停止營運 (STOPPED)
 * 2. available_rent_bikes 等於 0：無車可借 (NO_BIKES)
 * 3. available_rent_bikes 小於 5：車輛偏少 (LOW_BIKES)
 * 4. 其他：車輛充足 (SUFFICIENT)
 */
export function getStationStatus(station: YouBikeRawStation): StationStatusInfo {
  const isAct = String(station.act).trim() === '1';

  if (!isAct) {
    return {
      type: 'STOPPED',
      label: '停止營運',
      badgeClass: 'bg-slate-500 text-white',
      borderClass: 'border-2 border-slate-400',
      textClass: 'text-slate-500',
      bgLightClass: 'bg-slate-100',
    };
  }

  const bikes = Number(station.available_rent_bikes) || 0;

  if (bikes === 0) {
    return {
      type: 'NO_BIKES',
      label: '無車可用',
      badgeClass: 'bg-red-500 text-white',
      borderClass: 'border-2 border-red-500',
      textClass: 'text-red-600',
      bgLightClass: 'bg-red-50 text-red-700',
    };
  }

  if (bikes < 5) {
    return {
      type: 'LOW_BIKES',
      label: '車輛偏少',
      badgeClass: 'bg-orange-400 text-white',
      borderClass: 'border-2 border-orange-400',
      textClass: 'text-orange-600',
      bgLightClass: 'bg-orange-50 text-orange-700',
    };
  }

  return {
    type: 'SUFFICIENT',
    label: '車輛充足',
    badgeClass: 'bg-green-500 text-white',
    borderClass: 'border-2 border-green-500',
    textClass: 'text-green-600',
    bgLightClass: 'bg-green-50 text-green-700',
  };
}

/**
 * 清理站點名稱（移除 YouBike2.0_ 前綴）
 */
export function cleanStationName(name: string): { cleanName: string; version: string } {
  if (!name) return { cleanName: '', version: '2.0' };
  if (name.startsWith('YouBike2.0_')) {
    return {
      cleanName: name.replace('YouBike2.0_', ''),
      version: '2.0',
    };
  }
  if (name.startsWith('YouBike1.0_')) {
    return {
      cleanName: name.replace('YouBike1.0_', ''),
      version: '1.0',
    };
  }
  return {
    cleanName: name,
    version: '2.0',
  };
}

/**
 * 格式化時間 (mday 格式為 YYYYMMDDhhmmss 或 YYYY-MM-DD hh:mm:ss 或 ISO)
 */
export function formatTime(timeStr?: string, mdayStr?: string): string {
  const target = timeStr || mdayStr;
  if (!target) return '剛剛';

  if (target.includes('-') || target.includes('/')) {
    return target;
  }

  if (target.length === 14) {
    const y = target.substring(0, 4);
    const m = target.substring(4, 6);
    const d = target.substring(6, 8);
    const h = target.substring(8, 10);
    const min = target.substring(10, 12);
    const s = target.substring(12, 14);
    return `${y}/${m}/${d} ${h}:${min}:${s}`;
  }

  return target;
}

/**
 * 計算兩點經緯度直線距離（公尺）- Haversine 公式
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * 格式化距離顯示
 */
export function formatDistance(meters?: number): string {
  if (meters === undefined || meters === Infinity || isNaN(meters)) return '';
  if (meters < 1000) {
    return `${meters} 公尺`;
  }
  return `${(meters / 1000).toFixed(1)} 公里`;
}

/**
 * 取得 Google 地圖導航連結
 */
export function getGoogleMapsUrl(station: YouBikeRawStation): string {
  if (station.latitude && station.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    '臺北市 ' + station.sarea + ' ' + station.sna
  )}`;
}
