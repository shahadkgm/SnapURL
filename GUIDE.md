# Authenticated URL Shortener - Step-by-Step Learning Guide

This guide is designed to help you build the **Authenticated URL Shortener** step-by-step from scratch using **Nest.js** for the backend and **React (Vite)** for the frontend.

---

## 1. Nest.js Mental Model: How It Works

If you are coming from Express, Express is minimalist and unopinionated. Nest.js introduces **architectural structure** inspired by Angular:

| Concept | Purpose | Analogy |
| :--- | :--- | :--- |
| **Module (`@Module`)** | Groups related controllers, services, and imports together. Every feature has its own module. | A departmental office. |
| **Controller (`@Controller`)** | Handles incoming HTTP requests, route paths (`@Get()`, `@Post()`), and sends responses. | The receptionist taking the order. |
| **Service / Provider (`@Injectable`)** | Contains the **business logic** (database queries, calculations, external APIs). Injected into controllers via constructor. | The kitchen chef preparing the order. |
| **DTO (Data Transfer Object)** | Defines the exact shape of incoming request bodies using TypeScript classes and `class-validator` decorators. | The order form with validation rules. |
| **Guard (`@UseGuards`)** | Determines whether a request should be allowed to reach a route (e.g., verifying JWT tokens). | The security guard checking badges. |
| **Decorator** | Annotates classes, methods, or parameters (e.g. `@Body()`, `@Param()`, `@CurrentUser()`). | Sticky notes adding behavior or extracting data. |

---

## 2. Project Architecture Overview

```text
Boarding-2/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (User & Url models)
│   │   └── dev.db              # SQLite database file
│   ├── src/
│   │   ├── auth/               # Step 2 & 3: Authentication & JWT
│   │   │   ├── dto/            # register.dto.ts, login.dto.ts
│   │   │   ├── guards/         # jwt-auth.guard.ts
│   │   │   ├── strategies/     # jwt.strategy.ts
│   │   │   ├── decorators/     # current-user.decorator.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── urls/               # Step 4 & 5: URL Shortening
│   │   │   ├── dto/            # create-url.dto.ts
│   │   │   ├── urls.controller.ts
│   │   │   ├── urls.service.ts
│   │   │   └── urls.module.ts
│   │   ├── prisma/             # Database connection service (Already created)
│   │   │   ├── prisma.service.ts
│   │   │   └── prisma.module.ts
│   │   ├── app.module.ts       # Root module importing AuthModule, UrlsModule
│   │   └── main.ts             # Entry point (CORS + ValidationPipe enabled)
│   └── .env                    # Environment variables
└── frontend/                   # Step 6: React + Vite + TypeScript UI
    ├── src/
    │   ├── api/                # Axios or fetch API client (attaches JWT)
    │   ├── context/            # AuthContext (login, logout, token state)
    │   ├── components/         # Navbar, UrlCard, CreateUrlModal
    │   ├── pages/              # LoginPage, RegisterPage, DashboardPage
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

---

## 3. Step-by-Step Implementation Roadmap

### Phase 1: Database & Prisma (Already Scaffolded)

1. Check [backend/prisma/schema.prisma](file:///c:/Users/LAPTOP%20SHOP/Desktop/Boarding-2/backend/prisma/schema.prisma):
   - `User` model: `id`, `email`, `password`, `name`, `createdAt`, `urls` (relation to `Url[]`).
   - `Url` model: `id`, `originalUrl`, `shortCode`, `title`, `clicks`, `createdAt`, `userId` (relation to `User`).
2. Useful CLI commands:
   ```bash
   npx prisma db push       # Syncs your schema changes directly to dev.db
   npx prisma studio        # Opens a visual database GUI in your browser at http://localhost:5555
   ```

---

### Phase 2: Building the Authentication Module

#### A. Generate Auth Scaffolding
In the `backend` directory, run:
```bash
npx nest g module auth
npx nest g service auth
npx nest g controller auth
```
This creates `src/auth/` and automatically imports `AuthModule` into `app.module.ts`.

#### B. Create DTOs (Data Transfer Objects)
Create `src/auth/dto/register.dto.ts`:
```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name?: string;
}
```

Create `src/auth/dto/login.dto.ts`:
```typescript
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
```

#### C. Implement AuthService (`src/auth/auth.service.ts`)
Inject `PrismaService` and `JwtService`:
1. **`register(dto: RegisterDto)`**:
   - Check if a user with `dto.email` already exists (`this.prisma.user.findUnique`). If yes, throw `new ConflictException('Email already in use')`.
   - Hash password: `const hashedPassword = await bcrypt.hash(dto.password, 10)`.
   - Save user with `hashedPassword` using `this.prisma.user.create`.
   - Generate JWT token: `const token = this.jwtService.sign({ sub: user.id, email: user.email })`.
   - Return `{ user: { id: user.id, email: user.email, name: user.name }, token }`.
2. **`login(dto: LoginDto)`**:
   - Find user by email. If not found, throw `new UnauthorizedException('Invalid email or password')`.
   - Compare password: `const isMatch = await bcrypt.compare(dto.password, user.password)`. If false, throw `UnauthorizedException`.
   - Generate token: `this.jwtService.sign({ sub: user.id, email: user.email })`.
   - Return `{ user: { id: user.id, email: user.email, name: user.name }, token }`.

#### D. Configure `AuthModule` (`src/auth/auth.module.ts`)
Register `JwtModule` with the secret from `.env`:
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
```

#### E. AuthController Endpoints (`src/auth/auth.controller.ts`)
- `@Post('register')`: calls `this.authService.register(dto)`
- `@Post('login')`: calls `this.authService.login(dto)`
- `@Post('logout')`: returns `{ message: 'Logged out successfully' }` (clears token on client)
- `@UseGuards(JwtAuthGuard)` `@Get('me')`: returns current logged-in user profile

---

### Phase 3: Route Protection (Guards & Passport Strategy)

#### A. Create JWT Passport Strategy (`src/auth/strategies/jwt.strategy.ts`)
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'secret'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user; // Attached automatically to req.user
  }
}
```

#### B. Create JWT Guard (`src/auth/guards/jwt-auth.guard.ts`)
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

#### C. Create CurrentUser Param Decorator (`src/auth/decorators/current-user.decorator.ts`)
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```
*Now in any controller you can write: `@CurrentUser() user: User` to get the logged-in user!*

---

### Phase 4: URL Shortening Module

#### A. Generate URLs Module
```bash
npx nest g module urls
npx nest g service urls
npx nest g controller urls
```

#### B. Create DTO (`src/urls/dto/create-url.dto.ts`)
```typescript
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({ require_protocol: true }, { message: 'Must be a valid URL with http:// or https://' })
  @IsNotEmpty()
  originalUrl: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  customCode?: string; // Optional custom slug
}
```

#### C. Short Code Generator Logic
You can generate a random 6 to 8 character code using Node's built-in `crypto`:
```typescript
import * as crypto from 'crypto';

function generateShortCode(length = 6): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}
```

#### D. Implement UrlsService (`src/urls/urls.service.ts`)
1. **`create(dto: CreateUrlDto, userId: string)`**:
   - Determine `shortCode`: if `dto.customCode` is provided, verify it is not already taken; otherwise loop until a unique random code is generated.
   - Save to database using `this.prisma.url.create({ data: { originalUrl: dto.originalUrl, shortCode, title: dto.title, userId } })`.
2. **`findAllByUser(userId: string)`**:
   - Fetch all URLs belonging to `userId` ordered by `createdAt: 'desc'`.
3. **`findOne(id: string, userId: string)`**:
   - Fetch URL ensuring `userId` matches (prevent users from accessing other users' links).
4. **`delete(id: string, userId: string)`**:
   - Delete link ensuring `userId` matches.
5. **`redirectAndTrack(code: string)`**:
   - Find URL by `shortCode`. If not found, throw `new NotFoundException('Short URL not found')`.
   - Increment clicks: `await this.prisma.url.update({ where: { id: url.id }, data: { clicks: { increment: 1 } } })`.
   - Return `url.originalUrl`.

#### E. UrlsController (`src/urls/urls.controller.ts`)
```typescript
@Controller('api/urls')
export class UrlsController {
  constructor(private urlsService: UrlsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateUrlDto, @CurrentUser() user: any) {
    return this.urlsService.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.urlsService.findAllByUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.urlsService.delete(id, user.id);
  }
}
```

---

### Phase 5: Redirection Route (Public)

The redirect route must be **public** (so anyone clicking the short link gets redirected):
In `AppController` or `UrlsController`:
```typescript
@Get('r/:code')
async redirect(@Param('code') code: string, @Res() res: Response) {
  const originalUrl = await this.urlsService.redirectAndTrack(code);
  return res.redirect(originalUrl);
}
```

---

### Phase 6: Frontend Development (React + TypeScript)

The `frontend/` directory is already set up with Vite and Lucide icons.
1. **API Client (`frontend/src/api.ts`)**:
   - Helper function or Axios instance that includes `Authorization: Bearer ${token}` from `localStorage`.
2. **Authentication State**:
   - Save token in `localStorage.setItem('token', token)` on login/registration.
   - On logout: `localStorage.removeItem('token')`.
3. **Pages & Views**:
   - **Login & Register**: Clean forms with validation and error alerts.
   - **Dashboard**:
     - Form to enter a long URL (and optional title/custom slug).
     - Table/Cards showing: Title, Short Link (e.g., `http://localhost:3000/r/xyz123`), Original URL, Click Count, Created Date, and Delete button.
     - "Copy to Clipboard" button with instant feedback.
     - Logout button in navbar.

---

### Phase 7: Edge Cases & Evaluation Checklist

To achieve the maximum score in the evaluation:
1. **Data Validation**:
   - Reject invalid URLs (must contain `http://` or `https://`).
   - Reject weak passwords (at least 6 characters).
   - Reject invalid email formats.
2. **Security**:
   - Passwords must never be stored in plain text (always hashed with bcrypt).
   - Passwords must never be returned in API responses (strip password before returning user object).
   - Protected endpoints return `401 Unauthorized` without a valid Bearer token.
   - Users cannot view or delete another user's URLs (`403 Forbidden` or `404 Not Found`).
3. **Thorough Error Handling**:
   - Duplicate email registration returns `409 Conflict`.
   - Accessing a non-existent short URL returns a user-friendly `404 Not Found`.
4. **README Transparency (Bonus Points)**:
   - Explicitly document the use of AI tools (how they were used to scaffold architecture, generate instructions, and ensure best practices).

---

## 4. Development Workflow & Commands

### Running Backend:
```bash
cd backend
npm run start:dev     # Starts backend with hot-reload at http://localhost:3000
```

### Running Frontend:
```bash
cd frontend
npm run dev           # Starts Vite dev server at http://localhost:5173
```

### Running Tests:
```bash
cd backend
npm test              # Run unit tests
npm run test:e2e      # Run end-to-end tests
```
