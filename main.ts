import { OAuth2Client } from '@badgateway/oauth2-client';
import { assertEquals } from '@std/assert';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

Deno.test('resolves the correct endpoint while discovery is in-progress', async (t) => {
  using cleanup = new DisposableStack();

  const server = setupServer();
  cleanup.defer(() => server.close());

  // Having an extra prefix `/<string>` is necessary to replicate the bug.
  // Otherwise, it will match the fallback `/token`
  const TOKEN_ENDPOINT = new URL('/auth/token', location.origin).href;
  await t.step('mock config response', () => {
    server.use(
      http.get(
        '*/.well-known/oauth-authorization-server',
        () => {
          return HttpResponse.json({
            token_endpoint: TOKEN_ENDPOINT,
          });
        },
      ),
    );

    server.listen({ onUnhandledRequest: 'error' });
  });

  await t.step(
    'assert multiple discovery calls resolve to same endpoint',
    async () => {
      const client = new OAuth2Client({
        clientId: 'foo',
        server: location.href,
      });

      // Discovery via client.getEndpoint() happens once on first call to methods like
      // client.refreshToken().
      // When multiple calls to client.getEndpoint() happen before discovery completes,
      // the client will resolve to `/token` for the token endpoint, which may not be
      // correct.
      const [first, second] = await Promise.all([
        client.getEndpoint('tokenEndpoint'),
        client.getEndpoint('tokenEndpoint'),
      ]);

      assertEquals(first, TOKEN_ENDPOINT);
      assertEquals(second, TOKEN_ENDPOINT);
    },
  );
});
