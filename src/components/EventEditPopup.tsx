import { YStack, Text, Button, XStack, Stack, Image, ScrollView } from 'tamagui'
import { X } from '@tamagui/lucide-icons'
import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

interface EventEditPopupProps {
  event: Event
  onClose: () => void
  onDelete: (eventId: string) => void
}

interface UserInfo {
  email: string
  name?: string
}

export const EventEditPopup = ({ event, onClose, onDelete }: EventEditPopupProps) => {
  const [attendees, setAttendees] = useState<UserInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  return (
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
        {/* Header with close button */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="bold" color="$textPrimary">
            {event.name}
          </Text>
          <Button
            size="$3"
            circular
            backgroundColor="transparent"
            onPress={onClose}
          >
            <X size={24} color="$color" />
          </Button>
        </XStack>

        <ScrollView>
          <YStack space="$4">
            <XStack space="$2" alignItems="center">
              {event.creatorProfilePicture && (
                <Stack
                  width={40}
                  height={40}
                  borderRadius={20}
                  overflow="hidden"
                >
                  <Image
                    source={{ uri: event.creatorProfilePicture }}
                    width="100%"
                    height="100%"
                    resizeMode="cover"
                    alt="Creator's profile"
                  />
                </Stack>
              )}
              <YStack>
                <Text fontSize="$3" color="$textSecondary">
                  Posted by {event.creatorName || 'Anonymous'}
                </Text>
                <Text fontSize="$4" color="$color">
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </Text>
              </YStack>
            </XStack>

            <Text color="$textPrimary">
              {event.description}
            </Text>

            {event.tags && (
              <Text color="$color" fontSize="$3" opacity={0.7}>
                Tags: {event.tags}
              </Text>
            )}

            <Text color="$textSecondary" fontSize="$3">
              Type: {event.type}
            </Text>

            {/* Attendees Section */}
            <YStack space="$2" marginTop="$2">
              <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
                RSVPs ({attendees.length})
              </Text>
              {isLoading ? (
                <Text color="$textSecondary">Loading attendees...</Text>
              ) : attendees.length > 0 ? (
                <YStack space="$2">
                  {attendees.map((attendee) => (
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
                  ))}
                </YStack>
              ) : (
                <Text color="$textSecondary">No RSVPs yet</Text>
              )}
            </YStack>
          </YStack>
        </ScrollView>

        {/* Delete button and confirmation */}
        {!showDeleteConfirm ? (
          <Button
            backgroundColor="$red8"
            padding="$2"
            onPress={() => setShowDeleteConfirm(true)}
            hoverStyle={{ backgroundColor: '$red7' }}
          >
            <Text color="white" fontSize="$3">Delete Event</Text>
          </Button>
        ) : (
          <YStack space="$2">
            <Text color="$textPrimary" textAlign="center" fontWeight="bold">
              Are you sure you want to delete this event?
            </Text>
            <Text color="$textSecondary" textAlign="center" fontSize="$3">
              This action cannot be undone.
            </Text>
            <XStack space="$2" justifyContent="center">
              <Button
                backgroundColor="$gray8"
                padding="$2"
                onPress={() => setShowDeleteConfirm(false)}
                hoverStyle={{ backgroundColor: '$gray7' }}
                flex={1}
              >
                <Text color="white" fontSize="$3">Cancel</Text>
              </Button>
              <Button
                backgroundColor="$red8"
                padding="$2"
                onPress={() => {
                  onDelete(event.id)
                  onClose()
                }}
                hoverStyle={{ backgroundColor: '$red7' }}
                flex={1}
              >
                <Text color="white" fontSize="$3">Confirm Delete</Text>
              </Button>
            </XStack>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
} 