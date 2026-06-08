---
name: laoli-picgo
description: 图片上传技能，支持上传图片到 GitHub 作为图床
version: 1.0.0
dependencies:
  cli:
    name: laoli-creative
    version: ">=1.0.0"
---

# 图片上传 Skill

使用 `laoli picgo` 命令上传图片到 GitHub。

## 前置条件

```bash
# 安装 CLI
npm install -g laoli-creative

# 安装 PicGo
npm install -g picgo

# 配置 GitHub
laoli picgo config --repo username/image-host --token your-token
```

## 命令

### 上传图片

```bash
laoli picgo upload --input <path> [options]
```

| 选项 | 说明 |
|------|------|
| `--input <path>` | 图片文件路径（必填） |
| `--batch` | 批量上传 |
| `--json` | JSON 输出 |

### 配置 PicGo

```bash
laoli picgo config [options]
```

| 选项 | 说明 |
|------|------|
| `--repo <owner/repo>` | GitHub 仓库 |
| `--token <token>` | GitHub Personal Access Token |
| `--path <path>` | 仓库内路径 |
| `--branch <branch>` | 分支名 |
| `--custom-url <url>` | 自定义域名 |

## 示例

### 配置

```bash
# 基础配置
laoli picgo config --repo username/image-host --token ghp_xxxxx

# 完整配置
laoli picgo config \
  --repo username/image-host \
  --token ghp_xxxxx \
  --path assets/images \
  --branch main \
  --custom-url "https://cdn.jsdmirror.com/gh/username/image-host@main"
```

### 上传

```bash
# 上传单张图片
laoli picgo upload --input photo.png

# 批量上传
laoli picgo upload --input ./images/*.png --batch

# JSON 输出
laoli picgo upload --input photo.png --json
```

## 配置说明

### GitHub 仓库

创建一个专门的仓库用于存储图片：

```bash
# 创建仓库
# 仓库名：image-host（或任意名称）
# 设为公开仓库（免费用户）
```

### Personal Access Token

1. 访问 GitHub Settings > Developer settings > Personal access tokens
2. 生成新的 Token
3. 选择权限：`repo`（完整仓库访问）

### 自定义域名

推荐使用 jsDelivr CDN 加速：

```
https://cdn.jsdelivr.net/gh/username/repo@branch/
```

国内用户推荐使用 jsMirror：

```
https://cdn.jsdmirror.com/gh/username/repo@branch/
```

## 输出格式

上传成功后返回图片 URL：

```
https://raw.githubusercontent.com/username/image-host/main/assets/images/20260608105400000.png
```

或使用自定义域名：

```
https://cdn.jsdmirror.com/gh/username/image-host@main/assets/images/20260608105400000.png
```

## 工作流程

1. 配置 GitHub 仓库和 Token
2. 选择要上传的图片
3. 调用 CLI 上传图片
4. 返回图片 URL

## 注意事项

- 图片会自动重命名（时间戳格式）
- 支持 PNG, JPG, GIF, WebP 格式
- 使用 `--json` 获取结构化输出
- Token 请妥善保管，不要泄露
- 建议使用专门的仓库作为图床
