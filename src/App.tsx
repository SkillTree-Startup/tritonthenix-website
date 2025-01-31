import { TamaguiProvider, Theme, XStack, YStack, Image, Button, Text } from 'tamagui'
import config from './tamagui.config'
import { useEffect, useState } from 'react'
import logoSvg from './assets/logo.svg'

// Whitelist of emails with special privileges
const WHITELISTED_EMAILS = [
  'example@ucsd.edu',
  'admin@tritonthenix.com',
  // Add more emails here
  'cskeoch@ucsd.edu',
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

  const renderUserContent = () => {
    if (!userData) return null;

    return (
      <YStack space={16} alignItems="center">
        <Text color="black">Signed in as {userData.email}</Text>
        {userData.isAdmin && (
          <Text 
            color="green" 
            fontSize={16} 
            fontWeight="bold"
          >
            Admin Access Granted
          </Text>
        )}
        <Button
          backgroundColor="white"
          borderColor="#e2e8f0"
          borderWidth={1}
          padding={16}
          onPress={handleSignOut}
        >
          <Text>Sign Out</Text>
        </Button>
      </YStack>
    );
  };

  return (
    <TamaguiProvider config={config}>
      <Theme name="light">
        <YStack backgroundColor="#FFFFFF" minHeight="100vh">
          {/* Gradient Overlay */}
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            height={200}
            backgroundColor="transparent"
            backgroundImage="linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)"
          />

          {/* Header */}
          <XStack 
            padding={16} 
            justifyContent="space-between" 
            alignItems="center"
            position="relative"
            zIndex={1}
          >
            <Image
              source={logoSvg}
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
            padding={16}
            position="relative"
            zIndex={1}
            space={16}
          >
            {isSignedIn ? renderUserContent() : (
              <div id="googleSignInDiv"></div>
            )}
          </YStack>
        </YStack>
      </Theme>
    </TamaguiProvider>
  )
}

export default App