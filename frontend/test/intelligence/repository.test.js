import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRepositoryIndex, detectCycles, findDependencies, findDependents } from '../src/intelligence/index/repository.js';

function file(path, content) {
  const name = path.split('/').pop();
  return {
    path, name, ext: '.' + name.split('.').pop(),
    handle: { getFile: async () => new Blob([content]) }
  };
}

test('indexes symbols, exports, imports and internal dependencies', async () => {
  const project = {
    name: 'fixture-repo',
    files: [
      file('src/utils.js', 'export function add(a,b){ return a+b; }'),
      file('src/app.js', "import { add } from './utils.js'; export function run(){ return add(1,2); }")
    ]
  };
  const index = await buildRepositoryIndex(project);
  assert.equal(index.stats.files, 2);
  assert.ok(index.symbols.some(s => s.name === 'add'));
  assert.ok(index.symbols.some(s => s.name === 'run'));
  assert.equal(index.dependencies.length, 1);
  assert.equal(index.dependencies[0].to, 'src/utils.js');
  assert.ok(index.references.some(r => r.name === 'add' && r.resolvedSymbols.length > 0));
});

test('reports unresolved relative imports', async () => {
  const index = await buildRepositoryIndex({
    name: 'broken-fixture',
    files: [file('src/app.js', "import missing from './missing.js'; export const run = () => missing();")]
  });
  assert.equal(index.unresolvedImports.length, 1);
  assert.equal(index.unresolvedImports[0].to, null);
});

test('finds dependency relationships and cycles', async () => {
  const index = await buildRepositoryIndex({
    name: 'cycle-fixture',
    files: [
      file('a.js', "import b from './b.js'; export const a = b;"),
      file('b.js', "import a from './a.js'; export const b = a;")
    ]
  });
  assert.deepEqual(findDependencies(index, 'a.js'), ['b.js']);
  assert.deepEqual(findDependents(index, 'a.js'), ['b.js']);
  assert.ok(detectCycles(index).some(cycle => cycle.includes('a.js') && cycle.includes('b.js')));
});
