#!/usr/bin/env bash
# 图片生成 + 图床上传 工作流
# 生成一张图片，自动上传到 GitHub 图床，获取可分享的 CDN 链接

set -e

OUTPUT_DIR="./output"
mkdir -p "$OUTPUT_DIR"

echo "=== 1. 生成图片 ==="
laoli imagine generate \
  --prompt "一只橘猫在阳光下打盹，温馨治愈风格" \
  --aspect-ratio 16:9 \
  --output "$OUTPUT_DIR/cat.png"

echo ""
echo "=== 2. 上传到图床 ==="
laoli picgo upload --input "$OUTPUT_DIR/cat.png" --json

echo ""
echo "=== 完成 ==="
echo "图片已保存到: $OUTPUT_DIR/cat.png"
echo "图床链接见上方输出"
