// Prefixes an app-relative path with Astro's configured base path (e.g. "/DataCATS-site/")
// so links keep working when the site is served from a subpath, like a GitHub Pages
// project page. Pass paths without a leading slash: withBase('calendar'), withBase('').
export function withBase(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
