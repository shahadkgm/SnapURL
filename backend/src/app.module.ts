import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UrlsModule } from './urls/urls.module.js';

@Module({
  imports: [
    // Loads .env globally across all modules
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Provides MongoDB connection and Mongoose models globally
    DatabaseModule,
    // Authentication: register, login, JWT, guards
    AuthModule,
    // URL Shortening: create, list, delete, redirect
    UrlsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
