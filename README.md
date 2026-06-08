# Laoli Creative

Laoli Creative - AI Content Creation Toolkit with Skills

## Installation

```bash
npm install -g laoli-creative
```

## Quick Start

```bash
# Configure API key
laoli auth login --api-key sk-xxxxx --provider agnes

# Generate image
laoli imagine generate --prompt "A cat" --output cat.png

# Generate TTS
laoli tts synthesize --text "Hello" --output hello.mp3

# Generate video
laoli video generate --prompt "Ocean waves" --output ocean.mp4
```

## Commands

### Image Generation

```bash
laoli imagine generate --prompt <text> --output <path> [options]
laoli imagine edit --input <path> --prompt <text> --output <path> [options]
laoli imagine batch --batchfile <path> [options]
```

### TTS

```bash
laoli tts synthesize --text <text> --output <path> [options]
laoli tts voices [--provider <name>]
laoli tts clone --voice-file <path> --text <text> --output <path> [options]
```

### Video Generation

```bash
laoli video generate --prompt <text> --output <path> [options]
laoli video query --task-id <id>
laoli video download --task-id <id> --output <path>
```

### Background Music

```bash
laoli bgm generate --prompt <text> --output <path> [options]
```

### Image Upload

```bash
laoli picgo upload --input <path> [options]
laoli picgo config --repo <owner/repo> --token <token> [options]
```

### Configuration

```bash
laoli config show [--section <name>]
laoli config set --key <key> --value <value>
```

### Authentication

```bash
laoli auth login --api-key <key> [--provider <name>]
laoli auth logout [--provider <name>]
laoli auth status
```

## Global Options

| Option | Description |
|--------|-------------|
| `--api-key <key>` | API key |
| `--region <region>` | Region: global, cn |
| `--output <format>` | Output format: text, json |
| `--quiet` | Suppress non-essential output |
| `--verbose` | Verbose output |
| `--dry-run` | Dry run mode |
| `--non-interactive` | Non-interactive mode |
| `--help, -h` | Show help |
| `--version, -v` | Show version |

## Configuration

Configuration files are stored in:

- User config: `~/.laoli/config.json`
- Project config: `.laoli/config.json`
- Environment variables: `~/.laoli/.env`, `.laoli/.env`

### Configuration Files

| File | Description |
|------|-------------|
| `config/config.example.json` | Example configuration file |
| `config/config.schema.json` | Configuration schema for validation |
| `config/.env.example` | Example environment variables |

### Quick Setup

```bash
# Copy example config
cp config/config.example.json ~/.laoli/config.json

# Edit config
vi ~/.laoli/config.json

# Or set environment variables
export LAOLI_API_KEY=sk-xxxxx
export AGNES_API_KEY=xxxxx
```

## Providers

| Provider | Supported Features |
|----------|-------------------|
| agnes | Image generation, Image editing |
| apimart | Image generation, Image editing, Video generation |
| tuzi | Image generation, Image editing |
| minimax | Image generation, TTS, Music |
| mimo | TTS (预置音色、音色设计、音色克隆、唱歌) |

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
