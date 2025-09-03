# npm-bug-replication
Personal repository to replicate bugs found in NPM packages.

**Github issue**: https://github.com/badgateway/oauth2-client/issues/193

This branch replicates a race condition with [`@badgateway/oauth2-client`](https://www.npmjs.com/package/@badgateway/oauth2-client) which can cause token exchange to hit the wrong endpoint. When the `OAuth2Client` is used, it will [fetch a config](https://github.com/badgateway/oauth2-client/blob/v3.3.0/src/client.ts#L306) which tells it where the auth endpoints are (AKA endpoint discovery).

To prevent duplicate fetches, the client [sets an internal flag `discoveryDone`](https://github.com/badgateway/oauth2-client/blob/v3.3.0/src/client.ts#L345), which causes discovery to return early when called a second time. However, this flag is set _before_ [the config is actually fetched](https://github.com/badgateway/oauth2-client/blob/v3.3.0/src/client.ts#L354).

If the client is trying to derive an endpoint (e.g. [during token exchange](https://github.com/badgateway/oauth2-client/blob/v3.3.0/src/client/authorization-code.ts#L207)) while discovery is already in progress, it will silently fall back to [appending `/token` to the server URL](https://github.com/badgateway/oauth2-client/blob/v3.3.0/src/client.ts#L323) (e.g. `https://www.example.com/token` if the server URL is `https://www.example.com`). This may be incorrect, depending on your OAuth2 configuration.

## Steps to replicate

This branch requires Deno.

1. Run `deno task test`
2. Confirm test fails, because the 2nd `client.getEndpoint()` call resolves to `https://www.example.com/token` and not `https://www.example.com/auth/token`
