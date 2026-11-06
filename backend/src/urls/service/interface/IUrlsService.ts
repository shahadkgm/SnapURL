import type { CreateUrlDto } from '../../dto/create-url.dto.js';
import type { PaginationQueryDto } from '../../dto/pagination-query.dto.js';

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

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedUrlsResponse {
  data: FormattedUrl[];
  meta: PaginationMeta;
}

export interface IUrlsService {
  create(dto: CreateUrlDto, userId: string): Promise<FormattedUrl>;
  findAllByUser(userId: string, query?: PaginationQueryDto): Promise<PaginatedUrlsResponse>;
  findOne(id: string, userId: string): Promise<FormattedUrl>;
  delete(id: string, userId: string): Promise<{ message: string }>;
  redirectAndTrack(code: string): Promise<string>;
}

export const URLS_SERVICE_TOKEN = Symbol('IUrlsService');
