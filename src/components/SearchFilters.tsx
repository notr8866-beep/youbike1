import React from 'react';
import { Search, X, ArrowUpDown, Filter, RotateCcw, LayoutGrid, List } from 'lucide-react';
import { FilterState } from '../types';

interface SearchFiltersProps {
  filters: FilterState;
  districts: string[];
  onChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  totalFilteredCount: number;
  totalRawCount: number;
  viewMode: 'cards' | 'table';
  onChangeViewMode: (mode: 'cards' | 'table') => void;
  hasLocation: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  districts,
  onChange,
  onReset,
  totalFilteredCount,
  totalRawCount,
  viewMode,
  onChangeViewMode,
  hasLocation,
}) => {
  const isFiltered =
    filters.district !== 'ALL' ||
    filters.keyword.trim() !== '' ||
    filters.minAvailableBikes > 0 ||
    filters.maxDisplayCount !== 50 ||
    filters.statusFilter !== 'ALL' ||
    filters.sortBy !== 'default' ||
    filters.onlyFavorites;

  return (
    <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 mb-4 border border-slate-200">
      {/* Top Main Search Bar & District Dropdown */}
      <div className="row g-3 mb-3">
        {/* District Selector */}
        <div className="col-12 col-sm-4 col-lg-3">
          <label className="form-label text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="d-flex align-items-center gap-1">
              <Filter size={13} /> 選擇行政區
            </span>
          </label>
          <select
            className="form-select border-2 border-slate-200 rounded-3 py-2 px-3 focus:border-yellow-400 bg-slate-50 fw-semibold text-slate-800"
            value={filters.district}
            onChange={(e) => onChange({ district: e.target.value })}
            aria-label="選擇行政區"
          >
            <option value="ALL">全部行政區 ({totalRawCount} 站)</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Keyword Search Input */}
        <div className="col-12 col-sm-8 col-lg-5">
          <label className="form-label text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="d-flex align-items-center gap-1">
              <Search size={13} /> 關鍵字搜尋 (站名 / 地址)
            </span>
          </label>
          <div className="input-group">
            <span className="input-group-text bg-slate-50 border-2 border-end-0 border-slate-200 text-slate-400 rounded-start-3">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control border-2 border-start-0 border-slate-200 py-2 focus:border-yellow-400 bg-slate-50 fw-semibold text-slate-800"
              placeholder="搜尋站名或地址，例如：捷運公館站、公園、信義路..."
              value={filters.keyword}
              onChange={(e) => onChange({ keyword: e.target.value })}
            />
            {filters.keyword && (
              <button
                className="btn border-2 border-start-0 border-slate-200 bg-slate-50 text-slate-500 rounded-end-3"
                type="button"
                onClick={() => onChange({ keyword: '' })}
                title="清除關鍵字"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Min Available Bikes Setting */}
        <div className="col-6 col-sm-6 col-lg-2">
          <label className="form-label text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            最低可借車輛數
          </label>
          <select
            className="form-select border-2 border-slate-200 rounded-3 py-2 px-3 focus:border-yellow-400 bg-slate-50 fw-semibold text-slate-800"
            value={filters.minAvailableBikes}
            onChange={(e) => onChange({ minAvailableBikes: Number(e.target.value) })}
          >
            <option value={0}>不限 (0 台以上)</option>
            <option value={1}>至少 1 台</option>
            <option value={3}>至少 3 台</option>
            <option value={5}>至少 5 台 (充足)</option>
            <option value={10}>至少 10 台</option>
            <option value={20}>至少 20 台</option>
          </select>
        </div>

        {/* Max Display Count Setting */}
        <div className="col-6 col-sm-6 col-lg-2">
          <label className="form-label text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            最多顯示站點
          </label>
          <select
            className="form-select border-2 border-slate-200 rounded-3 py-2 px-3 focus:border-yellow-400 bg-slate-50 fw-semibold text-slate-800"
            value={filters.maxDisplayCount}
            onChange={(e) => onChange({ maxDisplayCount: Number(e.target.value) })}
          >
            <option value={20}>顯示 20 站</option>
            <option value={50}>顯示 50 站 (建議)</option>
            <option value={100}>顯示 100 站</option>
            <option value={200}>顯示 200 站</option>
            <option value={500}>顯示 500 站</option>
            <option value={0}>顯示全部站點</option>
          </select>
        </div>
      </div>

      {/* Secondary Controls: District Fast-Pills */}
      <div className="d-none d-md-block mb-3">
        <div className="d-flex align-items-center gap-1 flex-wrap overflow-auto custom-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider me-1">快速選區：</span>
          <button
            type="button"
            className={`vibrant-district-pill ${filters.district === 'ALL' ? 'active' : ''}`}
            onClick={() => onChange({ district: 'ALL' })}
          >
            全部 ({districts.length} 區)
          </button>
          {districts.map((d) => (
            <button
              key={d}
              type="button"
              className={`vibrant-district-pill ${filters.district === d ? 'active' : ''}`}
              onClick={() => onChange({ district: d })}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Tertiary Row: Status Filter, Sorting, View Toggle, Reset */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3 border-top border-slate-100">
        {/* Status Filter Chips */}
        <div className="d-flex align-items-center gap-1 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider me-1 d-none d-sm-inline">狀態：</span>
          <button
            type="button"
            className={`vibrant-filter-chip ${filters.statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => onChange({ statusFilter: 'ALL' })}
          >
            全部狀態
          </button>
          <button
            type="button"
            className={`vibrant-filter-chip ${filters.statusFilter === 'SUFFICIENT' ? 'active border-green-500 text-green-700 bg-green-50' : ''}`}
            onClick={() => onChange({ statusFilter: 'SUFFICIENT' })}
          >
            <span className="d-inline-block rounded-circle bg-green-500 me-1" style={{ width: 8, height: 8 }}></span>
            車輛充足 (≥5)
          </button>
          <button
            type="button"
            className={`vibrant-filter-chip ${filters.statusFilter === 'LOW_BIKES' ? 'active border-orange-400 text-orange-700 bg-orange-50' : ''}`}
            onClick={() => onChange({ statusFilter: 'LOW_BIKES' })}
          >
            <span className="d-inline-block rounded-circle bg-orange-400 me-1" style={{ width: 8, height: 8 }}></span>
            車輛偏少 (&lt;5)
          </button>
          <button
            type="button"
            className={`vibrant-filter-chip ${filters.statusFilter === 'NO_BIKES' ? 'active border-red-500 text-red-700 bg-red-50' : ''}`}
            onClick={() => onChange({ statusFilter: 'NO_BIKES' })}
          >
            <span className="d-inline-block rounded-circle bg-red-500 me-1" style={{ width: 8, height: 8 }}></span>
            無車可用 (0)
          </button>
          <button
            type="button"
            className={`vibrant-filter-chip ${filters.statusFilter === 'STOPPED' ? 'active border-slate-400 text-slate-700 bg-slate-100' : ''}`}
            onClick={() => onChange({ statusFilter: 'STOPPED' })}
          >
            <span className="d-inline-block rounded-circle bg-slate-500 me-1" style={{ width: 8, height: 8 }}></span>
            停止營運
          </button>
        </div>

        {/* Right side controls: Sorting, View Mode & Reset */}
        <div className="d-flex align-items-center gap-2 ms-auto flex-wrap">
          {/* Sorting */}
          <div className="d-flex align-items-center gap-1">
            <ArrowUpDown size={14} className="text-slate-400 d-none d-sm-inline" />
            <select
              className="form-select form-select-sm border-2 border-slate-200 rounded-3 fw-semibold bg-slate-50 text-slate-700"
              style={{ width: 'auto', minWidth: '135px' }}
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value as any })}
            >
              <option value="default">預設排序</option>
              {hasLocation && <option value="distance">📍 依距離最近</option>}
              <option value="bikes_desc">可借車輛最多</option>
              <option value="bikes_asc">可借車輛最少</option>
              <option value="return_desc">可還空位最多</option>
              <option value="name_asc">站名筆畫排序</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="btn-group btn-group-sm border-2 border-slate-200 rounded-3 overflow-hidden" role="group">
            <button
              type="button"
              className={`btn ${viewMode === 'cards' ? 'btn-dark bg-black text-white fw-bold' : 'btn-light bg-white text-slate-600'}`}
              onClick={() => onChangeViewMode('cards')}
              title="卡片檢視"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'table' ? 'btn-dark bg-black text-white fw-bold' : 'btn-light bg-white text-slate-600'}`}
              onClick={() => onChangeViewMode('table')}
              title="列表表格"
            >
              <List size={15} />
            </button>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger fw-bold rounded-3 d-flex align-items-center gap-1 px-2"
              onClick={onReset}
              title="重設所有篩選條件"
            >
              <RotateCcw size={13} />
              <span>重設</span>
            </button>
          )}
        </div>
      </div>

      {/* Result Count Notice */}
      <div className="mt-2 text-slate-500 small d-flex justify-content-between align-items-center">
        <div>
          目前顯示：<strong className="text-black fw-bold">{totalFilteredCount}</strong> 個站點
          {filters.maxDisplayCount > 0 && totalFilteredCount >= filters.maxDisplayCount && (
            <span className="text-slate-400 ms-1">
              (上限 {filters.maxDisplayCount} 筆，可調整「最多顯示站點」載入更多)
            </span>
          )}
        </div>
        {filters.onlyFavorites && (
          <span className="badge bg-yellow-400 text-black fw-bold">
            ★ 僅顯示常用收藏站點
          </span>
        )}
      </div>
    </div>
  );
};
