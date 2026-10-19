import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Url, UrlDocument } from '../database/schemas/url.schema.js';
import { User, UserDocument } from '../database/schemas/user.schema.js';
import type { CreateUrlDto } from './dto/create-url.dto.js';

@Injectable()
export class UrlsService {
  constructor(
    @InjectModel(Url.name)
    private readonly urlModel: Model<UrlDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateUrlDto, userId: string) {
    let shortCode: string;

    if (dto.customCode) {
      // Check if custom code is already taken
      const existing = await this.urlModel.findOne({ shortCode: dto.customCode });
      if (existing) {
        throw new ConflictException(`Custom alias "${dto.customCode}" is already taken`);
      }
      shortCode = dto.customCode;
    } else {
      // Generate unique random short code
      shortCode = await this.generateUniqueCode();
    }

    const url = await this.urlModel.create({
      originalUrl: dto.originalUrl,
      shortCode,
      title: dto.title ?? null,
      userId: new Types.ObjectId(userId),
    });

    return this.formatUrl(url);
  }

  async findAllByUser(userId: string) {
    const urls = await this.urlModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return urls.map(this.formatUrl);
  }

  async findOne(id: string, userId: string) {
    const url = await this.urlModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .lean();

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    return this.formatUrl(url);
  }

  async delete(id: string, userId: string) {
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

  private formatUrl(url: any) {
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
