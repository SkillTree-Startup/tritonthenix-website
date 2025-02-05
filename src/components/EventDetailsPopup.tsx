import { YStack, Text, Button, XStack, Stack, Image } from 'tamagui'
import { X } from '@tamagui/lucide-icons'
import { useState } from 'react'
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

interface EventDetailsPopupProps {
  event: Event
  onClose: () => void
  userEmail?: string
}

const formatEventDate = (dateStr: string) => {
  // Add Pacific Time zone offset to ensure correct date
  const date = new Date(`${dateStr}T00:00:00-08:00`)
  return date.toLocaleDateString()
}

export const EventDetailsPopup = ({ event, onClose, userEmail }: EventDetailsPopupProps) => {
  const [isRsvped, setIsRsvped] = useState(false)
  const [attendees, setAttendees] = useState<string[]>([])

  // Fetch current RSVPs when popup opens
  useState(() => {
    const fetchRsvps = async () => {
      const eventDoc = await getDoc(doc(db, 'events', event.id))
      const data = eventDoc.data()
      if (data?.attendees) {
        setAttendees(data.attendees)
        setIsRsvped(data.attendees.includes(userEmail))
      }
    }
    fetchRsvps()
  })

  const handleRsvp = async () => {
    if (!userEmail) return

    try {
      const eventRef = doc(db, 'events', event.id)
      if (isRsvped) {
        await updateDoc(eventRef, {
          attendees: arrayRemove(userEmail)
        })
        setAttendees(prev => prev.filter(email => email !== userEmail))
      } else {
        await updateDoc(eventRef, {
          attendees: arrayUnion(userEmail)
        })
        setAttendees(prev => [...prev, userEmail])
      }
      setIsRsvped(!isRsvped)
    } catch (error) {
      console.error('Error updating RSVP:', error)
    }
  }

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

        {/* Event details */}
        <YStack space="$4">
          {/* Only show creator info if it's not an Event type */}
          {event.type !== 'Event' && (
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
                  {formatEventDate(event.date)} at {event.time}
                </Text>
              </YStack>
            </XStack>
          )}

          {/* Always show date/time for Event type */}
          {event.type === 'Event' && (
            <Text fontSize="$4" color="$color">
              {formatEventDate(event.date)} at {event.time}
            </Text>
          )}

          <Text color="$textPrimary">
            {event.additionalDetails || event.description}
          </Text>

          {event.tags && (
            <Text color="$color" fontSize="$3" opacity={0.7}>
              Tags: {event.tags}
            </Text>
          )}

          {/* RSVP section */}
          <YStack space="$2" marginTop="$2">
            <Button
              backgroundColor={isRsvped ? '$green8' : '$blue8'}
              onPress={handleRsvp}
              disabled={!userEmail}
            >
              <Text color="white">
                {isRsvped ? 'Cancel RSVP' : 'RSVP'}
              </Text>
            </Button>
            
            <Text fontSize="$3" color="$textSecondary" textAlign="center">
              {attendees.length} {attendees.length === 1 ? 'person' : 'people'} attending
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  )
} 