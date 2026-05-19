import CountrySelect from "./CountrySelect";
import ThemeToggle from "./ThemeToggle";
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
  activeFilterCount?: number;
  searchQuery?: string;
}

export default function Header({
  countries,
  selectedCountry,
  onCountryChange,
  lastUpdated,
  isDetecting = false,
  onRefresh,
  isLoading = false,
  activeFilterCount = 0,
  searchQuery = "",
}: HeaderProps) {
  const freshnessLabel = lastUpdated
    ? `Updated ${formatRelativeTime(lastUpdated)}`
    : "Waiting for feed";

  return (
    <header className="px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
      <div className="mx-auto max-w-7xl">
        <div className="glass-panel relative overflow-hidden rounded-[36px] px-5 py-6 sm:px-8 sm:py-7">
          <div className="float-slow absolute -right-10 -top-16 h-40 w-40 rounded-full bg-cyan-200/50 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-28 w-28 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <div className="relative">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-center">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="rounded-[28px] border border-white/70 bg-white/85 p-3 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
                  <img
                    src={logo}
                    alt="RefurbRadar Logo"
                    className="h-12 w-12 object-contain sm:h-16 sm:w-16"
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                    Apple Refurb Tracker
                  </div>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.6rem]">
                    RefurbRadar
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    Apple refurbished inventory by region.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <div className="min-w-0">
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    Country or Region
                  </label>
                  <div className="relative">
                    <CountrySelect
                      countries={countries}
                      selectedCode={selectedCountry.code}
                      onSelect={onCountryChange}
                      disabled={isDetecting}
                    />
                    <svg
                      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m19 9-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ThemeToggle />
                </div>

                {onRefresh && (
                  <div className="flex flex-col justify-center gap-2 items-start">
                    <button
                      onClick={onRefresh}
                      disabled={isLoading || isDetecting}
                      className="flex min-h-[3rem] items-center justify-center gap-2 rounded-[18px] bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                      title="Refresh cache data"
                    >
                      <svg
                        className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
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
                      {isLoading ? "Refreshing" : "Refresh"}
                    </button>
                    <div className="px-1 text-left text-xs font-medium text-slate-500">
                      {freshnessLabel}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/40 pt-3">
              {activeFilterCount > 0 && (
                <span className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
                  {activeFilterCount} active filter
                  {activeFilterCount === 1 ? "" : "s"}
                </span>
              )}
              {searchQuery.trim() && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                  {searchQuery.trim()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
