import type { Country as CountryConfig } from '../config/countries';

interface CountrySelectProps {
  countries: CountryConfig[];
  selectedCode: string;
  onSelect: (code: string) => void;
  disabled?: boolean;
}

export default function CountrySelect({
  countries,
  selectedCode,
  onSelect,
  disabled = false,
}: CountrySelectProps) {
  return (
    <select
      value={selectedCode}
      onChange={(e) => onSelect(e.target.value)}
      disabled={disabled}
      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Select country"
    >
      {countries.map((country) => (
        <option key={country.code} value={country.code}>
          {country.label}
        </option>
      ))}
    </select>
  );
}




