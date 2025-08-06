"use client";

import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo";
import { AuthProvider } from "@/hooks/useAuth";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </AuthProvider>
  );
}
