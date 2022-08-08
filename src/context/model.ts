import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthenticationError } from 'apollo-server-errors';
import jwt from 'jsonwebtoken'
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

export interface Model {
  auth: () => { prisma: PrismaClient, id: number, hash: string }
  open: () => { prisma: PrismaClient, res: Response, hash: string }
}

const model = (token: any, res: Response): Model => {
  const hash = fs.readFileSync(path.join(__dirname, '../../private.key'), 'utf-8');
  return {
    auth: () => {
      try {
        if (!token) {
          throw new AuthenticationError('you must be logged in', {
            "auth": "user is not authenticated to make this request"
          });
        }
        token = jwt.verify(token, hash, { algorithms: ['RS256'] }) as { id: number, iat: number, exp: number };
        const newToken = jwt.sign({ id: token.id }, hash, { algorithm: 'RS256', expiresIn: '15h' });
        res.append('access_token', newToken);
      } catch (error: any) {
        throw new AuthenticationError(error.message, {
          "auth": error.message
        });
      }
      return { prisma, id: token.id, hash }
    },
    open: () => {
      return { prisma, res, hash }
    }
  }
}

export default model;