import Link from 'next/link';

export const runtime = 'edge';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0C] px-6 text-[#F4F4F5]">
      <div className="max-w-md text-center">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-[#E30613]">404</p>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm text-zinc-400">
          The page you are looking for may have moved or is no longer available.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-[#E30613] px-6 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
