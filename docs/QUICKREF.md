# Laoli Creative 快速参考

## 命令格式

```bash
laoli <command> <subcommand> [options]
```

## 核心命令

### 图片生成 (image)

```bash
laoli image generate --prompt "描述" --output output.png [--provider agnes] [--aspect-ratio 16:9]
laoli image batch --batchfile batch.json [--jobs 4]
```

### TTS 语音 (tts)

```bash
laoli tts synthesize --text "文本" --output output.mp3 [--voice 冰糖] [--provider minimax]
laoli tts voices [--provider minimax]
laoli tts clone --voice-file sample.wav --text "文本" --output output.mp3
```

### 视频生成 (video)

```bash
laoli video generate --prompt "描述" --output output.mp4 [--seconds 5] [--provider apimart]
laoli video query --task-id 12345
laoli video download --task-id 12345 --output output.mp4
```

### 音乐 (music)

```bash
laoli music --prompt "描述" --output output.mp3 [--instrumental]
```

### 图片上传 (picgo)

```bash
laoli picgo upload --input image.png
laoli picgo config --repo owner/repo --token xxx [--path assets/images]
```

### 配置管理 (config)

```bash
laoli config show [--section image]
laoli config set --key image.defaultProvider --value agnes
laoli config export-schema [--output schema.json]
```

### 认证管理 (auth)

```bash
laoli auth login --api-key <key> [--provider <name>]
laoli auth status
```

## 全局选项

| 选项 | 说明 |
|------|------|
| `--api-key <key>` | API key |
| `--region <region>` | 区域：global, cn |
| `--base-url <url>` | API base URL |
| `--output <format>` | 输出格式：text, json |
| `--quiet` | 静默模式 |
| `--verbose` | 详细输出 |
| `--dry-run` | 试运行 |
| `--non-interactive` | 非交互模式 |
| `--help` | 显示帮助 |
| `--version` | 显示版本 |

## Provider 列表

| Provider | 用途 | 默认模型 |
|----------|------|----------|
| agnes | 图片、视频 | agnes-image-2.1-flash |
| apimart | 图片、视频 | gpt-image-2, doubao-seedance-1-0-pro-fast |
| tuzi | 图片、视频 | gpt-image-2, veo3.1 |
| minimax | TTS、音乐 | speech-2.8-hd, music-2.6 |

## 配置文件位置

```
优先级：CLI参数 > 环境变量 > 项目配置 > 用户配置

用户配置：~/.laoli/config.json
项目配置：.laoli/config.json
环境变量：~/.laoli/.env, .laoli/.env
```

## 常用环境变量

```bash
LAOLI_API_KEY=sk-xxxxx          # 通用 API Key
AGNES_API_KEY=xxxxx             # Agnes API Key
APIMART_API_KEY=xxxxx           # APIMart API Key
TUZI_API_KEY=xxxxx              # Tuzi API Key
MINIMAX_API_KEY=xxxxx           # MiniMax API Key
HTTPS_PROXY=http://127.0.0.1:7890  # 代理
```

## 错误码

| 退出码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1 | 通用错误 |
| 2 | 参数错误 |
| 3 | 认证错误 |
| 4 | Provider 错误 |
| 5 | 网络错误 |
| 6 | 超时 |
| 7 | 文件错误 |
| 8 | 配置错误 |

## 目录结构

```
laoli-creative/
├── src/
│   ├── commands/      # 命令实现
│   ├── sdk/           # SDK 接口
│   ├── providers/     # Provider 实现
│   ├── config/        # 配置管理
│   ├── auth/          # 认证管理
│   ├── errors/        # 错误处理
│   └── utils/         # 工具函数
├── skills/
│   ├── laoli-image/
│   ├── laoli-tts/
│   ├── laoli-video/
│   ├── laoli-music/
│   └── laoli-picgo/
├── test/
├── package.json
└── tsconfig.json
```
