import { YStack, Text, Button } from 'tamagui'

interface ProfileProps {
  email?: string;
  name?: string;
  tempAdminMode?: boolean;
  onTempAdminToggle?: () => void;
}

export const Profile = ({ email, name, tempAdminMode, onTempAdminToggle }: ProfileProps) => {
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

        {/* Temp Admin Toggle */}
        <YStack 
          marginTop="$4" 
          borderTopWidth={1} 
          borderTopColor="$borderColor" 
          paddingTop="$4"
        >
          <Button
            backgroundColor={tempAdminMode ? '#22c55e' : '$background'}
            borderColor="$color"
            borderWidth={1}
            padding="$2"
            onPress={onTempAdminToggle}
          >
            <Text color="$color" fontSize="$2">
              {tempAdminMode ? 'Disable' : 'Enable'} Temp Admin
            </Text>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  )
} 