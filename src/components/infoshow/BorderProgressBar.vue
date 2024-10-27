<template>
  <div class="border-progress-container" ref="container">
    <canvas ref="canvas" class="border-progress-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
  progress: number;
}>();

const container = ref<HTMLDivElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

const drawProgress = () => {
  if (!ctx || !canvas.value || !container.value) return;

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  canvas.value.width = width;
  canvas.value.height = height;

  const borderWidth = 4; // 边框宽度
  const cornerRadius = 8; // 拐角半径
  ctx.lineWidth = borderWidth;

  // 创建渐变
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#4f46e5');  // 靛蓝色
  gradient.addColorStop(0.5, '#7c3aed'); // 紫色
  gradient.addColorStop(1, '#db2777');  // 粉色

  // 绘制背景
  ctx.strokeStyle = 'rgba(229, 231, 235, 0.2)'; // 淡灰色半透明
  drawRoundedRect(ctx, borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth, cornerRadius);
  ctx.stroke();

  // 计算进度
  const totalLength = (width + height) * 2 - 8 * cornerRadius + 2 * Math.PI * cornerRadius;
  const progressLength = (totalLength * props.progress) / 100;

  // 绘制进度
  ctx.strokeStyle = gradient;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();

  let remainingLength = progressLength;
  const halfBorder = borderWidth / 2;
  const innerWidth = width - borderWidth;
  const innerHeight = height - borderWidth;

  // 上边
  if (remainingLength > 0) {
    const topLength = Math.min(innerWidth - 2 * cornerRadius, remainingLength);
    ctx.moveTo(cornerRadius + halfBorder, halfBorder);
    ctx.lineTo(topLength + cornerRadius + halfBorder, halfBorder);
    remainingLength -= topLength;
  }

  // 右上角
  if (remainingLength > 0) {
    const angle = Math.min(Math.PI / 2, remainingLength / cornerRadius);
    ctx.arc(innerWidth - cornerRadius + halfBorder, cornerRadius + halfBorder, cornerRadius, -Math.PI / 2, angle - Math.PI / 2, false);
    remainingLength -= angle * cornerRadius;
  }

  // 右边
  if (remainingLength > 0) {
    const rightLength = Math.min(innerHeight - 2 * cornerRadius, remainingLength);
    ctx.lineTo(innerWidth + halfBorder, rightLength + cornerRadius + halfBorder);
    remainingLength -= rightLength;
  }

  // 右下角
  if (remainingLength > 0) {
    const angle = Math.min(Math.PI / 2, remainingLength / cornerRadius);
    ctx.arc(innerWidth - cornerRadius + halfBorder, innerHeight - cornerRadius + halfBorder, cornerRadius, 0, angle, false);
    remainingLength -= angle * cornerRadius;
  }

  // 下边
  if (remainingLength > 0) {
    const bottomLength = Math.min(innerWidth - 2 * cornerRadius, remainingLength);
    ctx.lineTo(innerWidth - bottomLength - cornerRadius + halfBorder, innerHeight + halfBorder);
    remainingLength -= bottomLength;
  }

  // 左下角
  if (remainingLength > 0) {
    const angle = Math.min(Math.PI / 2, remainingLength / cornerRadius);
    ctx.arc(cornerRadius + halfBorder, innerHeight - cornerRadius + halfBorder, cornerRadius, Math.PI / 2, Math.PI / 2 + angle, false);
    remainingLength -= angle * cornerRadius;
  }

  // 左边
  if (remainingLength > 0) {
    const leftLength = Math.min(innerHeight - 2 * cornerRadius, remainingLength);
    ctx.lineTo(halfBorder, innerHeight - leftLength - cornerRadius + halfBorder);
    remainingLength -= leftLength;
  }

  // 左上角
  if (remainingLength > 0) {
    const angle = Math.min(Math.PI / 2, remainingLength / cornerRadius);
    ctx.arc(cornerRadius + halfBorder, cornerRadius + halfBorder, cornerRadius, Math.PI, Math.PI + angle, false);
  }

  ctx.stroke();
};

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d');
    drawProgress();
  }
});

watch(() => props.progress, drawProgress);
</script>

<style scoped>
.border-progress-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.border-progress-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}
</style>