/**
 * 全局请求 Loading 管理器
 *
 * - 并发请求使用引用计数：只展示一次，直到所有参与计数的请求结束才关闭
 * - 防闪烁：短请求（默认 < 150ms）不展示 Loading，避免一闪而过
 * - 与 toast 共用小程序原生层：请求结束 hideLoading 后，toast 仍靠 delay 展示
 */

export interface GlobalLoadingOptions {
  /** 是否启用 Loading，默认 true（可用 false 关闭单次） */
  enabled?: boolean
  /** Loading 文案 */
  title?: string
  /** 是否显示透明蒙层，防止重复点击 */
  mask?: boolean
  /** 延迟展示毫秒数，用于防闪烁 */
  debounceMs?: number
}

/** 单次请求：`false` 关闭，或覆盖全局默认 */
export type RequestLoadingOption = false | GlobalLoadingOptions

const globalLoadingState: Required<GlobalLoadingOptions> = {
  enabled: true,
  title: '加载中...',
  mask: true,
  debounceMs: 150,
}

const loadingRuntime = {
  pendingCount: 0,
  timer: null as ReturnType<typeof setTimeout> | null,
  showing: false,
}

/** 设置全局默认开关：是否启用 Loading */
export function setGlobalLoadingEnabled(enabled: boolean) {
  globalLoadingState.enabled = !!enabled
}

/**
 * 设置全局默认配置
 * @param options enabled / title / mask / debounceMs
 */
export function setGlobalLoadingOptions(options: GlobalLoadingOptions = {}) {
  if (!options || typeof options !== 'object')
    return
  if (typeof options.enabled === 'boolean')
    globalLoadingState.enabled = options.enabled
  if (typeof options.title === 'string')
    globalLoadingState.title = options.title
  if (typeof options.mask === 'boolean')
    globalLoadingState.mask = options.mask
  if (typeof options.debounceMs === 'number')
    globalLoadingState.debounceMs = options.debounceMs
}

/** 解析单次请求的 Loading 参数（false = 关闭） */
export function resolveLoadingOptions(options?: RequestLoadingOption): Required<GlobalLoadingOptions> {
  if (options === false) {
    return {
      enabled: false,
      title: globalLoadingState.title,
      mask: globalLoadingState.mask,
      debounceMs: globalLoadingState.debounceMs,
    }
  }
  const opt = options && typeof options === 'object' ? options : {}
  const enabled = typeof opt.enabled === 'boolean' ? opt.enabled : globalLoadingState.enabled
  return {
    enabled,
    title: opt.title ?? globalLoadingState.title,
    mask: opt.mask ?? globalLoadingState.mask,
    debounceMs: opt.debounceMs ?? globalLoadingState.debounceMs,
  }
}

/**
 * 请求开始时调用
 * - 累加并发计数；0→1 时启动防闪烁计时器
 */
export function beginGlobalLoading(options?: RequestLoadingOption) {
  const opt = resolveLoadingOptions(options)
  if (!opt.enabled)
    return

  loadingRuntime.pendingCount += 1
  if (loadingRuntime.pendingCount !== 1)
    return

  if (loadingRuntime.timer) {
    clearTimeout(loadingRuntime.timer)
    loadingRuntime.timer = null
  }

  loadingRuntime.timer = setTimeout(() => {
    loadingRuntime.timer = null
    if (loadingRuntime.pendingCount > 0 && !loadingRuntime.showing) {
      loadingRuntime.showing = true
      uni.showLoading({
        title: opt.title,
        mask: opt.mask,
      })
    }
  }, Math.max(0, Number(opt.debounceMs) || 0))
}

/**
 * 请求结束时调用（务必与 beginGlobalLoading 成对，建议放在 complete/finally）
 * - 递减计数；归零时关闭 Loading 或取消尚未触发的计时器
 */
export function endGlobalLoading(options?: RequestLoadingOption) {
  const opt = resolveLoadingOptions(options)
  if (!opt.enabled)
    return

  loadingRuntime.pendingCount = Math.max(0, loadingRuntime.pendingCount - 1)
  if (loadingRuntime.pendingCount > 0)
    return

  if (loadingRuntime.timer) {
    clearTimeout(loadingRuntime.timer)
    loadingRuntime.timer = null
  }
  if (loadingRuntime.showing) {
    loadingRuntime.showing = false
    uni.hideLoading()
  }
}

/** 仅测试用：重置运行时状态 */
export function __resetGlobalLoadingForTest() {
  if (loadingRuntime.timer) {
    clearTimeout(loadingRuntime.timer)
    loadingRuntime.timer = null
  }
  if (loadingRuntime.showing)
    uni.hideLoading()
  loadingRuntime.pendingCount = 0
  loadingRuntime.showing = false
  setGlobalLoadingOptions({
    enabled: true,
    title: '加载中...',
    mask: true,
    debounceMs: 150,
  })
}
