import { Address, Post, prisma, User } from "@prisma/client";
import { AuthenticationError, gql } from "apollo-server-express";
import { Model } from "../context/model";
import bcrypt from 'bcrypt'
import { AddUserInput, LoginInput } from "../types/user";
import jwt from 'jsonwebtoken'
import fs from 'fs';
import path from 'path'

export const UserType = gql`
type User {
  id: BigInt,
  name: String,
  age: Int,
  password: String,
  email: String,
  created_at: String,
  address: [Address],
  post: [Post],
}

input LoginInput {
  email: String! @constraint(format: "email", uniqueTypeName:"email")
  password: String! @constraint(minLength: 6, uniqueTypeName:"password")
}

input AddUserInput {
  name: String! @constraint(minLength: 6, uniqueTypeName:"name"),
  age: Int! @constraint(min: 18, uniqueTypeName:"age"),
  password: String! @constraint(minLength: 6, uniqueTypeName:"password")
  email: String! @constraint(format: "email", uniqueTypeName:"email")
}

extend type Query {
  me: User
  login(input: LoginInput): User
}

extend type Mutation {
  addUser(input: AddUserInput): User
}
`;

export const UserResolver = {
  Query: {
    login: async (_: unknown, { input }: LoginInput, { open }: Model): Promise<User | null> => {
      const { prisma, res, hash } = open();

      // const signingOptions = {
      //   issuer: 'crud-test',
      //   subject: 'crud-test',
      //   audience: 'https://crud-test.herokuapp.com',
      //   expiresIn: "15h",
      //   algorithm: "RS256"
      // };

      const user = await prisma.user.findUnique({
        where: {
          email: input.email
        }
      });
      if (!user) {
        throw new AuthenticationError('invalid email or password', {
          "email": "this email does not exist"
        });
      }
      const match = await bcrypt.compare(input.password, user.password);
      if (!match) {
        throw new AuthenticationError('you must be logged in', {
          "password": "email or password did not match"
        });
      }

      const token = jwt.sign({ id: user.id }, hash, { algorithm: 'RS256', expiresIn: '15h' });
      res.append('access_token', token);
      return user;
    },
    me: async (_: unknown, __: unknown, { auth }: Model): Promise<Partial<User> | null> => {
      const { prisma, id } = auth();
      const user: Partial<User | null> = await prisma.user.findUnique({
        where: {
          id
        }
      });
      delete user?.password;
      return user;
    }
  },

  Mutation: {
    addUser: async (_: unknown, { input }: AddUserInput, { open }: Model): Promise<User> => {
      const password = await bcrypt.hash(input.password, 10);
      const { prisma } = open();
      return await prisma.user.create({
        data: { ...input, password }
      })
    }
  },

  User: {
    address: async (user: User, __: unknown, { open }: Model): Promise<Address[]> => {
      const { prisma } = open();
      return await prisma.address.findMany({
        where: {
          user_id: user.id
        }
      });
    },
    post: async (user: User, __: unknown, { open }: Model): Promise<Post[]> => {
      const { prisma } = open();
      return await prisma.post.findMany({
        where: {
          user_id: user.id
        }
      });
    }
  }
}