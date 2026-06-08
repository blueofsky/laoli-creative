---
name: laoli-tts
description: TTS 语音合成技能，支持多种音色和风格控制
version: 1.0.0
dependencies:
  cli:
    name: laoli-creative
    version: ">=1.0.0"
---

# TTS 语音合成 Skill

使用 `laoli tts` 命令进行语音合成。

## 前置条件

```bash
# 安装 CLI
npm install -g laoli-creative

# 配置 API Key（选择一个 provider）
laoli auth login --api-key sk-xxxxx --provider minimax
# 或
laoli auth login --api-key sk-xxxxx --provider mimo
```

## 命令

### 合成语音

```bash
laoli tts synthesize --text <text> --output <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--text <text>` | 要合成的文本（必填） |
| `--output <path>` | 输出音频文件路径（必填） |
| `--provider <name>` | Provider: minimax, mimo |
| `--model <id>` | 模型 ID |
| `--voice <id>` | 音色 ID 或音色描述（mimo voicedesign） |
| `--context <text>` | 风格控制（mimo only） |
| `--speed <n>` | 语速 |
| `--pitch <n>` | 音调 |
| `--format <fmt>` | 音频格式：mp3, wav |
| `--json` | JSON 输出 |

### 查看音色

```bash
laoli tts voices [--provider <name>] [--json]
```

### 音色克隆

```bash
laoli tts clone --voice-file <path> --text <text> --output <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--voice-file <path>` | 音色样本音频文件（必填） |
| `--text <text>` | 要合成的文本（必填） |
| `--output <path>` | 输出音频文件路径（必填） |

## Provider 对比

| 特性 | MiniMax | MiMo |
|------|---------|------|
| 预置音色 | ✅ 8个 | ✅ 8个 |
| 音色设计 | ❌ | ✅ 文本描述定制 |
| 音色克隆 | ❌ | ✅ 音频样本复刻 |
| 自然语言控制 | ❌ | ✅ 导演模式 |
| 唱歌 | ❌ | ✅ |
| 情绪标签 | ❌ | ✅ |

## 可用音色（两个 Provider 通用）

| 音色 | 语言 | 性别 | 风格 |
|------|------|------|------|
| 冰糖 | 中文 | 女性 | 活泼少女 |
| 茉莉 | 中文 | 女性 | 知性女声 |
| 苏打 | 中文 | 男性 | 阳光少年 |
| 白桦 | 中文 | 男性 | 成熟男声 |
| Mia | English | Female | Lively girl |
| Chloe | English | Female | Sweet Dreamy |
| Milo | English | Male | Sunny boy |
| Dean | English | Male | Steady Gentle |

## MiMo 模型

| 模型 ID | 用途 | 特殊能力 |
|---------|------|----------|
| mimo-v2.5-tts | 预置音色语音合成 | 支持唱歌 |
| mimo-v2.5-tts-voicedesign | 文本描述定制音色 | 自然语言控制 |
| mimo-v2.5-tts-voiceclone | 音频样本复刻音色 | 音色克隆 |

## 示例

### MiniMax 基础合成

```bash
# 中文语音
laoli tts synthesize --text "你好，今天天气真不错" --provider minimax --voice 冰糖 --output hello.mp3

# 英文语音
laoli tts synthesize --text "Hello, how are you?" --provider minimax --voice Mia --output hello.mp3
```

### MiMo 预置音色

```bash
# 中文语音
laoli tts synthesize --text "你好，今天天气真不错" --provider mimo --voice 冰糖 --output hello.mp3

# 唱歌
laoli tts synthesize --text "(唱歌)两只老虎，两只老虎，跑得快" --provider mimo --voice 冰糖 --output sing.mp3
```

### MiMo 音色设计

```bash
# 使用文本描述定制音色
laoli tts synthesize --text "你好" --provider mimo --model mimo-v2.5-tts-voicedesign --voice "磁性低沉男中音" --output hello.mp3

# 使用风格控制
laoli tts synthesize --text "你好" --provider mimo --voice 冰糖 --context "用温柔的语气，语速稍慢" --output hello.mp3
```

### MiMo 音色克隆

```bash
# 使用音频样本克隆音色
laoli tts synthesize --text "Hello" --provider mimo --model mimo-v2.5-tts-voiceclone --voice ./sample.mp3 --output clone.mp3
```

### 批量合成

```bash
# 创建文本列表
cat > texts.txt << EOF
你好
早上好
晚上好
EOF

# 批量合成
while IFS= read -r text; do
  laoli tts synthesize --text "$text" --provider mimo --voice 冰糖 --output "audio_$(date +%s).mp3"
done < texts.txt
```

## 工作流程

1. 选择合适的音色
2. 准备要合成的文本
3. 调用 CLI 合成语音
4. 返回音频文件路径

## 注意事项

- 使用 `--json` 获取结构化输出
- 使用 `--quiet` 抑制非必要输出
- 音频格式默认为 mp3
- 支持中英文混合文本
- 长文本会自动分段合成
