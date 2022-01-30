const { makeExtendSchemaPlugin, gql } = require('graphile-utils');
const { ingestData } = require('./modules/halo/ingest_api.js');

const typeDefs = gql`
  type RefreshDatabase {
    user: Boolean
  }

  input RefreshDatabaseInput {
    user: String!
  }

  extend type Mutation {
    refreshDatabase(input: RefreshDatabaseInput!): RefreshDatabase
  }
`;

const RefreshDatabasePlugin = makeExtendSchemaPlugin(() => {
  return {
    typeDefs,
    resolvers: {
      Mutation: {
        refreshDatabase: async (_query, args) => {
          const user = args.input.user;
          try {
            ingestData(user);
          } catch (e) {
            await pgClient.query('ROLLBACK TO SAVEPOINT graphql_mutation');
          }
          return {
            success: true,
          };
        },
      },
    },
  };
});

module.exports = { RefreshDatabasePlugin };
