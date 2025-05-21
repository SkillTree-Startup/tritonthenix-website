import React, { useState, useRef, useEffect } from 'react'; // Import React
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

export const Profile = ({ tempAdminMode = false, onTempAdminToggle = () => { }, userData }: ProfileProps) => {
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
    <div className="profile-container flex flex-col items-center" style={{ padding: 'var(--space-4)', gap: 'var(--space-4)' }}>
      <div className="profile-content flex flex-col" style={{ gap: 'var(--space-4)', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: 'var(--font-size-8)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Profile
        </h1>

        {/* Profile Info Card */}
        <div
          className="profile-info-card flex flex-col"
          style={{
            backgroundColor: 'var(--card-background)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--border-radius-medium)',
            gap: 'var(--space-4)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Profile Picture Section */}
          <div className="profile-picture-section flex flex-col items-center" style={{ gap: 'var(--space-2)' }}>
            <div
              className="image-container"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                overflow: 'hidden',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border-color)',
              }}
            >
              <img
                src={imageUrl || DEFAULT_PROFILE_IMAGE}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt="Profile picture"
              />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {userData && userData.email ? (
              <>
                <div className="buttons-row flex" style={{ gap: 'var(--space-2)' }}>
                  <button
                    className="upload-button"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    style={{
                      backgroundColor: 'var(--card-background)',
                      border: '1px solid var(--text-primary)', // Use text-primary for border
                      padding: 'var(--space-2)',
                      color: 'var(--text-primary)', // Use text-primary for text
                    }}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Picture'}
                  </button>

                  {imageUrl && (
                    <button
                      className="remove-button"
                      onClick={handleRemovePicture}
                      style={{
                        backgroundColor: 'var(--card-background)',
                        border: '1px solid var(--text-primary)',
                        padding: 'var(--space-2)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Remove Picture
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 'var(--font-size-5)', color: 'var(--text-primary)' }}>
                  {userData.name || 'Anonymous'}
                </p>
                <p style={{ fontSize: 'var(--font-size-4)', color: 'var(--text-secondary)' }}>
                  {userData.email}
                </p>
              </>
            ) : (
              <div className="signin-prompt flex flex-col items-center" style={{ gap: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--font-size-4)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Sign in to access your profile
                </p>
                {/* Desktop Sign-in - hide on small screens via CSS */}
                <div
                  className="google-signin-profile-desktop flex items-center justify-center"
                  style={{ width: '100%' /*, display: 'none' @sm via CSS */ }}
                >
                  <div
                    id="googleSignInDivProfile"
                    style={{
                      backgroundColor: 'transparent',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      // transform: 'scale(1)', // @gtMd via CSS
                      // transformOrigin: 'center',
                    }}
                  ></div>
                </div>

                {/* Mobile Sign-in - show only on small screens via CSS */}
                <div
                  className="google-signin-profile-mobile flex items-center justify-center"
                  style={{ width: '100%' /*, display: 'flex' @sm via CSS, display: 'none' default */ }}
                >
                  <div
                    id="googleSignInDivProfileMobile"
                    style={{
                      backgroundColor: 'transparent',
                      borderRadius: '20px',
                      overflow: 'hidden',
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Developer Options Card */}
        <div
          className="developer-options-card flex flex-col"
          style={{
            backgroundColor: 'var(--card-background)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--border-radius-medium)',
            gap: 'var(--space-4)',
            border: '1px solid var(--border-color)',
          }}
        >
          <p style={{ fontSize: 'var(--font-size-5)', color: 'var(--text-primary)', fontWeight: 'bold' }}>
            Developer Options
          </p>
          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            <button
              onClick={handleAdminLogin}
              style={{
                backgroundColor: tempAdminMode ? 'var(--red8)' : 'var(--blue8)',
                padding: 'var(--space-2) var(--space-4)',
                color: 'white',
              }}
            >
              {tempAdminMode ? 'Exit Admin Mode' : 'Log in as Admin'}
            </button>
            {tempAdminMode && (
              <p style={{ fontSize: 'var(--font-size-3)', color: 'var(--text-secondary)' }}>
                Logged in as Test Admin
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};