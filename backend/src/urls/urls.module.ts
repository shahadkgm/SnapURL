import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlsService } from './urls.service.js';
import { UrlsController } from './urls.controller.js';
import { RedirectController } from './redirect.controller.js';
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
  providers: [UrlsService],
  exports: [UrlsService],
})
export class UrlsModule {}
