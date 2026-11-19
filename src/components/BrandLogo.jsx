export default function BrandLogo({ className = 'h-12 w-12', showText = false, textClassName = '' }) {
  const logoSrc = '/logo.svg?v=3d-v2';
  if (!showText) {
    return <img src={logoSrc} alt="Prince Math Academy" className={className} />;
  }

  return (
    <span className={`flex items-center gap-3 ${textClassName}`}>
      <img src={logoSrc} alt="" className={className} />
      <span className="leading-none">
        <span className="block font-['Space_Grotesk',sans-serif] text-base font-extrabold tracking-tight text-white">
          Prince <span className="text-blue-300">Math</span>
        </span>
        <span className="block text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Academy
        </span>
      </span>
    </span>
  );
}
