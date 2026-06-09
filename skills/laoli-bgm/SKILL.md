---
name: laoli-bgm
description: AI 背景音乐生成
version: 1.0.0
dependencies:
  cli:
    name: laoli-creative
    version: ">=1.0.0"
---

# Laoli BGM（背景音乐生成）

## 前置条件

- 安装 CLI：`npm install -g laoli-creative`
- 配置 minimax provider 的 API Key：
  ```bash
  laoli auth login --api-key sk-xxxxx --provider minimax
  ```

## 命令

```bash
laoli bgm --prompt "<描述>" --output <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--prompt` | 音乐描述（必填） |
| `--output` | 输出音频文件路径（必填） |
| `--provider` | Provider：`minimax` |
| `--model` | 模型 ID |
| `--lyrics` | 歌词文本（有歌词则自动转为歌曲） |
| `--instrumental` | 纯音乐模式（不加歌词时自动启用） |
| `--json` | JSON 格式输出 |

## 音乐风格参考

Pop、Rock、Jazz、Classical、Electronic、Hip Hop、R&B、Folk、Ambient、Cinematic

## 示例

```bash
# 纯音乐
laoli bgm --prompt "A calm piano melody with gentle strings, relaxing ambient" --output calm.mp3

# 电影配乐
laoli bgm --prompt "Epic orchestral cinematic, dramatic build-up" --output epic.mp3

# 带歌词的歌曲
laoli bgm --prompt "Upbeat pop" --lyrics "[verse] La da dee..." --output song.mp3
```

## 注意事项

- 输出格式固定为 mp3
- 支持中英文歌词，歌词可用 `[verse]`、`[chorus]` 等标签分段
