import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { DocsExport, Feature } from './spec-types';
import { renderFeature } from './render-feature';

const ROOT = join(import.meta.dirname, '..');
const SPEC = join(ROOT, 'reference', 'vibrai-cli-mcp.json');
const DOCS_JSON = join(ROOT, 'docs.json');

export function buildReferenceGroup(features: Pick<Feature, 'id'>[]) {
  return { group: 'Reference', pages: features.map(f => `reference/${f.id}`) };
}

export function generate(): void {
  const spec = JSON.parse(readFileSync(SPEC, 'utf8')) as DocsExport;
  const outDir = join(ROOT, 'reference');
  mkdirSync(outDir, { recursive: true });

  for (const feature of spec.features)
    writeFileSync(join(outDir, `${feature.id}.mdx`), renderFeature(feature), 'utf8');

  const docs = JSON.parse(readFileSync(DOCS_JSON, 'utf8'));
  docs.navigation = docs.navigation ?? {};
  docs.navigation.groups = docs.navigation.groups ?? [];
  const refGroup = buildReferenceGroup(spec.features);
  const idx = docs.navigation.groups.findIndex((g: any) => g.group === 'Reference');
  if (idx >= 0) docs.navigation.groups[idx] = refGroup;
  else docs.navigation.groups.push(refGroup);
  writeFileSync(DOCS_JSON, JSON.stringify(docs, null, 2) + '\n', 'utf8');

  console.log(`Generated ${spec.features.length} reference pages.`);
}

// Run when executed directly (not when imported by tests)
if (import.meta.url === `file://${process.argv[1]}`) generate();
