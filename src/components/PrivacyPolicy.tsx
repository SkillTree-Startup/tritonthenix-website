import { YStack, Text } from 'tamagui'

export const PrivacyPolicy = () => {
  return (
    <YStack padding="$4" space="$4" maxWidth={800}>
      <Text fontSize="$8" fontWeight="bold" color="$color">
        Privacy Policy
      </Text>
      
      <Text color="$color">
        Last updated: {new Date().toLocaleDateString()}
      </Text>

      <YStack space="$3">
        <Text color="$color">
          At TritonThenix, we take your privacy seriously. This policy describes what personal information we collect and how we use it.
        </Text>

        <Text fontWeight="bold" color="$color" marginTop="$4">
          Information We Collect
        </Text>
        <Text color="$color">
          We only collect and store:
          • Your name (as provided by Google Sign-In)
          • Your email address (as provided by Google Sign-In)
        </Text>

        <Text fontWeight="bold" color="$color" marginTop="$4">
          How We Use Your Information
        </Text>
        <Text color="$color">
          We use this information solely for:
          • Account identification
          • Administrative access control
          • Essential communications about workouts and events
        </Text>

        <Text fontWeight="bold" color="$color" marginTop="$4">
          Data Protection
        </Text>
        <Text color="$color">
          We do not share, sell, or distribute your personal information with any third parties. Your data is stored securely using Google Firebase services.
        </Text>

        <Text fontWeight="bold" color="$color" marginTop="$4">
          Contact
        </Text>
        <Text color="$color">
          If you have any questions about this Privacy Policy, please contact us at admin@tritonthenix.com
        </Text>
      </YStack>
    </YStack>
  )
} 