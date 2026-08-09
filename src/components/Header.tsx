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
    <header className="punk-header sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex shrink-0 items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#ff3028]"
          aria-label="RefurbRadar home"
        >
          <img src={logo} alt="" className="h-8 w-8 grayscale contrast-200 object-contain" />
        </button>

        <nav className="hidden items-center justify-center xl:flex" aria-label="Product categories">
          {productGroups.map((group) => (
            <button
              key={group.slug}
              type="button"
              onClick={() => navigateGroup(group.slug)}
              className={`relative px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
                activeGroup === group.slug
                  ? 'text-black'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              {group.label}
              {activeGroup === group.slug && (
                <span className="absolute inset-x-3 -bottom-[7px] h-0.5 bg-[#ff3028]" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <span className="px-1 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500 sm:px-2 sm:text-[11px]">
            Apple Store
          </span>
          <CountrySelect
            countries={countries}
            selectedCode={selectedCountry.code}
            onSelect={onCountryChange}
            disabled={isDetecting}
          />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center border border-transparent text-black transition hover:border-black hover:bg-[#ff3028] hover:text-white xl:hidden"
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

      <nav
        className={`absolute inset-x-0 top-full border-t border-black bg-[#f2f1eb]/95 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-[opacity,transform,visibility] duration-300 ease-out xl:hidden ${
          mobileMenuOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible pointer-events-none -translate-y-3 opacity-0'
        }`}
        aria-label="Mobile product categories"
        aria-hidden={!mobileMenuOpen}
      >
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            {productGroups.map((group) => (
              <button
                key={group.slug}
                type="button"
                onClick={() => navigateGroup(group.slug)}
                className={`border px-4 py-3 text-left text-xs font-bold uppercase tracking-wider transition ${
                  activeGroup === group.slug
                    ? 'border-black bg-black text-white'
                    : 'border-transparent text-black hover:border-black hover:bg-[#ff3028] hover:text-white'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
      </nav>
    </header>
  );
}
