import type { Response } from 'express';

export interface IRedirectController {
  redirect(code: string, res: Response): Promise<void>;
}
