import { Response } from 'express';
import jwt from 'jsonwebtoken'

export const createTokens = (res: Response, id: number | bigint, hash: string) => {
  const access = jwt.sign({ id }, hash, { algorithm: 'RS256', expiresIn: '15m' });
  const refresh = jwt.sign({ id }, hash, { algorithm: 'RS256', expiresIn: '15d' });
  res.append('access_token', access);
  res.append('refresh_token', refresh);
}

export const createAccessToken = (res: Response, hash: string, token: any) => {
  token = jwt.verify(token, hash, { algorithms: ['RS256'] }) as { id: number, iat: number, exp: number };
  const newToken = jwt.sign({ id: token.id }, hash, { algorithm: 'RS256', expiresIn: '15m' });
  res.append('access_token', newToken);
  return token;
}