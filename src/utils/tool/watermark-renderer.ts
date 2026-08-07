/**
 * 批量水印 — 类型与 Canvas 绘制逻辑（移植自 blog-home-nuxt/pages/tool/watermark/index.vue）
 */

export const MAX_WATERMARK_PHOTOS = 50

export type TimeMark = 'yes' | 'no'
export type WatermarkPosition = 'bottom' | 'top' | 'center' | 'bottom-left' | 'bottom-right' | 'tile'
export type FontSizeMode = 'auto' | 'manual'
export type WatermarkColorMode = 'white' | 'black' | 'custom'
export type ExportFormat = 'png' | 'jpeg'
export type WatermarkFontKey = 'harmony' | 'pingfang' | 'yahei' | 'song' | 'kaiti' | 'mono'

export interface WatermarkFontOption {
  value: WatermarkFontKey
  label: string
  family: string
}

export const WATERMARK_FONT_OPTIONS: WatermarkFontOption[] = [
  { value: 'harmony', label: '鸿蒙 Sans（推荐）', family: 'HarmonyOS-Sans, sans-serif' },
  { value: 'pingfang', label: '苹方', family: '"PingFang SC", "Hiragino Sans GB", sans-serif' },
  { value: 'yahei', label: '微软雅黑', family: '"Microsoft YaHei", sans-serif' },
  { value: 'song', label: '宋体', family: '"Songti SC", SimSun, serif' },
  { value: 'kaiti', label: '楷体', family: '"Kaiti SC", KaiTi, STKaiti, serif' },
  { value: 'mono', label: '等宽', family: 'ui-monospace, "SF Mono", Consolas, monospace' },
]

export interface WatermarkStyle {
  position: WatermarkPosition
  opacity: number
  fontSizeMode: FontSizeMode
  customFontSize: number
  colorMode: WatermarkColorMode
  customColor: string
  rotation: number
  fontFamily: WatermarkFontKey
}

export interface ExportOptions {
  format: ExportFormat
  jpegQuality: number
}

export interface WatermarkColors {
  fill: string
  shadow: string
}

export interface WatermarkItem {
  id: string
  name: string
  originalSrc: string
  previewSrc: string
}

export function resolveFontFamily(style: WatermarkStyle): string {
  return WATERMARK_FONT_OPTIONS.find(opt => opt.value === style.fontFamily)?.family
    ?? WATERMARK_FONT_OPTIONS[0]!.family
}

export function buildCanvasFont(fontSize: number, style: WatermarkStyle): string {
  return `${fontSize}px ${resolveFontFamily(style)}`
}

export function buildWatermarkText(customMark: string, timeMark: TimeMark): string {
  const parts: string[] = []
  const text = customMark.trim()
  if (text)
    parts.push(text)
  if (timeMark === 'yes')
    parts.push(new Date().toLocaleDateString('zh-CN'))
  return parts.join('  ')
}

function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const normalized = hex.replace('#', '').trim()
  if (normalized.length === 3) {
    return {
      r: Number.parseInt(normalized[0]! + normalized[0]!, 16),
      g: Number.parseInt(normalized[1]! + normalized[1]!, 16),
      b: Number.parseInt(normalized[2]! + normalized[2]!, 16),
    }
  }
  if (normalized.length === 6) {
    return {
      r: Number.parseInt(normalized.slice(0, 2), 16),
      g: Number.parseInt(normalized.slice(2, 4), 16),
      b: Number.parseInt(normalized.slice(4, 6), 16),
    }
  }
  return null
}

export function getWatermarkColors(style: WatermarkStyle): WatermarkColors {
  const alpha = Math.min(100, Math.max(20, style.opacity)) / 100
  if (style.colorMode === 'black') {
    return {
      fill: `rgba(0, 0, 0, ${alpha})`,
      shadow: `rgba(255, 255, 255, ${alpha * 0.45})`,
    }
  }
  if (style.colorMode === 'custom') {
    const rgb = hexToRgb(style.customColor) ?? { r: 255, g: 255, b: 255 }
    return {
      fill: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
      shadow: `rgba(0, 0, 0, ${alpha * 0.4})`,
    }
  }
  return {
    fill: `rgba(255, 255, 255, ${alpha})`,
    shadow: `rgba(0, 0, 0, ${alpha * 0.5})`,
  }
}

export function resolveFontSize(width: number, height: number, style: WatermarkStyle): number {
  if (style.fontSizeMode === 'manual')
    return Math.min(120, Math.max(12, style.customFontSize || 30))
  return Math.max(16, Math.round(Math.min(width, height) * 0.04))
}

function resolveRotationDeg(style: WatermarkStyle): number {
  if (style.position === 'tile' && style.rotation === 0)
    return -30
  return style.rotation
}

function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  colors: WatermarkColors,
): void {
  ctx.fillStyle = colors.shadow
  ctx.fillText(text, x + 1, y + 1)
  ctx.fillStyle = colors.fill
  ctx.fillText(text, x, y)
}

function drawSingleWatermark(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  style: WatermarkStyle,
): void {
  const fontSize = resolveFontSize(width, height, style)
  const pad = Math.round(fontSize * 0.65)
  const colors = getWatermarkColors(style)
  const rotationRad = (resolveRotationDeg(style) * Math.PI) / 180
  ctx.font = buildCanvasFont(fontSize, style)
  ctx.textBaseline = 'middle'
  let x = width / 2
  let y = height - pad - fontSize / 2
  let textAlign: CanvasTextAlign = 'center'
  switch (style.position) {
    case 'top':
      y = pad + fontSize / 2
      break
    case 'center':
      y = height / 2
      break
    case 'bottom-left':
      x = pad
      y = height - pad - fontSize / 2
      textAlign = 'left'
      break
    case 'bottom-right':
      x = width - pad
      y = height - pad - fontSize / 2
      textAlign = 'right'
      break
  }
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotationRad)
  ctx.textAlign = textAlign
  drawTextWithShadow(ctx, text, 0, 0, colors)
  ctx.restore()
}

function drawTiledWatermark(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  style: WatermarkStyle,
): void {
  const fontSize = resolveFontSize(width, height, style)
  const colors = getWatermarkColors(style)
  const rotationRad = (resolveRotationDeg(style) * Math.PI) / 180
  ctx.save()
  ctx.font = buildCanvasFont(fontSize, style)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const textWidth = ctx.measureText(text).width
  const gapX = textWidth + fontSize * 2
  const gapY = fontSize * 3
  const radius = Math.sqrt(width * width + height * height)
  ctx.translate(width / 2, height / 2)
  ctx.rotate(rotationRad)
  for (let yy = -radius; yy < radius; yy += gapY) {
    for (let xx = -radius; xx < radius; xx += gapX)
      drawTextWithShadow(ctx, text, xx, yy, colors)
  }
  ctx.restore()
}

/** 在已有 Canvas 2D 上下文上绘制水印层 */
export function drawWatermarkLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: WatermarkStyle,
  customMark: string,
  timeMark: TimeMark,
): void {
  const text = buildWatermarkText(customMark, timeMark)
  if (!text)
    return
  if (style.position === 'tile')
    drawTiledWatermark(ctx, text, width, height, style)
  else
    drawSingleWatermark(ctx, text, width, height, style)
}

export function encodeCanvasDataUrl(
  canvas: HTMLCanvasElement | UniApp.CanvasContext,
  exportOptions: ExportOptions,
  width: number,
  height: number,
): Promise<string> {
  // #ifdef H5
  const quality = exportOptions.format === 'jpeg'
    ? Math.min(1, Math.max(0.6, exportOptions.jpegQuality / 100))
    : undefined
  const mime = exportOptions.format === 'jpeg' ? 'image/jpeg' : 'image/png'
  return Promise.resolve((canvas as HTMLCanvasElement).toDataURL(mime, quality))
  // #endif
  // #ifndef H5
  return new Promise((resolve, reject) => {
    uni.canvasToTempFilePath({
      canvas: canvas as any,
      width,
      height,
      destWidth: width,
      destHeight: height,
      fileType: exportOptions.format === 'jpeg' ? 'jpg' : 'png',
      quality: exportOptions.format === 'jpeg' ? exportOptions.jpegQuality / 100 : 1,
      success: res => resolve(res.tempFilePath),
      fail: err => reject(err),
    })
  })
  // #endif
}

export function sanitizeFileName(name: string): string {
  return [...name]
    .map((ch) => {
      const code = ch.charCodeAt(0)
      if (code < 32 || /[<>:"/\\|?*]/.test(ch))
        return '_'
      return ch
    })
    .join('')
    .slice(0, 80) || 'image'
}

export function getExportExtension(format: ExportFormat): string {
  return format === 'jpeg' ? 'jpg' : 'png'
}
