import { YStack, Text, Button } from 'tamagui'

interface HomeProps {
  isSignedIn: boolean
  userData: { email: string; isAdmin: boolean } | null
  handleSignOut: () => void
}

export const Home = ({ isSignedIn, userData, handleSignOut }: HomeProps) => (
  <YStack 
    flex={1} 
    justifyContent="center" 
    alignItems="center"
    width="100%"
    backgroundColor="white"
  >
    {isSignedIn ? (
      <>
        <Text color="black">Signed in as {userData?.email}</Text>
        {userData?.isAdmin && (
          <Text 
            color="black"
            fontSize="$4" 
            fontWeight="bold"
            style={{ color: '#22c55e' }}
          >
            You have admin access
          </Text>
        )}
        <Button
          backgroundColor="white"
          borderColor="black"
          borderWidth={1}
          padding="$4"
          onPress={handleSignOut}
        >
          <Text color="black">Sign Out</Text>
        </Button>
      </>
    ) : (
      <YStack 
        justifyContent="center" 
        alignItems="center"
        padding="$4"
      >
        <div id="googleSignInDiv"></div>
      </YStack>
    )}
  </YStack>
) 