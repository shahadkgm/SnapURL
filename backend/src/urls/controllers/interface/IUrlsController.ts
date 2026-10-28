import type { CreateUrlDto } from '../../dto/create-url.dto.js';
import type { SafeUser } from '../../../auth/service/interface/IAuthService.js';
import type { FormattedUrl } from '../../service/interface/IUrlsService.js';

export interface IUrlsController {
  create(dto: CreateUrlDto, user: SafeUser): Promise<FormattedUrl>;
  findAll(user: SafeUser): Promise<FormattedUrl[]>;
  delete(id: string, user: SafeUser): Promise<{ message: string }>;
}
