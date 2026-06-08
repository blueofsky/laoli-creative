---
name: laoli-video
description: 视频生成技能，支持文生视频、图生视频等功能
version: 1.0.0
dependencies:
  cli:
    name: laoli-creative
    version: ">=1.0.0"
---

# 视频生成 Skill

使用 `laoli video` 命令生成视频。

## 前置条件

```bash
# 安装 CLI
npm install -g laoli-creative

# 配置 API Key
laoli auth login --api-key sk-xxxxx --provider apimart
```

## 命令

### 生成视频

```bash
laoli video generate --prompt <text> --output <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--prompt <text>` | 视频描述（必填） |
| `--output <path>` | 输出视频文件路径（必填） |
| `--provider <name>` | Provider: apimart, tuzi, agnes |
| `--model <id>` | 模型 ID |
| `--seconds <n>` | 视频时长（秒） |
| `--size <WxH>` | 视频尺寸 |
| `--resolution <p>` | 分辨率：480p, 720p, 1080p, 4k |
| `--ref <files...>` | 参考图片 |
| `--json` | JSON 输出 |

### 查询任务状态

```bash
laoli video query --task-id <id> [--json]
```

### 下载视频

```bash
laoli video download --task-id <id> --output <path>
```

## Provider 支持

| Provider | 模型 | 时长 | 分辨率 |
|----------|------|------|--------|
| apimart | doubao-seedance-1-0-pro-fast | 5s | 480p-1080p |
| apimart | veo3.1-lite | 8s | 720p-4k |
| tuzi | veo3.1 | 8s | 720p-1080p |
| agnes | agnes-video-v2.0 | 3-15s | 480p-1080p |

## 示例

### 基础生成

```bash
# 文生视频
laoli video generate --prompt "Ocean waves at sunset" --output ocean.mp4

# 指定时长
laoli video generate --prompt "A cat walking" --seconds 10 --output cat.mp4

# 指定分辨率
laoli video generate --prompt "City night view" --resolution 1080p --output city.mp4
```

### 图生视频

```bash
# 使用参考图片
laoli video generate --prompt "Animate this scene" --ref photo.jpg --output animated.mp4
```

### 异步生成

```bash
# 启动异步任务
laoli video generate --prompt "Ocean waves" --output ocean.mp4 --json
# 返回: {"taskId": "12345", "status": "pending"}

# 查询状态
laoli video query --task-id 12345

# 下载完成的视频
laoli video download --task-id 12345 --output ocean.mp4
```

## 工作流程

1. 准备视频描述或参考图片
2. 选择 Provider 和模型
3. 启动视频生成任务
4. 等待任务完成（或异步查询）
5. 下载生成的视频

## 注意事项

- 视频生成通常需要较长时间
- 使用 `--json` 获取任务 ID 进行异步处理
- 支持的视频格式：MP4
- 参考图片支持本地文件和 URL
- 部分 Provider 支持音频生成
