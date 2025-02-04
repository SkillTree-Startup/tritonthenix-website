import { YStack, Text, useTheme, Theme } from 'tamagui'

const Home = () => {
  const theme = useTheme()
  const isDark = theme.name?.toString() === 'dark'

  return (
    <YStack 
      padding="$6" 
      paddingTop="15%" 
      position="relative"
      zIndex={2}
      alignItems="center"
      width="100%"
      $xs={{ padding: "$2", paddingTop: "20%" }}
      $sm={{ padding: "$4", paddingTop: "25%" }}
      $md={{ padding: "$5", paddingTop: "20%" }}
    >
      {/* Title with Open Sans */}
      <Text
        color="$color"
        fontSize={120}
        fontWeight="300"
        lineHeight={110}
        textAlign="center"
        opacity={0.95}
        $xs={{ fontSize: 28, lineHeight: 32, letterSpacing: '1.5px', marginBottom: '$2' }}
        $sm={{ fontSize: 36, lineHeight: 40, letterSpacing: '2px', marginBottom: '$3' }}
        $md={{ fontSize: 48, lineHeight: 52, letterSpacing: '2.5px', marginBottom: '$4' }}
        $lg={{ fontSize: 72, lineHeight: 80, letterSpacing: '3px' }}
        $xl={{ fontSize: 96, lineHeight: 100, letterSpacing: '3px' }}
        style={{
          fontFamily: 'Open Sans, sans-serif',
          textShadow: isDark ? `
            0 0 10px rgba(255,255,255,0.3),
            0 0 20px rgba(255,255,255,0.2),
            0 0 30px rgba(255,255,255,0.1)
          ` : 'none',
          animation: 'fadeIn 2s ease-in'
        }}
      >
        TritonThenix
      </Text>

      <YStack 
        maxWidth={500}
        marginTop="$8"
        alignItems="center"
        $xs={{ marginTop: "$2", padding: "$2" }}
        $sm={{ marginTop: "$4", padding: "$3" }}
        $md={{ marginTop: "$6", padding: "$4" }}
        style={{ animation: 'fadeInUp 1.5s ease-out 0.5s both' }}
      >
        <Text
          color="$color"
          fontSize="$5"
          opacity={0.9}
          lineHeight={32}
          textAlign="center"
          $xs={{ fontSize: "$1", lineHeight: 18, letterSpacing: '0.2px' }}
          $sm={{ fontSize: "$2", lineHeight: 22, letterSpacing: '0.3px' }}
          $md={{ fontSize: "$3", lineHeight: 26, letterSpacing: '0.4px' }}
          $lg={{ fontSize: "$4", lineHeight: 30 }}
          $xl={{ fontSize: "$5", lineHeight: 32 }}
          style={{
            fontFamily: 'Open Sans, sans-serif',
            fontWeight: '300',
            letterSpacing: '0.5px',
            textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          Welcome to the TritonThenix Family. Join our community of fitness enthusiasts and transform your journey.
        </Text>
      </YStack>
    </YStack>
  )
}

export default Home; 