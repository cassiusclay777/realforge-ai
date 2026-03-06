import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/upload/zip/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    listing: {
      create: vi.fn(),
    },
    listingMedia: {
      createMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/queues', () => ({
  imageProcessingQueue: {
    add: vi.fn(),
  },
}));

vi.mock('adm-zip', () => ({
  default: vi.fn().mockImplementation(() => ({
    getEntries: vi.fn().mockReturnValue([
      { entryName: 'image1.jpg', getData: vi.fn().mockReturnValue(Buffer.from('test')) },
      { entryName: 'image2.jpg', getData: vi.fn().mockReturnValue(Buffer.from('test')) },
    ]),
  })),
}));

vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock('path', async () => {
  const actual = await vi.importActual<typeof import('path')>('path');
  return {
    ...actual,
    join: vi.fn().mockReturnValue('/test/path'),
    extname: vi.fn().mockReturnValue('.jpg'),
  };
});

describe('Upload ZIP API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if no file is provided', async () => {
    const formData = new FormData();
    const request = new NextRequest('http://localhost:3000/api/upload/zip', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('No file provided');
  });

  it('should return 400 if file is not a ZIP', async () => {
    const formData = new FormData();
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    formData.append('file', file);

    const request = new NextRequest('http://localhost:3000/api/upload/zip', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('File must be a ZIP archive');
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock NextAuth to return null session
    vi.mock('next-auth', () => ({
      getServerSession: vi.fn().mockResolvedValue(null),
    }));

    const formData = new FormData();
    const file = new File(['test'], 'test.zip', { type: 'application/zip' });
    formData.append('file', file);

    const request = new NextRequest('http://localhost:3000/api/upload/zip', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});