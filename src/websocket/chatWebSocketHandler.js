/**
 * Couche Transport WebSocket - FindTheJob (2026)
 * Gestionnaire du canal bidirectionnel en temps réel pour le ChatBot Groq AI
 */

const { WebSocketServer, WebSocket } = require('ws');
const { streamChatConversation } = require('../services/chatService');

/**
 * Configure et attache le serveur WebSocket sur l'instance HTTP
 * @param {import('http').Server} httpServer 
 * @returns {WebSocketServer}
 */
function initChatWebSocketServer(httpServer) {
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 1024 * 1024
  });

  console.log('[WebSocket] Serveur WebSocket initialisé (gestion dynamique des upgrades HTTP)');

  // Écoute de l'événement 'upgrade' pour intercepter la négociation WebSocket
  httpServer.on('upgrade', (req, socket, head) => {
    const pathname = (req.url || '').split('?')[0];

    // Accepte les requêtes directes (/ws/chat) ainsi que les routes réécrites par Vercel
    if (
      pathname === '/ws/chat' ||
      pathname.startsWith('/ws') ||
      pathname.startsWith('/api') ||
      pathname === '/'
    ) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  // Heartbeat keep-alive (30 secondes)
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) {
        console.log('[WebSocket] Fermeture socket inactive (heartbeat timeout)');
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  // Évite d'empêcher l'arrêt ou la suspension du processus en environnement serverless
  if (typeof heartbeatInterval.unref === 'function') {
    heartbeatInterval.unref();
  }

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    const clientIp = req.socket.remoteAddress;
    console.log(`[WebSocket] Client connecté depuis ${clientIp}`);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (raw) => {
      try {
        const payload = JSON.parse(raw.toString());
        const { type, job, cvCriteria, messages } = payload;

        if (type === 'ping') {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          }
          return;
        }

        if (type !== 'chat_message') {
          console.warn(`[WebSocket] Type de message non supporté : ${type}`);
          return;
        }

        if (!job || !messages || !Array.isArray(messages)) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              error: 'Format de requête invalide : offre ou historique manquant.'
            }));
          }
          return;
        }

        // Notification de début de streaming
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'start',
            timestamp: Date.now()
          }));
        }

        // Streaming des tokens
        await streamChatConversation({
          job,
          cvCriteria: cvCriteria || null,
          messages,
          onChunk: (delta) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'chunk',
                delta
              }));
            }
          },
          onDone: (fullText, meta = null) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'done',
                fullText,
                isGroqRateLimit: Boolean(meta?.isGroqRateLimit),
                retryAfterSeconds: meta?.retryAfterSeconds || null,
                retryAfterFormatted: meta?.retryAfterFormatted || null
              }));
            }
          },
          onError: (err) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                error: err.message || 'Erreur lors de la génération',
                isGroqRateLimit: Boolean(err.isGroqRateLimit),
                retryAfterSeconds: err.retryAfterSeconds || null,
                retryAfterFormatted: err.retryAfterFormatted || null
              }));
            }
          }
        });

      } catch (err) {
        console.error('[WebSocket] Erreur traitement message client :', err);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Erreur lors du traitement de la requête.'
          }));
        }
      }
    });

    ws.on('error', (err) => {
      console.warn('[WebSocket] Erreur sur socket client :', err.message);
    });

    ws.on('close', (code, reason) => {
      console.log(`[WebSocket] Déconnexion client (code: ${code})`);
    });
  });

  return wss;
}

module.exports = {
  initChatWebSocketServer
};
