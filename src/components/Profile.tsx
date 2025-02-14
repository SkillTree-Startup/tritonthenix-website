import { YStack, Text, Button, Image, Stack, XStack } from 'tamagui'
import { useState, useRef, useEffect } from 'react'
import { storage, db } from '../firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { UserData } from '../types/Event'

const DEFAULT_PROFILE_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNEMUQxRDEiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4NSIgcj0iMzUiIGZpbGw9IiM5NDk0OTQiLz4KICA8cGF0aCBkPSJNMTAwIDE0MEMxMzYuMDQ0IDE0MCAxNjUgMTY4Ljk1NiAxNjUgMjA1SDE2NUgzNUgzNUMzNSAxNjguOTU2IDYzLjk1NiAxNDAgMTAwIDE0MFoiIGZpbGw9IiM5NDk0OTQiLz4KPC9zdmc+Cg=='

interface ProfileProps {
  userData: UserData | null;
  handleSignOut: () => void;
}

export const Profile = ({ userData, handleSignOut }: ProfileProps) => {
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_PROFILE_IMAGE)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update effect to use DEFAULT_PROFILE_IMAGE as fallback
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!userData || !userData.email) {
        setImageUrl(DEFAULT_PROFILE_IMAGE);
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', userData.email));
        if (userDoc.exists() && userDoc.data().profilePicture) {
          setImageUrl(userDoc.data().profilePicture);
        } else {
          setImageUrl(DEFAULT_PROFILE_IMAGE); // Use default image instead of empty string
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        setImageUrl(DEFAULT_PROFILE_IMAGE); // Use default image on error
      }
    };

    fetchProfilePicture();
  }, [userData]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userData || !userData.email) {
      console.log('No file selected or no email available')
      return
    }

    try {
      setIsUploading(true)
      
      // Use a consistent storage path based on email
      const storageRef = ref(storage, `profile-pictures/${userData.email}/profile`)
      
      // Delete old profile picture if it exists (using the consistent path)
      try {
        await deleteObject(storageRef)
      } catch (error) {
        // Ignore error if file doesn't exist
        console.log('No existing profile picture to delete')
      }
      
      console.log('Uploading file...')
      const snapshot = await uploadBytes(storageRef, file)
      console.log('File uploaded successfully')
      
      console.log('Getting download URL...')
      const url = await getDownloadURL(snapshot.ref)
      console.log('Download URL:', url)
      
      // Save the image URL and other user data to Firestore
      const userDocRef = doc(db, 'users', userData.email)
      await setDoc(userDocRef, {
        profilePicture: url,
        name: userData.name || 'Anonymous',
        email: userData.email,
        updatedAt: new Date(),
      }, { merge: true })

      setImageUrl(url)
    } catch (error) {
      console.error('Error uploading image:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
      setImageUrl(DEFAULT_PROFILE_IMAGE)
    } finally {
      setIsUploading(false)
    }
  }

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
                defaultSource={{ uri: DEFAULT_PROFILE_IMAGE }}
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
              <YStack space="$4" alignItems="center" width="100%">
                <YStack space="$2" alignItems="center">
                  <Text fontSize="$5" color="$textPrimary">
                    {userData.name || 'Anonymous'}
                  </Text>
                  <Text fontSize="$4" color="$textSecondary">
                    {userData.email}
                  </Text>
                </YStack>

                {/* Sign Out Button */}
                <Button
                  backgroundColor="$red8"
                  paddingHorizontal="$4"
                  paddingVertical="$2"
                  onPress={handleSignOut}
                  marginTop="$4"
                >
                  <Text color="white">Sign Out</Text>
                </Button>
              </YStack>
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
      </YStack>
    </YStack>
  );
}; 