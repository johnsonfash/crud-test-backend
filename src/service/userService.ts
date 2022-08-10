import { Address, Post, User } from "@prisma/client";
import { AuthenticationError, gql } from "apollo-server-express";
import { Model } from "../context/model";
import bcrypt from 'bcrypt'
import { AddUserInput, EditUserInput, LoginInput } from "../types/user";
import { createTokens } from "../helper/utils";

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
  password: String! @constraint(minLength: 6, uniqueTypeName:"password")
  email: String! @constraint(format: "email", uniqueTypeName:"email")
}

input EditUserInput {
  name: String @constraint(minLength: 6, uniqueTypeName:"name"),
  age: Int
}

extend type Query {
  me: User,
  accessToken: Boolean,
  login(input: LoginInput): User
}

extend type Mutation {
  addUser(input: AddUserInput): User,
  editUser(input: EditUserInput): User
}
`;

export const UserResolver = {
  Query: {
    accessToken: async (_: unknown, __: unknown, { auth }: Model): Promise<boolean> => Boolean(auth()),
    login: async (_: unknown, { input }: LoginInput, { open }: Model): Promise<boolean> => {
      const { prisma, res, hash } = open();
      const user = await prisma.user.findUnique({
        where: {
          email: input.email
        },
        select: {
          password: true,
          id: true
        }
      });
      if (!user) {
        throw new AuthenticationError('invalid email or password', {
          "email": "this email does not exist"
        });
      }
      const match = await bcrypt.compare(input.password, user.password);
      if (!match) {
        throw new AuthenticationError('email or password did not match', {
          "password": "email or password did not match"
        });
      }
      createTokens(res, user.id, hash)
      return Boolean(user);
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
    },
    editUser: async (_: unknown, { input }: EditUserInput, { auth }: Model): Promise<Partial<User> | null> => {
      const { prisma, id } = auth();
      const user: Partial<User | null> = await prisma.user.update({
        where: {
          id
        },
        data: {
          ...input
        }
      });
      delete user?.password;
      return user;
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