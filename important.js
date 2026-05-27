/**
 * Agrega a #important-questions todas las section.question.important
 * de los archivos listados en PREGUNTAS.html (sin duplicar contenido).
 * Requiere servir el sitio por HTTP (no file://).
 */
(function () {
  const EXCLUDE = new Set(['PREGUNTAS.html', 'Preguntas-Importantes.html']);

  async function getStudyFiles() {
    const res = await fetch('PREGUNTAS.html');
    if (!res.ok) throw new Error('No se pudo leer el índice');
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const files = [];
    for (const a of doc.querySelectorAll('ul.files a[href]')) {
      const href = a.getAttribute('href');
      if (href && href.endsWith('.html') && !EXCLUDE.has(href)) {
        files.push(href);
      }
    }
    return files;
  }

  function questionNumber(section) {
    const match = section.querySelector('h2')?.textContent?.match(/^(\d+)\./);
    return match ? match[1] : '';
  }

  async function loadImportantQuestions() {
    const container = document.getElementById('important-questions');
    const status = document.getElementById('important-status');
    if (!container) return;

    try {
      const files = await getStudyFiles();
      let total = 0;

      for (const file of files) {
        const res = await fetch(file);
        if (!res.ok) continue;

        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        const title =
          doc.querySelector('header h1')?.textContent?.trim() || file;
        const sections = doc.querySelectorAll('section.question.important');

        for (const section of sections) {
          const block = section.cloneNode(true);
          const num = questionNumber(section);

          const source = document.createElement('p');
          source.className = 'important-source';
          const link = document.createElement('a');
          link.href = file;
          link.textContent = title;
          source.append('De ', link);
          if (num) source.append(` · pregunta ${num}`);

          block.insertBefore(source, block.firstChild);
          container.appendChild(block);
          total += 1;
        }
      }

      if (status) status.remove();

      if (total === 0) {
        container.innerHTML =
          '<p class="section-note">Todavía no hay preguntas marcadas. En cualquier archivo, agregá <code>class="important"</code> a la <code>section.question</code> y el tag <code>&lt;span class="tag-important"&gt;Importante&lt;/span&gt;</code> en el título.</p>';
      }
    } catch (err) {
      if (status) {
        status.innerHTML = [
          '<p><strong>No se pudieron cargar las preguntas.</strong> El navegador bloquea leer otros archivos HTML si abrís la página como <code>file://</code>.</p>',
          '<p>Serví la carpeta del proyecto y abrí esta URL:</p>',
          '<pre><code>npm install\nnpm run dev\n# http://localhost:5173/Preguntas-Importantes.html</code></pre>',
          '<p class="section-note">También podés usar la extensión Live Server del IDE u otro servidor estático.</p>',
        ].join('');
      }
      console.error(err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadImportantQuestions);
  } else {
    loadImportantQuestions();
  }
})();
