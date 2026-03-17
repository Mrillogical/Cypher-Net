# Cypher-Net — Real-Time Chat Application

Cypher-Net is a full-stack real-time chat application inspired by Discord.  
It supports server-based communication, channel messaging, and live updates using WebSockets.

---

## 🚀 Features

- JWT-based authentication
- Server and channel management
- Real-time messaging with Socket.io
- Typing indicators
- Message editing and soft deletion
- Cursor-based pagination for messages
- Persistent storage using PostgreSQL + Prisma

---

## 🛠 Tech Stack

**Frontend**
- Next.js (App Router)
- Tailwind CSS
- Zustand (state management)

**Backend**
- Node.js
- Express.js
- Socket.io

**Database**
- PostgreSQL
- Prisma ORM

---

## 📁 Project Structure

```
cypher-net/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB schema (User, Server, Channel, Message)
│   └── src/
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── server.controller.js
│       │   ├── channel.controller.js
│       │   └── message.controller.js
│       ├── middleware/
│       │   ├── auth.js             # JWT verification
│       │   ├── validate.js         # express-validator helper
│       │   └── errorHandler.js     # 404 + global error handler
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── server.routes.js
│       │   ├── channel.routes.js
│       │   └── message.routes.js
│       ├── services/
│       │   └── socket.service.js   # All Socket.io logic
│       ├── utils/
│       │   ├── prisma.js           # Prisma client singleton
│       │   ├── jwt.js              # Token helpers
│       │   └── response.js         # Standardized API responses
│       ├── app.js                  # Express app (no http server)
│       └── index.js                # Entry: http server + Socket.io + DB
│
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx           # Root layout
        │   ├── page.tsx             # / — redirect guard
        │   ├── globals.css
        │   ├── auth/
        │   │   ├── layout.tsx
        │   │   ├── login/page.tsx
        │   │   └── register/page.tsx
        │   └── app/
        │       ├── layout.tsx       # Protected route wrapper
        │       ├── page.tsx         # No-server-selected placeholder
        │       └── channels/
        │           └── [channelId]/
        │               └── page.tsx # Chat view
        ├── components/
        │   ├── layout/
        │   │   ├── AppShell.tsx     # 3-column layout wrapper
        │   │   ├── ServerSidebar.tsx
        │   │   └── ChannelSidebar.tsx
        │   ├── chat/
        │   │   ├── ChatArea.tsx     # Infinite-scroll message list
        │   │   ├── MessageBubble.tsx
        │   │   ├── MessageInput.tsx
        │   │   └── TypingIndicator.tsx
        │   └── server/
        │       ├── CreateServerModal.tsx
        │       ├── CreateChannelModal.tsx
        │       └── DiscoverModal.tsx
        ├── hooks/
        │   ├── useSocket.ts         # Subscribe to channel events
        │   └── useTyping.ts         # Typing indicator emit/receive
        ├── lib/
        │   ├── api.ts               # Axios instance with JWT interceptor
        │   ├── socket.ts            # Socket.io client singleton
        │   └── stores/
        │       ├── authStore.ts     # Zustand — auth state
        │       ├── serverStore.ts   # Zustand — servers
        │       ├── channelStore.ts  # Zustand — channels
        │       └── messageStore.ts  # Zustand — messages per channel
        └── types/
            └── index.ts             # Shared TypeScript interfaces
```

---

## 🗄️ Prisma Schema

```prisma
model User      { id, username, email, passwordHash, createdAt }
model Server    { id, name, ownerId → User }
model ServerMember { id, serverId → Server, userId → User } @@unique([serverId, userId])
model Channel   { id, serverId → Server, name, type(TEXT|ANNOUNCEMENT) }
model Message   { id, channelId → Channel, userId → User, content, createdAt, deleted }
```

---

## 🔌 REST API Reference

### Auth  (`/api/auth`)
| Method | Path         | Auth | Description          |
|--------|--------------|------|----------------------|
| POST   | /register    | —    | Create account       |
| POST   | /login       | —    | Login, get JWT       |
| GET    | /me          | ✓    | Get current user     |

### Servers  (`/api/servers`)
| Method | Path                  | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| GET    | /                     | ✓    | My servers               |
| GET    | /discover             | ✓    | Servers I haven't joined |
| POST   | /                     | ✓    | Create server            |
| POST   | /:serverId/join       | ✓    | Join server              |
| DELETE | /:serverId/leave      | ✓    | Leave server             |
| DELETE | /:serverId            | ✓    | Delete (owner only)      |

### Channels  (`/api/servers/:serverId/channels`)
| Method | Path          | Auth | Description              |
|--------|---------------|------|--------------------------|
| GET    | /             | ✓    | List channels            |
| POST   | /             | ✓    | Create (owner only)      |
| DELETE | /:channelId   | ✓    | Delete (owner only)      |

### Messages  (`/api/channels/:channelId/messages`)
| Method | Path           | Auth | Description              |
|--------|----------------|------|--------------------------|
| GET    | /              | ✓    | Last 50 (cursor paging)  |
| POST   | /              | ✓    | Send via REST            |
| PATCH  | /:messageId    | ✓    | Edit own message         |
| DELETE | /:messageId    | ✓    | Soft-delete message      |

---

## ⚡ WebSocket Events

### Client → Server
| Event           | Payload                              | Description           |
|-----------------|--------------------------------------|-----------------------|
| join_channel    | `{ channelId }`                      | Subscribe to channel  |
| leave_channel   | `{ channelId }`                      | Unsubscribe           |
| send_message    | `{ channelId, content }`             | Send real-time msg    |
| edit_message    | `{ channelId, messageId, content }`  | Edit message          |
| delete_message  | `{ channelId, messageId }`           | Delete message        |
| typing_start    | `{ channelId }`                      | Start typing signal   |
| typing_stop     | `{ channelId }`                      | Stop typing signal    |

### Server → Client
| Event            | Payload                               | Description           |
|------------------|---------------------------------------|-----------------------|
| new_message      | `Message`                             | Broadcast new message |
| message_updated  | `Message`                             | Broadcast edit        |
| message_deleted  | `{ messageId, channelId }`            | Broadcast delete      |
| user_typing      | `{ userId, username, channelId }`     | Typing indicator      |
| user_stop_typing | `{ userId, channelId }`               | Stop indicator        |
| error            | `{ message }`                         | Error from socket     |

---

## 🚀 Setup & Run Instructions

### Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14 running locally (or remote URL)
- npm or yarn

---

### 1. Clone & Install

```bash
git clone <https://github.com/Mrillogical/Cypher-Net> cypher-net
cd cypher-net
```

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

---

### 2. Configure Environment Variables

**Backend** — copy and edit:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/cypher_net"
JWT_SECRET="change-this-to-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=4000
CLIENT_URL="http://localhost:3000"
NODE_ENV="development"
```

**Frontend** — copy and edit:
```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

---

### 3. Create the PostgreSQL Database

```bash
psql -U postgres -c "CREATE DATABASE cypher_net;"
```

---

### 4. Run Prisma Migrations

```bash
cd backend
npx prisma generate       # generates the Prisma Client
npx prisma migrate dev --name init   # creates tables + runs migration
```

To inspect your data visually:
```bash
npx prisma studio
```

---

### 5. Start the Backend

```bash
cd backend
npm run dev
# → Server running on http://localhost:4000
# → WebSocket server ready
```

---

### 6. Start the Frontend

In a new terminal:
```bash
cd frontend
npm run dev
# → Next.js app on http://localhost:3000
```

---

### 7. Open the App

Navigate to **http://localhost:3000**

You'll be redirected to `/auth/login`. Register two accounts in separate tabs to test real-time messaging.

---

## 🏗️ Production Build

**Backend:**
```bash
cd backend
npm start   # runs node src/index.js directly
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

---

## 🔑 Key Design Decisions

| Area | Decision | Reason |
|------|----------|--------|
| Auth | JWT in localStorage | Simple, stateless; use httpOnly cookies in prod |
| Realtime | Socket.io rooms per `channel:${id}` | Scoped broadcast, no cross-channel leakage |
| Messages | Soft delete (`deleted: true`) | Preserves conversation flow |
| Pagination | Cursor-based (createdAt) | Stable order even as new messages arrive |
| State | Zustand per domain | Lightweight, no boilerplate, easy selectors |
| Validation | express-validator + react-hook-form | Server + client-side parity |
| ORM | Prisma | Type-safe queries, great migration tooling |

---

## 🔒 Security Notes for Production

1. **Move JWT to httpOnly cookies** — removes XSS token theft risk
2. **Add rate limiting** — use `express-rate-limit` on auth routes
3. **Helmet.js** — add HTTP security headers
4. **HTTPS** — terminate TLS at load balancer or reverse proxy (nginx)
5. **Env secrets** — never commit `.env`; use a secrets manager
6. **Input sanitization** — already handled via express-validator + Prisma parameterized queries
