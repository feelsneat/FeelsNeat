'use client';

export const runtime = 'edge';

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#0A0A0C] px-6 text-[#F4F4F5]">
        <main className="max-w-md text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-[#E30613]">
            FeelsNeat
          </p>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Please try again. If the problem continues, come back in a moment.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-[#E30613] px-6 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
