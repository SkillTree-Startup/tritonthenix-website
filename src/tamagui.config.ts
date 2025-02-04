import { createTamagui } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { tokens, themes } from '@tamagui/themes'

const config = createTamagui({
  defaultTheme: 'dark',
  themes: {
    light: {
      ...themes.light,
      background: '#FFFFFF',
      color: '#000000',
      borderColor: '#e2e8f0',
      green10: '#22c55e',
      textPrimary: '#000000',
      textSecondary: '#4A5568',
      cardBackground: '#FFFFFF',
      headerBackground: 'rgba(255,255,255,0.9)',
    },
    dark: {
      ...themes.dark,
      background: '#000000',
      color: '#FFFFFF',
      borderColor: '#2d3748',
      green10: '#22c55e',
      textPrimary: '#FFFFFF',
      textSecondary: '#A0AEC0',
      cardBackground: '#1A202C',
      headerBackground: 'rgba(0,0,0,0.9)',
    }
  },
  tokens,
  shorthands,
  media: {
    xs: { maxWidth: 480 },
    sm: { maxWidth: 767 },
    md: { maxWidth: 1023 },
    lg: { maxWidth: 1279 },
    xl: { minWidth: 1280 },
    gtXs: { minWidth: 481 },
    gtSm: { minWidth: 768 },
    gtMd: { minWidth: 1024 },
    gtLg: { minWidth: 1280 },
    portrait: { orientation: 'portrait' },
    landscape: { orientation: 'landscape' }
  }
})

export type AppConfig = typeof config
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config