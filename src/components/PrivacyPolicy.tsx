import { YStack, Text, ScrollView } from 'tamagui'

export const PrivacyPolicy = () => {
  return (
    <YStack 
      height="90vh"
      width="100%" 
      alignItems="center"
      marginTop="$2"
    >
      <YStack padding="$2" space="$2" width="100%" alignItems="center">
        <YStack space="$2" maxWidth={800} width="100%">
          <Text 
            fontSize="$8" 
            fontWeight="bold" 
            color="$textPrimary"
            textAlign="center"
            width="100%"
          >
            Privacy Policy
          </Text>

          <ScrollView 
            height="100%"
            width="100%"
            maxWidth={1000}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <YStack 
              padding="$4" 
              space="$4" 
              alignItems="center"
              width="100%"
            >
              <Text 
                color="white" 
                fontSize="$3"
                textAlign="center"
                opacity={0.9}
              >
                Last updated: {new Date().toLocaleDateString()}
              </Text>

              <YStack space="$4" alignItems="center">
                <Text 
                  color="white" 
                  fontSize="$4" 
                  textAlign="center"
                  opacity={0.9}
                  maxWidth={800}
                  lineHeight={24}
                >
                  At TritonThenix, we take your privacy seriously. This policy describes what personal information we collect and how we use it.
                </Text>

                <YStack space="$4" alignItems="center" width="100%">
                  <Text 
                    fontWeight="bold" 
                    color="white" 
                    fontSize="$5"
                    textAlign="center"
                  >
                    Information We Collect
                  </Text>
                  <Text 
                    color="white" 
                    fontSize="$4" 
                    textAlign="center"
                    opacity={0.9}
                    maxWidth={800}
                    lineHeight={24}
                  >
                    We only collect and store:
                    • Your name (as provided by Google Sign-In)
                    • Your email address (as provided by Google Sign-In)
                  </Text>

                  <Text 
                    fontWeight="bold" 
                    color="white" 
                    fontSize="$5"
                    textAlign="center"
                    marginTop="$2"
                  >
                    How We Use Your Information
                  </Text>
                  <Text 
                    color="white" 
                    fontSize="$4" 
                    textAlign="center"
                    opacity={0.9}
                    maxWidth={800}
                    lineHeight={24}
                  >
                    We use this information solely for:
                    • Account identification
                    • Administrative access control
                    • Essential communications about workouts and events
                  </Text>

                  <Text 
                    fontWeight="bold" 
                    color="white" 
                    fontSize="$5"
                    textAlign="center"
                    marginTop="$2"
                  >
                    Data Protection
                  </Text>
                  <Text 
                    color="white" 
                    fontSize="$4" 
                    textAlign="center"
                    opacity={0.9}
                    maxWidth={800}
                    lineHeight={24}
                  >
                    We do not share, sell, or distribute your personal information with any third parties. Your data is stored securely using Google Firebase services.
                  </Text>

                  <Text 
                    fontWeight="bold" 
                    color="white" 
                    fontSize="$5"
                    textAlign="center"
                    marginTop="$2"
                  >
                    Contact
                  </Text>
                  <Text 
                    color="white" 
                    fontSize="$4" 
                    textAlign="center"
                    opacity={0.9}
                    maxWidth={800}
                    lineHeight={24}
                  >
                    If you have any questions about this Privacy Policy, please contact us at admin@tritonthenix.com
                  </Text>
                </YStack>
              </YStack>
            </YStack>
          </ScrollView>
        </YStack>
      </YStack>
    </YStack>
  )
} 