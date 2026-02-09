# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language, and the AI generates React components in a virtual file system with real-time preview.

## Essential Commands

### Setup
```bash
npm run setup              # Install deps + generate Prisma client + run migrations
```

### Development
```bash
npm run dev                # Start dev server with Turbopack at localhost:3000
npm run dev:daemon         # Start as background daemon (logs to logs.txt)
```

### Testing
```bash
npm test                   # Run Vitest tests
```

### Database
```bash
npx prisma generate        # Generate Prisma client after schema changes
npx prisma migrate dev     # Create and apply new migrations
npm run db:reset           # Reset database (WARNING: deletes all data)
npx prisma studio          # Open database GUI
```

### Build & Production
```bash
npm run build              # Production build (requires NODE_OPTIONS='--require ./node-compat.cjs')
npm start                  # Start production server
npm run lint               # Run ESLint
```

## Architecture Overview

### Core Data Flow
```
User Chat Input → /api/chat (AI SDK) → AI Tools (str_replace_editor, file_manager)
    ↓
VirtualFileSystem (in-memory)
    ↓
├─ PreviewFrame: Transforms JSX → iframe with import maps + esm.sh CDN
├─ CodeEditor: Monaco editor with syntax highlighting
└─ Database: Persists to Prisma SQLite (for authenticated users)
```

### Virtual File System

The application uses an **in-memory virtual file system** (`src/lib/file-system.ts`) that:
- Never writes files to disk
- Stores all files in a Map-based tree structure
- Serializes to JSON for database persistence
- Entry point is always `/App.jsx` or `/App.tsx`

**Key operations:**
- `createFile(path, content)` - Creates file with parent directories
- `updateFile(path, content)` - Modifies file content
- `deleteFile(path)` - Recursive deletion
- `rename(oldPath, newPath)` - Moves files/directories
- `serialize()` / `deserialize()` - JSON conversion for storage

### AI Component Generation

The `/api/chat` endpoint (`src/app/api/chat/route.ts`) uses Vercel AI SDK with two tools:

1. **str_replace_editor** (`src/lib/tools/str-replace.ts`)
   - View, create, or edit files
   - Operations: `view`, `str_replace`, `insert`, `create`
   - All edits must use exact string matching

2. **file_manager** (`src/lib/tools/file-manager.ts`)
   - Rename and delete operations
   - Commands: `rename`, `delete`

The AI is instructed via system prompt (`src/lib/prompts/generation.tsx`) to:
- Create React components with Tailwind CSS
- Use `/` as root directory
- Always create `/App.jsx` as entry point
- Use `@/` import alias for local files

### JSX Transformation & Preview

The preview system (`src/lib/transform/jsx-transformer.ts`) performs:

1. **Babel transformation**: JSX → CommonJS with React runtime
2. **Import map creation**:
   - Local files → Blob URLs
   - Third-party packages → esm.sh CDN
   - Missing imports → Placeholder components
3. **HTML generation**: Injects import maps + Tailwind CDN into iframe srcdoc

Preview auto-updates when the virtual file system changes (via `refreshTrigger` counter).

### Authentication & Projects

- **Auth**: JWT-based sessions (`src/lib/auth.ts`) stored in HTTP-only cookies (7-day expiry)
- **Database**: Prisma with SQLite (`prisma/schema.prisma`)
  - `User`: email, password (bcrypt), projects relation
  - `Project`: name, userId, messages (JSON), data (JSON)
- **Server Actions** (`src/actions/`): All database operations use Next.js server actions with auth checks
- **Anonymous mode**: Users can work without login (no persistence)

### State Management

Two React Context providers manage application state:

1. **FileSystemProvider** (`src/lib/contexts/file-system-context.tsx`)
   - Wraps VirtualFileSystem in React Context
   - Handles tool calls from AI (`handleToolCall`)
   - Manages selected file state
   - Triggers UI refresh via counter

2. **ChatProvider** (`src/lib/contexts/chat-context.tsx`)
   - Uses Vercel AI SDK's `useChat` hook
   - Manages message history and streaming
   - Coordinates with FileSystemContext for tool execution

### Key Technical Constraints

- **Import alias**: Always use `@/` for local imports (configured in tsconfig.json)
- **Entry point**: Preview requires `/App.jsx` or `/App.tsx` as root component
- **Tailwind**: Loaded via CDN in preview (Tailwind v4 in dev environment)
- **React version**: React 19 with new JSX transform
- **No file I/O**: Virtual file system never writes to disk
- **Max AI iterations**: Chat API limits to 40 tool execution steps

### Code Style

- **Comments**: Use sparingly. Only comment complex code that isn't self-explanatory.

### Testing

- **Framework**: Vitest with jsdom environment
- **Testing Library**: @testing-library/react for component tests
- **Test location**: `__tests__` directories next to source files
- **Coverage**: Tests exist for file-system, jsx-transformer, and major UI components

## Database & Prisma

### Schema Reference

The database schema is defined in `prisma/schema.prisma`. Always reference this file when working with database operations to understand the structure of stored data.

### Custom Output Location

The Prisma client is generated to `src/generated/prisma` (not default location). Always import from:
```typescript
import { PrismaClient } from '@/generated/prisma'
```

## Environment Variables

Optional `.env` configuration:
```
ANTHROPIC_API_KEY=your-api-key-here  # If not set, uses mock static code generator
```
