# Laoli Creative

[![CI](https://github.com/blueofsky/laoli-creative/actions/workflows/ci.yml/badge.svg)](https://github.com/blueofsky/laoli-creative/actions/workflows/ci.yml)

Laoli Creative - AI 内容创作 CLI 工具

> Skills 文档请移步 [laoli-recipe](https://github.com/blueofsky/laoli-recipe)

## Installation

```bash
npm install -g laoli-creative
```

## Quick Start

```bash
# Configure API key
laoli auth login --api-key sk-xxxxx --provider agnes

# Generate image
laoli image generate --prompt "A cat" --output cat.png

# Generate TTS
laoli tts speak --text "Hello" --output hello.mp3

# Generate video
laoli video generate --prompt "Ocean waves" --output ocean.mp4
```

## Commands

### Image Generation

```bash
laoli image generate --prompt <text> --output <path> [options]
laoli image batch --batchfile <path> [options]
```

### TTS

```bash
laoli tts speak --text <text> --output <path> [options]
laoli tts voice [--provider minimax|mimo]
```

### Video Generation

```bash
laoli video generate --prompt <text> --output <path> [options]
laoli video batch --batchfile <path> [options]
laoli video query --task-id <id>
laoli video download --task-id <id>
laoli video list
laoli video history
```

### Music

```bash
laoli music --prompt <text> --output <path> [options]
```

### Image Upload

```bash
laoli picgo upload --input <path> [options]
laoli picgo config --repo <owner/repo> --token <token> [options]
```

### Logs

```bash
laoli logs [options]
laoli logs --list
laoli logs --follow
```

### Configuration

```bash
laoli config show [--section <name>]
laoli config set --key <key> --value <value>
```

### Authentication

```bash
laoli auth login --api-key <key> [--provider <name>]
laoli auth status
```

## Global Options

| Option | Description |
|--------|-------------|
| `--api-key <key>` | API key |
| `--region <region>` | Region: global, cn |
| `--output <format>` | Output format: text, json |
| `--quiet` | Suppress non-essential output |
| `--verbose` | Verbose output (enable DEBUG logs) |
| `--log-level <level>` | Log level: DEBUG, INFO, WARN, ERROR |
| `--dry-run` | Dry run mode |
| `--non-interactive` | Non-interactive mode |
| `--help, -h` | Show help |
| `--version, -v` | Show version |

## Configuration

Configuration files are stored in:

- User config: `~/.laoli/config.json`
- Log config: `~/.laoli/log4js.json`
- Environment variables: `~/.laoli/.env`
- API Keys: `~/.laoli/.env`

### Quick Setup

```bash
# Copy example config
cp config/config.example.json ~/.laoli/config.json

# Set environment variables in ~/.laoli/.env
echo "AGNES_API_KEY=sk-xxxxx" >> ~/.laoli/.env
```

## Providers

| Provider | Image | Video | TTS | Music |
|----------|:-----:|:-----:|:---:|:-----:|
| agnes | ✅ | ✅ | - | - |
| apimart | ✅ | ✅ | - | - |
| tuzi | ✅ | ✅ | - | - |
| minimax | - | - | ✅ | ✅ |
| mimo | - | - | ✅ | - |

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build
bun run build

# Test
bun test
```

## License

MIT
