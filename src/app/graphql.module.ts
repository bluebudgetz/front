import {NgModule} from '@angular/core';
import {APOLLO_OPTIONS, ApolloModule} from 'apollo-angular';
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {onError} from 'apollo-link-error';
import {concat} from "apollo-link";
import {environment} from '../environments/environment';

function createApollo(httpLink: HttpLink) {
    const mainLink = httpLink.create({
        uri: environment.graphQLURL,
        withCredentials: true,
    });

    const errorLink = onError(({graphQLErrors, networkError}) => {
        if (graphQLErrors) {
            graphQLErrors.map(({message, locations, path}) =>
                console.log(
                    `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
                ),
            );
            // TODO: report errors to global error badge or something

            if (networkError) {
                console.log(`[Network error]: ${networkError}`);
            }
        }
    });

    return {
        link: concat(errorLink, mainLink),
        cache: new InMemoryCache({resultCaching: false}),
        defaultOptions: {
            fetchPolicy: '',
            watchQuery: {
                errorPolicy: 'all'
            }
        },
    };
}

@NgModule({
    exports: [ApolloModule, HttpLinkModule],
    providers: [
        {
            provide: APOLLO_OPTIONS,
            useFactory: (httpLink: HttpLink) => {
                return {
                    cache: new InMemoryCache(),
                    link: httpLink.create({
                        uri: "https://o5x5jzoo7z.sse.codesandbox.io/graphql"
                    })
                }
            },
            deps: [HttpLink],
        },
    ],
})
export class GraphQLModule {
}
