# Changelog

## 1.0.1 (2026-06-09)

### Features

- **Refactor**: `imagine` → `image` (command, SDK, skill, docs)
- **log4js**: Replace custom logger with log4js (dateFile daily rolling, automatic rotation)
- **HTTP body logging**: Full request/response body at DEBUG level, Authorization auto-masked
- **`laoli logs`**: New command to view/follow log files (`laoli logs`, `laoli logs -f`, `laoli logs --list`)
- **Video config**: `pollInterval`, `batchPollInterval`, `timeout`, `batchTimeout` in config
- **TTS parameters**: Expose `--speed`, `--vol`, `--pitch`, `--emotion`, `--context` (mimo)
- **MiniMax dynamic voices**: `laoli tts voice` now fetches 327 voices via API
- **Short flags**: `-f`, `-h`, `-v` support in CLI parser
- **defaultCommand**: Flat command mode (`laoli music`, `laoli logs` without subcommand)
- **Windows .cmd**: `bin/laoli.cmd` for cmd.exe compatibility

### Fixes

- **MiniMax URL**: `minimax.io` → `minimaxi.com` (was causing auth failures)
- **MiMo TTS**: Rewrote with correct API (`chat/completions`), auth, response parsing
- **Apimart video**: Fix taskId extraction (`data.data[0].task_id`), status mapping (`completed`), response envelope unwrap, local image upload for image-to-video
- **Music**: Fix request body (`output_format`, `audio_setting`), response validation (`base_resp`, `data.status`)
- **Content-Type**: Don't force `application/json` for FormData requests (fixes tuzi video)
- **TTS clone**: Removed from CLI (not supported)
- **Subcommand rename**: `synthesize` → `speak`, `voices` → `voice`
- **PicGo**: Token persisted to `.env` (was process-only), path double-slash fix, reused in agnes provider
- **Logger separation**: All logger functions write to file only, console output clean
- **JSON output**: `--json` output pure JSON without log4js prefix
- **Video download 429**: Skip redundant `queryVideoTask` when URL already known
- **Config defaults**: Video defaultProvider changed from apimart to agnes (free)
- **Test fixes**: Update tests for renamed commands, fix config mock

### Docs

- **Skills**: Full rewrite matching MiniMax format (triggers, workflow, sources, provider comparison, default values)
- **README**: Updated all command examples, fixed provider table, added `laoli logs`
- **CHANGELOG**: This file

## 1.0.0 (2026-06-08)

### Features

- **CLI Framework**: Command registry, argument parser, help system with global flags
- **5 AI Providers**: Agnes (image), APIMart (image+video), Tuzi (image), MiniMax (image+TTS+music), MiMo (TTS)
- **Commands**: `image` (generate/batch), `tts` (speak/voice), `video` (generate/query/download), `music` (generate), `picgo` (upload/config), `config` (show/set), `auth` (login/status)
- **SDK**: Programmatic API for all capabilities
- **Rename**: `bgm` → `music` (CLI command, SDK, skill, tests)
- **Skills**: Documentation for 5 skills (laoli-image, laoli-tts, laoli-video, laoli-music, laoli-picgo)
- **Config System**: 6-layer priority (default → user config → project config → .env → env vars → CLI flags)

### Build

- Bun-based build pipeline with ESM output
- TypeScript strict mode enabled

### Notes

- Runtime requires [Bun](https://bun.sh) >= 1.0
