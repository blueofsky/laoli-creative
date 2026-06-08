---
name: laoli-bgm
description: 背景音乐生成技能，支持纯音乐和带歌词的音乐生成
version: 1.0.0
dependencies:
  cli:
    name: laoli-creative
    version: ">=1.0.0"
---

# 背景音乐生成 Skill

使用 `laoli bgm` 命令生成背景音乐。

## 前置条件

```bash
# 安装 CLI
npm install -g laoli-creative

# 配置 API Key
laoli auth login --api-key sk-xxxxx --provider minimax
```

## 命令

### 生成音乐

```bash
laoli bgm generate --prompt <text> --output <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--prompt <text>` | 音乐描述（必填） |
| `--output <path>` | 输出音频文件路径（必填） |
| `--provider <name>` | Provider: minimax |
| `--model <id>` | 模型 ID |
| `--lyrics <text>` | 歌词文本 |
| `--instrumental` | 生成纯音乐 |
| `--json` | JSON 输出 |

## 示例

### 纯音乐

```bash
# 生成背景音乐
laoli bgm generate --prompt "Upbeat pop" --output bgm.mp3

# 生成电影配乐
laoli bgm generate --prompt "Cinematic orchestral" --instrumental --output cinematic.mp3

# 生成环境音乐
laoli bgm generate --prompt "Ambient, relaxing, nature sounds" --output ambient.mp3
```

### 带歌词的音乐

```bash
# 生成歌曲
laoli bgm generate --prompt "Pop song" --lyrics "[verse] La da dee, sunny day" --output song.mp3

# 使用完整歌词
cat > lyrics.txt << EOF
[verse]
La da dee, sunny day
Walking down the street
[chorus]
Happy, happy, happy
Everything's so sweet
EOF

laoli bgm generate --prompt "Pop song" --lyrics "$(cat lyrics.txt)" --output song.mp3
```

## 音乐风格

| 风格 | 描述 |
|------|------|
| Pop | 流行音乐 |
| Rock | 摇滚音乐 |
| Jazz | 爵士音乐 |
| Classical | 古典音乐 |
| Electronic | 电子音乐 |
| Hip Hop | 嘻哈音乐 |
| R&B | 节奏布鲁斯 |
| Folk | 民谣音乐 |
| Ambient | 环境音乐 |
| Cinematic | 电影配乐 |

## 工作流程

1. 确定音乐风格和情绪
2. 准备歌词（可选）
3. 调用 CLI 生成音乐
4. 返回音频文件路径

## 注意事项

- 使用 `--json` 获取结构化输出
- 使用 `--instrumental` 生成纯音乐
- 歌词支持中英文
- 音乐生成需要较长时间
- 支持的音频格式：MP3, WAV
