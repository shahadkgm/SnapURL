import type { CreateUrlDto } from '../../dto/create-url.dto.js';
import type { PaginationQueryDto } from '../../dto/pagination-query.dto.js';
import type { SafeUser } from '../../../auth/service/interface/IAuthService.js';
import type { FormattedUrl, PaginatedUrlsResponse } from '../../service/interface/IUrlsService.js';

export interface IUrlsController {
  create(dto: CreateUrlDto, user: SafeUser): Promise<FormattedUrl>;
  findAll(user: SafeUser, query?: PaginationQueryDto): Promise<PaginatedUrlsResponse>;
  delete(id: string, user: SafeUser): Promise<{ message: string }>;
}
