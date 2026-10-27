import { Server } from "ssh2";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { generateKeyPairSync } from "crypto";
import { startInkPortfolio } from "./index";

// ─── Logger Preservation ──────────────────────────────────────────
const safeLog = console.log.bind(console);
const safeWarn = console.warn.bind(console);
const safeError = console.error.bind(console);

// ─── Environment Configuration ────────────────────────────────────
const PORT = parseInt(process.env.PORT || "2222", 10);
const HOST = process.env.HOST || "0.0.0.0";
const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS || "50", 10);
const MAX_PER_IP = parseInt(process.env.MAX_PER_IP || "5", 10);
const IDLE_TIMEOUT_MS = parseInt(
  process.env.IDLE_TIMEOUT_MS || String(10 * 60 * 1000),
  10,
); // Default: 10 minutes

// ─── Host Key Resolution & Auto-Generation ────────────────────────
function getOrCreateHostKey(): string | Buffer {
  // 1. Direct environment variable (ideal for cloud/PaaS deployment)
  if (process.env.SSH_HOST_KEY) {
    return process.env.SSH_HOST_KEY;
  }

  // 2. File path resolution
  const keyPath = process.env.HOST_KEY_PATH || join(process.cwd(), "host.key");

  if (existsSync(keyPath)) {
    return readFileSync(keyPath);
  }

  // 3. Auto-generate persistent 2048-bit RSA key
  safeLog("[i] No host key found. Auto-generating secure 2048-bit RSA key...");
  const { privateKey } = (generateKeyPairSync as any)("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });

  try {
    const dir = dirname(keyPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(keyPath, privateKey, { mode: 0o600 });
    safeLog(`[+] Saved generated host key to ${keyPath}`);
  } catch (err: any) {
    safeWarn(`[!] Could not persist host key to disk (${err?.message}), using ephemeral memory key.`);
  }

  return privateKey;
}

const hostKey = getOrCreateHostKey();

// ─── Connection & Rate Limiting State ─────────────────────────────
let activeConnections = 0;
const ipConnectionCount = new Map<string, number>();
const activeClients = new Set<any>();

// ─── SSH Server Factory ───────────────────────────────────────────
const server = new Server({ hostKeys: [hostKey] }, (client, info) => {
  const clientIp = info.ip || "unknown";

  // 1. Global Capacity Guard
  if (activeConnections >= MAX_CONNECTIONS) {
    safeWarn(`[!] Rejected ${clientIp}: Server is at capacity (${activeConnections}/${MAX_CONNECTIONS}).`);
    client.end();
    return;
  }

  // 2. Per-IP Rate Limiting
  const currentIpCount = ipConnectionCount.get(clientIp) || 0;
  if (currentIpCount >= MAX_PER_IP) {
    safeWarn(`[!] Rejected ${clientIp}: Too many connections from this IP (${currentIpCount}/${MAX_PER_IP}).`);
    client.end();
    return;
  }

  // Register Connection
  activeConnections++;
  ipConnectionCount.set(clientIp, currentIpCount + 1);
  activeClients.add(client);
  safeLog(`[+] connect ${clientIp} (active: ${activeConnections}/${MAX_CONNECTIONS})`);

  let connectionDeregistered = false;
  const deregisterConnection = () => {
    if (connectionDeregistered) return;
    connectionDeregistered = true;
    activeClients.delete(client);
    activeConnections = Math.max(0, activeConnections - 1);
    const count = ipConnectionCount.get(clientIp) || 1;
    if (count <= 1) {
      ipConnectionCount.delete(clientIp);
    } else {
      ipConnectionCount.set(clientIp, count - 1);
    }
    safeLog(`[-] disconnect ${clientIp} (active: ${activeConnections}/${MAX_CONNECTIONS})`);
  };

  client.on("close", deregisterConnection);
  client.on("error", (err) => {
    safeWarn(`[!] Client ${clientIp} error: ${err.message}`);
    deregisterConnection();
  });

  // Accept anonymous SSH authentication
  client.on("authentication", (ctx) => ctx.accept());

  client.on("ready", () => {
    client.on("session", (accept) => {
      const session = accept();

      let rows = 24;
      let cols = 80;

      session.on("pty", (acceptPty, _, ptyInfo) => {
        rows = ptyInfo.rows;
        cols = ptyInfo.cols;
        acceptPty?.();
      });

      session.on("shell", async (acceptShell) => {
        const stream = acceptShell();

        // Attach dimensions & required TTY methods for Ink
        (stream as any).columns = cols;
        (stream as any).rows = rows;
        (stream as any).isTTY = true;
        (stream as any).setRawMode = () => {};
        (stream as any).ref = () => {};
        (stream as any).unref = () => {};

        // Line-ending normalization (ensure \r\n for raw terminal streams)
        const originalWrite = stream.write.bind(stream);
        (stream as any).write = (chunk: any, encoding?: any, cb?: any) => {
          if (typeof chunk === "string") {
            return originalWrite(chunk.replace(/(?<!\r)\n/g, "\r\n"), encoding, cb);
          } else if (Buffer.isBuffer(chunk)) {
            return originalWrite(chunk.toString().replace(/(?<!\r)\n/g, "\r\n"), encoding, cb);
          }
          return originalWrite(chunk, encoding, cb);
        };

        // Enter Alternate Screen Buffer, Hide Cursor, Clear Screen
        stream.write("\x1b[?1049h\x1b[?25l\x1b[2J\x1b[H");

        let appSession: { waitUntilExit: () => Promise<void>; unmount: () => void } | null = null;
        let isCleanedUp = false;
        let idleTimer: NodeJS.Timeout | null = null;

        const cleanup = () => {
          if (isCleanedUp) return;
          isCleanedUp = true;

          if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
          }

          // Explicitly unmount Ink and release React fiber tree & intervals
          try {
            appSession?.unmount();
          } catch {}

          // Exit Alternate Screen Buffer, Restore Cursor
          try {
            stream.write("\x1b[?1049l\x1b[?25h");
            stream.end();
          } catch {}
        };

        // Idle Inactivity Timeout (refreshes on every keystroke)
        const resetIdleTimer = () => {
          if (idleTimer) clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            try {
              stream.write("\r\n\x1b[33m[!] Session disconnected due to inactivity.\x1b[0m\r\n");
            } catch {}
            cleanup();
          }, IDLE_TIMEOUT_MS);
        };

        stream.on("data", () => {
          resetIdleTimer();
        });
        resetIdleTimer();

        // Responsive Terminal Resize Handling
        session.on("window-change", (acceptResize, _, win) => {
          cols = win.cols;
          rows = win.rows;
          (stream as any).columns = cols;
          (stream as any).rows = rows;
          stream.emit("resize");
          acceptResize?.();
        });

        stream.on("close", cleanup);
        stream.on("error", () => cleanup());

        try {
          appSession = startInkPortfolio({
            stdin: stream,
            stdout: stream,
          });
          await appSession.waitUntilExit();
        } catch (err) {
          safeError(`[!] Ink session error (${clientIp}):`, err);
        } finally {
          cleanup();
        }
      });

      // Reject non-interactive sub-systems
      session.on("exec", (_, reject) => reject?.());
      session.on("sftp", (_, reject) => reject?.());
    });
  });
});

// ─── Graceful Shutdown & Process Traps ────────────────────────────
const shutdown = (signal: string) => {
  safeLog(`\n[i] Received ${signal}. Initiating graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    safeLog("[i] SSH server listener closed.");
  });

  // Politely close remaining active client sessions
  for (const client of activeClients) {
    try {
      client.end();
    } catch {}
  }

  setTimeout(() => {
    safeLog("[✓] Shutdown complete. Goodbye!");
    process.exit(0);
  }, 1000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Global safety net for unhandled errors
process.on("uncaughtException", (err) => {
  safeError("[!] Uncaught Exception in SSH process:", err);
});

process.on("unhandledRejection", (reason) => {
  safeError("[!] Unhandled Rejection in SSH process:", reason);
});

// ─── Server Start ─────────────────────────────────────────────────
server.listen(PORT, HOST, () => {
  safeLog("───────────────────────────────────────────────────");
  safeLog(`✅ Hardened Ink SSH Server running on ${HOST}:${PORT}`);
  safeLog(`   Capacity: ${MAX_CONNECTIONS} max users | ${MAX_PER_IP} per IP`);
  safeLog(`   Idle Timeout: ${Math.round(IDLE_TIMEOUT_MS / 60000)} minutes`);
  safeLog(`   Connect command: ssh -p ${PORT} 127.0.0.1`);
  safeLog("───────────────────────────────────────────────────");
});
