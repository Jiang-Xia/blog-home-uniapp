/**
 * 抽奖动画会话：动画期间 WS 庆祝入队，关闭后 flush
 */
import { ref } from 'vue'

const active = ref(false)
const pendingCelebrations: Array<() => void> = []

export function useRpgLotterySession() {
  const beginLotteryDrawSession = () => {
    active.value = true
    pendingCelebrations.length = 0
  }

  const endLotteryDrawSession = () => {
    active.value = false
    const tasks = pendingCelebrations.splice(0)
    for (const task of tasks)
      task()
  }

  const deferCelebration = (task: () => void) => {
    if (active.value) {
      pendingCelebrations.push(task)
      return
    }
    task()
  }

  return {
    lotteryDrawSessionActive: active,
    beginLotteryDrawSession,
    endLotteryDrawSession,
    deferCelebration,
  }
}
