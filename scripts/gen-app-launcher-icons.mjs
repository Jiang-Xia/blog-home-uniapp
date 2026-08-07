/**
 * 从 static/app/icon.png（与 blog-home-nuxt/public/icon.png 同源）生成 App 各尺寸启动图标。
 * manifest.config.ts 中 app-plus.distribute.icons 引用 static/app/icons/*.png
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const source = path.join(root, 'static/app/icon.png')
const outDir = path.join(root, 'static/app/icons')

/** manifest.config.ts 引用的全部尺寸（去重） */
const SIZES = [
  20, 29, 40, 58, 60, 72, 76, 80, 87, 96,
  120, 144, 152, 167, 180, 192, 1024,
]

async function main() {
  if (!fs.existsSync(source)) {
    console.error(`[gen-app-launcher-icons] 缺少源图: ${source}`)
    console.error('请从 blog-home-nuxt/public/icon.png 复制到 static/app/icon.png')
    process.exit(1)
  }

  fs.mkdirSync(outDir, { recursive: true })

  for (const size of SIZES) {
    const out = path.join(outDir, `${size}x${size}.png`)
    await sharp(source)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(out)
  }

  console.log(`[gen-app-launcher-icons] wrote ${SIZES.length} icons -> static/app/icons/`)
}

main().catch((err) => {
  console.error('[gen-app-launcher-icons] failed:', err)
  process.exit(1)
})
