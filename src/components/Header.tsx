import CountrySelect from "./CountrySelect";
import type { Country as CountryConfig } from "../config/countries";
import { formatRelativeTime } from "../utils/format";
import logo from "../assets/logo.PNG";

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
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="RefurbRadar Logo"
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                RefurbRadar
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Apple Refurbished Products
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                Country or Region:
              </label>
              <CountrySelect
                countries={countries}
                selectedCode={selectedCountry.code}
                onSelect={onCountryChange}
                disabled={isDetecting}
              />
            </div>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading || isDetecting}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                title="Refresh cache data"
              >
                <svg
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
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
                {isLoading ? "Refreshing..." : "Refresh Cache"}
              </button>
            )}

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
