import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  connectToDatabase: vi.fn(),
  createEvent: vi.fn(),
  uploadStream: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
  connectToDatabase: mocks.connectToDatabase,
}));

vi.mock('@/database', () => ({
  Event: { create: mocks.createEvent },
}));

vi.mock('cloudinary', () => ({
  v2: {
    uploader: { upload_stream: mocks.uploadStream },
  },
}));

import { POST } from './route';

describe('POST /api/events', () => {
  beforeEach(() => {
    mocks.connectToDatabase.mockResolvedValue(undefined);
    mocks.createEvent.mockResolvedValue({ id: 'event-id' });
    mocks.uploadStream.mockImplementation(
      (
        _options,
        callback: (error: null, result: { secure_url: string }) => void
      ) => ({
        end: () =>
          callback(null, { secure_url: 'https://example.com/event.png' }),
      })
    );
  });

  it('persists the validated duplicate agenda and tags values', async () => {
    const formData = new FormData();
    formData.append('title', 'Test event');
    formData.append('tags', 'not valid JSON');
    formData.append('tags', JSON.stringify(['validated tag']));
    formData.append('agenda', 'not valid JSON');
    formData.append('agenda', JSON.stringify(['Validated agenda item']));
    formData.append(
      'image',
      new Blob(['image'], { type: 'image/png' }),
      'event.png'
    );

    const request = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(response.status).not.toBe(200);
    expect(mocks.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: ['validated tag'],
        agenda: ['Validated agenda item'],
      })
    );
  });
});
