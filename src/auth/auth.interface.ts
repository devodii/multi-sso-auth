import { Request } from 'express';

export enum AuthProvider {
  'GOOGLE' = 'GOOGLE',
  'FACEBOOK' = 'FACEBOOK',
}

export type AuthRequest = Request & { accountId: string };
