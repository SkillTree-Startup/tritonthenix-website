import { XStack } from 'tamagui'

interface GoogleSignInProps {
  id: string
  scale?: number
  mobile?: boolean
}

export const GoogleSignIn = ({ id, scale = 1, mobile = false }: GoogleSignInProps) => {
  return (
    <XStack
      style={{
        backgroundColor: 'transparent',
        borderRadius: '20px',
        overflow: 'hidden',
      }}
      $gtMd={{ transform: `scale(${scale})`, transformOrigin: 'right center' }}
      $md={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}
      display={mobile ? 'none' : 'flex'}
      $sm={{ display: mobile ? 'flex' : 'none' }}
    >
      <div 
        id={id}
        style={{
          backgroundColor: 'transparent',
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      />
    </XStack>
  )
} 