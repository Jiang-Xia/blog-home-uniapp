/**
 * RPG 钻石充值弹窗状态（全站共享）
 */
import { ref } from 'vue'
import { useRpgAudio } from '@/composables/use-rpg-audio'

const visible = ref(false)

export function useRpgRecharge() {
  const { playSfx } = useRpgAudio()

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
