import { YStack, Text, Button, XStack, ScrollView, Dialog, TextArea, Input } from 'tamagui'
import { X, Mail, Pencil } from '@tamagui/lucide-icons'
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
  const [maxRSVPs, setMaxRSVPs] = useState(event.maxRSVPs || 0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingLimit, setEditingLimit] = useState(false)

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
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'events', event.id), {
        maxRSVPs: parseInt(maxRSVPs.toString()) || 0
      });
      
      // Update the event object locally
      event.maxRSVPs = parseInt(maxRSVPs.toString()) || 0;
      
      // Close edit mode
      setEditingLimit(false);
    } catch (error) {
      console.error('Error updating max RSVPs:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.5)"
      justifyContent="center"
      alignItems="center"
      zIndex={2000}
      padding="$4"
    >
      <YStack
        backgroundColor="$background"
        borderRadius="$4"
        padding="$4"
        width="100%"
        maxWidth={500}
        space="$4"
        elevation={20}
        zIndex={2001}
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

        <YStack space="$2">
          <XStack space="$2" alignItems="center">
            <Text color="$textSecondary" fontSize="$3" fontWeight="bold">RSVP Limit:</Text>
            {editingLimit ? (
              <XStack flex={1} space="$2">
                <Input
                  flex={1}
                  value={maxRSVPs.toString()}
                  onChangeText={(text) => setMaxRSVPs(parseInt(text) || 0)}
                  placeholder="Enter max RSVPs"
                  keyboardType="numeric"
                  backgroundColor="$background"
                />
                <Button
                  backgroundColor="$blue8"
                  onPress={handleUpdateMaxRSVPs}
                  disabled={isUpdating}
                  padding="$2"
                >
                  <Text color="white">
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Text>
                </Button>
              </XStack>
            ) : (
              <XStack flex={1} space="$2" alignItems="center">
                <Text color="$textPrimary">
                  {maxRSVPs ? `${maxRSVPs} spots` : 'Unlimited spots'}
                </Text>
                <Button
                  size="$3"
                  backgroundColor="$blue2"
                  padding="$2"
                  onPress={() => setEditingLimit(true)}
                  hoverStyle={{ backgroundColor: '$blue3' }}
                  borderRadius="$4"
                >
                  <Pencil size={18} color="$blue8" />
                </Button>
              </XStack>
            )}
          </XStack>
        </YStack>

        {isLoading ? (
          <Text color="$textSecondary">Loading attendees...</Text>
        ) : attendees.length === 0 ? (
          <Text color="$textSecondary">No RSVPs yet</Text>
        ) : (
          <ScrollView maxHeight={400}>
            <YStack space="$2">
              {attendees.map((attendee) => (
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

      {showEmailDialog && (
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <Dialog.Portal>
            <Dialog.Overlay
              key="overlay"
              animation={{
                type: 'timing',
                duration: 150
              }}
              opacity={0.5}
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
            <Dialog.Content
              bordered
              elevate
              key="content"
              animation={{
                type: 'timing',
                duration: 150
              }}
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
    </YStack>
  )
} 