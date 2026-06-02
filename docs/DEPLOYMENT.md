# SnapAssist AI — Deployment Guide

## Build Commands

```bash
# Build all platforms
npm run build

# Platform-specific installers
npm run build:win      # Windows (NSIS installer)
npm run build:mac      # macOS (DMG)
npm run build:linux    # Linux (AppImage + .deb)

# Unpackaged build (for testing)
npm run build:unpack
```

## Output

Built artifacts are placed in `release/`:

| Platform | File | Type |
|----------|------|------|
| Windows | `SnapAssist-AI-Setup-1.0.0.exe` | NSIS Installer |
| macOS | `SnapAssist-AI-1.0.0.dmg` | Disk Image |
| Linux | `SnapAssist-AI-1.0.0.AppImage` | Portable |
| Linux | `snapassist-ai_1.0.0_amd64.deb` | Debian package |

## Code Signing

### Windows
Set environment variables before building:
```bash
$env:CSC_LINK = "path/to/certificate.pfx"
$env:CSC_KEY_PASSWORD = "certificate-password"
```

### macOS
```bash
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate-password"
export APPLE_ID="your@apple.id"
export APPLE_APP_SPECIFIC_PASSWORD="app-specific-password"
```

## Auto-Update (GitHub Releases)

1. Set up a GitHub repository
2. Create a GitHub personal access token
3. Set `GH_TOKEN` environment variable
4. Run: `npm run build:win` (or mac/linux)
5. Publish the release

The app checks for updates on launch and notifies users.

## CI/CD (GitHub Actions)

Create `.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Build installer
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          npx electron-builder --publish always
```
