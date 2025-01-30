import { createTamagui } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens } from '@tamagui/themes'

const config = createTamagui({
  themes,
  tokens,
  shorthands,
  defaultFont: 'body',
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config 