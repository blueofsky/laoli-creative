# Changelog

## 1.0.0 (2026-06-08)

### Features

- **CLI Framework**: Command registry, argument parser, help system with global flags
- **5 AI Providers**: Agnes (image), APIMart (image+video), Tuzi (image), MiniMax (image+TTS+music), MiMo (TTS)
- **Commands**: `imagine` (generate/edit/batch), `tts` (synthesize/voices/clone), `video` (generate/query/download), `bgm` (generate), `picgo` (upload/config), `config` (show/set), `auth` (login/status)
- **SDK**: Programmatic API for all capabilities
- **Skills**: Documentation for 5 skills (laoli-imagine, laoli-tts, laoli-video, laoli-bgm, laoli-picgo)
- **Config System**: 6-layer priority (default → user config → project config → .env → env vars → CLI flags)

### Build

- Bun-based build pipeline with ESM output
- TypeScript strict mode enabled

### Notes

- Runtime requires [Bun](https://bun.sh) >= 1.0
