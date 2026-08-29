export interface YouBikeRawStation {
  sno: string;
  sna: string;
  sarea: string;
  mday: string;
  ar: string;
  sareaen?: string;
  snaen?: string;
  aren?: string;
  act: string | number;
  srcUpdateTime?: string;
  updateTime?: string;
  total?: number;
  available_rent_bikes: number;
  latitude: number;
  longitude: number;
  available_return_bikes: number;
  distance?: number; // Calculated distance in meters
}

export type StationStatusType = 'STOPPED' | 'NO_BIKES' | 'LOW_BIKES' | 'SUFFICIENT';

export interface StationStatusInfo {
  type: StationStatusType;
  label: string;
  badgeClass: string;
  borderClass: string;
  textClass: string;
  bgLightClass: string;
}

export interface FilterState {
  district: string;
  keyword: string;
  minAvailableBikes: number;
  maxDisplayCount: number;
  statusFilter: string;
  sortBy: 'default' | 'bikes_desc' | 'bikes_asc' | 'return_desc' | 'name_asc' | 'distance';
  onlyFavorites: boolean;
}

export interface ApiResponse {
  success: boolean;
  totalCount: number;
  fetchedAt: number;
  fromCache: boolean;
  districts: string[];
  stations: YouBikeRawStation[];
  message?: string;
  error?: string;
}
