import { YStack, Text, Button, Image, Stack, XStack } from 'tamagui'
import { useState, useRef, useEffect } from 'react'
import { storage, db } from '../firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, setDoc, getDoc } from 'firebase/firestore'

interface ProfileProps {
  email?: string;
  name?: string;
  tempAdminMode?: boolean;
  onTempAdminToggle?: () => void;
}

export const Profile = ({ email, name, tempAdminMode, onTempAdminToggle }: ProfileProps) => {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch user's profile picture on component mount
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!email) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', email));
        if (userDoc.exists() && userDoc.data().profilePicture) {
          setImageUrl(userDoc.data().profilePicture);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, [email]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !email) {
      console.log('No file selected or no email available')
      return
    }

    try {
      setIsUploading(true)
      console.log('Starting upload for:', email)
      
      const timestamp = new Date().getTime()
      const storageRef = ref(storage, `profile-pictures/${email}_${timestamp}`)
      
      console.log('Uploading file...')
      const snapshot = await uploadBytes(storageRef, file)
      console.log('File uploaded successfully')
      
      console.log('Getting download URL...')
      const url = await getDownloadURL(snapshot.ref)
      console.log('Download URL:', url)
      
      // Save the image URL to Firestore
      await setDoc(doc(db, 'users', email), {
        profilePicture: url,
        name: name,
        email: email,
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
    if (!email) {
      console.log('User must be signed in to upload a profile picture')
      return
    }
    fileInputRef.current?.click()
  }

  const handleRemovePicture = async () => {
    if (!email || !imageUrl) return

    try {
      // First, update Firestore to remove the profile picture URL
      await setDoc(doc(db, 'users', email), {
        profilePicture: null,
        name: name,
        email: email,
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

  return (
    <YStack 
      padding="$6" 
      space="$4" 
      maxWidth={800} 
      width="100%" 
      margin="auto"
    >
      <Text 
        fontSize="$8" 
        fontWeight="bold" 
        color="$textPrimary"
      >
        Profile
      </Text>

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
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                width="100%"
                height="100%"
                resizeMode="cover"
                alt="Profile picture"
              />
            ) : (
              <Text
                color="$textSecondary"
                fontSize="$6"
                textAlign="center"
                marginTop="$4"
              >
                No Image
              </Text>
            )}
          </Stack>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          <XStack space="$2">
            <Button
              backgroundColor="$cardBackground"
              borderColor="$color"
              borderWidth={1}
              padding="$2"
              onPress={handleUploadClick}
              disabled={isUploading || !email}
            >
              <Text color="$color">
                {isUploading ? 'Uploading...' : email ? 'Upload Picture' : 'Sign in to upload'}
              </Text>
            </Button>

            {imageUrl && (
              <Button
                backgroundColor="$cardBackground"
                borderColor="$color"
                borderWidth={1}
                padding="$2"
                onPress={handleRemovePicture}
                disabled={!email}
              >
                <Text color="$color">
                  Remove Picture
                </Text>
              </Button>
            )}
          </XStack>
        </YStack>

        {/* Profile Information Section */}
        <YStack space="$2">
          <Text fontSize="$3" color="$textSecondary">Name</Text>
          <Text fontSize="$4" color="$textPrimary">{name || 'Not available'}</Text>
        </YStack>

        <YStack space="$2">
          <Text fontSize="$3" color="$textSecondary">Email</Text>
          <Text fontSize="$4" color="$textPrimary">{email || 'Not signed in'}</Text>
        </YStack>

        {/* Temp Admin Toggle */}
        <YStack 
          marginTop="$4" 
          borderTopWidth={1} 
          borderTopColor="$borderColor" 
          paddingTop="$4"
        >
          <Button
            backgroundColor={tempAdminMode ? '#22c55e' : '$background'}
            borderColor="$color"
            borderWidth={1}
            padding="$2"
            onPress={onTempAdminToggle}
          >
            <Text color="$color" fontSize="$2">
              {tempAdminMode ? 'Disable' : 'Enable'} Temp Admin
            </Text>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  )
} 