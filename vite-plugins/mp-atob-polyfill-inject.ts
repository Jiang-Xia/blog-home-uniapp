import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/** highlight.js 解压 grammar 依赖 atob；注入 vendor 最前，早于 common/vendor.js 内联语法加载 */
const MARKER = '/* mp-atob-polyfill-injected */'
const POLYFILL = `${MARKER}(function(){var g=typeof globalThis!="undefined"?globalThis:typeof global!="undefined"?global:{};if(typeof g.atob=="function")return;var C="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";g.atob=function(i){var s=String(i).replace(/[=]+$/,""),o="";if(s.length%4==1)throw new Error("Invalid base64");for(var n=0,b=0,c=0;n<s.length;)b=b<<6|C.indexOf(s.charAt(n++)),c+=6,c>=8&&(o+=String.fromCharCode(b>>>(c-=8)&255));return o}})();\n`

const VENDOR_REL = ['dist/dev/mp-weixin/common/vendor.js', 'dist/build/mp-weixin/common/vendor.js']

/**
 * 微信小程序：在 common/vendor.js 头部注入 atob，避免 highlight.js 访问 Buffer 导致整包白屏
 */
export default function mpAtobPolyfillInject(): Plugin {
  return {
    name: 'mp-atob-polyfill-inject',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      if (process.env.UNI_PLATFORM !== 'mp-weixin')
        return

      for (const rel of VENDOR_REL) {
        const vendorPath = path.resolve(process.cwd(), rel)
        if (!fs.existsSync(vendorPath))
          continue

        const content = fs.readFileSync(vendorPath, 'utf8')
        if (content.includes(MARKER))
          continue

        fs.writeFileSync(vendorPath, POLYFILL + content)
      }
    },
  }
}
