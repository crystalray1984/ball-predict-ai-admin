<script setup lang="tsx">
import { useSlots } from 'vue'
import { NScrollbar } from 'naive-ui'

defineProps({
    useContentScroller: {
        type: Boolean,
        default: true,
    },
})

const slots = useSlots()
</script>
<template>
    <div class="page-grid">
        <div v-if="slots.header" class="page-grid-header">
            <slot name="header"></slot>
        </div>
        <div class="page-grid-content">
            <NScrollbar v-if="useContentScroller">
                <slot></slot>
            </NScrollbar>
            <slot v-else></slot>
        </div>
        <div v-if="slots.footer" class="page-grid-footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>
<style lang="less" scoped>
.page-grid {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
}

.page-grid-content {
    position: relative;
    flex: 1;
}

.page-grid-header {
    padding: 12px;
    flex-shrink: 0;
}

.page-grid-footer {
    padding: 12px;
    flex-shrink: 0;
}
</style>
