import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './controllers/implementation/auth.controller.js';
import { AuthService } from './service/implementation/auth.service.js';
import { AUTH_SERVICE_TOKEN } from './service/interface/IAuthService.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { User, UserSchema } from '../database/schemas/user.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const rawSecret = configService.get<string>('JWT_SECRET');
        if (!rawSecret) {
          throw new Error('JWT_SECRET environment variable is missing');
        }
        const secret = String(rawSecret).replace(/^["']|["']$/g, '').trim();
        const rawExpiresIn = configService.get<string>('JWT_EXPIRES_IN', '7d');
        const expiresIn = String(rawExpiresIn).replace(/^["']|["']$/g, '').trim() || '7d';

        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE_TOKEN,
      useClass: AuthService,
    },
    AuthService,
    JwtStrategy,
  ],
  exports: [
    PassportModule,
    JwtModule,
    AUTH_SERVICE_TOKEN,
    AuthService,
  ],
})
export class AuthModule {}
