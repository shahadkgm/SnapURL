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
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'secret_key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d') as any,
        },
      }),
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
