'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import ServiceTabs from '@/components/ServiceTabs';
import FilterSidebar from '@/components/FilterSidebar';
import ServiceCard from '@/components/ServiceCard';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

function SkeletonCard() {
  return (
    <div className="bg-[#FFFFFF] rounded-2xl overflow-hidden border border-gray-200">
      <div className="aspect-[4/3] animate-shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-50 rounded-lg w-3/4 animate-shimmer" />
        <div className="h-4 bg-gray-50 rounded-lg w-1/2 animate-shimmer" />
        <div className="flex justify-between items-end pt-3 border-t border-gray-100">
          <div className="h-7 bg-gray-50 rounded-lg w-1/3 animate-shimmer" />
          <div className="h-9 bg-gray-50 rounded-lg w-1/4 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeType, setActiveType] = useState('TUYXONA');
  const [filters, setFilters] = useState({
    search: '',
    date: '',
    price_min: '',
    price_max: '',
    region: '',
    district: '',
    rating_min: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    date: '',
    price_min: '',
    price_max: '',
    region: '',
    district: '',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { type: activeType };
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.date) params.date = appliedFilters.date;
      if (appliedFilters.price_min) params.price_min = appliedFilters.price_min;
      if (appliedFilters.price_max) params.price_max = appliedFilters.price_max;
      if (appliedFilters.rating_min) params.rating_min = appliedFilters.rating_min;
      if (appliedFilters.region && appliedFilters.district) {
        params.location = `${appliedFilters.region}, ${appliedFilters.district}`;
      } else if (appliedFilters.region) {
        params.location = appliedFilters.region;
      }

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const res = await api.getServices(params);
      if (res.success) {
        setServices(res.data || []);
      } else {
        setServices([]);
      }
    } catch (err) {
      setError(t('load_services_error'));
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  }, [activeType, appliedFilters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setShowMobileFilters(false);
  };

  const handleResetFilters = () => {
    const empty = { search: '', date: '', price_min: '', price_max: '', region: '', district: '', rating_min: '' };
    setFilters(empty);
    setAppliedFilters(empty);
    setShowMobileFilters(false);
  };

  return (
    <div className="bg-[#F8F7FF] text-gray-900 min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero */}
      <HeroCarousel />

      {/* Main Content */}
      <main id="services" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar and Service Type Tabs */}
        <div className="mb-8 animate-fadeIn flex flex-col gap-6">
          {/* Search Section Above Navbar */}
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative w-full shadow-sm rounded-xl">
              <input 
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
                placeholder={t('search_placeholder')}
                className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-all text-sm sm:text-base shadow-sm hover:border-gray-300"
              />
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {filters.search && (
                <button 
                  onClick={() => {
                    setFilters({...filters, search: ''});
                    setAppliedFilters({...appliedFilters, search: ''});
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Service Types Navbar */}
          <ServiceTabs activeType={activeType} onTypeChange={setActiveType} />
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 bg-[#FFFFFF] text-gray-600 px-4 py-2.5 rounded-xl
                       border border-gray-200 hover:border-[#7C3AED]/30 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('filter_btn')}
            {Object.values(appliedFilters).some(v => v) && (
              <span className="bg-[#7C3AED] text-white text-xs font-bold w-5 h-5 rounded-full
                               flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <aside className={`
            ${showMobileFilters ? 'fixed inset-0 z-50 bg-black/30 flex items-end lg:items-start' : 'hidden'}
            lg:block lg:relative lg:bg-transparent w-full lg:w-80 flex-shrink-0
          `}>
            <div className={`
              w-full lg:w-80 lg:sticky lg:top-24
              ${showMobileFilters ? 'bg-[#F8F7FF] rounded-t-3xl lg:rounded-none p-4 pt-6 max-h-[85vh] overflow-auto' : ''}
            `}>
              {showMobileFilters && (
                <div className="flex justify-between items-center mb-4 lg:hidden">
                  <h3 className="text-lg font-semibold">{t('filter_btn')}</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-400 hover:text-gray-900"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Right Content - Service Cards */}
          <section className="flex-1 min-w-0">
            {/* Results info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">
                {loading ? t('loading') : t('results_found', { count: services.length })}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center mb-6 animate-fadeIn">
                <p className="text-red-400 mb-3">{t('error_fetching')}</p>
                <button
                  onClick={fetchServices}
                  className="text-sm text-[#7C3AED] hover:underline"
                >
                  {t('retry')}
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Services Grid */}
            {!loading && !error && services.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && services.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                <div className="w-24 h-24 rounded-full bg-[#FFFFFF] flex items-center justify-center mb-6
                                border border-gray-100">
                  <span className="text-4xl">{'🔍'}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('no_results')}
                </h3>
                <p className="text-gray-400 text-sm text-center max-w-md mb-6">
                  {t('no_results_desc')}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="text-[#7C3AED] hover:underline text-sm font-medium"
                >
                  {t('clear_filters')}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
