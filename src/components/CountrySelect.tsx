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
      className="w-full min-w-0 max-w-full appearance-none rounded-2xl border border-white/70 bg-white/80 px-4 py-3 pr-10 text-sm font-semibold text-slate-800 shadow-[0_10px_25px_rgba(15,23,42,0.08)] outline-none transition duration-200 focus:border-teal-300 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600/60 dark:bg-slate-700/70 dark:text-slate-100 dark:shadow-[0_10px_25px_rgba(0,0,0,0.2)] dark:focus:border-emerald-400 dark:focus:ring-emerald-900/50"
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






