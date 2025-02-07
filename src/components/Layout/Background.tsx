import { YStack } from 'tamagui'

interface BackgroundProps {
  theme: 'light' | 'dark'
}

export const Background = ({ theme }: BackgroundProps) => {
  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={1}
      opacity={0.6}
      backgroundColor={theme === 'light' ? '$background' : '$background'}
    />
  )
}