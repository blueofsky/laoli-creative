# Laoli Creative 开发检查清单

## Phase 1：核心框架

### CLI 框架搭建
- [x] 初始化项目：`npm init` 或 `bun init`
- [x] 配置 TypeScript：`tsconfig.json`
- [x] 配置 ESLint：`eslint.config.js` + TypeScript ESLint
- [x] 配置构建脚本：`build.ts`
- [x] 创建入口文件：`src/main.ts`
- [x] 实现 CLI 解析框架：`src/cli.ts`
- [x] 实现命令注册机制：`src/registry.ts`

### 配置管理模块
- [x] 定义配置 Schema：`src/config/schema.ts`
- [x] 实现配置加载器：`src/config/loader.ts`
- [x] 实现环境变量处理（已集成在 loader.ts 中）
- [ ] 实现配置迁移：`src/config/migrate.ts`
- [x] 实现配置命令：`src/commands/config/`

### Provider 抽象层
- [x] 定义 Provider 接口：`src/providers/index.ts`
- [x] 实现 Provider 注册：`src/providers/registry.ts`
- [x] 实现共享工具模块：`src/providers/shared.ts`
- [x] 实现 Agnes Provider：`src/providers/agnes.ts`
- [x] 实现 APIMart Provider：`src/providers/apimart.ts`
- [x] 实现 Tuzi Provider：`src/providers/tuzi.ts`
- [x] 实现 MiniMax Provider：`src/providers/minimax.ts`
- [x] 实现 MiMo Provider：`src/providers/mimo.ts`

### 错误处理机制
- [x] 定义错误码：`src/errors/codes.ts`
- [x] 实现基础错误类：`src/errors/codes.ts`
- [x] 实现错误处理器：`src/errors/handler.ts`

### HTTP 客户端
- [x] 实现 HTTP 请求：`src/client/http.ts`
- [x] 实现 SSE 流处理：`src/client/stream.ts`
- [x] 实现重试机制：`src/client/retry.ts`

## Phase 2：核心功能

### 图片生成模块 (imagine)
- [x] 实现 `generate` 命令
- [x] 实现 `edit` 命令
- [x] 实现 `batch` 命令
- [x] 实现 SDK 接口：`src/sdk/imagine.ts`
- [x] 编写基础测试：`test/commands/imagine.test.ts`
- [x] 编写 Skill：`skills/laoli-imagine/`

### TTS 语音模块 (tts)
- [x] 实现 `synthesize` 命令
- [x] 实现 `voices` 命令
- [x] 实现 `clone` 命令
- [x] 实现 SDK 接口：`src/sdk/tts.ts`
- [ ] 编写测试：`test/commands/tts/`
- [x] 编写 Skill：`skills/laoli-tts/`

### 视频生成模块 (video)
- [x] 实现 `generate` 命令（支持同步/异步模式）
- [x] 实现 `query` 命令
- [x] 实现 `download` 命令
- [x] 实现 SDK 接口：`src/sdk/video.ts`（包含 waitForVideoCompletion）
- [ ] 编写测试：`test/commands/video/`
- [x] 编写 Skill：`skills/laoli-video/`

## Phase 3：辅助功能

### 背景音乐模块 (bgm)
- [x] 实现 `generate` 命令
- [x] 实现 SDK 接口：`src/sdk/bgm.ts`
- [ ] 编写测试：`test/commands/bgm/`
- [x] 编写 Skill：`skills/laoli-bgm/`

### 图片上传模块 (picgo)
- [x] 实现 `upload` 命令（支持批量上传）
- [x] 实现 `config` 命令（支持显示/更新配置）
- [x] 实现 SDK 接口：`src/sdk/picgo.ts`
- [ ] 编写测试：`test/commands/picgo/`
- [x] 编写 Skill：`skills/laoli-picgo/`

## Phase 4：认证和配置

### 认证管理模块 (auth)
- [x] 实现 `login` 命令（保存 API Key 到配置文件）
- [x] 移除 `logout` 命令（API Key 无登出语义）
- [x] 实现 `status` 命令（检测环境变量 + 配置文件）
- [x] API Key 回退机制：环境变量 → 配置文件

## Phase 5：文档和测试

### 文档
- [x] 编写 README.md
- [x] 编写 CHANGELOG.md
- [ ] 编写 API 文档
- [ ] 编写使用示例
- [ ] 编写 Contributing 指南

### 测试 (bun:test)
- [x] 基础测试框架搭建
- [x] 编写 Provider 工具测试：`test/providers/shared.test.ts`
- [x] 编写配置 Schema 测试：`test/config/schema.test.ts`
- [x] 编写 imagine 命令测试：`test/commands/imagine.test.ts`
- [ ] 编写 SDK 测试
- [ ] 编写 TTS / video / bgm / picgo 命令测试

### 发布准备
- [x] 配置 TypeScript 严格模式
- [x] 配置 ESLint
- [ ] 构建验证（`bun run build`）
- [ ] 配置 npm 发布
- [ ] 配置 GitHub Actions CI
- [ ] 配置版本管理

## 待定事项

- [x] 确定包名：`laoli-creative`
- [ ] 确定发布方式（npm / GitHub Release）
- [ ] 确定文档站点方案
- [ ] 确定国际化方案
