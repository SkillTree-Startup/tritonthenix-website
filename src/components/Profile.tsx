import { YStack, Text } from 'tamagui'

interface ProfileProps {
  email?: string;
  name?: string;
}

export const Profile = ({ email, name }: ProfileProps) => {
  return (
    <YStack 
      padding="$6" 
      space="$4" 
      maxWidth={800} 
      width="100%" 
      margin="auto"
    >
      <Text 
        fontSize="$8" 
        fontWeight="bold" 
        color="$textPrimary"
      >
        Profile
      </Text>

      <YStack 
        backgroundColor="$cardBackground"
        padding="$4"
        borderRadius="$4"
        space="$4"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <YStack space="$2">
          <Text fontSize="$3" color="$textSecondary">Email</Text>
          <Text fontSize="$4" color="$textPrimary">{email || 'Not signed in'}</Text>
        </YStack>

        <YStack space="$2">
          <Text fontSize="$3" color="$textSecondary">Name</Text>
          <Text fontSize="$4" color="$textPrimary">{name || 'Not available'}</Text>
        </YStack>
      </YStack>
    </YStack>
  )
} 