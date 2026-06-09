# Laoli Creative 架构设计

> 版本：v1.0.1
> 日期：2026-06-09

## 整体架构

```
┌──────────────────────────────────┐
│          CLI 层 (src/)            │
│  - main.ts  入口                  │
│  - cli.ts   命令路由              │
│  - args.ts  参数解析              │
├──────────────────────────────────┤
│       命令层 (src/commands/)       │
│  image / tts / video / music      │
│  picgo / config / auth / logs     │
├──────────────────────────────────┤
│        SDK 层 (src/sdk/)          │
│  统一的编程接口                     │
├──────────────────────────────────┤
│      Provider 层 (src/providers/)  │
│  agnes / apimart / tuzi          │
│  minimax / mimo                  │
├──────────────────────────────────┤
│     基础设施层 (src/)              │
│  client/  HTTP 客户端             │
│  config/  配置管理                │
│  errors/  错误处理               │
│  utils/   工具函数               │
│  types/   类型定义               │
└──────────────────────────────────┘
```

## 命令结构

### 命令组

| 命令 | 子命令 | 说明 |
|------|--------|------|
| `image` | generate, batch | 图片生成 |
| `tts` | speak, voice | 语音合成 |
| `video` | generate, batch, query, download, list, history | 视频生成 |
| `music` | generate（默认） | 音乐生成 |
| `picgo` | upload, config | 图片上传 |
| `logs` | show（默认） | 日志查看 |
| `config` | show, set | 配置管理 |
| `auth` | login, status | 认证管理 |

### 命令注册

命令通过 `CommandGroup` + `Command` 接口注册：

```
CommandGroup（命令组）
├── name: string
├── description: string
├── defaultCommand?: string   // 无子命令时默认执行
└── commands: Command[]       // 子命令列表
    ├── name: string
    ├── description: string
    ├── options: OptionDef[]  // 参数定义
    ├── examples: string[]    // 使用示例
    └── execute: () => void   // 执行函数
```

## 配置系统

### 优先级

```
CLI 参数 > 环境变量 > 项目配置 (.laoli/config.json) > 用户配置 (~/.laoli/config.json) > 默认值
```

### 配置目录

```
~/.laoli/
├── config.json   用户配置文件
├── log4js.json   日志配置
├── .env          环境变量 / API Keys
└── logs/         日志文件（按日滚动）
```

## Provider 抽象层

### 支持的 Provider

| Provider | Image | Video | TTS | Music |
|----------|:-----:|:-----:|:---:|:-----:|
| agnes | ✅ | ✅ | - | - |
| apimart | ✅ | ✅ | - | - |
| tuzi | ✅ | ✅ | - | - |
| minimax | - | - | ✅ | ✅ |
| mimo | - | - | ✅ | - |

### 设计要点

- 每个 Provider 独立文件，通过统一的 Provider 注册表管理
- 配置在 `config.json` 中按 provider 分组（baseUrl, defaultModel, timeout 等）
- API Key 从环境变量或 `.env` 文件读取

## 构建与发布

- **运行时**: Node.js >= 18 / Bun
- **构建**: `bun run build` → ESM 输出到 `dist/`
- **安装**: `npm install -g laoli-creative`
- **CLI 入口**: `bin/laoli` / `bin/laoli.cmd`
