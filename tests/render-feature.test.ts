import { describe, it, expect } from 'vitest';
import { renderFeature } from '../scripts/render-feature';
import type { Feature } from '../scripts/spec-types';

const track: Feature = {
  id: 'track', title: 'Tracks', description: 'Manage tracks.',
  cli: { branch: 'track', commands: [{
    name: 'track create', description: 'Create a new track',
    arguments: [{ name: 'name', required: true, description: 'Track name' }],
    options: [{ name: '--type', value_name: 'partType', default: 'Other', description: 'Part type' }],
  }] },
  mcp: { tools: [{
    name: 'create_track', description: 'Create a track.',
    parameters: [{ name: 'name', type: 'string', required: true, description: 'Track display name' }],
  }] },
};

describe('renderFeature', () => {
  const mdx = renderFeature(track);
  it('emits frontmatter title', () => expect(mdx).toContain('title: "Tracks"'));
  it('marks the file generated', () => expect(mdx).toContain('GENERATED — do not edit by hand'));
  it('has a command-line section with usage', () => {
    expect(mdx).toContain('## Command line');
    expect(mdx).toContain('vibrai track create <name> --type <partType>');
  });
  it('has an MCP tools section with the tool call', () => {
    expect(mdx).toContain('## MCP tools');
    expect(mdx).toContain('"tool": "create_track"');
  });
  it('renders param fields', () => {
    expect(mdx).toContain('<ParamField path="name"');
  });

  it('escapes MDX-significant chars in prose', () => {
    const f = {
      id: 'x', title: 'X', description: 'Uses <genre> and {brace}.',
      cli: { branch: 'x', commands: [{ name: 'x do', description: 'See <thing> and {x}',
        arguments: [{ name: 'a', required: true, description: 'arg <y>' }], options: [] }] },
      mcp: { tools: [] },
    } as any;
    const escaped = renderFeature(f);
    // Strip frontmatter (everything up to and including the closing ---) so we
    // only assert on the MDX prose/body, not the YAML description field.
    const body = escaped.split('---\n').slice(2).join('---\n');
    // Raw angle-bracket forms must NOT appear in prose
    expect(body).not.toContain('<genre>');
    expect(body).not.toContain('<thing>');
    // Escaped forms must appear
    expect(body).toContain('&lt;genre>');
    expect(body).toContain('&#123;brace}');
    // The bash fenced block must NOT be escaped — usage still renders literally
    expect(mdx).toContain('vibrai track create <name> --type <partType>');
  });
});
