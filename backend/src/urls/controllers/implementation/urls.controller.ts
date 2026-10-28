import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUrlDto } from '../../dto/create-url.dto.js';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator.js';
import type { SafeUser } from '../../../auth/service/interface/IAuthService.js';
import { ROUTES } from '../../../common/constants/routes.constant.js';
import {
  URLS_SERVICE_TOKEN,
  type FormattedUrl,
  type IUrlsService,
} from '../../service/interface/IUrlsService.js';
import type { IUrlsController } from '../interface/IUrlsController.js';

@Controller(ROUTES.URLS.ROOT)
export class UrlsController implements IUrlsController {
  constructor(
    @Inject(URLS_SERVICE_TOKEN)
    private readonly urlsService: IUrlsService,
  ) {}

  // POST /api/urls — Create a new short URL (protected)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateUrlDto, @CurrentUser() user: SafeUser): Promise<FormattedUrl> {
    return this.urlsService.create(dto, user.id);
  }

  // GET /api/urls — Get all URLs for the logged-in user (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: SafeUser): Promise<FormattedUrl[]> {
    return this.urlsService.findAllByUser(user.id);
  }

  // DELETE /api/urls/:id — Delete a URL (protected, owner only)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(ROUTES.URLS.DELETE)
  delete(@Param('id') id: string, @CurrentUser() user: SafeUser): Promise<{ message: string }> {
    return this.urlsService.delete(id, user.id);
  }
}
