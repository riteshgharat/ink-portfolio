# Ink Portfolio 🚀

Interactive, responsive retro-modern terminal portfolio powered by [React Ink](https://github.com/vadimdemedes/ink) and [Bun](https://bun.sh). Accessible locally and over SSH (`ssh.riteshgharat.in`).

---

## Features

- **Responsive Architecture**: 50%–50% horizontal desktop split (ASCII portrait + dynamic content) and adaptive vertical mobile layout with auto-cropped ASCII portrait. Zero screen-flicker and zero line wrapping.
- **Client-Side Hyperlinks**: Uses standard OSC 8 terminal hyperlinks (`\x1b]8;;url\x07...`) for Contact and Project GitHub links. Click or Ctrl+Click opens directly in your visitor's local terminal emulator without running anything on the server.
- **Hardened SSH Daemon**:
  - Auto-generates persistent 2048-bit RSA host key if none exists.
  - Global connection concurrency limits (`MAX_CONNECTIONS`).
  - Per-IP rate limiting (`MAX_PER_IP`) to block abusive bots and port scanners.
  - Inactivity idle timeout (`IDLE_TIMEOUT_MS`) to reclaim zombie connections.
  - Full React tree unmount and resource release on client disconnect.
  - Graceful `SIGTERM` / `SIGINT` signal traps.
- **Dynamic Theming**: Press `t` to cycle themes (`cyan`, `green`, `yellow`, `magenta`, `blue`).
- **Separated Content Model**: All editable text, projects, contact info, and shortcuts live in [`src/content.ts`](./src/content.ts).

---

## Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Local Interactive Preview
```bash
bun run dev
```

### 3. Start SSH Server
```bash
bun run server
```

Then connect from another terminal:
```bash
ssh -p 2222 127.0.0.1
# or in production:
# ssh ssh.riteshgharat.in
```

---

## Production Docker Deployment

Deploy with Docker in one command:

```bash
docker compose up -d
```

View live server logs:
```bash
docker compose logs -f portfolio
```

### Configuration (`.env` or Docker environment)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `2222` | Port for the SSH server |
| `HOST` | `0.0.0.0` | Bind host address |
| `MAX_CONNECTIONS` | `50` | Maximum simultaneous active sessions |
| `MAX_PER_IP` | `5` | Maximum active connections per IP (anti-abuse) |
| `IDLE_TIMEOUT_MS` | `600000` | Inactivity timeout in ms (10 minutes) |
| `HOST_KEY_PATH` | `./host.key` | Path to persistent RSA host key |
| `SSH_HOST_KEY` | *(empty)* | Optional raw PEM private key string |

---

## Keyboard Controls

| Key | Action |
| :--- | :--- |
| `[← / →]` or `[h / l]` | Navigate directories on main screen |
| `[↑ / ↓]` or `[j / k]` | Select projects in `$ ls -la` |
| `[1 - 4]` | Jump directly to project 1–4 |
| `[↵]` (Enter) | Enter selected directory |
| `[ESC]` / `[Backspace]` | Return to previous / main screen |
| `[t]` | Cycle color theme |
| `[q]` / `[Ctrl+C]` | Quit session |
| `Click / Ctrl+Click` | Open GitHub / Contact URLs (client-side OSC 8) |

---

## Project Structure

```text
ink-portfolio/
├── Dockerfile              # Production container build
├── docker-compose.yml      # 1-click Docker orchestration with persistent volume
├── .env.example            # Environment variables template
├── src/
│   ├── App.tsx             # Responsive TUI React Ink components
│   ├── content.ts          # Centralized editable portfolio data & links
│   ├── ascii-art.ts        # ASCII art & banners
│   ├── server.ts           # Hardened production SSH2 server
│   ├── index.tsx           # Ink session lifecycle & render entrypoint
│   ├── dev.tsx             # Local terminal runner
│   └── assets/             # Raw ASCII portrait text files
```
