import { docUrl } from './routes.js';

import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

marked.use({
  renderer: {
    link({ href, title, text }) {
      if (href?.endsWith('.md')) {
        const slug = href.replace(/^\.\//, '').replace(/\.md$/, '');
        const t = title ? ` title="${title}"` : '';
        return `<a href="${docUrl(slug)}" data-nav${t}>${text}</a>`;
      }
      const t = title ? ` title="${title}"` : '';
      const external =
        href?.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${t}${external}>${text}</a>`;
    },
  },
});

export function stripHorizontalRules(md) {
  return md.replace(/^---\s*$/gm, '').trim();
}

export function renderMarkdown(md) {
  const html = marked.parse(stripHorizontalRules(md));
  return html.replace(/<table\b/g, '<div class="table-wrap"><table').replace(/<\/table>/g, '</table></div>');
}

export function splitDocContent(content) {
  const lines = content.split('\n');
  let title = '';
  const introLines = [];
  const bodyLines = [];
  let phase = 'title';

  for (const line of lines) {
    if (phase === 'title') {
      if (/^#\s+/.test(line)) {
        title = line.replace(/^#\s+/, '').trim();
        phase = 'intro';
        continue;
      }
      continue;
    }

    if (phase === 'intro' && /^##\s+/.test(line)) {
      phase = 'body';
      bodyLines.push(line);
      continue;
    }

    if (phase === 'intro') {
      introLines.push(line);
    } else {
      bodyLines.push(line);
    }
  }

  return {
    title,
    intro: introLines.join('\n').trim(),
    body: bodyLines.join('\n').trim(),
  };
}

export function wrapQuestionSections(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstChild;
  const fragment = document.createDocumentFragment();
  let currentSection = null;
  let answerDiv = null;

  for (const node of [...root.childNodes]) {
    if (node.nodeName === 'H2') {
      currentSection = document.createElement('section');
      currentSection.className = 'question';
      currentSection.appendChild(node.cloneNode(true));
      answerDiv = document.createElement('div');
      answerDiv.className = 'answer';
      currentSection.appendChild(answerDiv);
      fragment.appendChild(currentSection);
      continue;
    }

    if (currentSection && answerDiv) {
      answerDiv.appendChild(node.cloneNode(true));
    } else {
      const intro = document.createElement('div');
      intro.className = 'doc-intro';
      intro.appendChild(node.cloneNode(true));
      fragment.appendChild(intro);
    }
  }

  const container = document.createElement('div');
  container.appendChild(fragment);
  return container.innerHTML;
}
