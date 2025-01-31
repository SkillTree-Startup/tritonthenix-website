import { createTamagui } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { tokens } from '@tamagui/themes'

const config = createTamagui({
  defaultTheme: 'light',
  themes: {
    light: {
      background: '#FFFFFF',
      color: '#000000',
    },
  },
  tokens,
  shorthands,
  settings: {
    allowedStyleValues: 'strict'
  }
})

export type AppConfig = typeof config
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config