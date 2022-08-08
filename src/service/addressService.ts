import { Address, User, Post } from "@prisma/client";
import { gql } from "apollo-server-express";
import { Model } from "../context/model";
import { AddAddressInput } from "../types/address";

export const AddressType = gql`
  type Address {
    id: BigInt,
    country: String,
    state: String,
    lga: String,
    location: String,
    user_id: BigInt,
    user: User
  }

  extend type Query {
    getAllAddress: [Address],
    searchAddress(text: String!): [Address],
    address(id: Int!): Address
  }

  input AddAddressInput {
  country: String!,
  state: String!,
  lga: String!,
  location: String!
  }

  extend type Mutation {
  addAddress(input: AddAddressInput): Boolean
  }
`;

export const AddressResolver = {
  Query: {
    address: async (_: unknown, { id }: { id: number }, { auth }: Model): Promise<Address | null> => {
      return await auth().prisma.address.findUnique({
        where: {
          id
        }
      });
    },
    searchAddress: async (_: unknown, { text }: { text: string }, { open }: Model): Promise<[Address] | unknown> => {
      const { prisma } = open();
      const string = `%${text}%`;
      const data = prisma.$queryRaw`SELECT * FROM "Address" t WHERE t::text ILIKE ${string};`
      return await data;
    },
    getAllAddress: async (_: unknown, __: unknown, { auth }: Model): Promise<Address[]> => {
      const { prisma, id } = auth();
      return await prisma.address.findMany({
        where: {
          user_id: id
        }
      })
    }
  },
  Mutation: {
    addAddress: async (_: unknown, { input }: AddAddressInput, { auth }: Model): Promise<boolean> => {
      const { prisma, id } = auth();
      input.user_id = id;
      const newAddress = await prisma.address.create({ data: input });
      return Boolean(newAddress);
    },
  },
  Address: {
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
