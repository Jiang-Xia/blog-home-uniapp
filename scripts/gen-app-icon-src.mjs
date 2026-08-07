/**
 * 将 src/static/my-icons/*.svg 生成为 base64 data URI 映射（构建前执行）
 * - 避免运行时 Buffer / ?raw 在 MP/H5 不一致
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const iconDir = path.join(root, 'src/static/my-icons')
const outFile = path.join(root, 'src/config/app-icon-src.generated.ts')

const files = fs.readdirSync(iconDir).filter(f => f.endsWith('.svg')).sort()

/**
 * 微信小程序 image 不渲染 feGaussianBlur 等 SVG filter，保留源文件霓虹滤镜供 H5/设计稿。
 * 生成 data URI 时剥离 filter，渐变/描边主体仍可显示。
 */
function mpSafeSvg(svg) {
  let out = svg
    .replace(/<filter[\s\S]*?<\/filter>/gi, '')
    .replace(/\sfilter="url\([^"]+\)"/gi, '')
  out = out.replace(/<defs>\s*<\/defs>/gi, '')
  return out
}

function svgToDataUri(svg) {
  // MP 推荐 charset=utf-8 + encodeURIComponent；base64 svg 在真机常失败
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mpSafeSvg(svg))}`
}

const lines = files.map((file) => {
  const name = file.replace(/\.svg$/, '')
  const svg = fs.readFileSync(path.join(iconDir, file), 'utf-8')
  const uri = svgToDataUri(svg)
  return `  '${name}': '${uri}',`
})

const content = `/**
 * 自动生成：scripts/gen-app-icon-src.mjs
 * 勿手改；新增 SVG 后执行 pnpm gen:icons
 */
import type { AppIconName } from '@/config/app-icons'

export const APP_ICON_SRC: Record<AppIconName, string> = {
${lines.join('\n')}
}

export function getAppIconSrc(name: AppIconName): string {
  return APP_ICON_SRC[name]
}
`

fs.writeFileSync(outFile, content, 'utf-8')
console.log(`[gen-app-icon-src] wrote ${files.length} icons -> src/config/app-icon-src.generated.ts`)
