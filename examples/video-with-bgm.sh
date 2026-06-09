#!/usr/bin/env bash
# 视频生成 + 背景音乐 工作流
# 生成一段视频，再配上 BGM，适合短视频创作

set -e

OUTPUT_DIR="./output"
mkdir -p "$OUTPUT_DIR"

echo "=== 1. 生成视频 ==="
laoli video generate \
  --prompt "海浪拍打沙滩，日落时分，金色阳光洒在海面上" \
  --seconds 5 \
  --output "$OUTPUT_DIR/scene.mp4"

echo ""
echo "=== 2. 生成背景音乐 ==="
laoli music \
  --prompt "舒缓的钢琴曲，自然意境" \
  --instrumental \
  --output "$OUTPUT_DIR/bgm.mp3"

echo ""
echo "=== 完成 ==="
echo "视频: $OUTPUT_DIR/scene.mp4"
echo "音乐: $OUTPUT_DIR/bgm.mp3"
echo ""
echo "提示：可用 ffmpeg 合成："
echo "  ffmpeg -i $OUTPUT_DIR/scene.mp4 -i $OUTPUT_DIR/bgm.mp3 \\"
echo "    -c:v copy -c:a aac -shortest $OUTPUT_DIR/final.mp4"
