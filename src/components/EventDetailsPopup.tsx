import { YStack, Text, Button, XStack, Stack, Image } from 'tamagui'
import { X } from '@tamagui/lucide-icons'
import { useState, useEffect } from 'react'
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

interface EventDetailsPopupProps {
  event: Event
  onClose: () => void
  userEmail?: string
  onRSVP: () => void
  isRSVPd: boolean
}

const formatEventDate = (dateStr: string) => {
  // Add Pacific Time zone offset to ensure correct date
  const date = new Date(`${dateStr}T00:00:00-08:00`)
  return date.toLocaleDateString()
}

export const EventDetailsPopup = ({ event, onClose, userEmail, onRSVP, isRSVPd }: EventDetailsPopupProps) => {
  const [attendeeCount, setAttendeeCount] = useState(0)
  
  // Fetch current attendee count
  useEffect(() => {
    const fetchAttendeeCount = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', event.id))
        const eventData = eventDoc.data()
        const attendees = eventData?.attendees || []
        setAttendeeCount(attendees.length)
      } catch (error) {
        console.error('Error fetching attendees:', error)
      }
    }

    fetchAttendeeCount()
  }, [event.id])

  // Calculate spots remaining if there's a limit
  const spotsRemaining = event.maxRSVPs ? event.maxRSVPs - attendeeCount : null

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
              backgroundColor={isRSVPd ? '$red8' : '$blue8'}
              onPress={onRSVP}
              disabled={isRSVPd ? false : (event.maxRSVPs ? attendeeCount >= event.maxRSVPs : false)}
            >
              <Text color="white">
                {isRSVPd ? 'Cancel RSVP' : 'RSVP'}
              </Text>
            </Button>
            
            {/* Only show spots remaining if there's a limit */}
            {event.maxRSVPs && (
              <Text fontSize="$3" color="$textSecondary" textAlign="center">
                {event.maxRSVPs - attendeeCount} spots remaining
              </Text>
            )}
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  )
} 