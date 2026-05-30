import { describe, it, expect } from 'vitest';
import { renderFeature } from '../scripts/render-feature';
import type { Feature } from '../scripts/spec-types';

const track: Feature = {
  id: 'track', title: 'Tracks', description: 'Manage tracks.',
  cli: { branch: 'track', commands: [{
    name: 'track create', description: 'Create a new track',
    arguments: [{ name: 'name', required: true, description: 'Track name' }],
    options: [{ name: '--type', valueName: 'partType', default: 'Other', description: 'Part type' }],
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
});
