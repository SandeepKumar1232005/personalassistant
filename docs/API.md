# SnapAssist AI — API Reference

## IPC Channels

### Capture

| Channel | Direction | Arguments | Returns | Description |
|---------|-----------|-----------|---------|-------------|
| `capture:start` | Renderer→Main | none | `void` | Start capture mode |
| `capture:full-screen` | Renderer→Main | none | `string \| null` | Capture full screen |
| `capture:region-selected` | Capture→Main | `{x, y, width, height}` | none | Selected region |
| `capture:cancel` | Capture→Main | none | none | Cancel capture |
| `capture:complete` | Main→Renderer | `string` (base64) | none | Capture result |

### Settings

| Channel | Direction | Arguments | Returns |
|---------|-----------|-----------|---------|
| `settings:get` | Renderer→Main | none | `AppSettings` |
| `settings:set` | Renderer→Main | `Partial<AppSettings>` | `void` |
| `settings:get-api-key` | Renderer→Main | `provider: string` | `string` |
| `settings:set-api-key` | Renderer→Main | `provider, key` | `void` |

### Window

| Channel | Direction | Arguments |
|---------|-----------|-----------|
| `window:minimize` | Renderer→Main | none |
| `window:maximize` | Renderer→Main | none |
| `window:close` | Renderer→Main | none |
| `window:is-maximized` | Renderer→Main | none → `boolean` |

### System

| Channel | Direction | Returns |
|---------|-----------|---------|
| `app:version` | Renderer→Main | `string` |
| `app:platform` | Renderer→Main | `string` |
| `app:electron-version` | Renderer→Main | `string` |

## AI Provider Interface

```typescript
interface AIProvider {
  name: string
  type: ProviderType
  analyzeImage(params: AnalyzeParams): AsyncGenerator<string>
  chat(params: ChatParams): AsyncGenerator<string>
  validateApiKey(key: string): Promise<boolean>
}
```

## Zustand Stores

### `useSettingsStore`
Global app settings persisted to electron-store.

### `useChatStore`
Ephemeral chat session — cleared when session ends.

### `useAIStore`
AI processing state and orchestration.

### `useUIStore`
UI state (sidebar, navigation, toasts).

## Analysis Modes

| Mode | Description |
|------|-------------|
| `explain` | General content explanation |
| `summarize` | Concise summary |
| `ocr` | Text extraction |
| `code-analysis` | Code review and improvement |
| `error-debug` | Error message analysis |
| `ui-understanding` | UI description |
| `table-analysis` | Table data analysis |
| `chart-analysis` | Chart/graph interpretation |
| `diagram-analysis` | Diagram explanation |
| `translate` | Text translation |
| `qa` | Question answering |

## Application Modes

| Mode | Description |
|------|-------------|
| `quick-explain` | Brief, clear explanations |
| `developer` | Code-focused, technical analysis |
| `student` | Educational with analogies |
| `research` | Detailed technical analysis |
| `accessibility` | Image-to-text for screen readers |
