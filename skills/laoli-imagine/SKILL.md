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

使用 `laoli imagine` 命令生成和编辑图片。

## 前置条件

```bash
# 安装 CLI
npm install -g laoli-creative

# 配置 API Key
laoli auth login --api-key sk-xxxxx --provider agnes
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

### 编辑图片

```bash
laoli imagine edit --input <path> --prompt <text> --output <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--input <path>` | 输入图片路径（必填） |
| `--prompt <text>` | 编辑描述（必填） |
| `--output <path>` | 输出路径（必填） |
| `--provider <name>` | Provider: agnes, apimart, tuzi |
| `--model <id>` | 模型 ID |
| `--json` | JSON 输出 |

### 批量生成

```bash
laoli imagine batch --batchfile <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--batchfile <path>` | JSON 批处理文件路径（必填） |
| `--jobs <count>` | 并发数 |
| `--json` | JSON 输出 |

## 示例

### 基础生成

```bash
# 生成图片
laoli imagine generate --prompt "A cat in a spacesuit" --output cat.png

# 指定宽高比
laoli imagine generate --prompt "A landscape" --aspect-ratio 16:9 --output landscape.png

# 使用 Provider
laoli imagine generate --prompt "A cat" --provider agnes --output cat.png

# JSON 输出
laoli imagine generate --prompt "A cat" --output cat.png --json
```

### 编辑图片

```bash
# 编辑图片
laoli imagine edit --input cat.png --prompt "Add a hat" --output cat-hat.png

# 风格转换
laoli imagine edit --input photo.jpg --prompt "Make it watercolor" --output watercolor.png
```

### 批量生成

```bash
# 创建批处理文件
cat > batch.json << EOF
[
  {"prompt": "A cat", "output": "cat.png"},
  {"prompt": "A dog", "output": "dog.png"},
  {"prompt": "A bird", "output": "bird.png"}
]
EOF

# 批量生成
laoli imagine batch --batchfile batch.json --jobs 3
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
- 支持的图片格式：PNG, JPG, WebP
- 参考图片支持本地文件和 URL
