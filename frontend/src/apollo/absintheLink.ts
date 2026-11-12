import { ApolloLink } from '@apollo/client'
import { print } from 'graphql'
import type { Channel, Socket } from 'phoenix'
import { Observable } from 'rxjs'

type DocReply = { subscriptionId: string }
// @types/phoenix types socket messages as a bare `object`.
type SocketMessage = { topic: string; event: string; payload: { result: ApolloLink.Result } }

/**
 * An Apollo link for GraphQL subscriptions over Absinthe's Phoenix channel
 * protocol: join the `__absinthe__:control` channel, push each subscription
 * as a `doc`, then receive `subscription:data` messages on the topic named by
 * the returned subscription ID.
 */
export const createAbsintheLink = (socket: Socket): ApolloLink => {
  let control: Channel | null = null

  // Connect lazily, so pages without subscriptions never open the socket.
  const controlChannel = (): Channel => {
    if (!control) {
      socket.connect()
      control = socket.channel('__absinthe__:control')
      control.join()
    }

    return control
  }

  return new ApolloLink(
    (operation) =>
      new Observable<ApolloLink.Result>((observer) => {
        const channel = controlChannel()
        let subscriptionId: string | null = null
        let messageRef: string | null = null
        let closed = false

        channel
          .push('doc', { query: print(operation.query), variables: operation.variables })
          .receive('ok', (reply: DocReply) => {
            // Unsubscribed before the server replied: stop it right away.
            if (closed) {
              channel.push('unsubscribe', { subscriptionId: reply.subscriptionId })
              return
            }

            subscriptionId = reply.subscriptionId
            messageRef = socket.onMessage((message) => {
              const { topic, event, payload } = message as SocketMessage

              if (topic === subscriptionId && event === 'subscription:data') {
                observer.next(payload.result)
              }
            })
          })
          .receive('error', (reply: unknown) => {
            observer.error(new Error(`Subscription failed: ${JSON.stringify(reply)}`))
          })

        return () => {
          closed = true

          if (subscriptionId) channel.push('unsubscribe', { subscriptionId })
          if (messageRef) socket.off([messageRef])
        }
      }),
  )
}
