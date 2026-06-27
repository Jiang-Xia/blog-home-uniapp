/**
 * 光影边框常量 — 移植自 blog-home-nuxt/pages/tool/photos/constants.ts
 */
export interface PhotoSettings {
  padding: number
  blur: number
  borderRadius: number
  shadow: number
  showExif: boolean
  logoBrand: string
}

export const DEFAULT_PHOTO_SETTINGS: PhotoSettings = {
  padding: 28,
  blur: 24,
  borderRadius: 12,
  shadow: 12,
  showExif: true,
  logoBrand: '',
}

export const LOGO_BRAND_OPTIONS = [
  { value: '', label: '自动识别' },
  { value: 'nikon', label: 'Nikon' },
  { value: 'canon', label: 'Canon' },
  { value: 'sony', label: 'Sony' },
  { value: 'fujifilm', label: 'Fujifilm' },
  { value: 'leica', label: 'Leica' },
  { value: 'dji', label: 'DJI' },
] as const

const BRAND_LOGO_MAP: Record<string, string> = {
  NIKON: 'nikon',
  CANON: 'canon',
  SONY: 'sony',
  FUJIFILM: 'fujifilm',
  LEICA: 'leica',
  DJI: 'dji',
}

export function resolveLogoName(make: string, override = ''): string {
  if (override)
    return override
  if (!make)
    return ''
  const key = make.trim().toUpperCase()
  return BRAND_LOGO_MAP[key] || key.split(/\s+/)[0]?.toLowerCase() || ''
}

export function getLogoUrl(name: string, staticBase: string): string {
  return name ? `${staticBase}/images/photos/logo/${name}.png` : ''
}

export const MAX_PHOTOS = 50

export interface LayoutRect {
  containerWidth: number
  containerHeight: number
  displayX: number
  displayY: number
  displayWidth: number
  displayHeight: number
}

export function calcDisplayRect(
  imgWidth: number,
  imgHeight: number,
  containerWidth: number,
  containerHeight: number,
  padding: number,
): LayoutRect {
  const availW = containerWidth - padding * 2
  const availH = containerHeight - padding * 2
  const scale = Math.min(availW / imgWidth, availH / imgHeight, 1)
  const displayWidth = imgWidth * scale
  const displayHeight = imgHeight * scale
  return {
    containerWidth,
    containerHeight,
    displayX: (containerWidth - displayWidth) / 2,
    displayY: (containerHeight - displayHeight) / 2,
    displayWidth,
    displayHeight,
  }
}

export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

export function drawGradientBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#0a0a12')
  gradient.addColorStop(0.55, '#12121f')
  gradient.addColorStop(1, '#080810')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}
