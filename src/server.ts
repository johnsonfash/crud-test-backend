import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import 'dotenv/config';
import depthLimit from 'graphql-depth-limit';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { merge } from 'lodash';
import model from './context/model';
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive';
import { Request, Response } from 'express';
import { createServer } from 'http';
import compression from 'compression';
import cors from 'cors';
import { UserType, UserResolver } from './service/userService';
import { AddressType, AddressResolver } from './service/addressService';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageDisabled, ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { uploadFile } from './helper/upload';
import fileUpload from 'express-fileupload';
import { PostResolver, PostType } from './service/postService';

declare global {
  interface BigInt {
    toJSON: () => number;
    fromJSON: () => BigInt;
  }
}

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

BigInt.prototype.fromJSON = function () {
  return BigInt(this.toString());
};

const Query = gql`
  scalar BigInt

  type Query {
    _: String
  }
  type Mutation {
    _: String
  }
`;

async function startApolloServer() {
  const app = express();
  const httpServer = createServer(app);

  let schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, Query, UserType, AddressType, PostType],
    resolvers: merge(AddressResolver, UserResolver, PostResolver)
  });

  schema = constraintDirective()(schema);

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',
    validationRules: [depthLimit(5)],
    context: ({ req, res }: { req: Request, res: Response }) => {
      res.header('Access-Control-Expose-Headers', 'access_token');
      const token = req.headers.authorization || null;
      return model(token?.split(' ')[1], res);
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
    // ApolloServerPluginLandingPageDisabled(), //disable documentation
    // ApolloServerPluginLandingPageGraphQLPlayground(), // offline playground
    ApolloServerPluginLandingPageLocalDefault({ embed: true })  // embed true set it on localhost instead of https server
    ],
  });

  app.use(cors());
  app.use(compression());
  app.use(fileUpload());


  app.post('/upload', async (req: any, res: any) => {
    uploadFile(req, res);
  });

  app.use('/', express.static(__dirname + '/public'));

  await server.start();

  server.applyMiddleware({ app, path: '/graphql' });
  httpServer.listen(3000, (): void => console.log('GraphQL is now running on http://localhost:3000/graphql'));
}

startApolloServer();