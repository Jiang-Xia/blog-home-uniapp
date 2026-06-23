<script lang="ts" setup>
export interface PlaceholderLink {
  label: string
  route: string
}

const props = withDefaults(defineProps<{
  title: string
  phaseLabel?: string
  links?: PlaceholderLink[]
}>(), {
  phaseLabel: 'Phase 1 脚手架',
  links: () => [],
})

function navigate(route: string) {
  uni.navigateTo({ url: route })
}
</script>

<template>
  <view class="placeholder cyber-page-grid u-page-body py-8">
    <view class="text-center text-lg text-tech font-medium">
      {{ props.title }}
    </view>
    <view class="mt-2 text-center text-sm text-tech-muted">
      {{ props.phaseLabel }} · 功能开发中
    </view>
    <view v-if="props.links.length" class="u-stack-3 mt-8 flex flex-col">
      <cyber-button
        v-for="item in props.links"
        :key="item.route"
        variant="secondary"
        class="w-full text-center"
        @click="navigate(item.route)"
      >
        {{ item.label }}
      </cyber-button>
    </view>
  </view>
</template>
