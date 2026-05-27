const modules = import.meta.glob('../CONOCIMIENTO-RN-en-MD/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const SECTION_META = {
  '00': {
    title: 'JavaScript',
    desc: 'Fundamentos del lenguaje. Base para closures, async y el modelo mental de React.',
  },
  '01': {
    title: 'React',
    desc: 'Fundamentos y hooks. Lo preguntan aunque el rol sea RN.',
  },
  '02': {
    title: 'React Native',
    desc: 'El bloque más importante. Experiencia real, arquitectura y UI.',
  },
  '03': {
    title: 'State Management',
    desc: 'Redux y criterio para elegir en apps enterprise.',
  },
  '04': {
    title: 'Offline First',
    desc: 'Storage, sincronización y persistencia en mobile.',
  },
  '05': {
    title: 'Gestos y Animaciones',
    desc: 'React Native Gesture Handler y Reanimated.',
  },
  '06': {
    title: 'Testing',
    desc: 'Unit, integration y E2E con Detox.',
  },
  '07': {
    title: 'Otros',
    desc: 'Temas transversales: APIs, auth, etc.',
  },
};

function parseDoc(path, content) {
  const file = path.split('/').pop();
  const slug = file.replace(/\.md$/, '');
  const sectionKey = file.match(/^(\d+)/)?.[1] ?? '99';
  const badge = file.replace(/\.md$/, '').match(/^[\da-z]+/)?.[0] ?? slug;
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : slug;
  const questions = (content.match(/^##\s+\d+\./gm) || []).length;

  return { file, slug, sectionKey, badge, title, questions, content };
}

export function getAllDocs() {
  return Object.entries(modules)
    .map(([path, content]) => parseDoc(path, content))
    .sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }));
}

export function getDocBySlug(slug) {
  return getAllDocs().find((doc) => doc.slug === slug) ?? null;
}

export function groupDocsBySection(docs) {
  const groups = new Map();

  for (const doc of docs) {
    if (!groups.has(doc.sectionKey)) {
      const meta = SECTION_META[doc.sectionKey] ?? {
        title: `Sección ${doc.sectionKey}`,
        desc: '',
      };
      groups.set(doc.sectionKey, { ...meta, docs: [] });
    }
    groups.get(doc.sectionKey).docs.push(doc);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([key, group]) => ({ key, ...group }));
}
