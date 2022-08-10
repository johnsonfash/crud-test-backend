import { Address, User, Post } from "@prisma/client";
import { gql } from "apollo-server-express";
import { Model } from "../context/model";
import { AddPostInput, UpdatePostInput } from "../types/post";

export const PostType = gql`
  type Post {
    id: BigInt,
    title: String,
    body: String,
    user_id: BigInt,
    user: User
  }

  extend type Query {
    getAllPost: [Post],
    searchPost(text: String!): [Post],
    post(id: Int!): Post
  }

  input AddPostInput {
    title: String!,
    body: String!,
  }

  input UpdatePostInput {
    id: BigInt!
    title: String!,
    body: String!
  }

  extend type Mutation {
  addPost(input: AddPostInput): Post,
  updatePost(input: UpdatePostInput): Boolean,
  deletePost(id: Int!): Boolean
  }
`;

export const PostResolver = {
  Query: {
    post: async (_: unknown, { id }: { id: number }, { auth }: Model): Promise<Post | null> => {
      return await auth().prisma.post.findUnique({
        where: {
          id
        }
      });
    },
    searchPost: async (_: unknown, { text }: { text: string }, { open }: Model): Promise<[Post] | unknown> => {
      const { prisma } = open();
      const string = `%${text}%`;
      const data = prisma.$queryRaw`SELECT * FROM "Post" t WHERE t::text ILIKE ${string};`
      return await data;
    },
    getAllPost: async (_: unknown, __: unknown, { auth }: Model): Promise<Post[]> => {
      const { prisma, id } = auth();
      return await prisma.post.findMany({
        where: {
          user_id: id
        },
        orderBy: {
          id: 'desc'
        }
      })
    }
  },
  Mutation: {
    addPost: async (_: unknown, { input }: AddPostInput, { auth }: Model): Promise<Post> => {
      const { prisma, id } = auth();
      input.user_id = id;
      return await prisma.post.create({ data: input });
    },
    updatePost: async (_: unknown, { input }: UpdatePostInput, { auth }: Model): Promise<boolean> => {
      const { prisma, id } = auth();
      const newAddress = await prisma.post.updateMany({ where: { id: input.id, user_id: id }, data: input });
      return Boolean(newAddress);
    },
    deletePost: async (_: unknown, { id }: { id: number }, { auth }: Model): Promise<boolean> => {
      const { prisma, id: userId } = auth();
      const deleteAddress = await prisma.post.deleteMany({
        where: {
          AND: [
            { user_id: userId },
            { id }
          ]
        }
      });
      return Boolean(deleteAddress);
    },
  },
  Post: {
    user: async (address: Address, __: unknown, { open }: Model): Promise<User | null> => {
      const { prisma } = open();
      return await prisma.user.findUnique({
        where: {
          id: address.user_id
        }
      });
    }
  }
}