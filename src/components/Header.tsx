import { useState } from 'react';
import CountrySelect from './CountrySelect';
import type { Country } from '../config/countries';
import type { ProductGroup } from '../config/productGroups';
import logo from '../assets/logo.PNG';

interface HeaderProps {
  countries: Country[];
  productGroups: ProductGroup[];
  selectedCountry: Country;
  onCountryChange: (code: string) => void;
  activeGroup?: string | null;
  onNavigateHome: () => void;
  onNavigateGroup: (slug: string) => void;
  isDetecting?: boolean;
}

export default function Header({
  countries,
  productGroups,
  selectedCountry,
  onCountryChange,
  activeGroup = null,
  onNavigateHome,
  onNavigateGroup,
  isDetecting = false,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateGroup = (slug: string) => {
    onNavigateGroup(slug);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex shrink-0 items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="RefurbRadar home"
        >
          <img src={logo} alt="" className="h-8 w-8 object-contain" />
          <span className="hidden text-sm font-semibold tracking-tight text-slate-950 dark:text-white xl:inline">RefurbRadar</span>
        </button>

        <nav className="hidden items-center justify-center lg:flex" aria-label="Product categories">
          {productGroups.map((group) => (
            <button
              key={group.slug}
              type="button"
              onClick={() => navigateGroup(group.slug)}
              className={`relative rounded-lg px-3 py-2 text-sm transition ${
                activeGroup === group.slug
                  ? 'font-semibold text-slate-950 dark:text-white'
                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {group.label}
              {activeGroup === group.slug && (
                <span className="absolute inset-x-3 -bottom-[7px] h-0.5 rounded-full bg-slate-950 dark:bg-white" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <CountrySelect
            countries={countries}
            selectedCode={selectedCountry.code}
            onSelect={onCountryChange}
            disabled={isDetecting}
          />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 lg:hidden dark:text-slate-200 dark:hover:bg-white/10"
            aria-label="Open product menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-white/10 dark:bg-slate-950" aria-label="Mobile product categories">
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            {productGroups.map((group) => (
              <button
                key={group.slug}
                type="button"
                onClick={() => navigateGroup(group.slug)}
                className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeGroup === group.slug
                    ? 'bg-slate-100 text-slate-950 dark:bg-white/10 dark:text-white'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
