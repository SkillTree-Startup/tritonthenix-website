import { YStack, Text, Button, XStack, ScrollView } from 'tamagui'
import { X } from '@tamagui/lucide-icons'
import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

interface RSVPListPopupProps {
  event: Event
  onClose: () => void
}

interface UserInfo {
  email: string
  name?: string
}

export const RSVPListPopup = ({ event, onClose }: RSVPListPopupProps) => {
  const [attendees, setAttendees] = useState<UserInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        // Get event document to get attendee list
        const eventDoc = await getDoc(doc(db, 'events', event.id))
        const eventData = eventDoc.data()
        const attendeeEmails = eventData?.attendees || []

        // Fetch user info for each attendee
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
        maxHeight="80vh"
      >
        {/* Header with close button */}
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize="$6" fontWeight="bold" color="$textPrimary">
              RSVPs for {event.name}
            </Text>
            <Text fontSize="$3" color="$textSecondary">
              {event.date} at {event.time}
            </Text>
          </YStack>
          <Button
            size="$3"
            circular
            backgroundColor="transparent"
            onPress={onClose}
          >
            <X size={24} color="$color" />
          </Button>
        </XStack>

        {/* Attendee list */}
        <ScrollView>
          <YStack space="$2">
            {isLoading ? (
              <Text color="$textSecondary" textAlign="center">Loading...</Text>
            ) : attendees.length > 0 ? (
              attendees.map((attendee, index) => (
                <XStack 
                  key={attendee.email}
                  backgroundColor="$gray3"
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
              <Text color="$textSecondary" textAlign="center">
                No RSVPs yet
              </Text>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </YStack>
  )
} 