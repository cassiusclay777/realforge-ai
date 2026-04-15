// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/upload/zip/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';


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

vi.mock('fs/promises', () => {
  const mock = {
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  };
  return {
    ...mock,
    default: mock,
  };
});

// Use real path.extname / basename / join so extension checks match real filenames (e.g. .txt vs .zip).
vi.mock('path', async (importOriginal) => {
  const actual = await importOriginal<typeof import('path')>();
  return { ...actual, default: actual };
});

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id' }
  }),
}));

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
    expect(data.error).toBe('No file uploaded or file is empty');
  });

  it('should return 400 if file is not a ZIP', async () => {
    const formData = new FormData();
    const file = new File([Buffer.from('test')], 'test.txt', { type: 'text/plain' });
    formData.append('zipFile', file);

    const request = new NextRequest('http://localhost:3000/api/upload/zip', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid file type');
  });

  it('should return 401 if user is not authenticated', async () => {
    // Override the mock to return null session for this test
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const formData = new FormData();
    const file = new File(['test'], 'test.zip', { type: 'application/zip' });
    formData.append('zipFile', file);

    const request = new NextRequest('http://localhost:3000/api/upload/zip', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});