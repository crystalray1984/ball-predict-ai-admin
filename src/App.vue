<script setup lang="ts">
import { RouterView } from 'vue-router'
import {
    NConfigProvider,
    NMessageProvider,
    NModalProvider,
    dateZhCN,
    zhCN,
    darkTheme,
} from 'naive-ui'
</script>

<template>
    <NConfigProvider
        :abstract="true"
        :locale="zhCN"
        :dateLocale="dateZhCN"
        :inlineThemeDisabled="true"
        :theme="darkTheme"
        :themeOverrides="{
            common: {
                fontSizeMedium: '12px',
            },
            Form: {
                labelFontSizeLeftMedium: '12px',
                labelFontSizeTopMedium: '12px',
            },
            Input: {
                fontSizeMedium: '12px',
            },
            DataTable: {
                fontSizeSmall: '12px',
            },
            Button: {
                fontSizeSmall: '12px',
            },
        }"
    >
        <NMessageProvider>
            <NModalProvider>
                <RouterView />
            </NModalProvider>
        </NMessageProvider>
    </NConfigProvider>
</template>
