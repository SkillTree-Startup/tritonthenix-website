import { YStack, Text, Button, XStack, Stack, ScrollView, Dialog, TextArea, Input } from 'tamagui'
import { X, Mail, Settings } from '@tamagui/lucide-icons'
import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { DialogScope } from '../tamagui.config'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { Event } from '../types/Event'

interface RSVPListPopupProps {
  event: Event
  onClose: () => void
  userEmail: string
}

interface UserInfo {
  email: string
  name?: string
}

export const RSVPListPopup = ({ event, onClose, userEmail }: RSVPListPopupProps) => {
  const [attendees, setAttendees] = useState<UserInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailContent, setEmailContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [adminName, setAdminName] = useState<string>('')
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [maxRSVPs, setMaxRSVPs] = useState(event.maxRSVPs || 0)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        setIsLoading(true)
        const attendeePromises = (event.attendees || []).map(async (email: string) => {
          const userDoc = await getDoc(doc(db, 'users', email))
          const userData = userDoc.data()
          return {
            email,
            name: userData?.name || email
          }
        })

        const attendeeInfo = await Promise.all(attendeePromises)
        console.log('Fetched attendees:', attendeeInfo)
        setAttendees(attendeeInfo)
      } catch (error) {
        console.error('Error fetching attendees:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (event.attendees?.length) {
      fetchAttendees()
    }
  }, [event.attendees])

  useEffect(() => {
    const fetchAdminName = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userEmail))
        const userData = userDoc.data()
        setAdminName(userData?.name || 'Admin')
      } catch (error) {
        console.error('Error fetching admin name:', error)
        setAdminName('Admin')
      }
    }

    fetchAdminName()
  }, [userEmail])

  const handleSendEmail = () => {
    // Log the email details to console
    console.log('Email would be sent with the following details:');
    console.log('To:', attendees.map(a => a.email).join(', '));
    console.log('Event:', event.name);
    console.log('Message:', emailContent);
    
    // Close the email dialog
    setShowEmailDialog(false);
    // Reset the email content
    setEmailContent('');
  };

  const handleUpdateMaxRSVPs = async () => {
    if (isUpdating) return
    
    setIsUpdating(true)
    try {
      await updateDoc(doc(db, 'events', event.id), {
        maxRSVPs: parseInt(maxRSVPs.toString()) || 0
      })
      
      // Update the event object locally to reflect changes immediately
      event.maxRSVPs = parseInt(maxRSVPs.toString()) || 0
      
      setShowSettingsDialog(false)
    } catch (error) {
      console.error('Error updating max RSVPs:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(0,0,0,0.5)"
        justifyContent="center"
        alignItems="center"
        zIndex={1000}
        padding="$4"
      >
        <YStack
          backgroundColor="$background"
          borderRadius="$4"
          padding="$4"
          width="100%"
          maxWidth={500}
          space="$4"
        >
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$6" fontWeight="bold" color="$textPrimary">
              RSVPs ({attendees.length}{maxRSVPs ? `/${maxRSVPs}` : ''})
            </Text>
            <XStack space="$2">
              {attendees.length > 0 && (
                <Button
                  size="$3"
                  backgroundColor="$blue8"
                  onPress={() => setShowEmailDialog(true)}
                  hoverStyle={{ backgroundColor: '$blue7' }}
                >
                  <Mail size={20} color="white" />
                </Button>
              )}
              <Button
                size="$3"
                backgroundColor="$blue8"
                onPress={() => setShowSettingsDialog(true)}
                hoverStyle={{ backgroundColor: '$blue7' }}
              >
                <Settings size={20} color="white" />
              </Button>
              <Button
                size="$3"
                circular
                backgroundColor="transparent"
                onPress={onClose}
              >
                <X size={24} color="$color" />
              </Button>
            </XStack>
          </XStack>

          {isLoading ? (
            <Text color="$textSecondary">Loading attendees...</Text>
          ) : attendees.length === 0 ? (
            <Text color="$textSecondary">No RSVPs yet</Text>
          ) : (
            <ScrollView maxHeight={400}>
              <YStack space="$2">
                {attendees.map((attendee, index) => (
                  <XStack 
                    key={attendee.email}
                    backgroundColor="$backgroundHover"
                    padding="$3"
                    borderRadius="$2"
                    space="$2"
                  >
                    <Text flex={1} color="$textPrimary">
                      {attendee.name || attendee.email}
                    </Text>
                    <Text color="$textSecondary" fontSize="$2">
                      {attendee.email}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </ScrollView>
          )}
        </YStack>
      </YStack>

      {showEmailDialog && (
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <Dialog.Portal>
            <Dialog.Overlay
              key="overlay"
              animation="quick"
              opacity={0.5}
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
            <Dialog.Content
              bordered
              elevate
              key="content"
              animation={[
                'quick',
                {
                  opacity: {
                    overshootClamping: true
                  }
                }
              ]}
              enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
              exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
              space
            >
              <YStack space="$4">
                <Dialog.Title>
                  <Text fontSize="$5" color="$textPrimary">
                    Message Attendees
                  </Text>
                </Dialog.Title>

                <TextArea
                  value={emailContent}
                  onChangeText={setEmailContent}
                  placeholder="Type your message here..."
                  minHeight={150}
                  backgroundColor="$background"
                  borderColor="$borderColor"
                />

                <XStack space="$3" justifyContent="flex-end">
                  <Button
                    backgroundColor="transparent"
                    onPress={() => {
                      setShowEmailDialog(false);
                      setEmailContent('');
                    }}
                  >
                    <Text color="$color">Cancel</Text>
                  </Button>
                  <Button
                    backgroundColor="$blue8"
                    onPress={handleSendEmail}
                    disabled={!emailContent.trim()}
                  >
                    <Text color="white">Send</Text>
                  </Button>
                </XStack>
              </YStack>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      )}

      <Dialog
        modal
        open={showSettingsDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowSettingsDialog(false)
            setMaxRSVPs(event.maxRSVPs || 0)
          }
        }}
        {...DialogScope.props}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
            backgroundColor="rgba(0,0,0,0.5)"
            zIndex={1000}
          />
          <Dialog.Content
            bordered
            elevate
            key="content"
            animation={{
              type: 'fade',
              opacity: {
                overshootClamping: true
              }
            }}
            position="absolute"
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            space
            width="90%"
            maxWidth={500}
            backgroundColor="$background"
            zIndex={1001}
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          >
            <Dialog.Title>
              <Text fontSize="$5" color="$textPrimary">
                RSVP Limit
              </Text>
            </Dialog.Title>
            <Dialog.Description>
              Set the maximum number of RSVPs allowed for this event. Set to 0 for unlimited.
            </Dialog.Description>

            <YStack space="$4" paddingVertical="$4">
              <Input
                value={maxRSVPs.toString()}
                onChangeText={(text) => setMaxRSVPs(parseInt(text) || 0)}
                placeholder="Enter max RSVPs"
                keyboardType="numeric"
                backgroundColor="$background"
              />

              <XStack space="$3" justifyContent="flex-end">
                <Button
                  backgroundColor="transparent"
                  onPress={() => {
                    if (!isUpdating) {
                      setShowSettingsDialog(false)
                      setMaxRSVPs(event.maxRSVPs || 0)
                    }
                  }}
                  disabled={isUpdating}
                >
                  <Text color="$color">Cancel</Text>
                </Button>
                <Button
                  backgroundColor="$blue8"
                  onPress={handleUpdateMaxRSVPs}
                  disabled={isUpdating}
                >
                  <Text color="white">
                    {isUpdating ? 'Updating...' : 'Update'}
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  )
} 