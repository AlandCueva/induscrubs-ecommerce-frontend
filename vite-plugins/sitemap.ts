import {execFileSync} from 'node:child_process';
import type {Plugin} from 'vite';

// Must match the host the site actually serves: https://induscrubs.com
// 308-redirects to https://www.induscrubs.com.
const SITE_URL = (process.env.SITE_URL ?? 'https://www.induscrubs.com').replace(/\/+$/, '');

// The storefront is a single-URL SPA: catalog, product, checkout and legal
// views are React state, not routes, so "/" is the only indexable URL.
// Add a path here only once it is a real, directly-loadable route.
const ROUTES = ['/'];

// Date of the last commit that touched user-facing source. Returns null when
// git history is unavailable, in which case <lastmod> is omitted rather than invented.
function lastModified(): string | null {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', 'src', 'index.html', 'public'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : null;
  } catch {
    return null;
  }
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    apply: 'build',
    generateBundle() {
      const lastmod = lastModified();
      const urls = ROUTES.map(
        (route) =>
          `  <url>\n    <loc>${escapeXml(SITE_URL + route)}</loc>\n${
            lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''
          }  </url>`,
      ).join('\n');

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
    },
  };
}
