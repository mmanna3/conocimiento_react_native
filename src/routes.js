const base = import.meta.env.BASE_URL;

export function joinPath(path) {
  return `${base}${path.replace(/^\//, '')}`;
}

export function docUrl(slug) {
  return joinPath(`doc/${slug}`);
}

export function indexUrl() {
  return base;
}

export function getRelativePath() {
  const pathname = location.pathname;
  if (base !== '/' && pathname.startsWith(base.replace(/\/$/, ''))) {
    return pathname.slice(base.replace(/\/$/, '').length) || '/';
  }
  return pathname;
}

export function getSlugFromPath() {
  const match = getRelativePath().match(/^\/doc\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function isIndexRoute() {
  const path = getRelativePath();
  return path === '/' || path === '/index.html';
}
