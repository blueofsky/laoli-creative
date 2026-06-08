#!/usr/bin/env bash
# TTS 三大模式演示
# 展示预置音色、音色设计、音色克隆三种语音合成方式

set -e

OUTPUT_DIR="./output"
mkdir -p "$OUTPUT_DIR"
TEXT="你好，欢迎使用 Laoli Creative 语音合成工具"

echo "=== 1. 预置音色（MiniMax）==="
echo "列出可用音色..."
laoli tts voices --provider minimax

echo ""
echo "使用冰糖音色生成..."
laoli tts synthesize \
  --text "$TEXT" \
  --voice 冰糖 \
  --provider minimax \
  --output "$OUTPUT_DIR/mm-bingtang.mp3"

echo ""
echo "=== 2. 预置音色（MiMo）==="
laoli tts synthesize \
  --text "$TEXT" \
  --voice 茉莉 \
  --provider mimo \
  --output "$OUTPUT_DIR/mimo-moli.mp3"

echo ""
echo "=== 3. 音色设计（MiMo）==="
laoli tts synthesize \
  --text "$TEXT" \
  --provider mimo \
  --model mimo-v2.5-tts-voicedesign \
  --voice "温柔的男声，略带沙哑" \
  --output "$OUTPUT_DIR/mimo-designed.mp3"

echo ""
echo "=== 完成 ==="
echo "  MiniMax 冰糖: $OUTPUT_DIR/mm-bingtang.mp3"
echo "  MiMo 茉莉:    $OUTPUT_DIR/mimo-moli.mp3"
echo "  音色设计:     $OUTPUT_DIR/mimo-designed.mp3"
echo ""
echo "提示：音色克隆需要音频样本文件："
echo "  laoli tts clone --voice-file sample.wav --text \"$TEXT\" --output $OUTPUT_DIR/cloned.mp3"
