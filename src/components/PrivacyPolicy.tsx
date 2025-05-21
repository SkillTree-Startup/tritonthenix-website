import React from 'react'; // Import React

export const PrivacyPolicy = () => {
  return (
    <div
      className="privacy-policy-container flex flex-col items-center"
      style={{
        height: '90vh', // This might be better handled by flex properties of parent if possible
        width: '100%',
        marginTop: 'var(--space-2)',
      }}
    >
      <div className="privacy-content-wrapper flex flex-col items-center" style={{ padding: 'var(--space-2)', gap: 'var(--space-2)', width: '100%' }}>
        <div className="privacy-main-content flex flex-col" style={{ gap: 'var(--space-2)', maxWidth: '800px', width: '100%' }}>
          <h1
            style={{
              fontSize: 'var(--font-size-8)',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              textAlign: 'center',
              width: '100%',
            }}
          >
            Privacy Policy
          </h1>

          <div
            className="scrollable-content"
            style={{
              height: 'calc(90vh - 100px)', // Adjust height based on title and padding
              width: '100%',
              maxWidth: '1000px', // This seems wider than parent, check consistency
              overflowY: 'auto',
              // showsVerticalScrollIndicator: false, // CSS: ::-webkit-scrollbar { display: none; } for Webkit
              // bounces: false, // Not a direct CSS equivalent
            }}
          >
            <div
              className="inner-scroll-content flex flex-col items-center"
              style={{
                padding: 'var(--space-4)',
                gap: 'var(--space-4)',
                width: '100%',
              }}
            >
              <p
                style={{
                  color: 'var(--text-primary)', // Changed from white to use theme variable
                  fontSize: 'var(--font-size-3)',
                  textAlign: 'center',
                  opacity: 0.9,
                }}
              >
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <div className="flex flex-col items-center" style={{ gap: 'var(--space-4)' }}>
                <p
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-4)',
                    textAlign: 'center',
                    opacity: 0.9,
                    maxWidth: '800px',
                    lineHeight: '24px',
                  }}
                >
                  At TritonThenix, we take your privacy seriously. This policy describes what personal information we collect and how we use it.
                </p>

                <div className="flex flex-col items-center" style={{ gap: 'var(--space-4)', width: '100%' }}>
                  <h2
                    style={{
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-size-5)',
                      textAlign: 'center',
                    }}
                  >
                    Information We Collect
                  </h2>
                  <p
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-size-4)',
                      textAlign: 'center',
                      opacity: 0.9,
                      maxWidth: '800px',
                      lineHeight: '24px',
                    }}
                  >
                    We only collect and store:
                    <br />• Your name (as provided by Google Sign-In)
                    <br />• Your email address (as provided by Google Sign-In)
                  </p>

                  <h2
                    style={{
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-size-5)',
                      textAlign: 'center',
                      marginTop: 'var(--space-2)',
                    }}
                  >
                    How We Use Your Information
                  </h2>
                  <p
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-size-4)',
                      textAlign: 'center',
                      opacity: 0.9,
                      maxWidth: '800px',
                      lineHeight: '24px',
                    }}
                  >
                    We use this information solely for:
                    <br />• Account identification
                    <br />• Administrative access control
                    <br />• Essential communications about workouts and events
                  </p>

                  <h2
                    style={{
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-size-5)',
                      textAlign: 'center',
                      marginTop: 'var(--space-2)',
                    }}
                  >
                    Data Protection
                  </h2>
                  <p
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-size-4)',
                      textAlign: 'center',
                      opacity: 0.9,
                      maxWidth: '800px',
                      lineHeight: '24px',
                    }}
                  >
                    We do not share, sell, or distribute your personal information with any third parties. Your data is stored securely using Google Firebase services.
                  </p>

                  <h2
                    style={{
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-size-5)',
                      textAlign: 'center',
                      marginTop: 'var(--space-2)',
                    }}
                  >
                    Contact
                  </h2>
                  <p
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-size-4)',
                      textAlign: 'center',
                      opacity: 0.9,
                      maxWidth: '800px',
                      lineHeight: '24px',
                    }}
                  >
                    If you have any questions about this Privacy Policy, please contact us at admin@tritonthenix.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}