import './styles.css';
import { renderDoc, renderIndex } from './views.js';

const app = document.getElementById('app');

function getSlugFromPath() {
  const match = location.pathname.match(/^\/doc\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function navigate() {
  const slug = getSlugFromPath();
  if (slug) {
    renderDoc(app, slug);
  } else {
    renderIndex(app);
  }
  window.scrollTo(0, 0);
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-nav]');
  if (!link || event.defaultPrevented) return;

  const url = new URL(link.href, location.origin);
  if (url.origin !== location.origin) return;

  event.preventDefault();
  history.pushState(null, '', url.pathname);
  navigate();
});

window.addEventListener('popstate', navigate);

navigate();
