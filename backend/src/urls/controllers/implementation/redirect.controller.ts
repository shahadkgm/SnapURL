import { Controller, Get, Inject, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ROUTES } from '../../../common/constants/routes.constant.js';
import {
  URLS_SERVICE_TOKEN,
  type IUrlsService,
} from '../../service/interface/IUrlsService.js';
import type { IRedirectController } from '../interface/IRedirectController.js';

// Public redirect controller — no JWT required
@Controller(ROUTES.REDIRECT.ROOT)
export class RedirectController implements IRedirectController {
  constructor(
    @Inject(URLS_SERVICE_TOKEN)
    private readonly urlsService: IUrlsService,
  ) {}

  // GET /r/:code — Redirect to original URL and track click
  @Get(ROUTES.REDIRECT.BY_CODE)
  async redirect(@Param('code') code: string, @Res() res: Response): Promise<void> {
    const originalUrl = await this.urlsService.redirectAndTrack(code);
    res.redirect(originalUrl);
  }
}
