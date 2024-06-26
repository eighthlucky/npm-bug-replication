# npm-bug-replication

Personal repository to replicate bugs found in NPM packages.

**Github issue**: https://github.com/socketio/engine.io/issues/705

This branch replicates a thrown error when using [`socket.io` (and `engine.io`)](https://github.com/socketio/engine.io) along with [`uWebSockets.js`](https://github.com/uNetworking/uWebSockets.js/):

```
Error: uWS.HttpResponse must not be accessed after uWS.HttpResponse.onAborted callback, or after a successful response. See documentation for uWS.HttpResponse and consult the user manual.
```

The potential cause is that `engine.io` attempts to write to a closed connection, which is disallowed by `uWebSockets.js`.

## Steps to replicate

1. Run `npm install`
2. Run `npm start`
3. Confirm it crashes with the above error message

## Potential fix

1. Run `npm install`
2. Run `npm run patch`
3. Run `npm start`
4. Confirm it exits without error
5. Run `npm run unpatch` to clean up
