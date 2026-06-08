# Examples

Workflow 示例脚本，展示 `laoli` 命令的实战组合用法。

## 目录

| 示例 | 说明 |
|------|------|
| [image-pipeline](./image-pipeline.sh) | 生成图片 → 自动上传图床 → 获取 CDN 链接 |
| [video-with-bgm](./video-with-bgm.sh) | 生成视频 + 配背景音乐 → 产出最终视频 |
| [tts-voice-demo](./tts-voice-demo.sh) | TTS 三大模式演示：预置音色 / 音色设计 / 音色克隆 |
| [batch-generate](./batch-generate.sh) | 批量生成多张图片 |

## 前置条件

```bash
# 1. 安装依赖
bun install

# 2. 配置 API Key（任选一种方式）
export AGNES_API_KEY=sk-xxxxx           # 临时
laoli auth login --api-key sk-xxxxx --provider agnes  # 持久化

# 3. 图床配置（图片上传示例需要）
laoli picgo config --repo username/repo --token ghp_xxx
```

## 用法

```bash
# 直接运行
bash examples/image-pipeline.sh

# 查看具体内容了解每个步骤
cat examples/video-with-bgm.sh
```
