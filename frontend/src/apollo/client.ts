import { ApolloClient, InMemoryCache } from '@apollo/client';
import { environment } from '@/config/environment';

export const client = new ApolloClient({
    uri: `${environment.apiBaseUrl}/graphql`,
    cache: new InMemoryCache()
});
