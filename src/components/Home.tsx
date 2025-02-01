import { YStack, Text } from 'tamagui'

const Home = () => {
  return (
    <YStack 
      padding="$6" 
      paddingTop="15%" 
      position="relative"
      zIndex={2}
      alignItems="center"
      width="100%"
    >
      {/* Title with Open Sans */}
      <Text
        color="white"
        fontSize={120}
        fontWeight="300"
        lineHeight={110}
        textAlign="center"
        opacity={0.95}
        style={{
          fontFamily: 'Open Sans, sans-serif',
          letterSpacing: '3px',
          textShadow: `
            0 0 10px rgba(255,255,255,0.3),
            0 0 20px rgba(255,255,255,0.2),
            0 0 30px rgba(255,255,255,0.1)
          `,
          animation: 'fadeIn 2s ease-in'
        }}
      >
        TritonThenix
      </Text>

      <YStack 
        maxWidth={500}
        marginTop="$12"
        alignItems="center"
        style={{
          animation: 'fadeInUp 1.5s ease-out 0.5s both'
        }}
      >
        <Text
          color="white"
          fontSize="$5"
          opacity={0.9}
          lineHeight={32}
          textAlign="center"
          style={{
            fontFamily: 'Open Sans, sans-serif',
            fontWeight: '300',
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Welcome to the TritonThenix Family. Join our community of fitness enthusiasts and transform your journey.
        </Text>
      </YStack>
    </YStack>
  )
}

export default Home; 