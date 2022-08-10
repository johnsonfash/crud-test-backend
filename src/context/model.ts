import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { AuthenticationError } from 'apollo-server-errors';
import { createAccessToken } from '../helper/utils';

// const hash = fs.readFileSync(path.join(__dirname, '../../private.key'), 'utf-8');
const hash = `-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJAXBmEyLVxCgS2Mphkjeq3yi52eiIaC7MO3Xp2jFELBFc0c5CbO+QY
YQwI8n4WFcxrga/v5ifyrntJIAJMsw6ZgwIDAQABAkBPiaJJC5khw8vtifpdLXWn
39RlyYmgzPRrhVVX/K19AyBdziUrQbuA8aw50kLYEJUfI2TXylo3SqylU5KodFiR
AiEAqLsMcT7pKrzPxXp9IVGVZ+aX6cIF7kgLhsylK1PRgAcCIQCLvBGyhFp0DDnQ
1j7UWi1iLTmICj8CqjUDUq8wY4EDpQIgXDwLnCgoq40VAr1ng3wmcOqTplvChDPr
4R8jNuEVx6cCIHrHoME8HIKVb4O5jPFn3zLBzChl4GHGDtjBoV+iPu1lAiEAn9+Y
jqGKZbx+3ExNoloBt5BUin4exv1G/UBXn2X2dVA=
-----END RSA PRIVATE KEY-----`;

const prisma = new PrismaClient({
  errorFormat: 'minimal',
});
export interface Model {
  auth: () => { prisma: PrismaClient, id: number, hash: string, res: Response }
  open: () => { prisma: PrismaClient, res: Response, hash: string }
}

const model = (token: any, res: Response): Model => {
  return {
    auth: () => {
      try {
        if (!token) {
          throw new AuthenticationError('you must be logged in', {
            "auth": "user must be logged in to make this request"
          });
        }
        token = createAccessToken(res, hash, token);
      } catch (error: any) {
        throw new AuthenticationError(error.message, {
          "auth": error.message
        });
      }
      return { prisma, hash, res, id: token.id }
    },
    open: () => {
      return { prisma, res, hash }
    }
  }
}

export default model;