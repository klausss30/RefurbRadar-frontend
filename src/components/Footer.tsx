import logo from '../assets/logo.PNG';

export default function Footer() {
  return (
    <footer className="border-t border-black bg-black text-[#f2f1eb]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="h-9 w-9 object-contain grayscale invert" />
          <div>
            <p className="text-sm font-black uppercase tracking-[0.12em]">RefurbRadar</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-neutral-400">
              Apple refurbished inventory tracker
            </p>
          </div>
        </div>

        <div className="border-l-2 border-[#ff3028] pl-4 text-[11px] uppercase tracking-[0.1em] text-neutral-300 sm:text-right">
          <p className="font-bold text-white">Data sourced from Apple Store</p>
          <p className="mt-1 text-neutral-400">Products are purchased on Apple Store</p>
        </div>
      </div>
    </footer>
  );
}
