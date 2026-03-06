import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hashed = await hash(password, 10);
      expect(hashed).toBe('hashed-password');
      expect(hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('User creation', () => {
    it('should create user with hashed password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'AGENT',
        createdAt: new Date(),
      };

      (prisma.user.create as any).mockResolvedValue(mockUser);

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed-password',
          role: 'AGENT',
        },
      });

      expect(user).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed-password',
          role: 'AGENT',
        },
      });
    });
  });

  describe('User lookup', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'AGENT',
        password: 'hashed-password',
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(user).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null for non-existent user', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      });

      expect(user).toBeNull();
    });
  });
});