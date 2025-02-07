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
  label: string;
  page?: string;
  onClick?: () => void;
}

const MenuItem = ({ 
  label, 
  page, 
  onClick, 
  handleMenuToggle
}: MenuItemProps & { 
  handleNavigate: (path: string) => void;
  handleMenuToggle: () => void;
}) => {
  const navigate = useNavigate()
  return (
    <Button
      backgroundColor="transparent"
      padding="$4"
      onPress={() => {
        if (onClick) {
          onClick()
        } else if (page) {
          navigate(page)
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

  const renderMenuItem = (props: MenuItemProps) => (
    <MenuItem 
      {...props} 
      handleNavigate={handleNavigate} 
      handleMenuToggle={handleMenuToggle}
    />
  )

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
            {renderMenuItem({ 
              label: "Workouts", 
              onClick: () => handleNavigate('/schedule/workouts')
            })}
            {renderMenuItem({ 
              label: "Events", 
              onClick: () => handleNavigate('/schedule/events')
            })}
            {renderMenuItem({ 
              label: "Events", 
              onClick: () => handleNavigate('/schedule/events')
            })}
            {renderMenuItem({ 
              label: "Profile",
              onClick: () => handleNavigate('/Profile')
            })}
            {renderMenuItem({ 
              label: "privacy",
              onClick: () => handleNavigate('/privacy')
            })}
          </YStack>

          {isAdmin && renderMenuItem({ label: "Admin Panel", page: "/admin" })}
                    
          <YStack 
            borderTopWidth={1} 
            borderTopColor="$borderColor"
            marginTop="$2"
            paddingTop="$2"
          >
            {renderMenuItem({ 
              label: "Sign Out", 
              onClick: handleSignOut
            })}
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
            {renderMenuItem({ 
              label: "Workouts", 
              onClick: () => handleNavigate('/schedule/workouts')
            })}
            {renderMenuItem({ 
              label: "Events", 
              onClick: () => handleNavigate('/schedule/events')
            })}
            {renderMenuItem({ 
              label: "Profile",
              onClick: () => handleNavigate('/Profile')
            })}
            {renderMenuItem({ 
              label: "privacy",
              onClick: () => handleNavigate('/privacy')
            })}
          </YStack>
        </>
      )}
    </YStack>
  )
} 