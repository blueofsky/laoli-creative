---
name: laoli-video
description: AI 视频生成，支持文生视频和图生视频
version: 1.0.0
dependencies:
  cli:
    name: laoli-creative
    version: ">=1.0.0"
---

# Laoli Video（视频生成）

## 前置条件

- 安装 CLI：`npm install -g laoli-creative`
- 配置至少一个视频 Provider 的 API Key：
  ```bash
  laoli auth login --api-key sk-xxxxx --provider agnes
  ```

## 命令

### 生成视频

```bash
laoli video generate --prompt "<描述>" --output <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--prompt` | 视频描述（必填） |
| `--output` | 输出视频文件路径（必填） |
| `--provider` | Provider：`agnes`（免费）、`tuzi`、`apimart` |
| `--model` | 模型 ID |
| `--seconds` | 视频时长（秒） |
| `--size` | 尺寸（如 `9:16`、`1280x720`） |
| `--resolution` | 分辨率：480p、720p、1080p、4k |
| `--ref` | 参考图片路径或 URL（图生视频） |
| `--poll-interval` | 轮询间隔（毫秒，默认 5000） |
| `--timeout` | 单任务超时（毫秒，默认 600000） |
| `--async` | 只提交不等待，返回 taskId |
| `--json` | JSON 格式输出 |

### 批量生成

```bash
laoli video batch --batchfile <path>
```

batchfile JSON 格式：
```json
[
  { "prompt": "...", "output": "a.mp4" },
  { "prompt": "...", "output": "b.mp4", "provider": "tuzi" }
]
```

选项：`--async`（仅提交）、`--jobs <n>`（并发数，默认 2）

### 其他命令

```bash
laoli video list                    # 查看队列中的任务
laoli video query --task-id <id>    # 查询任务状态
laoli video download --task-id <id> # 下载已完成视频
laoli video history                 # 查看历史记录
```

## Provider 对比

| Provider | 费用 | 提交速度 | 生成速度 | 说明 |
|----------|:----:|:--------:|:--------:|------|
| **agnes** | ❌ 免费 | 慢（~60s） | ~3min | 日常主力，不限量 |
| **tuzi** veo3.1 | $0.7/次 | 快（~3s） | ~2min | 加急用 |
| **apimart** veo3.1-lite | $0.05/次 | 快 | - | 需充值 |

## 示例

```bash
# 文生视频（agnes 免费）
laoli video generate --prompt "a cute cat walking in a garden" --output cat.mp4

# 图生视频
laoli video generate --prompt "cat watching sunset" --ref photo.png --output cat-sunset.mp4

# 指定 Provider 和模型
laoli video generate --prompt "ocean waves" --provider tuzi --output ocean.mp4

# 9:16 竖屏
laoli video generate --prompt "a person dancing" --size 9:16 --output dance.mp4

# 异步模式
laoli video generate --prompt "time lapse city" --async --output city.mp4
laoli video download --task-id xxx-xxx

# 批量生成
laoli video batch --batchfile tasks.json

# 图生视频命名规范：{描述}-ref-{provider}.mp4
# 文生视频命名规范：{描述}-{provider}.mp4
```

## 工作流程

1. 确定视频描述 prompt 和参考图（可选）
2. 选择 Provider（免费用 agnes，加急用 tuzi）
3. 生成并等待完成
4. 或使用 `--async` 提交后回头下载

## 注意事项

- agnes 免费但生成较慢，建议 `--poll-interval 8000` 避免限流
- 视频生成耗时较长，批量任务建议用 `--async` 提交
- 日志文件位于 `~/.laoli/logs/`，按日滚动
