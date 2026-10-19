import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from './app.module.js';

/**
 * Root AppModule smoke test.
 * Verifies the module compiles without errors.
 * Feature-specific tests should be added alongside their own modules:
 *   - src/auth/auth.service.spec.ts
 *   - src/urls/urls.service.spec.ts
 */
describe('AppModule', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should compile the module without errors', () => {
    expect(app).toBeDefined();
  });
});
