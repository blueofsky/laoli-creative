---
name: laoli-tts
description: 文本转语音合成，支持 MiniMax 和 MiMo 双 Provider
version: 1.0.0
dependencies:
  cli:
    name: laoli-creative
    version: ">=1.0.0"
---

# Laoli TTS（文本转语音）

## 前置条件

- 安装 CLI：`npm install -g laoli-creative`
- 配置 API Key（以 minimax 为例）：
  ```bash
  laoli auth login --api-key sk-xxxxx --provider minimax
  ```
  或设置环境变量 `MINIMAX_API_KEY` / `MIMO_API_KEY`

## 命令

### 合成语音

```bash
laoli tts speak --text "<text>" --output <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--text` | 要合成的文本（必填） |
| `--output` | 输出音频文件路径（必填） |
| `--provider` | Provider：`minimax`（默认）、`mimo` |
| `--model` | 模型 ID |
| `--voice` | 音色 ID |
| `--speed` | 语速 0.5~2.0（minimax） |
| `--vol` | 音量 0~10（minimax） |
| `--pitch` | 音调 -12~12（minimax） |
| `--emotion` | 情绪：happy/sad/angry/calm/whisper...（minimax） |
| `--context` | 自然语言风格描述（mimo 导演模式） |
| `--format` | 输出格式：mp3、wav |
| `--json` | JSON 格式输出 |

### 查看音色

```bash
laoli tts voice [--provider minimax|mimo]
```

## Provider 对比

| 特性 | MiniMax | MiMo |
|------|---------|------|
| 预置音色 | 327 个（多语言） | 9 个 |
| 语速/音量/音调 | ✅ 数值控制 | 通过 context 自然语言控制 |
| 情绪参数 | ✅ 枚举值 | 文本内标签 |
| 导演模式 | ❌ | ✅ 自然语言风格描述 |
| 唱歌 | ❌ | ✅ 文本内 `(唱歌)` 标签 |
| 音频格式 | mp3/wav/pcm/flac | wav 固定 |
| 成熟度 | 成熟稳定 | 测试阶段 |

## 示例

```bash
# MiniMax 基础合成（默认）
laoli tts speak --text "你好世界" --output hello.mp3

# MiniMax 指定音色和情绪
laoli tts speak --text "太棒了" --voice female-shaonv --emotion happy --output happy.mp3

# MiniMax 调整语速和音量
laoli tts speak --text "慢慢说" --speed 0.8 --vol 5 --output slow.mp3

# MiMo 预置音色
laoli tts speak --text "你好" --provider mimo --voice 冰糖 --output hello.wav

# MiMo 导演模式（自然语言风格控制）
laoli tts speak --text "晚安" --provider mimo --context "温柔轻声" --output goodnight.wav

# JSON 输出
laoli tts speak --text "Hello" --json --output hello.mp3
```

## 工作流程

1. 查看可用音色：`laoli tts voice`
2. 选择 Provider 和音色
3. 合成语音：`laoli tts speak --text "..." --output output.mp3`
4. 如需精细控制，使用 MiniMax 的 speed/vol/pitch/emotion
5. 如需自然语言风格控制，使用 MiMo 的 context 参数

## 注意事项

- minimax 默认音色 female-shaonv（少女音色）
- mimo 默认音色 冰糖（活泼少女）
- MiniMax 输出默认 mp3，MiMo 固定 wav 格式
- 日志文件位于 `~/.laoli/logs/`，按日滚动
