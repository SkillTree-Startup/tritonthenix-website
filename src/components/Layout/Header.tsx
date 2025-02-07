import { XStack, Button, Image, Text, Stack, YStack } from 'tamagui'
import { useLocation, useNavigate } from 'react-router-dom'
import logoSvg from '../../assets/logo.svg'
import { GoogleSignIn } from '../Auth/GoogleSignIn'
import { useEffect, useRef } from 'react'

interface HeaderProps {
  isSignedIn: boolean
  userData: {
    email: string;
  } | null
  handleMenuToggle: () => void
  isMenuOpen?: boolean
}

export const Header = ({ isSignedIn, userData, handleMenuToggle, isMenuOpen }: HeaderProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleMenuToggle()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen, handleMenuToggle])

  const isActiveRoute = (path: string) => {
    return location.pathname.includes(path)
  }

  const handleNavigate = (path: string) => {
    navigate(path.startsWith('/') ? path : `/${path}`)
    if (isMenuOpen) {
      handleMenuToggle()
    }
  }

  return (
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
        $xl={{ display: 'flex' }}
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

      {/* Right side: Auth Buttons */}
      <XStack 
        space="$2" 
        alignItems="center"
        $sm={{ space: '$0' }}
      >
        {!isSignedIn ? (
          <XStack 
            space="$2" 
            alignItems="center"
            $sm={{ display: 'none' }}
          >
            <GoogleSignIn id="googleSignInDiv" scale={1} />
          </XStack>
        ) : (
          <Text color="white" marginRight="$2" fontSize="$3">
            {userData?.email}
          </Text>
        )}

        {/* Hamburger Menu Button */}
        <Button
          ref={menuRef}
          backgroundColor="transparent"
          padding="$2"
          onPress={handleMenuToggle}
          aria-label="Menu"
          pressStyle={{ backgroundColor: '$gray8' }}
          hoverStyle={{ backgroundColor: '$gray12' }}
          $sm={{ padding: '$1' }}
        >
          <YStack space="$1.5">
            <Stack height={2} width={24} backgroundColor="white" />
            <Stack height={2} width={24} backgroundColor="white" />
            <Stack height={2} width={24} backgroundColor="white" />
          </YStack>
        </Button>
      </XStack>
    </XStack>
  )
} 