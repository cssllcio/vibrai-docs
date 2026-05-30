import { describe, it, expect } from 'vitest';
import { buildReferenceGroup } from '../scripts/generate-reference';

describe('buildReferenceGroup', () => {
  it('lists one reference page per feature', () => {
    const group = buildReferenceGroup([
      { id: 'track' } as any, { id: 'clip' } as any,
    ]);
    expect(group.group).toBe('Reference');
    expect(group.pages).toEqual(['reference/track', 'reference/clip']);
  });
});
