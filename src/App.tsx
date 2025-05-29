import React, { useEffect, useState } from 'react' // Import React
import logoSvg from './assets/logo.svg'
import backgroundImage from './assets/image.png'
import { useLocation, useNavigate } from 'react-router-dom'
import AppRoutes from './components/Routes'
import { jwtDecode } from 'jwt-decode'
import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
// Removed Tamagui imports: TamaguiProvider, Theme, XStack, YStack, Image, Button, Text, Stack

// Whitelist of emails with special privileges
const WHITELISTED_EMAILS = [
  'example@ucsd.edu',
  'admin@tritonthenix.com',
  // Add more emails here
  'cskeoch@ucsd.edu',
  'jweston@ucsd.edu',
  'r1wan@ucsd.edu',
];

// Type for user data
interface UserData {
  email: string;
  name: string;
  isAdmin: boolean;
  profilePicture?: string;
  createdAt?: Date;
  lastLogin: Date;
}

// Declare global google type
declare global {
  interface Window {
    google: any;
  }
}

// Update MenuItem interface
interface MenuItemProps {
  label: string;
  page?: string;
  onClick?: () => void;
  className?: string; // Allow passing className
}

// Add this constant for the test admin data
const TEST_ADMIN_DATA: UserData = {
  email: 'admin@tritonthenix.com',
  name: 'Test Admin',
  isAdmin: true,
  profilePicture: 'https://ui-avatars.com/api/?name=Test+Admin&background=0D8ABC&color=fff',
  lastLogin: new Date()
};

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [tempAdminMode, setTempAdminMode] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  // Theme state can be used to toggle a class on the body for CSS variable changes
  const [theme, setTheme] = useState<'light' | 'dark'>('dark') // Default is already dark

  useEffect(() => {
    // Apply theme attribute to html element
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isSignedIn) {
      const initializeGoogleSignIn = () => {
        window.google?.accounts.id.initialize({
          client_id: "427440820094-2g565030h0k2t080koick8ntbm54m10n.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Try to render header button
        const headerButton = document.getElementById("googleSignInDiv");
        if (headerButton) {
          window.google?.accounts.id.renderButton(
            headerButton,
            {
              type: "standard",
              theme: "outline",
              size: "medium",
              shape: "pill",
              text: "signin_with",
              width: 200,
              locale: "en",
              logo_alignment: "center"
            }
          );
        }

        // Try to render profile button
        const profileButton = document.getElementById("googleSignInDivProfile");
        if (profileButton) {
          window.google?.accounts.id.renderButton(
            profileButton,
            {
              type: "standard",
              theme: "outline",
              size: "medium",
              shape: "pill",
              text: "signin_with",
              width: 200,
              locale: "en",
              logo_alignment: "center"
            }
          );
        }

        // Add initialization for the mobile profile button
        const profileButtonMobile = document.getElementById("googleSignInDivProfileMobile");
        if (profileButtonMobile) {
          window.google?.accounts.id.renderButton(
            profileButtonMobile,
            {
              type: "standard",
              theme: "outline",
              size: "medium",
              shape: "pill",
              text: "signin_with",
              width: 200,
              locale: "en",
              logo_alignment: "center"
            }
          );
        }
      };

      // Initial attempt
      initializeGoogleSignIn();

      // Retry after a short delay to ensure DOM elements are ready
      const retryTimeout = setTimeout(initializeGoogleSignIn, 1000);

      return () => clearTimeout(retryTimeout);
    }
  }, [isSignedIn, location.pathname]);

  const handleCredentialResponse = async (response: any) => {
    try {
      const decoded: any = jwtDecode(response.credential)
      const userEmail = decoded.email
      const userName = decoded.name
      const picture = decoded.picture

      // Create userData object with all required fields
      const newUserData = {
        email: userEmail,
        name: userName,
        isAdmin: WHITELISTED_EMAILS.includes(userEmail),
        profilePicture: picture,
        lastLogin: new Date()
      } as UserData  // Use type assertion instead of including createdAt

      setUserData(newUserData)
      setIsSignedIn(true)

      // Update user document in Firestore
      const userRef = doc(db, 'users', userEmail)
      await setDoc(userRef, {
        ...newUserData,
        createdAt: new Date()  // Add createdAt only in Firestore
      }, { merge: true })
    } catch (error) {
      console.error('Error processing login:', error)
    }
  }

  const handleSignOut = () => {
    window.google?.accounts.id.disableAutoSelect();
    setIsSignedIn(false);
    setUserData(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleNavigate = (path: string) => {
    navigate(path.startsWith('/') ? path : `/${path}`);
    setIsMenuOpen(false);
  }

  // Helper function to check if link is active
  const isActiveRoute = (path: string) => {
    return location.pathname.includes(path);
  };

  // Update MenuItem component
  const MenuItem = ({ label, page, onClick, className }: MenuItemProps) => (
    <button
      className={`menu-item ${className || ''}`}
      onClick={() => {
        if (onClick) {
          onClick();
        } else if (page) {
          handleNavigate(page);
        }
        setIsMenuOpen(false);
      }}
      style={{
        backgroundColor: 'transparent',
        padding: 'var(--space-4)',
        width: '100%',
        textAlign: 'left',
        color: 'var(--text-primary)',
      }}
    >
      {label}
    </button>
  )

  // Add theme toggle handler
  const handleThemeToggle = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      return newTheme;
    });
  }

  // Update the temp admin toggle handler
  const handleTempAdminToggle = () => {
    if (tempAdminMode) {
      // Reset to previous state
      setTempAdminMode(false);
      setIsSignedIn(false);
      setUserData(null);
    } else {
      // Switch to admin mode
      setTempAdminMode(true);
      setIsSignedIn(true);
      setUserData(TEST_ADMIN_DATA);
    }
  };

  // Update the isAdmin check in the header
  const isAdmin = tempAdminMode || WHITELISTED_EMAILS.includes(userData?.email || '');

  return (
    // TamaguiProvider and Theme removed
    <div
      className="app-container"
      style={{
        backgroundColor: 'var(--background)',
        minHeight: '100vh',
        position: 'relative',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Background Image - Conditionally render or use CSS */}
      {theme === 'dark' && ( // This logic can be moved to CSS if preferred
        <div
          className="background-image-container"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            width: '100vw',
            height: '100vh',
          }}
        >
          <img
            src={backgroundImage}
            alt="Background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              opacity: 0.7,
            }}
          />
          <div
            className="background-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          />
        </div>
      )}

      {/* Navigation Bar */}
      <header
        className="navigation-bar flex justify-between items-center"
        style={{
          padding: 'var(--space-4)',
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'var(--header-background)', // Use CSS variable
          height: '70px',
        }}
      >
        {/* Left side: Logo */}
        <button
          onClick={() => handleNavigate('')}
          aria-label="Go to home"
          className="logo-button"
          style={{ background: 'transparent', padding: 0, border: 'none' }}
        >
          <img
            src={logoSvg}
            alt="TritonThenix Logo"
            style={{ width: '150px', height: '40px', objectFit: 'contain' }}
          />
        </button>

        {/* Center: Main Navigation - Use CSS for responsive display */}
        <nav
          className="main-navigation flex space-x-8 items-center"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            // display: 'none', // Handled by CSS media queries
          }}
        // $xl={{ display: 'flex' }} // Replace with CSS: @media (min-width: 1280px) { .main-navigation { display: flex; } }
        >
          <button
            onClick={() => handleNavigate('schedule/workouts')}
            className={`nav-link ${isActiveRoute('workouts') ? 'active' : ''}`}
            style={{ background: 'transparent', padding: 'var(--space-2)', color: 'var(--text-primary)', fontSize: 'var(--font-size-3)' }}
          >
            WORKOUTS
          </button>
          <button
            onClick={() => handleNavigate('schedule/events')}
            className={`nav-link ${isActiveRoute('events') ? 'active' : ''}`}
            style={{ background: 'transparent', padding: 'var(--space-2)', color: 'var(--text-primary)', fontSize: 'var(--font-size-3)' }}
          >
            EVENTS
          </button>
        </nav>

        {/* Right side: Auth Buttons + Theme Toggle */}
        <div
          className="auth-section flex items-center"
        // $sm={{ space: '$0' }} // Replace with CSS
        >
          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
            className="theme-toggle-button"
            style={{ background: 'transparent', padding: 'var(--space-2)' /* $sm reduce padding via CSS */ }}
          >
            {theme === 'dark' ? (
              <span style={{ color: 'var(--text-primary)', fontSize: '24px' }}>☀️</span>
            ) : (
              <span style={{ color: 'var(--text-primary)', fontSize: '24px' }}>🌙</span>
            )}
          </button>

          {!isSignedIn ? (
            <div
              className="google-signin-container-desktop"
            // $sm={{ display: 'none' }} // Hide on mobile via CSS
            >
              <div
                id="googleSignInDiv"
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  // $gtMd={{ transform: 'scale(1)' }}
                  // $md={{ transform: 'scale(0.8)' }} // Handle scaling via CSS
                }}
              ></div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-primary)', marginRight: 'var(--space-2)', fontSize: 'var(--font-size-3)' }}>
              {userData?.email}
            </p>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={handleMenuToggle}
            aria-label="Menu"
            className="hamburger-button"
            style={{ background: 'transparent', padding: 'var(--space-2)' /* $sm reduce padding via CSS */ }}
          >
            <div className="flex flex-col space-y-1"> {/* Simplified hamburger icon structure */}
              <span style={{ height: '2px', width: '24px', backgroundColor: 'var(--text-primary)', display: 'block' }}></span>
              <span style={{ height: '2px', width: '24px', backgroundColor: 'var(--text-primary)', display: 'block' }}></span>
              <span style={{ height: '2px', width: '24px', backgroundColor: 'var(--text-primary)', display: 'block' }}></span>
            </div>
          </button>
        </div>
      </header>

      {/* Menu Items */}
      {isMenuOpen && (
        <div
          className="menu-dropdown flex flex-col space-y-1"
          style={{
            position: 'absolute',
            right: 0,
            top: '70px', // Below header
            width: '250px',
            backgroundColor: 'var(--card-background)', // Use card background
            borderRadius: 'var(--border-radius-medium)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)', // elevation
            padding: 'var(--space-2)',
            zIndex: 3,
            // $sm={{ width: '100%', right: 0 }} // Handle responsive width via CSS
          }}
        >
          {isSignedIn ? (
            <>
              {/* Mobile Navigation Items - Use CSS for $xl display none */}
              <div className="mobile-nav-items">
                <MenuItem
                  label="Workouts"
                  onClick={() => handleNavigate('/schedule/workouts')}
                />
                <MenuItem
                  label="Events"
                  onClick={() => handleNavigate('/schedule/events')}
                />
                <MenuItem
                  label="Profile"
                  page="profile"
                />
              </div>

              {isAdmin && (
                <MenuItem label="Admin Panel" page="/admin" />
              )}

              <MenuItem label="Privacy Policy" page="privacy" />

              <div
                className="sign-out-section"
                style={{
                  borderTop: '1px solid var(--border-color)',
                  marginTop: 'var(--space-2)',
                  paddingTop: 'var(--space-2)',
                }}
              >
                <MenuItem
                  label="Sign Out"
                  onClick={handleSignOut}
                />
              </div>
            </>
          ) : (
            <>
              {/* Show Google Sign-In in menu only on mobile - Use CSS for $sm display flex */}
              <div
                className="google-signin-container-mobile"
                style={{
                  // display: 'none', // $sm display flex via CSS
                  justifyContent: 'center',
                  padding: 'var(--space-2) 0',
                }}
              >
                <div
                  id="googleSignInDivMobile"
                  style={{
                    backgroundColor: 'transparent',
                    borderRadius: '20px',
                    overflow: 'hidden'
                  }}
                ></div>
              </div>

              {/* Rest of the signed out menu items - Use CSS for $xl display none */}
              <div className="mobile-nav-items-signedout">
                <MenuItem
                  label="Workouts"
                  onClick={() => handleNavigate('/schedule/workouts')}
                />
                <MenuItem
                  label="Events"
                  onClick={() => handleNavigate('/schedule/events')}
                />
                <MenuItem label="Profile" page="profile" />
              </div>
              <MenuItem label="Privacy Policy" page="privacy" />
            </>
          )}
        </div>
      )}

      {/* Raindrop Effect Container */}
      <div
        className="raindrop-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {[...Array(100)].map((_, i) => (
          <div // Replaced Stack with div
            key={i}
            className="raindrop" // Add class for styling via existing CSS in <style>
            style={{
              position: 'absolute',
              // backgroundColor: 'white', // Or use CSS - CSS handles this now
              width: '2px',
              height: '3px',
              opacity: 0.7,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `raindrop ${Math.random() * 2 + 1.5}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: '0 0 8px var(--color)', // Use theme color for shadow
              background: 'linear-gradient(transparent, var(--color))', // Use theme color for gradient
            }}
          />
        ))}
      </div>

      {/* App Routes */}
      <main
        className="app-content"
        style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent', // Content area background
        }}
      >
        <AppRoutes
          userEmail={userData?.email || ''}
          userName={userData?.name}
          tempAdminMode={tempAdminMode}
          onTempAdminToggle={handleTempAdminToggle}
          userData={userData}
        />
      </main>

      {/* EST. SINCE 2022 Text - Conditionally render based on route */}
      {location.pathname === '/' && (
        <div
          className="est-since-text-container flex items-center space-x-2"
          style={{
            position: 'absolute',
            bottom: 'var(--space-4)',
            right: 'var(--space-6)',
            zIndex: 2,
          }}
        >
          <div // Replaced Stack with div
            className="vertical-line"
            style={{
              width: '1px',
              height: '40px',
              backgroundColor: 'var(--text-secondary)', // Use a theme-aware secondary color
              marginRight: 'var(--space-3)',
            }}
          />
          <div> {/* Replaced YStack with div */}
            <p
              style={{
                color: 'var(--text-secondary)', // Use a theme-aware secondary color
                fontSize: '12px',
                letterSpacing: '2px',
                fontFamily: 'Open Sans',
                textTransform: 'uppercase',
                animation: 'fadeIn 2s ease-in',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)', // This shadow might need theme adjustment if too dark/light
              }}
            >
              Est.
            </p>
            <p
              style={{
                color: 'var(--text-primary)', // Use a theme-aware primary color
                fontSize: '24px',
                fontWeight: '300',
                letterSpacing: '4px',
                fontFamily: 'Open Sans',
                animation: 'fadeIn 2s ease-in',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)', // This shadow might need theme adjustment
              }}
            >
              2022
            </p>
          </div>
        </div>
      )}
    </div>
    // TamaguiProvider and Theme removed
  )
}

export default App
// Keep the <style> block with animations as it's already standard CSS.
// Make sure to add CSS classes for responsive styles previously handled by Tamagui's $sm, $xl, etc.
// e.g. in your index.css or App.css:
/*
@media (max-width: 767px) { // sm breakpoint
  .auth-section { gap: 0; }
  .theme-toggle-button { padding: var(--space-1); }
  .google-signin-container-desktop { display: none; }
  .menu-dropdown { width: 100%; right: 0; }
  .google-signin-container-mobile { display: flex; }
}
@media (min-width: 1280px) { // xl breakpoint
  .main-navigation { display: flex; }
  .mobile-nav-items, .mobile-nav-items-signedout { display: none; }
}
*/
// Add the following CSS to your App.css or index.css for the responsive styles previously handled by Tamagui
// This is just an example, you might need to adjust based on your actual breakpoints
/*
.main-navigation { display: none; } // Hide by default
@media (min-width: 1280px) { .main-navigation { display: flex; } }

.auth-section .google-signin-container-desktop { display: flex; }
@media (max-width: 767px) {
  .auth-section { gap: var(--space-0); }
  .auth-section .theme-toggle-button { padding: var(--space-1); }
  .auth-section .google-signin-container-desktop { display: none; }
  .auth-section .hamburger-button { padding: var(--space-1); }
}

.menu-dropdown {
  // existing styles
}
@media (max-width: 767px) {
  .menu-dropdown {
    width: 100%;
    right: 0;
  }
  .menu-dropdown .google-signin-container-mobile { display: flex; }
}
@media (min-width: 1280px) {
  .menu-dropdown .mobile-nav-items,
  .menu-dropdown .mobile-nav-items-signedout {
    display: none;
  }
}
.menu-dropdown .google-signin-container-mobile { display: none; } // Hide by default
*/