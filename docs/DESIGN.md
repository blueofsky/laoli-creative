# Laoli Recipe 设计方案

> 版本：v1.0.0
> 日期：2026-06-08
> 状态：设计阶段

## 1. 整体架构

### 1.1 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    laoli-creative                           │
│  - CLI 命令行工具                                             │
│  - SDK 编程接口                                               │
│  - Skills 使用指南（随 CLI 分发）                              │
│  - 统一的 AI 内容生成接口                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓ 调用
┌─────────────────────────────────────────────────────────────┐
│                    Provider 层                               │
│  - Agnes、APIMart、Tuzi、MiniMax、MiMo 等第三方 API           │
│  - 统一的接口抽象层                                            │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 仓库结构

```
laoli-recipe/
└── laoli/
    ├── laoli-creative/     # 统一仓库（CLI + Skills）
    │   ├── src/            # CLI 源码
    │   ├── skills/         # Skills 文档
    │   └── package.json
    └── DESIGN.md           # 本文档
```

### 1.3 依赖关系

```
laoli-creative 包含 CLI + Skills
laoli-creative 依赖 Provider APIs
```

---

## 2. CLI 设计 (laoli-creative)

### 2.1 目录结构

```
laoli-creative/
├── src/
│   ├── commands/                    # 子命令模块
│   │   ├── imagine/                # 图片生成
│   │   │   ├── generate.ts         # laoli imagine generate
│   │   │   ├── edit.ts             # laoli imagine edit
│   │   │   ├── batch.ts            # laoli imagine batch
│   │   │   └── index.ts            # 命令注册
│   │   ├── tts/                    # TTS 语音合成
│   │   │   ├── synthesize.ts       # laoli tts synthesize
│   │   │   ├── voices.ts           # laoli tts voices
│   │   │   ├── clone.ts            # laoli tts clone
│   │   │   └── index.ts
│   │   ├── video/                  # 视频生成
│   │   │   ├── generate.ts         # laoli video generate
│   │   │   ├── query.ts            # laoli video query
│   │   │   ├── download.ts         # laoli video download
│   │   │   └── index.ts
│   │   ├── music/                  # 音乐
│   │   │   ├── generate.ts         # laoli music generate
│   │   │   └── index.ts
│   │   ├── picgo/                  # 图片上传
│   │   │   ├── upload.ts           # laoli picgo upload
│   │   │   ├── config.ts           # laoli picgo config
│   │   │   └── index.ts
│   │   ├── config/                 # 配置管理
│   │   │   ├── show.ts             # laoli config show
│   │   │   ├── set.ts              # laoli config set
│   │   │   └── index.ts
│   │   └── auth/                   # 认证管理
│   │       ├── login.ts            # laoli auth login
│   │       ├── logout.ts           # laoli auth logout
│   │       ├── status.ts           # laoli auth status
│   │       └── index.ts
│   ├── sdk/                        # SDK 编程接口
│   │   ├── imagine.ts
│   │   ├── tts.ts
│   │   ├── video.ts
│   │   ├── music.ts
│   │   ├── picgo.ts
│   │   └── index.ts
│   ├── providers/                  # Provider 抽象层
│   │   ├── agnes.ts
│   │   ├── apimart.ts
│   │   ├── tuzi.ts
│   │   ├── minimax.ts
│   │   ├── mimo.ts
│   │   └── index.ts
│   ├── client/                     # HTTP 客户端
│   │   ├── http.ts
│   │   ├── stream.ts
│   │   └── retry.ts
│   ├── config/                     # 配置管理
│   │   ├── schema.ts              # 配置 schema 定义
│   │   ├── loader.ts              # 配置加载器
│   │   └── env.ts                 # 环境变量处理
│   ├── auth/                       # 认证管理
│   │   ├── credentials.ts
│   │   └── oauth.ts
│   ├── errors/                     # 错误处理
│   │   ├── base.ts
│   │   ├── codes.ts
│   │   └── handler.ts
│   ├── utils/                      # 工具函数
│   │   ├── logger.ts
│   │   ├── prompt.ts
│   │   └── format.ts
│   ├── types/                      # 类型定义
│   │   ├── api.ts
│   │   ├── config.ts
│   │   └── flags.ts
│   ├── cli.ts                      # CLI 定义
│   └── main.ts                     # 入口文件
├── skills/                         # Skills 文档
│   ├── laoli-imagine/
│   ├── laoli-tts/
│   ├── laoli-video/
│   ├── laoli-music/
│   └── laoli-picgo/
├── test/                           # 测试文件
│   ├── commands/
│   ├── sdk/
│   └── providers/
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

### 2.2 命令设计

#### 2.2.1 全局选项

```bash
laoli [command] [subcommand] [options]

全局选项：
  --api-key <key>        API key
  --region <region>      区域：global, cn
  --base-url <url>       API base URL
  --output <format>      输出格式：text, json
  --quiet                静默模式
  --verbose              详细输出
  --dry-run              试运行
  --non-interactive      非交互模式
  --help                 显示帮助
  --version              显示版本
```

#### 2.2.2 图片生成

```bash
# 生成图片
laoli imagine generate --prompt <text> --output <path> [options]
  --provider <name>      Provider: agnes, apimart, tuzi
  --model <id>           模型 ID
  --aspect-ratio <ratio> 宽高比：16:9, 1:1, 4:3
  --size <WxH>           尺寸：1024x1024
  --quality <level>      质量：normal, 2k
  --ref <files...>       参考图片
  --n <count>            生成数量

# 编辑图片
laoli imagine edit --input <path> --prompt <text> --output <path> [options]

# 批量生成
laoli imagine batch --batchfile <path> [options]
  --jobs <count>         并发数
```

#### 2.2.3 TTS 语音合成

```bash
# 合成语音
laoli tts synthesize --text <text> --output <path> [options]
  --provider <name>      Provider: minimax, mimo
  --model <id>           模型 ID
  --voice <id>           音色 ID
  --speed <n>            语速
  --pitch <n>            音调
  --format <fmt>         格式：mp3, wav

# 查看音色
laoli tts voices [--provider <name>]

# 音色克隆
laoli tts clone --voice-file <path> --text <text> --output <path> [options]
```

#### 2.2.4 视频生成

```bash
# 生成视频
laoli video generate --prompt <text> --output <path> [options]
  --provider <name>      Provider: apimart, tuzi, agnes
  --model <id>           模型 ID
  --seconds <n>          时长
  --size <WxH>           尺寸
  --ref <files...>       参考图片

# 查询任务状态
laoli video query --task-id <id> [--output json]

# 下载视频
laoli video download --task-id <id> --output <path>
```

#### 2.2.5 背景音乐

```bash
# 生成音乐
laoli music --prompt <text> --output <path> [options]
  --provider <name>      Provider: minimax
  --model <id>           模型 ID
  --instrumental         纯音乐
```

#### 2.2.6 图片上传

```bash
# 上传图片
laoli picgo upload --input <path> [options]
  --batch                批量上传

# 配置 PicGo
laoli picgo config --repo <owner/repo> --token <token> [options]
  --path <path>          仓库路径
  --branch <branch>      分支
  --custom-url <url>     自定义域名
```

#### 2.2.7 配置管理

```bash
# 查看配置
laoli config show [--section <name>]

# 设置配置
laoli config set --key <key> --value <value>

# 导出 schema
laoli config export-schema [--output <path>]
```

#### 2.2.8 认证管理

```bash
# 保存 API Key
laoli auth login --api-key <key> [--provider <name>]

# 查看状态
laoli auth status
```

### 2.3 SDK 接口设计

```typescript
// 导入
import { LaoliSDK } from 'laoli-creative';

// 初始化
const laoli = new LaoliSDK({
  apiKey: 'sk-xxxxx',
  region: 'cn',
});

// 图片生成
const image = await laoli.imagine.generate({
  prompt: 'A cat',
  outputPath: './cat.png',
  aspectRatio: '16:9',
});

// TTS
const audio = await laoli.tts.synthesize({
  text: 'Hello',
  voice: '冰糖',
  outputPath: './hello.mp3',
});

// 视频生成
const video = await laoli.video.generate({
  prompt: 'Ocean waves',
  outputPath: './ocean.mp4',
  seconds: 5,
});
```

---

## 3. Skills 设计 (laoli-creative/skills)

### 3.1 目录结构

```
laoli-creative/
├── skills/                         # Skills 文档
│   ├── laoli-imagine/              # 图片生成 Skill
│   │   └── SKILL.md
│   ├── laoli-tts/                  # TTS Skill
│   │   └── SKILL.md
│   ├── laoli-video/                # 视频生成 Skill
│   │   └── SKILL.md
│   ├── laoli-music/                # Music Skill
│   │   └── SKILL.md
│   └── laoli-picgo/                # PicGo Skill
│       └── SKILL.md
├── src/                            # CLI 源码
├── package.json
├── README.md
└── LICENSE
```

### 3.2 SKILL.md 模板

```markdown
---
name: laoli-imagine
description: 图片生成技能，支持文生图、图生图、批量生成等功能
version: 1.0.0
dependencies:
  cli:
    name: laoli-creative
    version: ">=1.0.0"
---

# 图片生成 Skill

## 前置条件

```bash
# 安装 CLI
npm install -g laoli-creative

# 配置 API Key
laoli auth login --api-key sk-xxxxx
```

## 命令

### 生成图片

```bash
laoli imagine generate --prompt <text> --output <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--prompt <text>` | 图片描述（必填） |
| `--output <path>` | 输出路径（必填） |
| `--provider <name>` | Provider: agnes, apimart, tuzi |
| `--model <id>` | 模型 ID |
| `--aspect-ratio <ratio>` | 宽高比：16:9, 1:1, 4:3 |
| `--size <WxH>` | 尺寸：1024x1024 |
| `--quality <level>` | 质量：normal, 2k |
| `--ref <files...>` | 参考图片 |
| `--json` | JSON 输出 |

## 示例

```bash
# 基础生成
laoli imagine generate --prompt "A cat" --output cat.png

# 指定宽高比
laoli imagine generate --prompt "A landscape" --aspect-ratio 16:9 --output landscape.png

# 使用参考图
laoli imagine generate --prompt "Make blue" --ref source.png --output blue.png

# JSON 输出
laoli imagine generate --prompt "A cat" --output cat.png --json
```

## 工作流程

1. 分析用户需求
2. 构建 prompt
3. 调用 CLI 生成图片
4. 返回结果

## 注意事项

- 使用 `--json` 获取结构化输出
- 使用 `--quiet` 抑制非必要输出
- 错误时检查退出码和错误信息
```

---

## 4. 配置 Schema 设计

### 4.1 配置文件位置

```
优先级（高到低）：
1. CLI 参数
2. 环境变量
3. 项目配置：.laoli/config.json
4. 用户配置：~/.laoli/config.json
5. 系统默认值
```

### 4.2 配置文件结构

```
~/.laoli/
├── .env                # 环境变量
├── config.json         # 配置文件
├── credentials.json    # 认证信息
└── cache/              # 缓存

项目目录/
└── .laoli/
    ├── .env            # 项目环境变量
    └── config.json     # 项目配置
```

### 4.3 config.json Schema

```json
{
  "version": 1,
  "defaultProvider": "agnes",
  "defaultRegion": "cn",
  
  "providers": {
    "agnes": {
      "baseUrl": "https://apihub.agnes-ai.com/v1",
      "defaultModel": "agnes-image-2.1-flash",
      "timeout": 30000,
      "maxRetries": 3
    },
    "apimart": {
      "baseUrl": "https://api.apimart.ai/v1",
      "defaultModel": "gpt-image-2"
    },
    "tuzi": {
      "baseUrl": "https://api.tu-zi.com/v1",
      "defaultModel": "gpt-image-2"
    },
    "minimax": {
      "baseUrl": "https://api.minimax.io/v1",
      "defaultModel": "MiniMax-M2.7"
    }
  },
  
  "imagine": {
    "defaultProvider": "agnes",
    "defaultModel": "agnes-image-2.1-flash",
    "defaultOutputDir": "./images",
    "defaultQuality": "2k",
    "defaultAspectRatio": "1:1"
  },
  
  "tts": {
    "defaultProvider": "minimax",
    "defaultModel": "speech-2.8-hd",
    "defaultOutputDir": "./audio",
    "defaultVoice": "冰糖",
    "defaultFormat": "mp3"
  },
  
  "video": {
    "defaultProvider": "apimart",
    "defaultModel": "doubao-seedance-1-0-pro-fast",
    "defaultOutputDir": "./videos",
    "defaultSeconds": 5,
    "defaultResolution": "1080p"
  },
  
  "music": {
    "defaultProvider": "minimax",
    "defaultModel": "music-2.6",
    "defaultOutputDir": "./music",
    "defaultFormat": "mp3"
  },
  
  "picgo": {
    "repo": "",
    "branch": "main",
    "path": "assets/images",
    "customUrl": ""
  },
  
  "display": {
    "defaultFormat": "text",
    "quiet": false,
    "noColor": false
  },
  
  "proxy": ""
}
```

### 4.4 .env 文件格式

```bash
# ~/.laoli/.env

# 通用 API Key
LAOLI_API_KEY=sk-xxxxx

# Provider 特定 API Key
AGNES_API_KEY=xxxxx
APIMART_API_KEY=xxxxx
TUZI_API_KEY=xxxxx
MINIMAX_API_KEY=xxxxx

# 其他服务
MIMO_API_KEY=xxxxx

# 代理
HTTPS_PROXY=http://127.0.0.1:7890
```

---

## 5. Provider 抽象层设计

### 5.1 Provider 接口

```typescript
// providers/index.ts
export interface Provider {
  name: string;
  
  // 图片生成
  generateImage(params: ImageParams): Promise<ImageResult>;
  
  // TTS
  synthesizeSpeech(params: TTSParams): Promise<TTSResult>;
  
  // 视频生成
  generateVideo(params: VideoParams): Promise<VideoResult>;
  
  // 音乐生成
  generateMusic(params: MusicParams): Promise<MusicResult>;
}

export interface ImageParams {
  prompt: string;
  model?: string;
  aspectRatio?: string;
  size?: string;
  quality?: string;
  refImages?: string[];
  n?: number;
}

export interface ImageResult {
  url: string;
  outputPath?: string;
  metadata: Record<string, any>;
}
```

### 5.2 Provider 注册

```typescript
// providers/registry.ts
const providers: Record<string, Provider> = {};

export function registerProvider(provider: Provider) {
  providers[provider.name] = provider;
}

export function getProvider(name: string): Provider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Provider "${name}" not found`);
  }
  return provider;
}
```

---

## 6. 错误处理设计

### 6.1 错误码

```typescript
// errors/codes.ts
export enum ExitCode {
  SUCCESS = 0,
  GENERAL = 1,
  INVALID_ARGS = 2,
  AUTH_ERROR = 3,
  PROVIDER_ERROR = 4,
  NETWORK_ERROR = 5,
  TIMEOUT = 6,
  FILE_ERROR = 7,
  CONFIG_ERROR = 8,
}
```

### 6.2 错误格式

```json
{
  "error": {
    "code": "PROVIDER_ERROR",
    "message": "Image generation failed",
    "details": {
      "provider": "agnes",
      "statusCode": 500,
      "apiError": "Internal server error"
    }
  }
}
```

---

## 7. 实施计划

### Phase 1：核心框架 (Week 1-2)

- [ ] CLI 框架搭建
- [ ] 配置管理模块
- [ ] Provider 抽象层
- [ ] 错误处理机制

### Phase 2：核心功能 (Week 3-4)

- [ ] `laoli imagine` 模块
- [ ] `laoli tts` 模块
- [ ] `laoli video` 模块

### Phase 3：辅助功能 (Week 5-6)

- [x] `laoli music` 模块
- [x] `laoli picgo` 模块

### Phase 5：Skills 开发 (Week 9-10)

- [ ] 核心 Skills 编写
- [ ] 示例和文档
- [ ] 测试和优化

---

## 8. 待定事项

1. **包名**：✅ 已确定：`laoli-creative`
2. **发布方式**：npm 发布还是 GitHub Release？
3. **CI/CD**：GitHub Actions 配置
4. **文档站点**：是否需要独立文档站点？
5. **国际化**：是否需要支持多语言？

---

## 9. 参考资料

- [MiniMax CLI](https://github.com/MiniMax-AI/cli)
- [MiniMax Skills](https://github.com/MiniMax-AI/skills)
- [Commander.js](https://github.com/tj/commander.js)
- [oclif](https://oclif.io/)
