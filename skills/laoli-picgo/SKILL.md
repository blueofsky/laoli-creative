---
name: laoli-picgo
description: 图片上传到 GitHub 图床
version: 1.0.0
dependencies:
  cli:
    name: laoli-creative
    version: ">=1.0.0"
---

# Laoli PicGo（图片上传）

## 前置条件

- 安装 CLI：`npm install -g laoli-creative`
- 准备 GitHub 公开仓库和 Personal Access Token（权限：repo）
- 运行配置命令存入凭证

## 命令

### 配置

```bash
laoli picgo config --repo <owner/repo> --token <token> [options]
```

| 选项 | 说明 |
|------|------|
| `--repo` | GitHub 仓库（如 `username/image-host`） |
| `--token` | GitHub Personal Access Token |
| `--path` | 仓库内路径（默认 `img/`） |
| `--branch` | 分支（默认 `main`） |
| `--custom-url` | 自定义 CDN 域名 |
| `--show` | 查看当前配置 |

### 上传

```bash
laoli picgo upload --input <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--input` | 图片文件路径或目录 |
| `--batch` | 批量上传（input 为目录时必需） |
| `--json` | JSON 格式输出 |

### CDN 加速配置

```bash
laoli picgo config \
  --repo username/image-host \
  --token ghp_xxxxx \
  --path img/ \
  --branch main \
  --custom-url "https://cdn.jsdmirror.com/gh/username/image-host@main"
```

## 示例

```bash
# 配置
laoli picgo config --repo blueofsky/laolihub --token ghp_xxxxx

# 查看配置
laoli picgo config --show

# 上传单张
laoli picgo upload --input image.png

# 批量上传
laoli picgo upload --input ./images/ --batch

# JSON 输出
laoli picgo upload --input image.png --json
```

## 工作流程

1. 创建 GitHub 公开仓库
2. 生成 Personal Access Token（Settings > Developer settings > Tokens，勾选 repo）
3. 运行 `laoli picgo config` 存入配置
4. 上传图片获得 URL

## 注意事项

- 图片自动重命名为时间戳格式
- 支持格式：PNG、JPG、GIF、WebP
- Token 仅保存在 `~/.laoli/.env`，不写入配置文件
