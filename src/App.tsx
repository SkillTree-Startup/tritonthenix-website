import { TamaguiProvider, Theme, XStack, YStack, Image, Button, Text } from 'tamagui'
import config from './tamagui.config'
import { useEffect, useState } from 'react'
import logoSvg from './assets/logo.svg'
import { ImageSourcePropType } from 'react-native'

// Convert SVG import to proper Image source type
const logoSource = logoSvg as unknown as ImageSourcePropType

// Whitelist of emails with special privileges
const WHITELISTED_EMAILS = [
  'example@ucsd.edu',
  'admin@tritonthenix.com',
  // Add more emails here
  'cskeoch@ucsd.edu',
  'jweston@ucsd.edu',
  'r1wan@ucsd.edu',
];

// Type for user data
interface UserData {
  email: string;
  isAdmin: boolean;
}

// Declare global google type
declare global {
  interface Window {
    google: any;
  }
}

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    // Initialize Google Sign-In
    window.google?.accounts.id.initialize({
      client_id: "427440820094-2g565030h0k2t080koick8ntbm54m10n.apps.googleusercontent.com",
      callback: handleCredentialResponse
    });

    // Render the button
    if (!isSignedIn) {
      window.google?.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large" }
      );
    }
  }, [isSignedIn]);

  const handleCredentialResponse = (response: any) => {
    // Decode the JWT token
    const decodedToken = JSON.parse(atob(response.credential.split('.')[1]));
    const email = decodedToken.email;
    const isAdmin = WHITELISTED_EMAILS.includes(email);
    
    setUserData({
      email,
      isAdmin
    });
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    window.google?.accounts.id.disableAutoSelect();
    setIsSignedIn(false);
    setUserData(null);
  };

  return (
    <TamaguiProvider config={config}>
      <Theme name="light">
        <YStack backgroundColor="$background" minHeight={800}>
          {/* Gradient Overlay */}
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            height={200}
            backgroundColor="$background"
            opacity={0.8}
          />

          {/* Header */}
          <XStack 
            padding="$4" 
            justifyContent="space-between" 
            alignItems="center"
            position="relative"
            zIndex={1}
          >
            <Image
              source={logoSource}
              alt="Triton Phenix Logo"
              width={150}
              height={40}
              resizeMode="contain"
            />
          </XStack>

          {/* Content */}
          <YStack 
            flex={1} 
            justifyContent="center" 
            alignItems="center"
            padding="$4"
            position="relative"
            zIndex={1}
            space="$4"
          >
            {isSignedIn ? (
              <YStack space="$4" alignItems="center">
                <Text color="$color">Signed in as {userData?.email}</Text>
                {userData?.isAdmin && (
                  <Text 
                    color="$color"
                    fontSize="$4" 
                    fontWeight="bold"
                    style={{ color: '#22c55e' }}
                  >
                    You have admin access
                  </Text>
                )}
                <Button
                  backgroundColor="$background"
                  borderColor="$color"
                  borderWidth={1}
                  padding="$4"
                  onPress={handleSignOut}
                >
                  <Text>Sign Out</Text>
                </Button>
              </YStack>
            ) : (
              <div id="googleSignInDiv"></div>
            )}
          </YStack>
        </YStack>
      </Theme>
    </TamaguiProvider>
  )
}

export default App