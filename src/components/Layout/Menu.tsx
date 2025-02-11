import { YStack, Button, Text, XStack } from 'tamagui'
import { useNavigate } from 'react-router-dom'

interface MenuProps {
  isMenuOpen: boolean
  isSignedIn: boolean
  isAdmin: boolean
  handleSignOut: () => void
  handleNavigate: (path: string) => void
  handleMenuToggle: () => void
}

interface MenuItemProps {
  label: string
  page?: string
  onClick?: () => void
}

const MenuItem = ({ 
  label, 
  page, 
  onClick,
  handleNavigate,
  handleMenuToggle 
}: MenuItemProps & { 
  handleNavigate: (path: string) => void
  handleMenuToggle: () => void
}) => {
  return (
    <Button
      backgroundColor="transparent"
      padding="$4"
      onPress={() => {
        if (onClick) {
          onClick()
        } else if (page) {
          handleNavigate(page)
        }
        handleMenuToggle()
      }}
      width="100%"
      justifyContent="flex-start"
      hoverStyle={{ backgroundColor: '$gray4' }}
    >
      <Text color="$color">{label}</Text>
    </Button>
  )
}

export const Menu = ({ 
  isMenuOpen, 
  isSignedIn, 
  isAdmin, 
  handleSignOut,
  handleNavigate,
  handleMenuToggle
}: MenuProps) => {
  if (!isMenuOpen) return null

  return (
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
          <YStack $xl={{ display: 'none' }}>
            <MenuItem 
              label="Workouts" 
              onClick={() => handleNavigate('/schedule/workouts')}
              handleNavigate={handleNavigate}
              handleMenuToggle={handleMenuToggle}
            />
            <MenuItem 
              label="Events" 
              onClick={() => handleNavigate('/schedule/events')}
              handleNavigate={handleNavigate}
              handleMenuToggle={handleMenuToggle}
            />
            <MenuItem 
              label="Profile"
              page="profile"
              handleNavigate={handleNavigate}
              handleMenuToggle={handleMenuToggle}
            />
          </YStack>

          {isAdmin && (
            <MenuItem 
              label="Admin Panel" 
              page="/admin"
              handleNavigate={handleNavigate}
              handleMenuToggle={handleMenuToggle}
            />
          )}

          <MenuItem 
            label="Privacy Policy" 
            page="privacy"
            handleNavigate={handleNavigate}
            handleMenuToggle={handleMenuToggle}
          />

          <YStack 
            borderTopWidth={1} 
            borderTopColor="$borderColor"
            marginTop="$2"
            paddingTop="$2"
          >
            <MenuItem 
              label="Sign Out" 
              onClick={handleSignOut}
              handleNavigate={handleNavigate}
              handleMenuToggle={handleMenuToggle}
            />
          </YStack>
        </>
      ) : (
        <>
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
          
          <YStack $xl={{ display: 'none' }}>
            <MenuItem 
              label="Workouts" 
              onClick={() => handleNavigate('/schedule/workouts')}
              handleNavigate={handleNavigate}
              handleMenuToggle={handleMenuToggle}
            />
            <MenuItem 
              label="Events" 
              onClick={() => handleNavigate('/schedule/events')}
              handleNavigate={handleNavigate}
              handleMenuToggle={handleMenuToggle}
            />
            <MenuItem 
              label="Profile" 
              page="profile"
              handleNavigate={handleNavigate}
              handleMenuToggle={handleMenuToggle}
            />
          </YStack>
          <MenuItem 
            label="Privacy Policy" 
            page="privacy"
            handleNavigate={handleNavigate}
            handleMenuToggle={handleMenuToggle}
          />
        </>
      )}
    </YStack>
  )
} 