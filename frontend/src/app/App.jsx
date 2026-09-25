import { useMemo, useState } from 'react';
import { buildRepositoryIndex } from '../intelligence/index/repository.js';

const TEXT_EXTENSIONS = new Set([
  '.js','.jsx','.ts','.tsx','.vue','.py','.java','.kt','.go','.rs','.php','.cs',
  '.cpp','.c','.h','.html','.css','.scss','.json','.md','.txt','.xml','.yaml',
  '.yml','.sql','.sh','.bat','.ps1','.env'
]);
const IGNORE_DIRS = new Set([
  '.git','node_modules','dist','build','.venv','venv','__pycache__','.idea','.vscode',
  'coverage','.next','.nuxt','.turbo','.cache'
]);

function extensionOf(name) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}
function isText(name) { return TEXT_EXTENSIONS.has(extensionOf(name)); }

async function collectDirectory(handle, prefix = '', files = []) {
  for await (const entry of handle.values()) {
    if (entry.kind === 'directory') {
      if (IGNORE_DIRS.has(entry.name)) continue;
      await collectDirectory(entry, prefix ? prefix + '/' + entry.name : entry.name, files);
    } else if (entry.kind === 'file' && isText(entry.name)) {
      const path = prefix ? prefix + '/' + entry.name : entry.name;
      files.push({
        path,
        name: entry.name,
        ext: extensionOf(entry.name),
        text: true,
        handle: entry
      });
    }
  }
  return files;
}

function Stat({ label, value }) {
  return <article className="stat"><span>{label}</span><strong>{value}</strong></article>;
}

export default function App() {
  const [project, setProject] = useState(null);
  const [index, setIndex] = useState(null);
  const [active, setActive] = useState('overview');
  const [status, setStatus] = useState('Open a local repository to begin.');
  const [progress, setProgress] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState(null);

  const files = index?.files || project?.files || [];
  const matches = useMemo(() => {
    if (!index || !query.trim()) return [];
    const q = query.toLowerCase();
    return [
      ...index.symbols.filter(s => s.name.toLowerCase().includes(q)).map(s => ({ type:'symbol', ...s })),
      ...index.files.filter(f => f.path.toLowerCase().includes(q)).map(f => ({ type:'file', path:f.path }))
    ].slice(0, 80);
  }, [index, query]);

  async function openRepository() {
    if (!window.showDirectoryPicker) {
      setStatus('This browser does not expose the File System Access API. Use a Chromium-based browser.');
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'read' });
      setStatus('Scanning repository files…');
      const collected = await collectDirectory(handle);
      const nextProject = { name: handle.name, files: collected, handle };
      setProject(nextProject);
      setIndex(null);
      setSelectedPath(null);
      setStatus(`Loaded ${collected.length.toLocaleString()} text files. Build the intelligence index when ready.`);
    } catch (error) {
      if (error?.name !== 'AbortError') setStatus(error?.message || 'Unable to open repository.');
    }
  }

  async function buildIndex() {
    if (!project) return;
    try {
      setStatus('Building repository intelligence…');
      setProgress({ current: 0, total: project.files.length, phase: 'start' });
      const result = await buildRepositoryIndex(project, {
        onProgress: p => setProgress(p)
      });
      setIndex(result);
      setActive('codebase');
      setStatus(`Index complete: ${result.stats.files.toLocaleString()} files analyzed.`);
      setProgress(null);
    } catch (error) {
      setProgress(null);
      setStatus(error?.message || 'Indexing failed.');
    }
  }

  const selected = index?.files.find(f => f.path === selectedPath);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="mark">R</div>
          <div><strong>RepoThink</strong><small>Codebase Intelligence Workspace</small></div>
        </div>
        <div className="actions">
          <button onClick={openRepository}>Open Repository</button>
          <button className="primary" disabled={!project || !!progress} onClick={buildIndex}>
            {progress ? 'Indexing…' : 'Build Index'}
          </button>
        </div>
      </header>

      <div className="statusbar">
        <span>{project ? `Repository: ${project.name}` : 'No repository open'}</span>
        <span>{status}</span>
      </div>

      <nav>
        {[
          ['overview','Overview'],['explorer','Explorer'],['search','Search'],['codebase','Codebase'],
          ['architecture','Architecture'],['impact','Impact'],['health','Health'],['git','Git'],
          ['context','Context'],['reports','Reports'],['ai','AI']
        ].map(([id,label]) =>
          <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}>{label}</button>
        )}
      </nav>

      <main>
        {active === 'overview' && (
          <section>
            <div className="hero">
              <div>
                <span className="eyebrow">LOCAL-FIRST SOFTWARE UNDERSTANDING</span>
                <h1>Think through an unfamiliar codebase.</h1>
                <p>Open a local repository, build a structural index, then explore files, symbols, references and dependencies without uploading the project.</p>
                <button className="primary large" onClick={openRepository}>Open Repository</button>
              </div>
              <div className="journey">
                <b>Open → Index → Understand → Analyze</b>
                <span>Search → Trace → Impact → Context → AI</span>
              </div>
            </div>
            {project && <div className="stats">
              <Stat label="Text files" value={project.files.length.toLocaleString()} />
              <Stat label="Indexed files" value={(index?.stats.files || 0).toLocaleString()} />
              <Stat label="Symbols" value={(index?.stats.symbols || 0).toLocaleString()} />
              <Stat label="Dependencies" value={(index?.dependencies.length || 0).toLocaleString()} />
            </div>}
          </section>
        )}

        {active === 'explorer' && (
          <section className="panel">
            <h2>Explorer</h2>
            <p className="muted">Browse files discovered in the local repository.</p>
            {!project ? <Empty /> : <div className="file-list">{files.map(f =>
              <button key={f.path} onClick={() => setSelectedPath(f.path)}>{f.path}</button>
            )}</div>}
            {selected && <pre className="source">{JSON.stringify(selected, null, 2)}</pre>}
          </section>
        )}

        {active === 'search' && (
          <section className="panel">
            <h2>Search</h2>
            <input className="searchbox" placeholder="Search files or symbols…" value={query} onChange={e => setQuery(e.target.value)} />
            {!index ? <Empty text="Build the index to search symbols and files." /> :
              <div className="results">{matches.map((m,i) =>
                <button key={i} onClick={() => {setSelectedPath(m.path); setActive('explorer')}}>
                  <b>{m.name || m.path}</b><span>{m.type} · {m.path}</span>
                </button>
              )}</div>}
          </section>
        )}

        {active === 'codebase' && (
          <section>
            <div className="section-head"><div><h2>Codebase Intelligence</h2><p className="muted">Structural index of the repository.</p></div><button className="primary" disabled={!project || !!progress} onClick={buildIndex}>Build / Refresh Index</button></div>
            {!index ? <Empty text="Open a repository and build its intelligence index." /> :
              <div className="stats">
                <Stat label="Files" value={index.stats.files.toLocaleString()} />
                <Stat label="Lines" value={index.stats.lines.toLocaleString()} />
                <Stat label="Symbols" value={index.stats.symbols.toLocaleString()} />
                <Stat label="References" value={index.stats.references.toLocaleString()} />
                <Stat label="Internal edges" value={index.stats.internalEdges.toLocaleString()} />
                <Stat label="Unresolved imports" value={index.unresolvedImports.length.toLocaleString()} />
              </div>}
          </section>
        )}

        {['architecture','impact','health','git','context','reports','ai'].includes(active) && (
          <section className="panel">
            <span className="eyebrow">NEXT WORKSPACE</span>
            <h2>{active[0].toUpperCase() + active.slice(1)}</h2>
            <p className="muted">The workspace is reserved in the new RepoThink architecture. Intelligence foundations are being implemented before this surface is expanded.</p>
            {index && active === 'health' && <div className="callout">{index.unresolvedImports.length} unresolved relative imports detected.</div>}
            {index && active === 'impact' && <div className="callout">{index.dependencies.length} internal dependency edges are available for impact traversal.</div>}
          </section>
        )}
      </main>

      {progress && <div className="progress"><div><b>{progress.phase}</b><span>{progress.current || 0} / {progress.total || 0}</span></div><div className="bar"><i style={{width: `${Math.min(100, ((progress.current || 0) / Math.max(1, progress.total || 1)) * 100)}%`}} /></div></div>}
    </div>
  );
}

function Empty({ text='Open a repository to begin.' }) {
  return <div className="empty">{text}</div>;
}
