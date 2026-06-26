import { exec } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * 打开开发者工具
 * @param {string} env - 环境，'dev' 或 'build'
 * @param {object} options - 配置选项
 * @param {string} options.wechatDevtoolsCliPath - 微信开发者工具 CLI 路径
 * @param {string} options.alipayDevtoolsPath - 支付宝小程序开发者工具安装目录
 */
function _openDevTools(env = 'dev', options = {}) {
  const { wechatDevtoolsCliPath, alipayDevtoolsPath } = options
  const platform = process.platform // darwin, win32, linux
  const { UNI_PLATFORM } = process.env //  mp-weixin, mp-alipay, mp-lark

  const uniPlatformText = UNI_PLATFORM === 'mp-weixin' ? '微信小程序' : UNI_PLATFORM === 'mp-alipay' ? '支付宝小程序' : UNI_PLATFORM === 'mp-lark' ? '抖音小程序' : '小程序'

  // 项目路径（构建输出目录），根据环境选择不同目录
  const outputDir = env === 'build' ? `dist/build/${UNI_PLATFORM}` : `dist/dev/${UNI_PLATFORM}`
  const projectPath = path.resolve(process.cwd(), outputDir)

  // 检查构建输出目录是否存在
  if (!fs.existsSync(projectPath)) {
    console.log(`❌ ${uniPlatformText}构建目录不存在:`, projectPath)
    return
  }

  console.log(`🚀 正在打开${uniPlatformText}开发者工具...`)

  // 根据不同操作系统执行不同命令
  let command = ''

  if (platform === 'darwin') {
    // macOS
    if (UNI_PLATFORM === 'mp-weixin') {
      const cliPath = wechatDevtoolsCliPath || '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
      command = `"${cliPath}" -o "${projectPath}"`
    }
    else if (UNI_PLATFORM === 'mp-alipay') {
      const appPath = alipayDevtoolsPath || '/Applications/小程序开发者工具.app/Contents/MacOS/小程序开发者工具'
      command = `"${appPath}" --p "${projectPath}"`
    }
    else if (UNI_PLATFORM === 'mp-lark') {
      command = `/Applications/抖音开发者工具.app/Contents/MacOS/抖音开发者工具 --p "${projectPath}"`
    }
  }
  else if (platform === 'win32' || platform === 'win64') {
    // Windows
    if (UNI_PLATFORM === 'mp-weixin') {
      const cliPath = wechatDevtoolsCliPath || 'D:\\softwares\\微信web开发者工具\\cli.bat'
      command = `"${cliPath}" -o "${projectPath}"`
    }
    else if (UNI_PLATFORM === 'mp-alipay') {
      const installPath = alipayDevtoolsPath || 'D:\\softwares\\支付宝开发者工具\\小程序开发者工具'
      const exePath = path.join(installPath, '小程序开发者工具.exe')
      command = `"${exePath}" --p "${projectPath}"`
    }
  }
  else {
    // Linux 或其他系统
    console.log(`❌ 当前系统不支持自动打开${uniPlatformText}开发者工具`)
    return
  }

  if (!command) {
    console.log(`❌ 当前平台暂不支持自动打开${uniPlatformText}开发者工具`)
    return
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`❌ 打开${uniPlatformText}开发者工具失败:`, error.message)
      if (UNI_PLATFORM === 'mp-weixin') {
        console.log('💡 当前使用的微信开发者工具 CLI 命令:', command)
        console.log('💡 如果安装位置不同，可以在 env/.env 配置 WECHAT_DEVTOOLS_CLI_PATH 为本机实际 CLI 路径')
      }
      else if (UNI_PLATFORM === 'mp-alipay') {
        console.log('💡 当前使用的支付宝开发者工具命令:', command)
        console.log('💡 如果安装位置不同，可以在 env/.env 配置 ALIPAY_DEVTOOLS_PATH 为本机实际安装目录')
      }
      console.log(`💡 请确保${uniPlatformText}开发者工具服务端口已启用`)
      console.log(`💡 可以手动打开${uniPlatformText}开发者工具并导入项目:`, projectPath)
      return
    }

    if (stderr) {
      console.log('⚠️ 警告:', stderr)
    }

    console.log(`✅ ${uniPlatformText}开发者工具已打开`)

    if (stdout) {
      console.log(stdout)
    }
  })
}

/**
 * 创建 Vite 插件，用于自动打开开发者工具
 * @param {object} options - 配置选项
 * @param {string} options.mode - 构建模式，'development' 或 'production'
 * @param {string} options.wechatDevtoolsCliPath - 微信开发者工具 CLI 路径
 * @param {string} options.alipayDevtoolsPath - 支付宝小程序开发者工具安装目录
 */
export default function openDevTools(options = {}) {
  const { mode = 'development', wechatDevtoolsCliPath, alipayDevtoolsPath } = options
  // 根据 mode 确定环境：development -> dev, production -> build
  const env = mode === 'production' ? 'build' : 'dev'

  // 首次构建标记
  let isFirstBuild = true

  return {
    name: 'uni-devtools',
    writeBundle() {
      if (isFirstBuild && process.env.UNI_PLATFORM?.includes('mp')) {
        isFirstBuild = false
        _openDevTools(env, { wechatDevtoolsCliPath, alipayDevtoolsPath })
      }
    },
  }
}
