# SnapAssist AI — Development Guide

## Architecture

SnapAssist AI is an Electron application with three isolated processes:

```
┌─────────────────────────────────────────────────────────┐
│                    Main Process                          │
│  (Node.js runtime)                                       │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Window      │  │  Screenshot   │  │  Secure       │  │
│  │  Manager     │  │  Engine       │  │  Storage      │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Shortcut    │  │  IPC          │  │  Privacy      │  │
│  │  Manager     │  │  Handlers     │  │  Manager      │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ contextBridge
┌───────────────────────┴─────────────────────────────────┐
│                   Preload Scripts                         │
│  index.ts (main window)    capture.ts (capture window)   │
└───────────────────────┬─────────────────────────────────┘
                        │ window.electronAPI
┌───────────────────────┴─────────────────────────────────┐
│                  Renderer Process                         │
│  (React + TypeScript)                                    │
│                                                          │
│  ┌─── Stores ───┐  ┌─── Services ───┐  ┌─── Pages ───┐ │
│  │ settings     │  │ AI providers   │  │ Home        │  │
│  │ chat         │  │ (OpenAI,       │  │ Chat        │  │
│  │ ai           │  │  Anthropic,    │  │ Settings    │  │
│  │ ui           │  │  Gemini,       │  │ About       │  │
│  │              │  │  Custom)       │  │             │  │
│  └──────────────┘  └────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── main/           # Electron main process (Node.js)
├── preload/        # Preload scripts (contextBridge)
└── renderer/       # React application
    ├── src/
    │   ├── components/   # UI components
    │   ├── pages/        # Page-level components
    │   ├── stores/       # Zustand state stores
    │   ├── services/     # AI provider abstraction
    │   ├── hooks/        # Custom React hooks
    │   ├── lib/          # Utilities and constants
    │   ├── types/        # TypeScript type definitions
    │   └── assets/       # CSS and static assets
    └── capture/     # Separate entry for capture overlay
```

## Key Design Decisions

### Security
- **Context Isolation**: All windows use `contextIsolation: true`
- **No Node Integration**: `nodeIntegration: false` in all renderers
- **Preload Bridge**: Only specific, typed APIs exposed via `contextBridge`
- **API Key Encryption**: Uses `safeStorage` (OS-level encryption)

### Privacy
- Screenshots exist only as in-memory base64 strings
- No file system writes for captured images
- Session data cleared when overlay/chat is closed
- Auto-cleanup timer for any temp files

### AI Abstraction
- Factory pattern for provider creation
- All providers implement the same `AIProvider` interface
- Streaming responses via `AsyncGenerator`
- Provider switching requires zero code changes

## Adding a New AI Provider

1. Create `src/renderer/src/services/ai/my-provider.ts`
2. Extend `BaseProvider` or implement `AIProvider`
3. Register in `provider-factory.ts`
4. Add to `ProviderType` union in `types/ai.ts`
5. Add models list in `types/settings.ts`

## Adding a New Analysis Mode

1. Add the mode to `AnalysisMode` union in `types/ai.ts`
2. Add label in `ANALYSIS_MODE_LABELS`
3. Add system prompt in `lib/prompts.ts`
4. Add user prompt in `base-provider.ts`

## Development Commands

```bash
npm run dev          # Start dev server with HMR
npm run build        # Build for production
npm run typecheck    # Run TypeScript checks
npm run test         # Run unit tests
npm run lint         # Run ESLint
```
