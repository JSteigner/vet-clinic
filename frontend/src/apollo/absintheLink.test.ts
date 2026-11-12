import { ApolloLink, gql } from '@apollo/client';
import type { Socket } from 'phoenix';
import { firstValueFrom, take } from 'rxjs';
import { describe, expect, test, vi } from 'vitest';

import { createAbsintheLink } from './absintheLink';

const SUBSCRIPTION = gql`
  subscription {
    appointmentChanged {
      id
    }
  }
`;

type Message = { topic: string; event: string; payload: unknown };
type Reply = { status: 'ok' | 'error'; response: unknown; deferred?: boolean };

/**
 * A fake phoenix Socket: records pushes, answers each `doc` push with the
 * next queued reply (or holds a deferred one until `release()`), and lets
 * tests emit socket messages.
 */
const fakeSocket = () => {
  const pushes: { event: string; payload: unknown }[] = [];
  const replies: Reply[] = [];
  const handlers = new Map<string, (message: Message) => void>();
  let release = () => {};
  let nextRef = 0;

  const channel = {
    join: vi.fn(),
    push(event: string, payload: unknown) {
      pushes.push({ event, payload });
      const reply = event === 'doc' ? replies.shift() : undefined;

      const push = {
        receive(status: string, callback: (response: unknown) => void) {
          if (reply && reply.status === status) {
            if (reply.deferred) release = () => callback(reply.response);
            else callback(reply.response);
          }

          return push;
        },
      };

      return push;
    },
  };

  const socket = {
    connect: vi.fn(),
    channel: vi.fn(() => channel),
    onMessage(handler: (message: Message) => void) {
      const ref = String(nextRef++);
      handlers.set(ref, handler);
      return ref;
    },
    off(refs: string[]) {
      refs.forEach((ref) => handlers.delete(ref));
    },
  };

  return {
    socket: socket as unknown as Socket,
    pushes,
    handlers,
    reply: (reply: Reply) => replies.push(reply),
    release: () => release(),
    emit: (message: Message) => handlers.forEach((handler) => handler(message)),
    connect: socket.connect,
  };
};

const subscribe = (link: ApolloLink) =>
  ApolloLink.execute(link, { query: SUBSCRIPTION }, { client: {} as never });

describe('createAbsintheLink', () => {
  test('pushes the document and forwards data for its subscription only', async () => {
    const fake = fakeSocket();
    fake.reply({ status: 'ok', response: { subscriptionId: 'sub:1' } });

    const result = firstValueFrom(subscribe(createAbsintheLink(fake.socket)).pipe(take(1)));

    fake.emit({ topic: 'sub:other', event: 'subscription:data', payload: { result: {} } });
    fake.emit({
      topic: 'sub:1',
      event: 'subscription:data',
      payload: { result: { data: { appointmentChanged: { id: '7' } } } },
    });

    expect(await result).toEqual({ data: { appointmentChanged: { id: '7' } } });
    expect(fake.pushes[0]).toMatchObject({ event: 'doc', payload: { variables: {} } });
    expect(fake.connect).toHaveBeenCalledOnce();
  });

  test('unsubscribes and stops listening when the subscription ends', () => {
    const fake = fakeSocket();
    fake.reply({ status: 'ok', response: { subscriptionId: 'sub:1' } });

    subscribe(createAbsintheLink(fake.socket)).subscribe().unsubscribe();

    expect(fake.pushes.at(-1)).toEqual({
      event: 'unsubscribe',
      payload: { subscriptionId: 'sub:1' },
    });
    expect(fake.handlers.size).toBe(0);
  });

  test('unsubscribes when the subscription ends before the server replies', () => {
    const fake = fakeSocket();
    fake.reply({ status: 'ok', response: { subscriptionId: 'sub:1' }, deferred: true });

    subscribe(createAbsintheLink(fake.socket)).subscribe().unsubscribe();
    fake.release();

    expect(fake.pushes.at(-1)).toEqual({
      event: 'unsubscribe',
      payload: { subscriptionId: 'sub:1' },
    });
    expect(fake.handlers.size).toBe(0);
  });

  test('reports an error reply as a subscription error', async () => {
    const fake = fakeSocket();
    fake.reply({ status: 'error', response: { errors: [{ message: 'bad doc' }] } });

    const result = firstValueFrom(subscribe(createAbsintheLink(fake.socket)));

    await expect(result).rejects.toThrow('Subscription failed: {"errors":[{"message":"bad doc"}]}');
  });

  test('connects the socket once for many subscriptions', () => {
    const fake = fakeSocket();
    const link = createAbsintheLink(fake.socket);

    subscribe(link).subscribe();
    subscribe(link).subscribe();

    expect(fake.connect).toHaveBeenCalledOnce();
  });
});
