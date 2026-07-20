'use client';

import { regionsAndDistricts } from '@/lib/regions';
import { useLanguage } from '@/context/LanguageContext';

export default function FilterSidebar({ filters, onFilterChange, onApply, onReset }) {
  const { t } = useLanguage();
  const handleChange = (field, value) => {
    if (field === 'region') {
      onFilterChange({ ...filters, region: value, district: '' });
    } else {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-gray-200 animate-slideUp">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {t('filter_btn')}
        </h3>
      </div>

      {/* Date Picker */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          {t('filter_date')}
        </label>
        <input
          type="date"
          value={filters.date || ''}
          onChange={(e) => handleChange('date', e.target.value)}
          className="w-full bg-[#F8F7FF] border border-gray-200 text-gray-900 rounded-lg px-4 py-3
                     focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/20
                     transition-all duration-200 text-sm"
        />
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          {t('filter_price_range')}
        </label>
        <div className="space-y-3">
          <div className="relative">
            <input
              type="number"
              placeholder={t('filter_min_price')}
              value={filters.price_min || ''}
              onChange={(e) => handleChange('price_min', e.target.value)}
              className="w-full bg-[#F8F7FF] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 pr-14
                         focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/20
                         transition-all duration-200 text-sm placeholder:text-gray-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
              {t('currency_uzs')}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder={t('filter_max_price')}
              value={filters.price_max || ''}
              onChange={(e) => handleChange('price_max', e.target.value)}
              className="w-full bg-[#F8F7FF] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 pr-14
                         focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/20
                         transition-all duration-200 text-sm placeholder:text-gray-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
              {t('currency_uzs')}
            </span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">{t('filter_region')}</label>
          <select
            value={filters.region || ''}
            onChange={(e) => handleChange('region', e.target.value)}
            className="w-full bg-[#F8F7FF] border border-gray-200 text-gray-900 rounded-lg px-4 py-3
                       focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/20
                       transition-all duration-200 text-sm"
          >
            <option value="">{t('filter_all_regions')}</option>
            {Object.keys(regionsAndDistricts).map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">{t('filter_district')}</label>
          <select
            value={filters.district || ''}
            onChange={(e) => handleChange('district', e.target.value)}
            disabled={!filters.region}
            className="w-full bg-[#F8F7FF] border border-gray-200 text-gray-900 rounded-lg px-4 py-3
                       focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/20
                       transition-all duration-200 text-sm disabled:opacity-50"
          >
            <option value="">{t('filter_all_districts')}</option>
            {filters.region && regionsAndDistricts[filters.region]?.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">{t('filter_rating_min')}</label>
        <select
          value={filters.rating_min || ''}
          onChange={(e) => handleChange('rating_min', e.target.value)}
          className="w-full bg-[#F8F7FF] border border-gray-200 text-gray-900 rounded-lg px-4 py-3
                     focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/20
                     transition-all duration-200 text-sm"
        >
          <option value="">{t('service_all')}</option>
          <option value="5">{t('filter_rating_5')}</option>
          <option value="4">{t('filter_rating_4')}</option>
          <option value="3">{t('filter_rating_3')}</option>
          <option value="2">{t('filter_rating_2')}</option>
          <option value="1">{t('filter_rating_1')}</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={onApply}
          className="w-full bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-semibold py-3 px-4
                     rounded-lg transition-all duration-200 text-sm
                     hover:shadow-lg hover:shadow-[#7C3AED]/20 active:scale-[0.98]"
        >
          {t('filter_apply')}
        </button>
        <button
          onClick={onReset}
          className="w-full text-gray-400 hover:text-[#7C3AED] text-sm font-medium py-2
                     transition-colors duration-200"
        >
          {t('filter_reset')}
        </button>
      </div>
    </div>
  );
}
