import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UrlsService } from '../urls/urls.service.js';
import { ROUTES } from '../common/constants/routes.constant.js';

// Public redirect controller — no JWT required
@Controller(ROUTES.REDIRECT.ROOT)
export class RedirectController {
  constructor(private readonly urlsService: UrlsService) {}

  // GET /r/:code — Redirect to original URL and track click
  @Get(ROUTES.REDIRECT.BY_CODE)
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const originalUrl = await this.urlsService.redirectAndTrack(code);
    return res.redirect(originalUrl);
  }
}
