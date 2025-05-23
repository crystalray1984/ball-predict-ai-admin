<script setup lang="ts">
import { RouterView } from 'vue-router'
import {
    NConfigProvider,
    NMessageProvider,
    NModalProvider,
    dateZhCN,
    zhCN,
    darkTheme,
    NDialogProvider,
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
                fontSize: '12px',
                fontSizeSmall: '12px',
            },
            Form: {
                labelFontSizeLeftMedium: '12px',
                labelFontSizeTopMedium: '12px',
            },
            Input: {
                fontSizeMedium: '12px',
                fontSizeSmall: '12px',
            },
            DataTable: {
                fontSizeSmall: '12px',
            },
            Button: {
                fontSizeSmall: '12px',
            },
            Card: {
                titleFontSizeSmall: '14px',
            },
            Select: {
                fontSizeSmall: '12px',
                InternalSelectMenu: {
                    optionFontSizeSmall: '12px',
                    optionFontSizeMedium: '12px',
                },

                InternalSelection: {
                    fontSizeSmall: '12px',
                    fontSizeMedium: '12px',
                },
            },
        }"
    >
        <NMessageProvider>
            <NModalProvider>
                <NDialogProvider>
                    <RouterView />
                </NDialogProvider>
            </NModalProvider>
        </NMessageProvider>
    </NConfigProvider>
</template>
