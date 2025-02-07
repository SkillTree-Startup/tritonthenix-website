import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { UserData } from '../types/auth'
import { WHITELISTED_EMAILS, TEST_ADMIN_DATA, GOOGLE_CLIENT_ID } from '../constants/auth'

export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [tempAdminMode, setTempAdminMode] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isSignedIn) {
      const initializeGoogleSignIn = () => {
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        })

        const buttonIds = ['googleSignInDiv', 'googleSignInDivProfile', 'googleSignInDivProfileMobile']
        buttonIds.forEach(id => {
          const button = document.getElementById(id)
          if (button) {
            window.google?.accounts.id.renderButton(button, {
              type: "standard",
              theme: "outline",
              size: "medium",
              shape: "pill",
              text: "signin_with",
              width: 200,
              locale: "en",
              logo_alignment: "center"
            })
          }
        })
      }

      initializeGoogleSignIn()
      const retryTimeout = setTimeout(initializeGoogleSignIn, 1000)
      return () => clearTimeout(retryTimeout)
    }
  }, [isSignedIn, location.pathname])

  const handleCredentialResponse = async (response: any) => {
    try {
      const decoded: any = jwtDecode(response.credential)
      const userEmail = decoded.email
      const userName = decoded.name
      const picture = decoded.picture

      const newUserData = {
        email: userEmail,
        name: userName,
        isAdmin: WHITELISTED_EMAILS.includes(userEmail),
        profilePicture: picture,
        lastLogin: new Date()
      } as UserData

      setUserData(newUserData)
      setIsSignedIn(true)

      const userRef = doc(db, 'users', userEmail)
      await setDoc(userRef, {
        ...newUserData,
        createdAt: new Date()
      }, { merge: true })
    } catch (error) {
      console.error('Error processing login:', error)
    }
  }

  const handleSignOut = () => {
    window.google?.accounts.id.disableAutoSelect()
    setIsSignedIn(false)
    setUserData(null)
    navigate('/')
  }

  const handleTempAdminToggle = () => {
    if (tempAdminMode) {
      setTempAdminMode(false)
      setIsSignedIn(false)
      setUserData(null)
    } else {
      setTempAdminMode(true)
      setIsSignedIn(true)
      setUserData(TEST_ADMIN_DATA)
    }
  }

  const isAdmin = tempAdminMode || WHITELISTED_EMAILS.includes(userData?.email || '')

  return {
    isSignedIn,
    userData,
    isAdmin,
    tempAdminMode,
    handleSignOut,
    handleTempAdminToggle
  }
} 