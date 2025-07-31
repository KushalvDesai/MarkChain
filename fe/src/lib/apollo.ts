import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: "http://localhost:3001/graphql", // Update to actual backend URL
  cache: new InMemoryCache(),
});
