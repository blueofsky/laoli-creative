#!/usr/bin/env bash
# 批量生成图片示例
# 从 JSON 文件读取多个 prompt 批量生成

set -e

OUTPUT_DIR="./output"
mkdir -p "$OUTPUT_DIR"

# 创建批处理 JSON 文件
BATCH_FILE="$OUTPUT_DIR/batch.json"

cat > "$BATCH_FILE" << 'JSONEOF'
[
  { "prompt": "一只柴犬在草地上奔跑", "output": "./output/shiba.png", "aspectRatio": "16:9" },
  { "prompt": "富士山樱花季，水彩画风格", "output": "./output/fuji.png", "aspectRatio": "16:9" },
  { "prompt": "赛博朋克城市夜景，霓虹灯", "output": "./output/cyber.png", "aspectRatio": "9:16" },
  { "prompt": "星空下的帐篷，插画风格", "output": "./output/tent.png", "aspectRatio": "4:3" }
]
JSONEOF

echo "=== 批量生成图片（4张，并发2路）==="
laoli imagine batch \
  --batchfile "$BATCH_FILE" \
  --jobs 2

echo ""
echo "=== 完成 ==="
echo "生成文件:"
ls -la "$OUTPUT_DIR"/*.png 2>/dev/null || echo "  （需要配置 API Key 才能实际运行）"
