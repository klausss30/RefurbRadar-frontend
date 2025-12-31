import CountrySelect from './CountrySelect';
import type { Country as CountryConfig } from '../config/countries';

interface HeaderProps {
  countries: CountryConfig[];
  selectedCountry: CountryConfig;
  onCountryChange: (code: string) => void;
  lastUpdated: Date | null;
  isDetecting?: boolean;
}

export default function Header({
  countries,
  selectedCountry,
  onCountryChange,
  lastUpdated,
  isDetecting = false,
}: HeaderProps) {
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
            
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

