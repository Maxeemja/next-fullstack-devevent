import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAllEvents: vi.fn(),
  getEventBySlug: vi.fn(),
  getSimilarEventsBySlug: vi.fn(),
}));

vi.mock('@/lib/actions/event.actions', () => ({
  getAllEvents: mocks.getAllEvents,
  getEventBySlug: mocks.getEventBySlug,
  getSimilarEventsBySlug: mocks.getSimilarEventsBySlug,
}));

vi.mock('@/components/BookEvent', () => ({
  default: () => null,
}));

vi.mock('@/components/EventCard', () => ({
  default: () => null,
}));

import { generateStaticParams } from './page';

describe('generateStaticParams', () => {
  beforeEach(() => {
    mocks.getAllEvents.mockReset();
  });

  it('returns a fallback slug when there are no database events', async () => {
    mocks.getAllEvents.mockResolvedValue([]);

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: 'placeholder' },
    ]);
  });
});
