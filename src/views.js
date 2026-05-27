import { getAllDocs, getDocBySlug, groupDocsBySection } from './docs.js';
import { renderMarkdown, splitDocContent, wrapQuestionSections } from './markdown.js';
import { docUrl, indexUrl } from './routes.js';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderIndex(container) {
  const docs = getAllDocs();
  const sections = groupDocsBySection(docs);
  const totalQuestions = docs.reduce((sum, doc) => sum + doc.questions, 0);

  document.title = 'Entrevista React Native Senior / Arquitecto';

  container.innerHTML = `
    <div class="page page-index">
      <header>
        <h1>Entrevista React Native Senior / Arquitecto</h1>
        <p class="subtitle">Guía de estudio — preguntas y respuestas</p>
        <div class="stats">
          <div class="stat"><strong>${sections.length}</strong> secciones</div>
          <div class="stat"><strong>${docs.length}</strong> archivos</div>
          <div class="stat"><strong>~${totalQuestions}</strong> preguntas</div>
        </div>
      </header>
      ${sections
        .map(
          (section) => `
        <section class="index-section">
          <h2><span class="section-num">${Number(section.key)}</span> ${escapeHtml(section.title)}</h2>
          ${section.desc ? `<p class="section-desc">${escapeHtml(section.desc)}</p>` : ''}
          <ul class="files">
            ${section.docs
              .map(
                (doc) => `
              <li>
                <a href="${docUrl(doc.slug)}" data-nav>
                  <span class="file-name">${escapeHtml(doc.title)}</span>
                  <span class="file-meta">${doc.questions} preguntas · <span class="badge">${escapeHtml(doc.badge)}</span></span>
                </a>
              </li>`
              )
              .join('')}
          </ul>
        </section>`
        )
        .join('')}
      <footer>
        Contenido desde <code>CONOCIMIENTO-RN-en-MD/</code>. Editá los markdown y recargá el navegador.
        Serví con <code>npm run dev</code>.
      </footer>
    </div>`;
}

export function renderDoc(container, slug) {
  const doc = getDocBySlug(slug);

  if (!doc) {
    document.title = 'No encontrado';
    container.innerHTML = `
      <div class="page page-doc">
        <nav class="back"><a href="${indexUrl()}" data-nav>← Índice</a></nav>
        <header>
          <h1>Documento no encontrado</h1>
          <p class="section-note">No existe <code>${escapeHtml(slug)}</code> en CONOCIMIENTO-RN-en-MD.</p>
        </header>
      </div>`;
    return;
  }

  const { title, intro, body } = splitDocContent(doc.content);
  const introHtml = intro ? renderMarkdown(intro) : '';
  const bodyHtml = body ? wrapQuestionSections(renderMarkdown(body)) : '';

  document.title = `${title} — Guía RN`;

  container.innerHTML = `
    <div class="page page-doc">
      <nav class="back"><a href="${indexUrl()}" data-nav>← Índice</a></nav>
      <header>
        <span class="tag">${escapeHtml(doc.badge)}</span>
        <h1>${escapeHtml(title)}</h1>
        ${introHtml ? `<div class="doc-intro">${introHtml}</div>` : ''}
      </header>
      <article>${bodyHtml}</article>
    </div>`;
}
