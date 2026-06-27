/**
 * 模拟微信「ES6 转 ES5」对产物 JS 做 Babel 转换，定位 SyntaxError。
 */
import fs from 'node:fs'
import path from 'node:path'
import { transformSync } from '@babel/core'

const root = path.resolve(import.meta.dirname, '../dist/dev/mp-weixin')
const files = []

function walk(dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name)
    if (name.isDirectory())
      walk(p)
    else if (name.name.endsWith('.js'))
      files.push(p)
  }
}

walk(root)

const plugins = [
  '@babel/plugin-transform-block-scoping',
  '@babel/plugin-transform-classes',
  '@babel/plugin-transform-arrow-functions',
  '@babel/plugin-transform-shorthand-properties',
]

const fails = []
for (const file of files) {
  const code = fs.readFileSync(file, 'utf8')
  if (code.length < 50_000)
    continue
  try {
    transformSync(code, { babelrc: false, configFile: false, sourceType: 'script', plugins })
  }
  catch (e) {
    fails.push({ file: path.relative(root, file), msg: e.message, loc: e.loc })
  }
}

console.log(`checked ${files.length} files, large: ${files.filter(f => fs.statSync(f).size > 50000).length}`)
for (const f of fails)
  console.log('\nFAIL', f.file, f.msg, f.loc || '')

if (!fails.length)
  console.log('all large files passed babel es5 simulation')
