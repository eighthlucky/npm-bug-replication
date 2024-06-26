// @ts-check

import { Server } from 'socket.io';
import { connect } from 'socket.io-client';
import { App as createApp } from 'uWebSockets.js';

const PORT = 3000;
const SERVER_URL = `http://localhost:${PORT}`;

// Initialize socket.io server with uWebSockets app
const server = new Server({ serveClient: false });
const app = createApp();
server.attachApp(app);

// Listen and wait for it to be ready
await new Promise((r) => app.listen(PORT, r));

// Create a new socket.io client and wait for it to connect
const socket = connect(SERVER_URL);
await new Promise((r) => socket.once('connect', r));

// Mimic a new socket.io client connection with an already connected session ID
// Engine.io will close the connection, but will incorrectly attempt to upgrade it afterwards
// See https://github.com/socketio/engine.io/blob/6.6.0/lib/userver.ts#L213
try {
  new WebSocket(
    `ws://localhost:3000/socket.io/?EIO=4&transport=websocket&sid=${socket.io.engine.id}`,
  );
} catch {}

// Exit when there is no error (i.e. using the patch)
setTimeout(() => process.exit(0), 2_000);
