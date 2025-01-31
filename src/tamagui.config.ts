import { createTamagui } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { tokens, themes } from '@tamagui/themes'

const config = createTamagui({
  defaultTheme: 'light',
  themes: {
    light: {
      ...themes.light,
      background: '#FFFFFF',
      color: '#000000',
      borderColor: '#e2e8f0',
      green10: '#22c55e'
    },
    dark: {
      ...themes.dark,
      background: '#000000',
      color: '#FFFFFF',
      borderColor: '#2d3748',
      green10: '#22c55e'
    }
  },
  tokens,
  shorthands,
  media: {
    sm: { maxWidth: 860 },
    gtSm: { minWidth: 860 + 1 },
  }
})

export type AppConfig = typeof config
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config