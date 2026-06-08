# Laoli Skills

Laoli Creative 的 Skills 集合，为 AI 编码代理提供结构化的使用指南。

## Skills 列表

| Skill | 描述 | 状态 |
|-------|------|------|
| [laoli-imagine](laoli-imagine/) | 图片生成 | ✅ |
| [laoli-tts](laoli-tts/) | TTS 语音合成 | ✅ |
| [laoli-video](laoli-video/) | 视频生成 | ✅ |
| [laoli-bgm](laoli-bgm/) | 背景音乐生成 | ✅ |
| [laoli-picgo](laoli-picgo/) | 图片上传 | ✅ |

## 使用方法

Skills 随 `laoli-creative` CLI 一起安装，AI 编码代理会自动发现这些 Skills。

```bash
# 安装 CLI（包含 Skills）
npm install -g laoli-creative

# 使用 CLI
laoli imagine generate --prompt "A cat" --output cat.png
laoli tts synthesize --text "Hello" --output hello.mp3
```

## 开发

### 添加新 Skill

1. 在 `skills/` 目录下创建新目录
2. 创建 `SKILL.md` 文件
3. 遵循现有 Skill 的格式

### Skill 格式

```markdown
---
name: skill-name
description: 技能描述
version: 1.0.0
dependencies:
  cli:
    name: laoli-creative
    version: ">=1.0.0"
---

# 技能名称

## 前置条件

## 命令

## 示例

## 工作流程

## 注意事项
```

## 许可证

MIT
