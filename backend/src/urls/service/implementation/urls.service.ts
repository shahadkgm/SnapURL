import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Url, UrlDocument } from '../../../database/schemas/url.schema.js';
import { User, UserDocument } from '../../../database/schemas/user.schema.js';
import type { CreateUrlDto } from '../../dto/create-url.dto.js';
import type { PaginationQueryDto } from '../../dto/pagination-query.dto.js';
import type {
  FormattedUrl,
  IUrlsService,
  PaginatedUrlsResponse,
} from '../interface/IUrlsService.js';

@Injectable()
export class UrlsService implements IUrlsService {
  constructor(
    @InjectModel(Url.name)
    private readonly urlModel: Model<UrlDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateUrlDto, userId: string): Promise<FormattedUrl> {
    const userObjectId = new Types.ObjectId(userId);
    let normalizedUrl = dto.originalUrl.trim();

    try {
      const parsed = new URL(normalizedUrl);
      // Safeguard against shortening an existing short redirect URL (loop prevention)
      if (parsed.pathname.startsWith('/r/')) {
        throw new BadRequestException('Cannot shorten an already shortened SnapURL link');
      }
      // Normalize trailing slashes (e.g. https://example.com/page/ -> https://example.com/page)
      if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }
      normalizedUrl = parsed.toString();
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
    }

    // Check if the user has already shortened this exact URL (avoid duplications)
    const existingUrl = await this.urlModel.findOne({
      userId: userObjectId,
      originalUrl: normalizedUrl,
    });

    // Case 1: User provided a custom alias
    if (dto.customCode) {
      const customCode = dto.customCode.trim();

      // Check if alias is in use
      const aliasHolder = await this.urlModel.findOne({ shortCode: customCode });
      if (aliasHolder) {
        // If it already belongs to this user and is for the exact same original URL, reuse it
        if (
          aliasHolder.userId.toString() === userId &&
          aliasHolder.originalUrl === normalizedUrl
        ) {
          if (dto.title && dto.title !== aliasHolder.title) {
            aliasHolder.title = dto.title;
            await aliasHolder.save();
          }
          return this.formatUrl(aliasHolder);
        }
        throw new ConflictException(`Custom alias "${customCode}" is already taken`);
      }

      // If user already had this URL shortened without this custom alias, update it
      if (existingUrl) {
        existingUrl.shortCode = customCode;
        if (dto.title !== undefined) existingUrl.title = dto.title ?? null;
        await existingUrl.save();
        return this.formatUrl(existingUrl);
      }

      // Create new URL document with the custom code
      const url = await this.urlModel.create({
        originalUrl: normalizedUrl,
        shortCode: customCode,
        title: dto.title ?? null,
        userId: userObjectId,
      });

      return this.formatUrl(url);
    }

    // Case 2: No custom code provided (auto-generated code)
    // If the URL is already shortened by this user, return the existing short link
    if (existingUrl) {
      if (dto.title && dto.title !== existingUrl.title) {
        existingUrl.title = dto.title;
        await existingUrl.save();
      }
      return this.formatUrl(existingUrl);
    }

    // Generate a unique random short code
    const shortCode = await this.generateUniqueCode();

    const url = await this.urlModel.create({
      originalUrl: normalizedUrl,
      shortCode,
      title: dto.title ?? null,
      userId: userObjectId,
    });

    return this.formatUrl(url);
  }

  async findAllByUser(
    userId: string,
    query?: PaginationQueryDto,
  ): Promise<PaginatedUrlsResponse> {
    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.min(100, Math.max(1, query?.limit ?? 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId),
    };

    if (query?.search?.trim()) {
      const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: searchRegex },
        { shortCode: searchRegex },
        { originalUrl: searchRegex },
      ];
    }

    const [total, urls] = await Promise.all([
      this.urlModel.countDocuments(filter),
      this.urlModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: urls.map((url) => this.formatUrl(url)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<FormattedUrl> {
    const url = await this.urlModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .lean();

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    return this.formatUrl(url);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const url = await this.urlModel.findOneAndDelete({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (!url) {
      throw new NotFoundException('URL not found or you do not have permission to delete it');
    }

    return { message: 'URL deleted successfully' };
  }

  async redirectAndTrack(code: string): Promise<string> {
    const url = await this.urlModel.findOneAndUpdate(
      { shortCode: code },
      { $inc: { clicks: 1 } },
      { new: true },
    );

    if (!url) {
      throw new NotFoundException('Short URL not found');
    }

    return url.originalUrl;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async generateUniqueCode(length = 6): Promise<string> {
    let code: string;
    let attempts = 0;
    do {
      code = crypto.randomBytes(length).toString('base64url').slice(0, length);
      const existing = await this.urlModel.findOne({ shortCode: code });
      if (!existing) return code;
      attempts++;
    } while (attempts < 10);

    throw new ConflictException('Failed to generate a unique short code, please try again');
  }

  private formatUrl(url: any): FormattedUrl {
    return {
      id: url._id.toString(),
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      title: url.title ?? null,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
      userId: url.userId?.toString(),
    };
  }
}
