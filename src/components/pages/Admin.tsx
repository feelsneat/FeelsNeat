import { AdminDashboard } from '@/components/interactive/AdminDashboard';

export const runtime = 'edge';

interface AdminPageProps {
  userEmail: string | null;
  error?: string;
  email?: string;
}

export default async function AdminPage({ userEmail, error, email }: AdminPageProps) {

  // If not logged in, render the secure authentication prompt
  if (!userEmail) {
    return (
      <main className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 py-24 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm text-center">
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-black">
              FN
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              FeelsNeat CMS
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Authorized admin workspace. Sign in to edit website content.
            </p>
          </div>

          {error === 'unauthorized' && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400 text-left">
              Email <span className="font-semibold">{email}</span> is not authorized. Please log in with an allowed admin account.
            </div>
          )}

          {error && error !== 'unauthorized' && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400 text-left">
              Authentication failed. Please try again.
            </div>
          )}

          <div className="mt-8 space-y-4">
            <a
              href="/api/auth/login"
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.75 21.57,11.4 21.35,11.1z" fill="#4285F4" />
                  <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.57c-0.9,0.6 -2.07,0.98 -3.3,0.98c-2.35,0 -4.33,-1.58 -5.04,-3.72H2.9v2.66C4.38,18.7 7.94,20.6 12,20.6z" fill="#34A853" />
                  <path d="M6.96,13.1c-0.18,-0.55 -0.28,-1.13 -0.28,-1.73s0.1,-1.18 0.28,-1.73V7.08H2.9C2.3,8.28 1.96,9.65 1.96,11.1s0.34,2.82 0.94,4.02l3.16,-2.46C6.44,14.68 6.68,13.92 6.96,13.1z" fill="#FBBC05" />
                  <path d="M12,5.18c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,2.44 14.43,1.6 12,1.6C7.94,1.6 4.38,3.5 2.9,6.46l3.16,2.46c0.71,-2.14 2.69,-3.72 5.04,-3.72z" fill="#EA4335" />
                </g>
              </svg>
              <span>Sign in with Google</span>
            </a>

            {/* Development-mode bypass button */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 pt-4 border-t border-zinc-150 dark:border-zinc-800">
                <p className="text-xs text-zinc-400 mb-2">Development Tooling</p>
                <a
                  href="/api/auth/dev-login"
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Bypass OAuth (Dev Auto Sign-In)
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full bg-zinc-50 dark:bg-zinc-950 py-12 border-b border-zinc-100 dark:border-zinc-800/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdminDashboard userEmail={userEmail} />
      </div>
    </main>
  );
}
