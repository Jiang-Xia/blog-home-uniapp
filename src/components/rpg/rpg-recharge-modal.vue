<script lang="ts" setup>
/**
 * RPG 钻石充值弹窗（H5 跳转 / 小程序订单提示）
 */
import { createRpgRechargeOrder } from '@/api/rpg-recharge'
import { useRpgRecharge } from '@/composables/use-rpg-recharge'

const { visible, closeRechargeModal } = useRpgRecharge()
const amount = ref('10')
const submitting = ref(false)

async function submit() {
  const yuan = Number(amount.value)
  if (!yuan || yuan <= 0) {
    uni.showToast({ title: '请输入有效金额', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const order = await createRpgRechargeOrder(yuan)
    // #ifdef H5
    if (order.universalLink)
      window.open(order.universalLink, '_blank')
    // #endif
    // #ifdef MP-WEIXIN
    uni.showModal({
      title: '充值订单已创建',
      content: `订单号 ${order.outTradeNo}，支付完成后钻石将自动到账`,
      showCancel: false,
    })
    // #endif
    closeRechargeModal()
  }
  catch (e: any) {
    uni.showToast({ title: e?.message || '创建订单失败', icon: 'none' })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <view v-if="visible" class="recharge-overlay u-overlay fixed inset-0 z-50 flex items-center justify-center" @click="closeRechargeModal">
    <cyber-card class="recharge-modal cyber-card-pad-xl" @click.stop>
      <text class="block text-lg text-tech font-bold">充值钻石</text>
      <text class="mt-2 block text-sm text-tech-muted">输入充值金额（元），支付成功后钻石自动到账</text>
      <wd-input v-model="amount" type="number" label="金额(元)" class="mt-4" />
      <view class="u-gap-2 mt-4 flex">
        <view class="flex-1">
          <wd-button block :loading="submitting" @click="submit">
            确认充值
          </wd-button>
        </view>
        <view class="flex-1">
          <wd-button block type="info" @click="closeRechargeModal">
            取消
          </wd-button>
        </view>
      </view>
    </cyber-card>
  </view>
</template>

<style scoped>
.recharge-overlay {
  position: fixed;
  background: rgba(0, 0, 0, 0.6);
}
.recharge-modal {
  width: 85%;
  max-width: 360px;
}
</style>
