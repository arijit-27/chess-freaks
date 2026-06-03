// server/socket.js
const ws = require('ws');
const db = require('./db');

let wss = null;

function initSocket(server) {
  wss = new ws.Server({ noServer: true });

  // Attach to server upgrade request
  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (wsClient) => {
        wss.emit('connection', wsClient, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', async (wsClient) => {
    console.log('Client connected to WebSocket');

    try {
      // On connection, send active auction state if there is one
      const activeAuction = await db.auctions.getActive();
      if (activeAuction) {
        const player = await db.players.getById(activeAuction.playerId);
        wsClient.send(JSON.stringify({
          type: 'AUCTION_SYNC',
          payload: {
            auction: activeAuction,
            player: player
          }
        }));
      }
    } catch (err) {
      console.error('Error fetching/sending active auction state:', err);
    }

    wsClient.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });

    wsClient.on('error', (err) => {
      console.error('WebSocket client error:', err);
    });
  });
}

function broadcast(type, payload) {
  if (!wss) return;
  const message = JSON.stringify({ type, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(message);
    }
  });
}

module.exports = {
  initSocket,
  broadcast
};
