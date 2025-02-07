import { TamaguiProvider, Theme, YStack } from 'tamagui'
import config from './tamagui.config'
import { useState } from 'react'
import { useNavigate, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AppRoutes from './components/Routes'
import { Header } from './components/Layout/Header'
import { Menu } from './components/Layout/Menu'
import Home from './components/Home'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  
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
                />
              } />
            </Routes>
          </YStack>
        </YStack>
    </TamaguiProvider>
  )
}

export default App