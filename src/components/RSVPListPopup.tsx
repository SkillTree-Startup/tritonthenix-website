import { YStack, Text, Button, XStack, Stack, ScrollView, Dialog, TextArea } from 'tamagui'
import { X, Mail } from '@tamagui/lucide-icons'
import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

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

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', event.id))
        const eventData = eventDoc.data()
        const attendeeEmails = eventData?.attendees || []

        const attendeePromises = attendeeEmails.map(async (email: string) => {
          const userDoc = await getDoc(doc(db, 'users', email))
          const userData = userDoc.data()
          return {
            email,
            name: userData?.name
          }
        })

        const attendeeInfo = await Promise.all(attendeePromises)
        setAttendees(attendeeInfo)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching attendees:', error)
        setIsLoading(false)
      }
    }

    fetchAttendees()
  }, [event.id])

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

  const handleSendEmail = async () => {
    if (!emailContent.trim()) return
    
    setIsSending(true)
    try {
      // Mock successful email send for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Email would be sent to:', {
        recipients: attendees.map(a => a.email),
        subject: `Message from TritonThenix: ${event.name}`,
        content: emailContent,
        eventDetails: {
          name: event.name,
          date: event.date,
          time: event.time,
          sentBy: adminName
        }
      })

      // Close dialog and cleanup
      setShowEmailDialog(false)
      setEmailContent('')
      setIsSending(false)
      
    } catch (error) {
      console.error('Error sending email:', error)
      setIsSending(false)
    }
  }

  return (
    <>
      <YStack
        position="fixed"
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
              RSVPs ({attendees.length})
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
                circular
                backgroundColor="transparent"
                onPress={onClose}
              >
                <X size={24} color="$color" />
              </Button>
            </XStack>
          </XStack>

          <ScrollView>
            <YStack space="$2">
              {isLoading ? (
                <Text color="$textSecondary">Loading attendees...</Text>
              ) : attendees.length > 0 ? (
                attendees.map((attendee) => (
                  <XStack 
                    key={attendee.email}
                    backgroundColor="$cardBackground"
                    padding="$3"
                    borderRadius="$2"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Text color="$textPrimary" fontSize="$4">
                      {attendee.name || 'Anonymous'}
                    </Text>
                    <Text color="$textSecondary" fontSize="$3">
                      {attendee.email}
                    </Text>
                  </XStack>
                ))
              ) : (
                <Text color="$textSecondary">No RSVPs yet</Text>
              )}
            </YStack>
          </ScrollView>
        </YStack>
      </YStack>

      {showEmailDialog && (
        <Dialog 
          modal={false}
          defaultOpen={true}
          onOpenChange={(open) => {
            if (!open && !isSending) {
              setShowEmailDialog(false)
              setEmailContent('')
            }
          }}
        >
          <Dialog.Portal>
            <Dialog.Overlay
              key="overlay"
              animation="quick"
              opacity={0.5}
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
              zIndex={2000}
              position="fixed"
              top={0}
              left={0}
              right={0}
              bottom={0}
            />
            <Dialog.Content
              bordered
              elevate
              key="content"
              animation={[
                'quick',
                {
                  opacity: {
                    overshootClamping: true,
                  },
                },
              ]}
              enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
              exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
              space
              zIndex={2001}
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              width="90%"
              maxWidth={500}
              backgroundColor="$background"
            >
              <Dialog.Title>Send Message to Attendees</Dialog.Title>
              <Dialog.Description>
                This message will be sent to all {attendees.length} attendees of {event.name} from {adminName}.
              </Dialog.Description>

              <YStack space="$4">
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
                      setShowEmailDialog(false)
                      setEmailContent('')
                    }}
                  >
                    <Text color="$color">Cancel</Text>
                  </Button>
                  <Button
                    backgroundColor="$blue8"
                    onPress={handleSendEmail}
                    disabled={isSending || !emailContent.trim()}
                  >
                    <Text color="white">
                      {isSending ? 'Sending...' : 'Send'}
                    </Text>
                  </Button>
                </XStack>
              </YStack>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      )}
    </>
  )
} 