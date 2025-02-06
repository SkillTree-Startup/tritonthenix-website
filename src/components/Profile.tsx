import { YStack, Text, Button, Image, Stack, XStack } from 'tamagui'
import { useState, useRef, useEffect } from 'react'
import { storage, db } from '../firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { UserData } from '../types/Event'

const DEFAULT_PROFILE_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNEMUQxRDEiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4NSIgcj0iMzUiIGZpbGw9IiM5NDk0OTQiLz4KICA8cGF0aCBkPSJNMTAwIDE0MEMxMzYuMDQ0IDE0MCAxNjUgMTY4Ljk1NiAxNjUgMjA1SDE2NUgzNUgzNUMzNSAxNjguOTU2IDYzLjk1NiAxNDAgMTAwIDE0MFoiIGZpbGw9IiM5NDk0OTQiLz4KPC9zdmc+Cg=='

interface ProfileProps {
  tempAdminMode: boolean;
  onTempAdminToggle: () => void;
  userData: UserData | null;
}

export const Profile = ({ tempAdminMode = false, onTempAdminToggle = () => {}, userData }: ProfileProps) => {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset image URL when email changes or admin mode changes
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!userData || !userData.email) {
        setImageUrl('');
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', userData.email));
        if (userDoc.exists() && userDoc.data().profilePicture) {
          setImageUrl(userDoc.data().profilePicture);
        } else {
          setImageUrl(''); // Clear the image if none exists
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        setImageUrl('');
      }
    };

    fetchProfilePicture();
  }, [userData, tempAdminMode]); // Added tempAdminMode as dependency

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userData || !userData.email) {
      console.log('No file selected or no email available')
      return
    }

    try {
      setIsUploading(true)
      console.log('Starting upload for:', userData.email)
      
      const timestamp = new Date().getTime()
      const storageRef = ref(storage, `profile-pictures/${userData.email}_${timestamp}`)
      
      console.log('Uploading file...')
      const snapshot = await uploadBytes(storageRef, file)
      console.log('File uploaded successfully')
      
      console.log('Getting download URL...')
      const url = await getDownloadURL(snapshot.ref)
      console.log('Download URL:', url)
      
      // Save the image URL to Firestore
      await setDoc(doc(db, 'users', userData.email), {
        profilePicture: url,
        name: userData.name,
        email: userData.email,
      }, { merge: true });

      setImageUrl(url)
    } catch (error) {
      console.error('Error uploading image:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadClick = () => {
    if (!userData || !userData.email) {
      console.log('User must be signed in to upload a profile picture')
      return
    }
    fileInputRef.current?.click()
  }

  const handleRemovePicture = async () => {
    if (!userData || !userData.email || !imageUrl) return

    try {
      // First, update Firestore to remove the profile picture URL
      await setDoc(doc(db, 'users', userData.email), {
        profilePicture: null,
        name: userData.name,
        email: userData.email,
      }, { merge: true })

      // Try to delete from Storage if possible
      try {
        // Get the file name from the URL
        const fileName = imageUrl.split('profile-pictures%2F')[1]?.split('?')[0]
        if (fileName) {
          const storageRef = ref(storage, `profile-pictures/${fileName}`)
          await deleteObject(storageRef)
          console.log('File deleted from storage')
        }
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError)
        // Continue even if storage deletion fails
      }

      // Clear the image URL from state
      setImageUrl('')
      console.log('Profile picture removed successfully')
    } catch (error) {
      console.error('Error removing profile picture:', error)
    }
  }

  const handleAdminLogin = () => {
    if (onTempAdminToggle) {
      onTempAdminToggle();
    }
  };

  return (
    <YStack padding="$4" space="$4" alignItems="center">
      <YStack space="$4" maxWidth={500} width="100%">
        <Text fontSize="$8" fontWeight="bold" color="$textPrimary">
          Profile
        </Text>

        {/* Profile Info Card */}
        <YStack 
          backgroundColor="$cardBackground"
          padding="$4"
          borderRadius="$4"
          space="$4"
          borderWidth={1}
          borderColor="$borderColor"
        >
          {/* Profile Picture Section */}
          <YStack space="$2" alignItems="center">
            <Stack
              width={120}
              height={120}
              borderRadius={60}
              overflow="hidden"
              backgroundColor="$background"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Image
                source={{ uri: imageUrl || DEFAULT_PROFILE_IMAGE }}
                width="100%"
                height="100%"
                resizeMode="cover"
                alt="Profile picture"
              />
            </Stack>
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            {userData && userData.email ? (
              <>
                <XStack space="$2">
                  <Button
                    backgroundColor="$cardBackground"
                    borderColor="$color"
                    borderWidth={1}
                    padding="$2"
                    onPress={handleUploadClick}
                    disabled={isUploading}
                  >
                    <Text color="$color">
                      {isUploading ? 'Uploading...' : 'Upload Picture'}
                    </Text>
                  </Button>

                  {imageUrl && (
                    <Button
                      backgroundColor="$cardBackground"
                      borderColor="$color"
                      borderWidth={1}
                      padding="$2"
                      onPress={handleRemovePicture}
                    >
                      <Text color="$color">
                        Remove Picture
                      </Text>
                    </Button>
                  )}
                </XStack>
                <Text fontSize="$5" color="$textPrimary">
                  {userData.name || 'Anonymous'}
                </Text>
                <Text fontSize="$4" color="$textSecondary">
                  {userData.email}
                </Text>
              </>
            ) : (
              <YStack space="$4" alignItems="center">
                <Text fontSize="$4" color="$textSecondary" textAlign="center">
                  Sign in to access your profile
                </Text>
                <XStack 
                  space="$2" 
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
                  $sm={{ display: 'none' }}
                >
                  <XStack
                    style={{
                      backgroundColor: 'transparent',
                      borderRadius: '20px',
                      overflow: 'hidden',
                    }}
                    $gtMd={{ transform: 'scale(1)', transformOrigin: 'center' }}
                  >
                    <div id="googleSignInDivProfile"></div>
                  </XStack>
                </XStack>
                
                <XStack
                  space="$2"
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
                  display="none"
                  $sm={{ display: 'flex' }}
                >
                  <XStack
                    style={{
                      backgroundColor: 'transparent',
                      borderRadius: '20px',
                      overflow: 'hidden',
                    }}
                  >
                    <div id="googleSignInDivProfileMobile"></div>
                  </XStack>
                </XStack>
              </YStack>
            )}
          </YStack>
        </YStack>

        {/* Developer Options Card */}
        <YStack 
          backgroundColor="$cardBackground"
          padding="$4"
          borderRadius="$4"
          space="$4"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Text fontSize="$5" color="$textPrimary" fontWeight="bold">
            Developer Options
          </Text>
          <XStack space="$2" alignItems="center">
            <Button
              backgroundColor={tempAdminMode ? '$red8' : '$blue8'}
              onPress={handleAdminLogin}
              paddingHorizontal="$4"
              paddingVertical="$2"
            >
              <Text color="white">
                {tempAdminMode ? 'Exit Admin Mode' : 'Log in as Admin'}
              </Text>
            </Button>
            {tempAdminMode && (
              <Text fontSize="$3" color="$textSecondary">
                Logged in as Test Admin
              </Text>
            )}
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}; 