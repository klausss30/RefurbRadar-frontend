import { useEffect, useMemo, useRef, useState } from 'react';
import { getMarketDisplayCode, type Country } from '../config/countries';

interface CountrySelectProps {
  countries: Country[];
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCountries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return countries;

    return countries.filter((country) =>
      country.label.toLowerCase().includes(normalized)
      || country.code.toLowerCase().includes(normalized)
      || country.currency.toLowerCase().includes(normalized)
      || getMarketDisplayCode(country.code).toLowerCase().includes(normalized));
  }, [countries, query]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const selectCountry = (code: string) => {
    onSelect(code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        className="inline-flex h-10 items-center gap-1.5 border border-transparent px-3 text-xs font-black uppercase tracking-wider text-black transition hover:border-black hover:bg-[#ff3028] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change country or region"
      >
        {getMarketDisplayCode(selectedCode)}
        <svg className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(21rem,calc(100vw-2rem))] overflow-hidden border border-black bg-[#f2f1eb]/95 p-2 shadow-[7px_7px_0_rgba(17,17,15,0.2)] backdrop-blur-xl">
          <div className="relative mb-2">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country or region"
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-base outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:text-sm dark:border-white/10 dark:bg-slate-800 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-900"
            />
          </div>

          <div className="max-h-80 overflow-y-auto" role="listbox" aria-label="Country or region">
            {filteredCountries.map((country) => {
              const selected = country.code === selectedCode;
              return (
                <button
                  key={country.code}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectCountry(country.code)}
                  className={`flex w-full items-center justify-between border px-3 py-2.5 text-left text-sm transition ${
                    selected
                      ? 'border-black bg-black text-white'
                      : 'border-transparent text-black hover:border-black hover:bg-[#ff3028] hover:text-white'
                  }`}
                >
                  <span>
                    <span className="font-semibold">{country.label}</span>
                    <span className="ml-2 text-xs text-slate-400">{country.currency}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs font-semibold">
                    {getMarketDisplayCode(country.code)}
                    {selected && <span aria-hidden="true">✓</span>}
                  </span>
                </button>
              );
            })}
            {filteredCountries.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-slate-500">No matching market</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
