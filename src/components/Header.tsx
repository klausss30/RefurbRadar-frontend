import { useState, useEffect, useRef } from 'react';
import CountrySelect from './CountrySelect';
import type { Country as CountryConfig } from '../config/countries';
import { getProductsCacheInfo } from '../hooks/useFeed';
import { formatRelativeTime } from '../utils/format';

interface HeaderProps {
  countries: CountryConfig[];
  selectedCountry: CountryConfig;
  onCountryChange: (code: string) => void;
  lastUpdated: Date | null;
  isDetecting?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function Header({
  countries,
  selectedCountry,
  onCountryChange,
  lastUpdated,
  isDetecting = false,
  onRefresh,
  isLoading = false,
}: HeaderProps) {
  const [showCacheInfo, setShowCacheInfo] = useState(false);
  const cacheInfoRef = useRef<HTMLDivElement>(null);
  const cacheInfo = getProductsCacheInfo(selectedCountry.code);

  // Close cache info when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cacheInfoRef.current && !cacheInfoRef.current.contains(event.target as Node)) {
        setShowCacheInfo(false);
      }
    }

    if (showCacheInfo) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCacheInfo]);

  const formatCacheSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatCacheAge = (age: number | null): string => {
    if (!age) return 'N/A';
    const minutes = Math.floor(age / (60 * 1000));
    const seconds = Math.floor((age % (60 * 1000)) / 1000);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">RefurbRadar</h1>
            <p className="text-sm text-gray-600 mt-1">
              Apple Refurbished Products
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                Country:
              </label>
              <CountrySelect
                countries={countries}
                selectedCode={selectedCountry.code}
                onSelect={onCountryChange}
                disabled={isDetecting}
              />
            </div>

            {/* Refresh Button and Cache Info */}
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isLoading || isDetecting}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  title="Refresh cache data"
                >
                  <svg
                    className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {isLoading ? 'Refreshing...' : 'Refresh Cache'}
                </button>
              )}

              {/* Cache Info Button */}
              <div className="relative" ref={cacheInfoRef}>
                <button
                  onClick={() => setShowCacheInfo(!showCacheInfo)}
                  className="px-2 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                  title="View cache information"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>

                {/* Cache Info Tooltip */}
                {showCacheInfo && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-20 text-sm">
                    <div className="font-semibold text-gray-900 mb-2">Cache Information</div>
                    <div className="space-y-1.5 text-gray-600">
                      <div className="flex justify-between">
                        <span>Storage Location:</span>
                        <span className="font-mono text-xs text-gray-500">localStorage</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cache Status:</span>
                        <span className={cacheInfo.exists ? 'text-green-600' : 'text-gray-400'}>
                          {cacheInfo.exists ? 'Cached' : 'Not cached'}
                        </span>
                      </div>
                      {cacheInfo.exists && (
                        <>
                          <div className="flex justify-between">
                            <span>Cache Age:</span>
                            <span>{formatCacheAge(cacheInfo.age)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cache Size:</span>
                            <span>{formatCacheSize(cacheInfo.size)}</span>
                          </div>
                        </>
                      )}
                      <div className="pt-2 mt-2 border-t border-gray-100 text-xs text-gray-500">
                        Cache Validity: 30 minutes<br />
                        Stored in browser local storage
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Cached {formatRelativeTime(lastUpdated)}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

