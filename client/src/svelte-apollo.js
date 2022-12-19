import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const httpEndpoint = 'http://localhost:3000/graphql';

const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: httpEndpoint,
});

const AUTH_TOKEN = 'apollo-token';

// Cache implementation
const cache = new InMemoryCache();

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
  tokenName: AUTH_TOKEN,
});

export default apolloClient;
