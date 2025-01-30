import { createTamagui } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens } from '@tamagui/themes'

const config = createTamagui({
  themes,
  tokens,
  shorthands
})

export type AppConfig = typeof config
export default config