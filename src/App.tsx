import { TamaguiProvider, Theme, XStack, YStack, Image, Button, Text, Stack } from 'tamagui'
import config from './tamagui.config'
import { useEffect, useState } from 'react'
import logoSvg from './assets/logo.svg'
import { AdminPanel } from './components/AdminPanel'
import { PrivacyPolicy } from './components/PrivacyPolicy'

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activePage, setActivePage] = useState<string>(() => {
    // Get initial page from URL path
    const path = window.location.pathname
    if (path === '/privacy') return 'privacy'
    if (path === '/admin') return 'admin'
    return 'home'
  })

  useEffect(() => {
    window.google?.accounts.id.initialize({
      // Use the client ID from your Firebase project
      client_id: "427440820094-2g565030h0k2t080koick8ntbm54m10n.apps.googleusercontent.com",
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });

    if (!isSignedIn) {
      window.google?.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        {
          type: "standard",
          theme: "filled_blue",
          size: "large",
          shape: "pill",
          text: "signin_with",
          width: 250,
          locale: "en"
        }
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

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogoClick = () => {
    handleNavigate('home')
  }

  const handleNavigate = (page: string) => {
    setActivePage(page)
    // Update URL without reload
    window.history.pushState({}, '', page === 'home' ? '/' : `/${page}`)
  }

  const MenuItem = ({ label, page }: { label: string, page: string }) => (
    <Button
      backgroundColor="transparent"
      padding="$4"
      onPress={() => {
        handleNavigate(page)
        setIsMenuOpen(false)
      }}
      width="100%"
      justifyContent="flex-start"
      hoverStyle={{ backgroundColor: '$gray4' }}
    >
      <Text color="$color">{label}</Text>
    </Button>
  )

  return (
    <TamaguiProvider config={config}>
      <Theme name="light">
        <YStack backgroundColor="$background" minHeight={800}>
          {/* Gradient Overlay - Updated */}
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            height={200}
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
            }}
          />

          {/* Header with Hamburger */}
          <XStack 
            padding="$4" 
            justifyContent="space-between" 
            alignItems="center"
            position="relative"
            zIndex={2}
          >
            <Button
              backgroundColor="transparent"
              padding={0}
              onPress={handleLogoClick}
              aria-label="Go to home"
            >
              <Image
                source={{ uri: logoSvg }}
                alt="Triton Phenix Logo"
                width={150}
                height={40}
                resizeMode="contain"
              />
            </Button>

            {/* Hamburger Menu Button */}
            <Button
              backgroundColor="transparent"
              padding="$2"
              onPress={handleMenuToggle}
              aria-label="Menu"
            >
              <YStack space="$1.5">
                <Stack height={2} width={24} backgroundColor="white" />
                <Stack height={2} width={24} backgroundColor="white" />
                <Stack height={2} width={24} backgroundColor="white" />
              </YStack>
            </Button>
          </XStack>

          {/* Menu Overlay */}
          {isMenuOpen && (
            <YStack
              position="absolute"
              right={0}
              top={70}
              width={250}
              backgroundColor="$background"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$borderColor"
              elevation={10}
              padding="$2"
              zIndex={3}
              space="$1"
            >
              <MenuItem label="Workouts" page="workouts" />
              <MenuItem label="Events" page="events" />
              <MenuItem label="Profile" page="profile" />
              {userData?.isAdmin && (
                <MenuItem label="Admin Panel" page="admin" />
              )}
              <MenuItem label="Privacy Policy" page="privacy" />
            </YStack>
          )}

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
            {activePage === 'privacy' ? (
              <PrivacyPolicy />
            ) : activePage === 'admin' ? (
              <AdminPanel />
            ) : (
              isSignedIn ? (
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
              )
            )}
          </YStack>
        </YStack>
      </Theme>
    </TamaguiProvider>
  )
}

export default App