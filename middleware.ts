// middleware.ts  – place at the project root

/**
 * 1.  Add BASIC_AUTH_USER and BASIC_AUTH_PASS
 *     for *every* environment (Development, Preview, Production)
 *     in the Vercel dashboard.
 *
 * 2.  Commit this file and push.
 *
 * 3.  All requests now prompt for the credentials once;
 *     the browser re-sends them automatically for subsequent assets.
 */

const USER = process.env.BASIC_AUTH_USER ?? '';
const PASS = process.env.BASIC_AUTH_PASS ?? '';

export const config = {
  // Protect everything except static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|js|css|woff|woff2|ttf|otf|webmanifest)).*)',],
};

export default function middleware(req: Request) {
  // Short-circuit if credentials are missing so you don’t lock yourself out
  if (!USER || !PASS) {
    console.warn('⚠️  BASIC_AUTH_USER/PASS not set; skipping auth!');
    return;
  }

  // ↳ Parse the Authorization header
  const authHeader = req.headers.get('authorization') ?? '';
  const [scheme, encoded] = authHeader.split(' ');
  if (scheme === 'Basic') {
    const [user, pass] = atob(encoded).split(':');
    if (user === USER && pass === PASS) {
      return;                      // ✅ correct creds – continue to the app
    }
  }

  // ↳ Otherwise, ask the browser for credentials
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Protected site"' },
  });
}
