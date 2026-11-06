import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UrlsService } from './urls.service.js';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('UrlsService', () => {
  let service: UrlsService;
  let mockUrlModel: any;
  let mockUserModel: any;

  const mockUserId = new Types.ObjectId().toString();

  beforeEach(() => {
    mockUrlModel = {
      findOne: vi.fn(),
      create: vi.fn(),
      find: vi.fn(),
      countDocuments: vi.fn(),
      findOneAndUpdate: vi.fn(),
      findOneAndDelete: vi.fn(),
    };
    mockUserModel = {};

    service = new UrlsService(mockUrlModel, mockUserModel);
  });

  describe('create - deduplication & collision logic', () => {
    it('should return existing URL if user already shortened the exact same original URL', async () => {
      const existingDoc = {
        _id: new Types.ObjectId(),
        originalUrl: 'https://example.com/test',
        shortCode: 'abc1234',
        title: 'Old Title',
        clicks: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: new Types.ObjectId(mockUserId),
        save: vi.fn(),
      };

      mockUrlModel.findOne.mockResolvedValueOnce(existingDoc);

      const result = await service.create(
        { originalUrl: 'https://example.com/test' },
        mockUserId,
      );

      expect(mockUrlModel.findOne).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
        originalUrl: 'https://example.com/test',
      });
      expect(mockUrlModel.create).not.toHaveBeenCalled();
      expect(result.shortCode).toBe('abc1234');
    });

    it('should reject shortening a link that is already a shortened link (/r/...)', async () => {
      await expect(
        service.create(
          { originalUrl: 'https://snapurl.com/r/shortCode' },
          mockUserId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if requested custom alias is already taken by another link', async () => {
      mockUrlModel.findOne
        .mockResolvedValueOnce(null) // existing by originalUrl
        .mockResolvedValueOnce({
          _id: new Types.ObjectId(),
          shortCode: 'my-alias',
          userId: new Types.ObjectId(),
          originalUrl: 'https://other-domain.com',
        }); // alias holder

      await expect(
        service.create(
          { originalUrl: 'https://example.com', customCode: 'my-alias' },
          mockUserId,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new short URL when no duplicate exists', async () => {
      mockUrlModel.findOne
        .mockResolvedValueOnce(null) // existing by originalUrl
        .mockResolvedValueOnce(null); // generateUniqueCode check

      const newDoc = {
        _id: new Types.ObjectId(),
        originalUrl: 'https://example.com',
        shortCode: 'xYz987',
        title: null,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: new Types.ObjectId(mockUserId),
      };

      mockUrlModel.create.mockResolvedValueOnce(newDoc);

      const result = await service.create(
        { originalUrl: 'https://example.com' },
        mockUserId,
      );

      expect(mockUrlModel.create).toHaveBeenCalled();
      expect(result.originalUrl).toBe('https://example.com');
    });
  });

  describe('findAllByUser - pagination', () => {
    it('should apply pagination parameters and return meta', async () => {
      const mockItems = [
        {
          _id: new Types.ObjectId(),
          originalUrl: 'https://example.com',
          shortCode: 'abc123',
          title: 'Example',
          clicks: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: new Types.ObjectId(mockUserId),
        },
      ];

      mockUrlModel.countDocuments.mockResolvedValueOnce(25);

      const mockQueryChain = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValueOnce(mockItems),
      };
      mockUrlModel.find.mockReturnValueOnce(mockQueryChain);

      const response = await service.findAllByUser(mockUserId, {
        page: 2,
        limit: 10,
      });

      expect(mockQueryChain.skip).toHaveBeenCalledWith(10);
      expect(mockQueryChain.limit).toHaveBeenCalledWith(10);
      expect(response.data.length).toBe(1);
      expect(response.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });
  });
});

