/**
 * 光影边框 Canvas 渲染 — uni-app 版（无 Worker，H5/MP 共用 2D 上下文）
 * 数据来源：本地选图 tempFilePath / H5 blob URL；品牌 logo 来自静态资源 CDN
 */
import { getCurrentInstance } from 'vue'
import {
  calcDisplayRect,
  drawGradientBackground,
  getLogoUrl,

  resolveLogoName,
  roundRectPath,
} from '@/utils/tool/photo-constants'
import type { PhotoSettings } from '@/utils/tool/photo-constants'
import { getStaticBaseUrl } from '@/utils/ws-origin'

export interface PhotoRenderSize {
  width: number
  height: number
}

export const EXPORT_SIZE: PhotoRenderSize = { width: 1280, height: 800 }
export const PREVIEW_SIZE: PhotoRenderSize = { width: 640, height: 400 }

/** 解析品牌 logo 完整 URL */
export function resolveBrandLogoUrl(make: string, logoBrand: string): string {
  const name = resolveLogoName(make, logoBrand)
  return name ? getLogoUrl(name, getStaticBaseUrl()) : ''
}

/** H5：加载 HTMLImageElement（跨域 logo 需 anonymous） */
export function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}

/**
 * 在 2D 上下文上绘制光影边框（主图 + 渐变底 + 圆角 + 可选阴影）
 * @param drawPhoto 将照片绘制到 (x,y,w,h) 的回调（兼容 MP canvas.createImage）
 */
export function drawPhotoFrameLayer(
  ctx: CanvasRenderingContext2D,
  settings: PhotoSettings,
  size: PhotoRenderSize,
  imgW: number,
  imgH: number,
  drawPhoto: (x: number, y: number, w: number, h: number) => void,
  drawBlur?: () => void,
  logo?: CanvasImageSource | null,
  options: { withShadow?: boolean } = {},
) {
  const { width, height } = size
  const layout = calcDisplayRect(imgW, imgH, width, height, settings.padding)

  ctx.clearRect(0, 0, width, height)
  drawGradientBackground(ctx, width, height)

  if (settings.blur > 0 && drawBlur) {
    ctx.save()
    drawBlur()
    ctx.restore()
  }

  ctx.save()
  if (options.withShadow && settings.shadow > 0) {
    ctx.shadowColor = 'rgba(0,0,0,0.55)'
    ctx.shadowBlur = settings.shadow
    ctx.shadowOffsetY = 6
  }
  roundRectPath(
    ctx,
    layout.displayX,
    layout.displayY,
    layout.displayWidth,
    layout.displayHeight,
    settings.borderRadius,
  )
  ctx.clip()
  drawPhoto(layout.displayX, layout.displayY, layout.displayWidth, layout.displayHeight)
  ctx.restore()

  if (logo && settings.logoBrand) {
    const logoSize = 28
    const lx = layout.displayX + 12
    const ly = layout.displayY + layout.displayHeight - logoSize - 12
    ctx.drawImage(logo as CanvasImageSource, lx, ly, logoSize, logoSize)
  }
}

/** H5 一站式渲染为 data URL */
export async function renderPhotoFrameDataUrl(
  photoSrc: string,
  settings: PhotoSettings,
  size: PhotoRenderSize,
): Promise<string> {
  const img = await loadHtmlImage(photoSrc)
  let logoEl: HTMLImageElement | null = null
  const logoUrl = resolveBrandLogoUrl('', settings.logoBrand)
  if (logoUrl) {
    try {
      logoEl = await loadHtmlImage(logoUrl)
    }
    catch {
      logoEl = null
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const ctx = canvas.getContext('2d')
  if (!ctx)
    throw new Error('canvas unsupported')

  if (settings.blur > 0) {
    const tmp = document.createElement('canvas')
    tmp.width = Math.max(1, Math.round(img.width * Math.min(1, 280 / Math.max(img.width, img.height))))
    tmp.height = Math.max(1, Math.round(img.height * Math.min(1, 280 / Math.max(img.width, img.height))))
    tmp.getContext('2d')?.drawImage(img, 0, 0, tmp.width, tmp.height)
    const blurFn = () => {
      const coverScale = Math.max(size.width / tmp.width, size.height / tmp.height)
      const coverW = tmp.width * coverScale
      const coverH = tmp.height * coverScale
      ctx.save()
      ctx.filter = `blur(${Math.min(settings.blur, 20)}px)`
      ctx.globalAlpha = 0.45
      ctx.drawImage(tmp, (size.width - coverW) / 2, (size.height - coverH) / 2, coverW, coverH)
      ctx.restore()
    }
    drawPhotoFrameLayer(
      ctx,
      settings,
      size,
      img.width,
      img.height,
      (x, y, w, h) => ctx.drawImage(img, x, y, w, h),
      blurFn,
      logoEl,
      { withShadow: true },
    )
  }
  else {
    drawPhotoFrameLayer(
      ctx,
      settings,
      size,
      img.width,
      img.height,
      (x, y, w, h) => ctx.drawImage(img, x, y, w, h),
      undefined,
      logoEl,
      { withShadow: true },
    )
  }

  return canvas.toDataURL('image/jpeg', 0.92)
}

/** MP：type=2d canvas 导出临时路径 */
export async function renderPhotoFrameTempPath(
  photoSrc: string,
  settings: PhotoSettings,
  size: PhotoRenderSize,
  canvasId = '#photo-export-canvas',
): Promise<string> {
  const info = await new Promise<UniApp.GetImageInfoSuccessData>((resolve, reject) => {
    uni.getImageInfo({ src: photoSrc, success: resolve, fail: reject })
  })

  let logoSrc = ''
  if (settings.logoBrand)
    logoSrc = resolveBrandLogoUrl('', settings.logoBrand)

  return new Promise((resolve, reject) => {
    uni.createSelectorQuery()
      .in(getCurrentInstance())
      .select(canvasId)
      .fields({ node: true, size: true }, async (res) => {
        const nodeInfo = Array.isArray(res) ? res[0] : res
        const canvas = (nodeInfo as { node?: any })?.node
        if (!canvas) {
          reject(new Error('canvas node missing'))
          return
        }
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        canvas.width = size.width
        canvas.height = size.height

        const photoImg = canvas.createImage()
        const loadPhoto = new Promise<void>((resPhoto, rejPhoto) => {
          photoImg.onload = () => resPhoto()
          photoImg.onerror = () => rejPhoto(new Error('photo load failed'))
          photoImg.src = photoSrc
        })

        let logoImg: any = null
        const loadLogo = logoSrc
          ? new Promise<void>((resLogo) => {
              logoImg = canvas.createImage()
              logoImg.onload = () => resLogo()
              logoImg.onerror = () => {
                logoImg = null
                resLogo()
              }
              logoImg.src = logoSrc
            })
          : Promise.resolve()

        try {
          await Promise.all([loadPhoto, loadLogo])

          const blurFn = settings.blur > 0
            ? () => {
                const scale = Math.min(1, 280 / Math.max(info.width, info.height))
                const sw = Math.max(1, Math.round(info.width * scale))
                const sh = Math.max(1, Math.round(info.height * scale))
                const coverScale = Math.max(size.width / sw, size.height / sh)
                const coverW = sw * coverScale
                const coverH = sh * coverScale
                ctx.save()
                ctx.filter = `blur(${Math.min(settings.blur, 20)}px)`
                ctx.globalAlpha = 0.45
                ctx.drawImage(photoImg, (size.width - coverW) / 2, (size.height - coverH) / 2, coverW, coverH)
                ctx.restore()
              }
            : undefined

          drawPhotoFrameLayer(
            ctx,
            settings,
            size,
            info.width,
            info.height,
            (x, y, w, h) => ctx.drawImage(photoImg, x, y, w, h),
            blurFn,
            logoImg,
            { withShadow: true },
          )

          uni.canvasToTempFilePath({
            canvas,
            width: size.width,
            height: size.height,
            destWidth: size.width,
            destHeight: size.height,
            fileType: 'jpg',
            quality: 0.92,
            success: r => resolve(r.tempFilePath),
            fail: reject,
          } as UniNamespace.CanvasToTempFilePathOptions, getCurrentInstance())
        }
        catch (e) {
          reject(e)
        }
      })
      .exec()
  })
}

/** 跨端渲染：H5 返回 data URL，MP 返回临时路径 */
export async function renderPhotoFrameOutput(
  photoSrc: string,
  settings: PhotoSettings,
  size: PhotoRenderSize,
): Promise<string> {
  // #ifdef H5
  return renderPhotoFrameDataUrl(photoSrc, settings, size)
  // #endif
  // #ifndef H5
  return renderPhotoFrameTempPath(photoSrc, settings, size)
  // #endif
}
