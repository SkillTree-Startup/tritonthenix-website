import { Route, Routes as RouterRoutes, Navigate } from 'react-router-dom'
import { AdminPanel } from './AdminPanel'
import { PrivacyPolicy } from './PrivacyPolicy'
import { Home } from './Home'
import { YStack } from 'tamagui'

interface RoutesProps {
  isSignedIn: boolean
  userData: { email: string; isAdmin: boolean } | null
  handleSignOut: () => void
}

export const Routes = ({ isSignedIn, userData, handleSignOut }: RoutesProps) => (
  <YStack flex={1} justifyContent="center" alignItems="center">
    <RouterRoutes>
      <Route path="/" element={
        <Home 
          isSignedIn={isSignedIn} 
          userData={userData} 
          handleSignOut={handleSignOut} 
        />
      } />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  </YStack>
) 