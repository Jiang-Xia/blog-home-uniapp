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
  <view class="placeholder px-4 py-8">
    <view class="text-center text-lg text-gray-800 font-medium">
      {{ props.title }}
    </view>
    <view class="mt-2 text-center text-sm text-gray-500">
      {{ props.phaseLabel }} · 功能开发中
    </view>
    <view v-if="props.links.length" class="mt-8 flex flex-col gap-3">
      <button
        v-for="item in props.links"
        :key="item.route"
        type="default"
        class="w-full"
        @click="navigate(item.route)"
      >
        {{ item.label }}
      </button>
    </view>
  </view>
</template>
