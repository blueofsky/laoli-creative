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

### TTS (Text-to-Speech)

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

### Vision (Image Understanding)

```bash
laoli vision --image <path> --prompt <text>
```

### ASR (Speech-to-Text)

```bash
laoli asr --input <audio-path> [--language auto|zh|en]
```

### Image Upload (PicGo)

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

### Authentication

```bash
laoli auth login --api-key <key> [--provider <name>]
laoli auth status
```

### Configuration

```bash
# View config
laoli config show [--section <name>]
laoli config show --section image

# Get a specific value (bare output, for scripting)
laoli config get --key recipe.schema

# Set a config value
laoli config set --key image.defaultProvider --value agnes
laoli config set --key recipe.schema --value /path/to/recipe.schema.json

# Export JSON schema
laoli config export-schema [--output <path>]
```

### Recipe Configuration (laoli-recipe Skill Config)

管理 [laoli-recipe](https://github.com/blueofsky/laoli-recipe) 项目中所有 AI 技能的统一配置。

```bash
# Initialize recipes.json with default values from schema
laoli recipe init
laoli recipe init --force
laoli recipe init --skill laoli-article-illustrator

# View schema definitions
laoli recipe schema
laoli recipe schema --skill laoli-article-illustrator

# Get skill config values
laoli recipe get
laoli recipe get --skill laoli-article-illustrator
laoli recipe get --skill laoli-article-illustrator --key watermark.enabled

# Set skill config values
laoli recipe set --skill laoli-article-illustrator --key watermark.enabled --value true
laoli recipe set --skill laoli-article-illustrator --key watermark.content --value "@laoli"
laoli recipe set --skill laoli-cover-image --key preferred_palette --value warm
```

> **注意**: 首次使用前需配置 `recipe.schema` 路径：
> ```bash
> laoli config set --key recipe.schema --value /path/to/laoli-recipe/config/recipe.schema.json
> laoli recipe init
> ```

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
- Recipe config: `~/.laoli/recipes.json` (skill configurations)
- Log config: `~/.laoli/log4js.json`
- Environment variables: `~/.laoli/.env`

### Quick Setup

```bash
# Copy example config
cp config/config.example.json ~/.laoli/config.json

# Set environment variables in ~/.laoli/.env
echo "AGNES_API_KEY=sk-xxxxx" >> ~/.laoli/.env

# (Optional) Configure recipe schema for skill management
laoli config set --key recipe.schema --value /path/to/laoli-recipe/config/recipe.schema.json
```

## Providers

| Provider | Image | Video | TTS | Music | Vision | ASR |
|----------|:-----:|:-----:|:---:|:-----:|:------:|:---:|
| agnes | ✅ | ✅ | - | - | - | - |
| apimart | ✅ | ✅ | - | - | - | - |
| tuzi | ✅ | ✅ | - | - | - | - |
| minimax | - | - | ✅ | ✅ | - | - |
| mimo | - | - | ✅ | - | ✅ | ✅ |

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Type check
bun run typecheck

# Build
bun run build

# Test
bun test

# Run specific tests
bun test test/commands/recipe.test.ts
```

## License

MIT
