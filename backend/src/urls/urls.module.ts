import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlsController } from './controllers/implementation/urls.controller.js';
import { RedirectController } from './controllers/implementation/redirect.controller.js';
import { UrlsService } from './service/implementation/urls.service.js';
import { URLS_SERVICE_TOKEN } from './service/interface/IUrlsService.js';
import { Url, UrlSchema } from '../database/schemas/url.schema.js';
import { User, UserSchema } from '../database/schemas/user.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Url.name, schema: UrlSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UrlsController, RedirectController],
  providers: [
    {
      provide: URLS_SERVICE_TOKEN,
      useClass: UrlsService,
    },
    UrlsService,
  ],
  exports: [URLS_SERVICE_TOKEN, UrlsService],
})
export class UrlsModule {}
