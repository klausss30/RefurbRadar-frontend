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
      className="w-full min-w-0 max-w-full appearance-none rounded-2xl border border-white/70 bg-white/65 px-4 py-3 pr-10 text-sm font-semibold text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_28px_rgba(43,69,101,0.1)] outline-none backdrop-blur-2xl transition duration-200 focus:border-blue-300 focus:bg-white/85 focus:ring-4 focus:ring-blue-100/70 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_28px_rgba(0,0,0,0.28)] dark:focus:border-sky-400/50 dark:focus:bg-slate-900/70 dark:focus:ring-sky-400/10"
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





