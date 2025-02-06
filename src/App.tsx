import { TamaguiProvider, Theme, XStack, YStack, Image, Button, Text, Stack } from 'tamagui'
import config from './tamagui.config'
import { useEffect, useState } from 'react'
import logoSvg from './assets/logo.svg'
import backgroundImage from './assets/image.png'
import { useLocation, useNavigate } from 'react-router-dom'
import AppRoutes from './components/Routes'
import { Moon, Sun } from '@tamagui/lucide-icons'
import { jwtDecode } from 'jwt-decode'
import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

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
  name: string;
  isAdmin: boolean;
  profilePicture?: string;
  createdAt?: Date;
  lastLogin: Date;
}

// Declare global google type
declare global {
  interface Window {
    google: any;
  }
}

// Update MenuItem interface
interface MenuItemProps {
  label: string;
  page?: string;
  onClick?: () => void;
}

// Add this constant for the test admin data
const TEST_ADMIN_DATA: UserData = {
  email: 'admin@tritonthenix.com',
  name: 'Test Admin',
  isAdmin: true,
  profilePicture: 'https://ui-avatars.com/api/?name=Test+Admin&background=0D8ABC&color=fff',
  lastLogin: new Date()
};

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [tempAdminMode, setTempAdminMode] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    if (!isSignedIn) {
      const initializeGoogleSignIn = () => {
        window.google?.accounts.id.initialize({
          client_id: "427440820094-2g565030h0k2t080koick8ntbm54m10n.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Try to render header button
        const headerButton = document.getElementById("googleSignInDiv");
        if (headerButton) {
          window.google?.accounts.id.renderButton(
            headerButton,
            {
              type: "standard",
              theme: "outline",
              size: "medium",
              shape: "pill",
              text: "signin_with",
              width: 200,
              locale: "en",
              logo_alignment: "center"
            }
          );
        }

        // Try to render profile button
        const profileButton = document.getElementById("googleSignInDivProfile");
        if (profileButton) {
          window.google?.accounts.id.renderButton(
            profileButton,
            {
              type: "standard",
              theme: "outline",
              size: "medium",
              shape: "pill",
              text: "signin_with",
              width: 200,
              locale: "en",
              logo_alignment: "center"
            }
          );
        }

        // Add initialization for the mobile profile button
        const profileButtonMobile = document.getElementById("googleSignInDivProfileMobile");
        if (profileButtonMobile) {
          window.google?.accounts.id.renderButton(
            profileButtonMobile,
            {
              type: "standard",
              theme: "outline",
              size: "medium",
              shape: "pill",
              text: "signin_with",
              width: 200,
              locale: "en",
              logo_alignment: "center"
            }
          );
        }
      };

      // Initial attempt
      initializeGoogleSignIn();

      // Retry after a short delay to ensure DOM elements are ready
      const retryTimeout = setTimeout(initializeGoogleSignIn, 1000);

      return () => clearTimeout(retryTimeout);
    }
  }, [isSignedIn, location.pathname]);

  const handleCredentialResponse = async (response: any) => {
    try {
      const decoded: any = jwtDecode(response.credential)
      const userEmail = decoded.email
      const userName = decoded.name
      const picture = decoded.picture

      // Create userData object with all required fields
      const newUserData = {
        email: userEmail,
        name: userName,
        isAdmin: WHITELISTED_EMAILS.includes(userEmail),
        profilePicture: picture,
        lastLogin: new Date()
      } as UserData  // Use type assertion instead of including createdAt

      setUserData(newUserData)
      setIsSignedIn(true)

      // Update user document in Firestore
      const userRef = doc(db, 'users', userEmail)
      await setDoc(userRef, {
        ...newUserData,
        createdAt: new Date()  // Add createdAt only in Firestore
      }, { merge: true })
    } catch (error) {
      console.error('Error processing login:', error)
    }
  }

  const handleSignOut = () => {
    window.google?.accounts.id.disableAutoSelect();
    setIsSignedIn(false);
    setUserData(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleNavigate = (path: string) => {
    navigate(path.startsWith('/') ? path : `/${path}`);
    setIsMenuOpen(false);
  }

  // Helper function to check if link is active
  const isActiveRoute = (path: string) => {
    return location.pathname.includes(path);
  };

  // Update MenuItem component
  const MenuItem = ({ label, page, onClick }: MenuItemProps) => (
    <Button
      backgroundColor="transparent"
      padding="$4"
      onPress={() => {
        if (onClick) {
          onClick();
        } else if (page) {
          handleNavigate(page);
        }
        setIsMenuOpen(false);
      }}
      width="100%"
      justifyContent="flex-start"
      hoverStyle={{ backgroundColor: '$gray4' }}
    >
      <Text color="$color">{label}</Text>
    </Button>
  )

  // Add theme toggle handler
  const handleThemeToggle = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // Update the temp admin toggle handler
  const handleTempAdminToggle = () => {
    if (tempAdminMode) {
      // Reset to previous state
      setTempAdminMode(false);
      setIsSignedIn(false);
      setUserData(null);
    } else {
      // Switch to admin mode
      setTempAdminMode(true);
      setIsSignedIn(true);
      setUserData(TEST_ADMIN_DATA);
    }
  };

  // Update the isAdmin check in the header
  const isAdmin = tempAdminMode || WHITELISTED_EMAILS.includes(userData?.email || '');

  return (
    <TamaguiProvider config={config}>
      <Theme name={theme}>
        <YStack 
          backgroundColor="$background"  // Revert to using theme token
          minHeight="100vh"
          position="relative"
          width="100vw"
          overflow="hidden"
        >
          {/* Background Image - Only show in dark mode */}
          {theme === 'dark' && (
            <YStack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              overflow="hidden"
              width="100vw"
              height="100vh"
            >
              <Image
                source={{ uri: backgroundImage }}
                alt="Background"
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                style={{
                  width: '100vw',
                  height: '100vh',
                  objectFit: 'cover',
                  opacity: 0.7,
                }}
              />
              <YStack
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                backgroundColor="rgba(0,0,0,0.6)"
              />
            </YStack>
          )}

          {/* Navigation Bar - Always Black */}
          <XStack
            padding="$4"
            justifyContent="space-between"
            alignItems="center"
            position="relative"
            zIndex={2}
            backgroundColor="rgba(0,0,0,0.9)"
            height={70}
          >
            {/* Left side: Logo */}
            <Button
              backgroundColor="transparent"
              padding={0}
              pressStyle={{ backgroundColor: 'transparent' }}
              hoverStyle={{ backgroundColor: 'transparent' }}
              onPress={() => handleNavigate('')}
              aria-label="Go to home"
              className="logo-button"
            >
              <Image
                source={{ uri: logoSvg }}
                alt="TritonThenix Logo"
                width={150}
                height={40}
                resizeMode="contain"
              />
            </Button>

            {/* Center: Main Navigation - Only show on XL screens */}
            <XStack 
              space="$8" 
              alignItems="center"
              position="absolute"
              left="50%"
              style={{ transform: 'translateX(-50%)' }}
              display="none"
              $xl={{ display: 'flex' }}  // Only show on XL screens
            >
              <Button
                backgroundColor="transparent"
                padding="$2"
                pressStyle={{ backgroundColor: 'transparent' }}
                hoverStyle={{ backgroundColor: 'transparent' }}
                onPress={() => handleNavigate('schedule/workouts')}
                className={`nav-link ${isActiveRoute('workouts') ? 'active' : ''}`}
              >
                <Text 
                  color="white" 
                  fontSize="$3" 
                  className={`nav-text ${isActiveRoute('workouts') ? 'active' : ''}`}
                >
                  WORKOUTS
                </Text>
              </Button>
              <Button
                backgroundColor="transparent"
                padding="$2"
                pressStyle={{ backgroundColor: 'transparent' }}
                hoverStyle={{ backgroundColor: 'transparent' }}
                onPress={() => handleNavigate('schedule/events')}
                className={`nav-link ${isActiveRoute('events') ? 'active' : ''}`}
              >
                <Text 
                  color="white" 
                  fontSize="$3" 
                  className={`nav-text ${isActiveRoute('events') ? 'active' : ''}`}
                >
                  EVENTS
                </Text>
              </Button>
            </XStack>

            {/* Right side: Auth Buttons + Theme Toggle */}
            <XStack 
              space="$2" 
              alignItems="center"
              $sm={{ space: '$0' }} // Remove space on mobile
            >
              {/* Theme Toggle Button */}
              <Button
                backgroundColor="transparent"
                padding="$2"
                onPress={handleThemeToggle}
                aria-label="Toggle theme"
                hoverStyle={{ opacity: 0.8 }}
                $sm={{ padding: '$1' }} // Reduce padding on mobile
              >
                {theme === 'dark' ? (
                  <Sun size={24} color="white" />
                ) : (
                  <Moon size={24} color="white" />
                )}
              </Button>

              {!isSignedIn ? (
                <XStack 
                  space="$2" 
                  alignItems="center"
                  $sm={{ display: 'none' }}  // Hide on mobile
                >
                  <XStack
                    style={{
                      backgroundColor: 'transparent',
                      borderRadius: '20px',
                      overflow: 'hidden',
                    }}
                    $gtMd={{ transform: 'scale(1)', transformOrigin: 'right center' }}
                    $md={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}
                  >
                    <div id="googleSignInDiv"></div>
                  </XStack>
                </XStack>
              ) : (
                <Text color={theme === 'dark' ? 'white' : 'black'} marginRight="$2" fontSize="$3">
                  {userData?.email}
                </Text>
              )}

              {/* Hamburger Menu Button */}
              <Button
                backgroundColor="transparent"
                padding="$2"
                onPress={handleMenuToggle}
                aria-label="Menu"
                $sm={{ padding: '$1' }} // Reduce padding on mobile
              >
                <YStack space="$1.5">
                  <Stack height={2} width={24} backgroundColor="white" />
                  <Stack height={2} width={24} backgroundColor="white" />
                  <Stack height={2} width={24} backgroundColor="white" />
                </YStack>
              </Button>
            </XStack>
          </XStack>

          {/* Updated Menu Items */}
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
              $sm={{ width: '100%', right: 0 }}
            >
              {isSignedIn ? (
                <>
                  {/* Mobile Navigation Items */}
                  <YStack $xl={{ display: 'none' }}>
                    <MenuItem 
                      label="Workouts" 
                      onClick={() => handleNavigate('/schedule/workouts')} 
                    />
                    <MenuItem 
                      label="Events" 
                      onClick={() => handleNavigate('/schedule/events')} 
                    />
                    <MenuItem 
                      label="Profile"
                      page="profile" 
                    />
                  </YStack>

                  {/* Admin Panel (if admin) */}
                  {isAdmin && (
                    <MenuItem label="Admin Panel" page="/admin" />
                  )}
                  
                  <MenuItem label="Privacy Policy" page="privacy" />
                  
                  {/* Sign Out Button */}
                  <YStack 
                    borderTopWidth={1} 
                    borderTopColor="$borderColor"
                    marginTop="$2"
                    paddingTop="$2"
                  >
                    <MenuItem 
                      label="Sign Out" 
                      onClick={handleSignOut}
                    />
                  </YStack>
                </>
              ) : (
                <>
                  {/* Show Google Sign-In in menu only on mobile */}
                  <XStack 
                    display="none" 
                    $sm={{ display: 'flex' }}
                    justifyContent="center"
                    paddingVertical="$2"
                  >
                    <div 
                      id="googleSignInDivMobile"
                      style={{
                        backgroundColor: 'transparent',
                        borderRadius: '20px',
                        overflow: 'hidden'
                      }}
                    ></div>
                  </XStack>
                  
                  {/* Rest of the signed out menu items */}
                  <YStack $xl={{ display: 'none' }}>
                    <MenuItem 
                      label="Workouts" 
                      onClick={() => handleNavigate('/schedule/workouts')} 
                    />
                    <MenuItem 
                      label="Events" 
                      onClick={() => handleNavigate('/schedule/events')} 
                    />
                    <MenuItem label="Profile" page="profile" />
                  </YStack>
                  <MenuItem label="Privacy Policy" page="privacy" />
                </>
              )}
            </YStack>
          )}

          {/* Enhanced Raindrop Effect Container */}
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            overflow="hidden"
            zIndex={1}
          >
            {/* Generate more raindrops with enhanced visibility */}
            {[...Array(100)].map((_, i) => (
              <Stack
                key={i}
                position="absolute"
                backgroundColor="white"
                width={2}
                height={3}
                opacity={0.7}  // Increased opacity
                top={`${Math.random() * 100}%`}
                left={`${Math.random() * 100}%`}
                style={{
                  animation: `raindrop ${Math.random() * 2 + 1.5}s linear infinite`,  // Faster animation
                  animationDelay: `${Math.random() * 2}s`,
                  boxShadow: '0 0 8px rgba(255,255,255,0.8)',  // Enhanced glow
                  background: 'linear-gradient(transparent, rgba(255,255,255,0.8))',  // Gradient effect
                }}
              />
            ))}
          </YStack>

          {/* Add Routes after the header */}
          <YStack 
            flex={1} 
            width="100%" 
            position="relative" 
            zIndex={2}
            backgroundColor="transparent"
          >
            <AppRoutes 
              userEmail={userData?.email || ''} 
              userName={userData?.name}
              tempAdminMode={tempAdminMode}
              onTempAdminToggle={handleTempAdminToggle}
              userData={userData}
            />
          </YStack>

          {/* EST. SINCE 2022 Text */}
          <XStack
            position="absolute"
            bottom="$4"
            right="$6"
            zIndex={2}
            alignItems="center"
            space="$2"
          >
            <Stack
              width={1}
              height={40}
              backgroundColor="rgba(255,255,255,0.4)"
              marginRight="$3"
            />
            <YStack>
              <Text
                color="rgba(255,255,255,0.7)"
                fontSize={12}
                letterSpacing={2}
                fontFamily="Open Sans"
                style={{
                  textTransform: 'uppercase',
                  animation: 'fadeIn 2s ease-in',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Est.
              </Text>
              <Text
                color="rgba(255,255,255,0.9)"
                fontSize={24}
                fontWeight="300"
                letterSpacing={4}
                fontFamily="Open Sans"
                style={{
                  animation: 'fadeIn 2s ease-in',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                2022
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </Theme>

      {/* Updated animation styles */}
      <style>
        {`
          @keyframes raindrop {
            0% {
              transform: translateY(-100px) scale(1);
              opacity: 0;
            }
            10% {
              opacity: 0.7;
            }
            50% {
              opacity: 0.8;
              transform: translateY(400px) scale(1.2);  // Added scale effect
            }
            100% {
              transform: translateY(800px) scale(0.4);
              opacity: 0;
            }
          }

          /* Create a shimmering effect for raindrops */
          @keyframes shimmer {
            0% {
              box-shadow: 0 0 4px rgba(255,255,255,0.4);
            }
            50% {
              box-shadow: 0 0 12px rgba(255,255,255,0.8);
            }
            100% {
              box-shadow: 0 0 4px rgba(255,255,255,0.4);
            }
          }

          /* Add a trail effect */
          .raindrop::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 15px;
            background: linear-gradient(transparent, rgba(255,255,255,0.3));
            transform: translateY(-100%);
          }

          /* Existing animations remain the same */
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .text-hover {
            transition: all 0.3s ease;
          }
          .text-hover:hover {
            text-shadow: 0 0 15px rgba(255,255,255,0.5);
          }

          .nav-link {
            position: relative;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            perspective: 1000px;
            background: transparent !important;
          }

          .nav-text {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          /* Active state styling */
          .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 50%;
            width: 30px;
            height: 2px;
            background: white;
            transform: translateX(-50%);
            box-shadow: 0 0 10px rgba(255,255,255,0.5);
          }

          .nav-text.active {
            font-weight: 500;
            text-shadow: 0 0 10px rgba(255,255,255,0.3);
          }

          /* Hover effects */
          .nav-link:hover {
            animation: float 2s ease-in-out infinite;
            background: transparent !important;
          }

          .nav-link:hover .nav-text {
            text-shadow: 0 0 10px rgba(255,255,255,0.5);
          }

          /* Don't apply float animation to active link */
          .nav-link.active:hover {
            animation: none;
            transform: none;
          }

          @keyframes float {
            0% {
              transform: translateY(-8px) scale(1.15);
            }
            50% {
              transform: translateY(-12px) scale(1.15);
            }
            100% {
              transform: translateY(-8px) scale(1.15);
            }
          }

          /* Transition for page changes */
          .page-transition {
            transition: opacity 0.3s ease;
          }

          .page-transition-enter {
            opacity: 0;
          }

          .page-transition-enter-active {
            opacity: 1;
          }

          .page-transition-exit {
            opacity: 1;
          }

          .page-transition-exit-active {
            opacity: 0;
          }

          /* Add subtle hover effect for the EST text */
          .est-text {
            transition: all 0.3s ease;
          }

          .est-text:hover {
            transform: translateY(-2px);
            text-shadow: 0 4px 8px rgba(0,0,0,0.4);
          }

          @keyframes subtlePulse {
            0% {
              opacity: 0.7;
            }
            50% {
              opacity: 0.9;
            }
            100% {
              opacity: 0.7;
            }
          }

          /* Add subtle animation to the vertical line */
          .vertical-line {
            animation: subtlePulse 3s infinite ease-in-out;
          }

          /* Logo with float effect */
          .logo-button {
            background: transparent !important;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            perspective: 1000px;
          }

          .logo-button:hover {
            animation: logoFloat 2s ease-in-out infinite;
            background: transparent !important;
          }

          @keyframes logoFloat {
            0% {
              transform: translateY(-4px) scale(1.05);
            }
            50% {
              transform: translateY(-8px) scale(1.05);
            }
            100% {
              transform: translateY(-4px) scale(1.05);
            }
          }
        `}
      </style>
    </TamaguiProvider>
  )
}

export default App