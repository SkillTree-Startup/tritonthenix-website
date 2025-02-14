import { TamaguiProvider, YStack } from 'tamagui'
import config from './tamagui.config'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AppRoutes from './components/Routes'
import { Header } from './components/Layout/Header'
import { Menu } from './components/Layout/Menu'
import Home from './components/Home'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const hasRedirected = useRef(false)
  
  const { 
    isSignedIn, 
    userData, 
    isAdmin,
    tempAdminMode,
    handleSignOut,
    handleTempAdminToggle 
  } = useAuth()

  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen)

  const handleNavigate = (path: string) => {
    navigate(path.startsWith('/') ? path : `/${path}`)
    setIsMenuOpen(false)
  }

  // Update effect to handle admin navigation only once
  useEffect(() => {
    if (isAdmin && isSignedIn && !hasRedirected.current) {
      hasRedirected.current = true
      navigate('/admin')
    }
  }, [isAdmin, isSignedIn, navigate])

  // Reset the redirect flag when user signs out
  useEffect(() => {
    if (!isSignedIn) {
      hasRedirected.current = false
    }
  }, [isSignedIn])

  return (
    <TamaguiProvider config={config}>
        <YStack 
          backgroundColor="$background"
          minHeight="100vh"
          position="relative"
          width="100vw"
          overflow="hidden"
        >          
          <Header 
            isSignedIn={isSignedIn}
            userData={userData}
            handleMenuToggle={handleMenuToggle}
          />

          <Menu 
            isMenuOpen={isMenuOpen}
            isSignedIn={isSignedIn}
            isAdmin={isAdmin}
            handleSignOut={handleSignOut}
            handleNavigate={handleNavigate}
            handleMenuToggle={handleMenuToggle}
          />

          <YStack 
            flex={1} 
            width="100%" 
            position="relative" 
            zIndex={2}
            backgroundColor="transparent"
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/*" element={
                <AppRoutes 
                  userEmail={userData?.email || ''} 
                  userName={userData?.name}
                  tempAdminMode={tempAdminMode}
                  onTempAdminToggle={handleTempAdminToggle}
                  userData={userData}
                  handleSignOut={handleSignOut}
                />
              } />
            </Routes>
          </YStack>
        </YStack>
    </TamaguiProvider>
  )
}

export default App