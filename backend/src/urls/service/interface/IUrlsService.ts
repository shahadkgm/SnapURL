import type { CreateUrlDto } from '../../dto/create-url.dto.js';

export interface FormattedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  title: string | null;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface IUrlsService {
  create(dto: CreateUrlDto, userId: string): Promise<FormattedUrl>;
  findAllByUser(userId: string): Promise<FormattedUrl[]>;
  findOne(id: string, userId: string): Promise<FormattedUrl>;
  delete(id: string, userId: string): Promise<{ message: string }>;
  redirectAndTrack(code: string): Promise<string>;
}

export const URLS_SERVICE_TOKEN = Symbol('IUrlsService');
