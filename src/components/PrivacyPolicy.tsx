import { YStack, Text, ScrollView } from 'tamagui'

export const PrivacyPolicy = () => {
  return (
    <YStack 
      height="90vh"  // Fixed height
      width="100%" 
      alignItems="center"
      marginTop="$4"
    >
      {/* Title stays fixed */}
      <Text 
        fontSize="$10" 
        fontWeight="bold" 
        color="white"
        textAlign="center"
        marginBottom="$4"
        style={{
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          animation: 'fadeIn 1s ease-in'
        }}
      >
        Privacy Policy
      </Text>

      {/* Scrollable content */}
      <ScrollView 
        height="100%"
        width="100%"
        maxWidth={1000}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <YStack 
          padding="$6" 
          space="$6" 
          alignItems="center"
          width="100%"
        >
          <Text 
            color="white" 
            fontSize="$4"
            textAlign="center"
            opacity={0.9}
          >
            Last updated: {new Date().toLocaleDateString()}
          </Text>

          <YStack space="$6" alignItems="center">
            <Text 
              color="white" 
              fontSize="$5" 
              textAlign="center"
              opacity={0.9}
              maxWidth={800}
              lineHeight={32}
            >
              At TritonThenix, we take your privacy seriously. This policy describes what personal information we collect and how we use it.
            </Text>

            <YStack space="$6" alignItems="center" width="100%">
              <Text 
                fontWeight="bold" 
                color="white" 
                fontSize="$6"
                textAlign="center"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              >
                Information We Collect
              </Text>
              <Text 
                color="white" 
                fontSize="$5" 
                textAlign="center"
                opacity={0.9}
                maxWidth={800}
                lineHeight={32}
              >
                We only collect and store:
                • Your name (as provided by Google Sign-In)
                • Your email address (as provided by Google Sign-In)
              </Text>

              <Text 
                fontWeight="bold" 
                color="white" 
                fontSize="$6"
                textAlign="center"
                marginTop="$4"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              >
                How We Use Your Information
              </Text>
              <Text 
                color="white" 
                fontSize="$5" 
                textAlign="center"
                opacity={0.9}
                maxWidth={800}
                lineHeight={32}
              >
                We use this information solely for:
                • Account identification
                • Administrative access control
                • Essential communications about workouts and events
              </Text>

              <Text 
                fontWeight="bold" 
                color="white" 
                fontSize="$6"
                textAlign="center"
                marginTop="$4"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              >
                Data Protection
              </Text>
              <Text 
                color="white" 
                fontSize="$5" 
                textAlign="center"
                opacity={0.9}
                maxWidth={800}
                lineHeight={32}
              >
                We do not share, sell, or distribute your personal information with any third parties. Your data is stored securely using Google Firebase services.
              </Text>

              <Text 
                fontWeight="bold" 
                color="white" 
                fontSize="$6"
                textAlign="center"
                marginTop="$4"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              >
                Contact
              </Text>
              <Text 
                color="white" 
                fontSize="$5" 
                textAlign="center"
                opacity={0.9}
                maxWidth={800}
                lineHeight={32}
              >
                If you have any questions about this Privacy Policy, please contact us at admin@tritonthenix.com
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
} 