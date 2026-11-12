import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { OperationTypeNode } from 'graphql'
import { Socket } from 'phoenix'

import { createAbsintheLink } from './absintheLink'

const apiUrl: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

// Queries and mutations go over HTTP; subscriptions over the Phoenix socket.
const link = ApolloLink.split(
  ({ operationType }) => operationType === OperationTypeNode.SUBSCRIPTION,
  createAbsintheLink(new Socket(`${apiUrl.replace(/^http/, 'ws')}/socket`)),
  new HttpLink({ uri: `${apiUrl}/api/graphql` }),
)

export const client = new ApolloClient({ link, cache: new InMemoryCache() })
