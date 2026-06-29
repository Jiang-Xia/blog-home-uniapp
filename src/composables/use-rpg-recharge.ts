/**
 * RPG 钻石充值弹窗状态（全站共享）
 * - rechargeComplete WS 自动关单并提示到账
 */
import { ref } from 'vue'
import { onRealtimeEvent } from '@/composables/use-realtime-socket'
import { useRpgAudio } from '@/composables/use-rpg-audio'
import { useRpg } from '@/composables/use-rpg'

const visible = ref(false)
let rechargeListenerBound = false

function bindRechargeListener() {
  if (rechargeListenerBound)
    return
  rechargeListenerBound = true

  onRealtimeEvent('rechargeComplete', (data: any) => {
    const { fetchStatus } = useRpg()
    void fetchStatus()
    visible.value = false
    const diamonds = data?.diamonds ?? 0
    if (diamonds > 0) {
      uni.showToast({
        title: `充值成功 +${diamonds} 钻`,
        icon: 'success',
      })
    }
  })
}

export function useRpgRecharge() {
  const { playSfx } = useRpgAudio()

  bindRechargeListener()

  const openRechargeModal = () => {
    visible.value = true
    playSfx('uiClick')
  }

  const closeRechargeModal = () => {
    visible.value = false
  }

  return {
    visible,
    openRechargeModal,
    closeRechargeModal,
    openDynamicRechargeModal: openRechargeModal,
  }
}
