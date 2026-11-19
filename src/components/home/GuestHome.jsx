import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Crest3D from './Crest3D';

export default function GuestHome() {
  return (
    <main className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#f3f5fb] px-[max(1rem,env(safe-area-inset-left))] py-3 text-[#0f1d4a] dark:bg-[#0a1226] dark:text-[#f1f3fb]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-36 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#d4a22f]/[0.06] blur-3xl dark:bg-[#e6b94a]/[0.05]" />
        <div className="absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-[#16377a]/[0.05] blur-3xl dark:bg-[#8aa7e5]/[0.06]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1120px] grid-cols-1 items-center gap-y-2 lg:grid-cols-2 lg:gap-x-14">
        <section className="order-1 mx-auto w-full max-w-[560px] lg:order-2" aria-label="Interactive academy crest">
          <Crest3D />
        </section>

        <section className="order-2 min-w-0 text-center lg:order-1 lg:text-left">
          <h1 className="m-0 font-normal">
            <span className="block font-['Cinzel',Georgia,serif] text-[clamp(3rem,10vw,6.2rem)] font-bold uppercase leading-none tracking-[0.03em] text-[#0f1d4a] dark:text-[#f1f3fb]">
              Prince
            </span>
            <span className="mt-3 flex items-center justify-center gap-3 font-sans text-[clamp(0.85rem,2.4vw,1.2rem)] font-semibold uppercase tracking-[0.26em] text-[#0f1d4a] dark:text-[#f1f3fb] lg:justify-start">
              <span aria-hidden="true" className="h-0.5 w-14 bg-[#b98a1f] lg:hidden" />
              Math Academy
              <span aria-hidden="true" className="h-0.5 w-14 bg-[#b98a1f] lg:w-24" />
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-[54ch] text-base leading-relaxed text-[#47527a] dark:text-[#aeb7d6] sm:text-lg lg:mx-0">
            Clear teaching, steady practice and real confidence in mathematics.
          </p>

          <nav aria-label="Account options" className="mt-4 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              to={createPageUrl('Register')}
              className="inline-flex min-h-12 min-w-40 items-center justify-center rounded-lg border-2 border-[#13245a] bg-[#13245a] px-6 py-3 text-sm font-bold tracking-wide text-[#ffffff] shadow-[0_8px_20px_rgba(15,29,74,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0b2456] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b98a1f] dark:border-[#e6b94a] dark:bg-[#e6b94a] dark:text-[#0a1226] dark:hover:bg-[#f0ca63]"
            >
              Sign up
            </Link>
            <Link
              to={createPageUrl('Login')}
              className="inline-flex min-h-12 min-w-40 items-center justify-center rounded-lg border-2 border-[#d3d9ea] bg-transparent px-6 py-3 text-sm font-bold tracking-wide text-[#0f1d4a] transition duration-200 hover:-translate-y-0.5 hover:border-[#b98a1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b98a1f] dark:border-[#26305a] dark:text-[#f1f3fb] dark:hover:border-[#e6b94a]"
            >
              Log in
            </Link>
          </nav>

          <Link
            to={createPageUrl('ForgotPassword')}
            className="mt-2 inline-flex rounded px-2 py-2 text-sm font-semibold text-[#47527a] underline decoration-[#b98a1f] decoration-2 underline-offset-4 transition hover:text-[#0f1d4a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b98a1f] dark:text-[#aeb7d6] dark:hover:text-white"
          >
            Forgot password?
          </Link>
        </section>
      </div>
    </main>
  );
}
