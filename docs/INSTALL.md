# SnapAssist AI — Installation Guide

## Prerequisites

- **Node.js** 20.x or later
- **npm** 10.x or later (comes with Node.js)
- A Vision-capable AI API key (OpenAI, Anthropic, Google Gemini, or compatible)

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/snapassist-ai/snapassist-ai.git
cd snapassist-ai
npm install
```

### 2. Configure API Key

You have two options:

**Option A: Environment Variable**
```bash
# Windows (PowerShell)
$env:OPENAI_API_KEY = "sk-your-key-here"

# macOS/Linux
export OPENAI_API_KEY="sk-your-key-here"
```

**Option B: In-App Settings**
1. Launch the app
2. Go to Settings → AI Provider
3. Enter your API key
4. Click Save

### 3. Run in Development

```bash
npm run dev
```

The app will launch with hot module replacement enabled.

### 4. Build for Production

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

Built installers will be in the `release/` directory.

## First Run

1. The app starts with the Home page
2. Press **Ctrl + Shift + Space** to capture a screenshot
3. Drag to select a region of your screen
4. The AI will analyze the captured content
5. Ask follow-up questions in the chat

## Supported AI Providers

| Provider | Models | Environment Variable |
|----------|--------|---------------------|
| OpenAI | gpt-4o, gpt-4o-mini | `OPENAI_API_KEY` |
| Anthropic | claude-sonnet-4, claude-haiku-35 | `ANTHROPIC_API_KEY` |
| Google Gemini | gemini-2.5-pro, gemini-2.5-flash | `GEMINI_API_KEY` |
| Custom | Any OpenAI-compatible | N/A |

## Troubleshooting

### Screenshot not working
- **Windows**: Ensure no other app is capturing the global shortcut
- **macOS**: Grant Screen Recording permission in System Preferences → Security & Privacy
- **Linux (Wayland)**: Use X11 session or configure PipeWire

### API connection failed
- Verify your API key is correct
- Check if the endpoint URL is reachable
- For self-hosted models, ensure the server is running
