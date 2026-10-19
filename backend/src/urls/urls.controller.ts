import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { UrlsService } from './urls.service.js';
import { CreateUrlDto } from './dto/create-url.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { SafeUser } from '../auth/service/interface/IAuthService.js';
import { ROUTES } from '../common/constants/routes.constant.js';

@Controller(ROUTES.URLS.ROOT)
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  // POST /api/urls — Create a new short URL (protected)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateUrlDto, @CurrentUser() user: SafeUser) {
    return this.urlsService.create(dto, user.id);
  }

  // GET /api/urls — Get all URLs for the logged-in user (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: SafeUser) {
    return this.urlsService.findAllByUser(user.id);
  }

  // DELETE /api/urls/:id — Delete a URL (protected, owner only)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(ROUTES.URLS.DELETE)
  delete(@Param('id') id: string, @CurrentUser() user: SafeUser) {
    return this.urlsService.delete(id, user.id);
  }
}
